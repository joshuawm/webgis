<template>
  <div>
    <div id="map"></div>
    <div id="features">
      <div>当前选择景点：</div>
      <div v-for="info in poidata" class="poiInfo">
        <input type="checkbox" v-model="checkedList" :value="info.id"></input>
        <label>{{info.name}}</label>
      </div>
    </div>
    <nav id="menu"></nav>
    <div id="echartsDisplay" ref="echarts" @mousedown="mouseDownHandleelseE($event)" @mouseup="mouseUpHandleelseE($event)">
      <echarts></echarts>
    </div>
    <div id="distance" class="distance-container"></div>
    <div id="population" ref="kongtiao" class="population-container" @mousedown="mouseDownHandleelse($event)" @mouseup="mouseUpHandleelse($event)" ></div>
  </div>
</template>

<script>
import mapboxgl from "@mapgis/mapbox-gl";
import * as turf from "@turf/turf";
import jingdanimage from "../assets/jingdian32px.png";
import attractiondata from "../data/attractions.json";
import attractionsCount from "../data/attractionsCount.json";
import Vue from "vue";
import axios from "axios"
import VueComponentAPI from "@vue/composition-api";
import popupComponets from "./scenicpop";
import echarts from "./echarts"
const popup = Vue.extend(popupComponets);
import GeoJSON from "geojson";
Vue.use(VueComponentAPI);
// Vue.forceUpdate();

export default {
  name: "listtoanalysis",
  data() {
    return {
      map:null,
      totalsceniclist:[],
      poidata:[],
      checkedList:[],
      selectedJSON:null,
      countscenic:[],
      oldChild:{
        distance:null,
        hot:null
      },
      moveDataelse: {
        x: null,
        y: null
      },
      moveDataelseChart: {
        x: null,
        y: null
      }
    };
  },
  components: {echarts},
  mounted(){

    let that = this;
    mapboxgl.accessToken =
      "pk.eyJ1Ijoiam9zaHVhbXdvbmciLCJhIjoiY2tzaXRlOXcyMHVhNzJ2bnN4aG11NW10aiJ9.RdgXiHX8GNMNWTr2X92ruQ";
    const map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/joshuamwong/ckte9azm523g217juhpczqo5q",
      center: this.$store.state.mapCenter,
      zoom: this.$store.state.mapZoom
    });

    map.on("load",async ()=>{
      map.addSource("attractionlayer", {
        type: "geojson",
        data: attractiondata
      });
      map.addLayer({
        id: "attractionLayer",
        type: "symbol",
        source: "attractionlayer",
        paint: {
          "text-color": "black"
        },
        layout: {
          "icon-image": "jingdian",
          "text-field": "{name}",
          "text-anchor": "right",
          "text-font": ["Open Sans Bold"],
          "text-line-height": 1.2,
          "text-size": 12,
          "text-offset": [-1, 0]
        },
        minzoom: 0,
        maxzoom: 22
      });
      await this.getAlLMyData()
      this.getget()
    })

    map.on("click", "attractionLayer", (e) =>{
      new mapboxgl.Popup({anchor:"right"}).setLngLat(e.lngLat).setHTML("<div id='list_scenic'></div>").addTo(map);
      let popupinfo={
        id:e.features[0].properties.id,
        type:"attractions"
      };
      new popup({
        propsData:{
          infos: {
            infos: {
              id: e.features[0].properties.id,
              typ: "attractions",
              userID: this.$store.state.user_id
            }
          }
        }
      }).$mount("#list_scenic");
      map.panTo([e.lngLat.lng,e.lngLat.lat])
    });
    map.loadImage(jingdanimage, (error, image) => {
      if (error) {
        console.log(error);
      } else {
        map.addImage("jingdian", image);
      }

      map.on("click", "人流量分析", function(e) {
        var sentence = "";
        //this.selectedJSON.features[i].properties.Count
        if (e.features[0].properties.Count < 1000) {
          sentence = "该景点人数适宜，可放心前往";
        } else {
          sentence = "该景点人数可能较多，请谨慎前往";
        }
        new mapboxgl.Popup()
          .setLngLat([e.lngLat.lng, e.lngLat.lat])
          .setHTML(
            `<b>${e.features[0].properties.name}</b>` +
            "在携程的评论数量为: " +
            `<b>${e.features[0].properties.Count.toString()}</b>` +
            "<br>" +
            sentence
          )
          .addTo(map);
      });

      //多个图层
      var toggleableLayerIds = [ '距离分析', '价格评分分析','人流量分析' ];
      //显示图层的切换和选择
      for (var i = 0; i < toggleableLayerIds.length; i++) {
        var id = toggleableLayerIds[i];
        var link = document.createElement('a');
        //a标签的样式
        Object.assign(link.style, {
          fontSize: "13px",
          color: "#404040",
          display: "block",
          margin:"0",
          padding:"5px" ,
          textDecoration: "none",
          borderBottom: "1px solid rgba(0,0,0,0.25)",
          textAlign: "center",

          backgroundColor: "transparent"
        });
        link.href = '#';
        link.className = 'active';
        link.textContent = id;

        link.onclick = function (e) {
          var clickedLayer = this.textContent;
          e.preventDefault();
          e.stopPropagation();
          var visibility = map.getLayoutProperty(clickedLayer, 'visibility');
          if (visibility === 'visible') {
            map.setLayoutProperty(clickedLayer, 'visibility', 'none');
            this.className = '';
          } else {
            this.className = 'active';
            map.setLayoutProperty(clickedLayer, 'visibility', 'visible');
          }
          console.log(clickedLayer)
          //距离分析具体距离的显示切换
          if(clickedLayer==="距离分析"&&this.className ==='active'){
            document.getElementById("distance").style.visibility="visible"
          }else if (clickedLayer==="距离分析"&&this.className ==='') {
            document.getElementById("distance").style.visibility="hidden"
          }
          if(clickedLayer==="人流量分析"&&this.className ==='active'){
            document.getElementById("population").style.visibility="visible"
          }else if (clickedLayer==="人流量分析"&&this.className ==='') {
            document.getElementById("population").style.visibility="hidden"
          }
          if(clickedLayer==="价格评分分析") {
            let visiable = document.getElementById("echartsDisplay").style.display
            if (visiable != "none") {
              document.getElementById("echartsDisplay").style.display = "none"
            } else {
              document.getElementById("echartsDisplay").style.display = "block"
            }
          }
        };
        var layers = document.getElementById('menu');
        layers.appendChild(link);
      }

      map.on("wheel", function() {
        let range = map.getZoom();
        that.$store.commit("set_map_zoom", range);
        let c = map.getCenter();
        that.$store.commit("set_map_center", c);
      });
      map.on("move", function() {
        let range = map.getZoom();
        that.$store.commit("set_map_zoom", range);
        let c = map.getCenter();
        that.$store.commit("set_map_center", c);
      });

    });
    this.map=map
  },
  methods: {

    async getAlLMyData(){ //refresh级别
      let list =this.$store.state.listToAnalysis
      if(list !== this.totalsceniclist){
        if(list.length>0) {
          let queryString = ""
          for (let index = 0; index < list.length; index++) {
            if (index === 0) {
              queryString = `(attraction_id=${list[index]})`
            } else {
              queryString = `${queryString} OR (attraction_id=${list[index]})`
            }
          }
          let res = await axios.get(`http://121.5.235.15/api/v2/zhouyou/_table/attractions?fields=attraction_name,attraction_id,attraction_lon,attraction_lat&filter=${queryString}`, {
            params: {
              api_key: '956eed8e98667eca2722be6afc37e123212466565cab5df2f7e653d206f3e3c0'
            }
          })
          let data = res.data.resource
          let newPOIData=[]
          for (let i = 0; i < data.length; i++) {
            newPOIData.push({
              name: data[i].attraction_name,
              id: data[i].attraction_id,
              lon: data[i].attraction_lon,
              lat: data[i].attraction_lat
            })
          }
          this.checkedList = list
          this.totalsceniclist=list
          //list选中景点的id
          //geojsondata选中景点的具体数据
          let geojsondata = GeoJSON.parse(this.poidata,{"Point":["lon","lat"],include:['name',"id"]})
          //this.selectedJSON选中景点的JSON数据
          this.selectedJSON=geojsondata
          this.poidata=newPOIData
        }
      }},
    getget(){
        var distanceContainer = document.getElementById("distance");
        var populationContainer = document.getElementById("population");
        //利用一个GeoJSON对象来储存测量对象
        var geojson = {
          type: "FeatureCollection",
          features: []
        };
        //线的gson数据
        var linestring = {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: []
          }
        };
        this.getAlLMyData()
          const canvas = this.map.getCanvasContainer();
          canvas.style.cursor = "crosshair";

          //添加注记和景点图标


        //点选景点

        geojson.features=geojson.features.concat(this.selectedJSON.features);
        if (geojson.features.length > 1) {
          linestring.geometry.coordinates = geojson.features.map(function (
            point
          ) {
            return point.geometry.coordinates;
          });
          //将线数据写入geojson
          geojson.features.push(linestring);
          //添加距离分析的source 和 layer

          var value = document.createElement("pre");

          value.textContent =
            "所有选中景点的距离总和是:" +
            turf.lineDistance(linestring).toLocaleString() +
            "km";
          if(distanceContainer.hasChildNodes()){
            distanceContainer.replaceChild(value,this.oldChild.distance)
            this.oldChild.distance=value
          }else{
            this.oldChild.distance=value
            distanceContainer.appendChild(value)
          }



          //添加价格评分分析的source和layer
          //添加人流量分析的source 和 layer

          for (let i = 0; i <this.selectedJSON.features.length; i++) {
            for (let j = 0; j < attractionsCount.features.length; j++) {
              if (
                this.selectedJSON.features[i].properties.id ===
                attractionsCount.features[j].properties.id
              ) {
                //更新totalsceniclist给数组的每一个元素的properties添加Count属性 this.selectedJSON.features[i].properties.Count
                this.selectedJSON.features[i].properties.Count =
                  attractionsCount.features[j].properties.count;
              }
            }
          }

          let temp=[]
          for (let i = 0; i <geojson.features.length ; i++) {
            if (geojson.features[i].geometry.type==="Point"){
              temp.push({name:geojson.features[i].properties.name,count:geojson.features[i].properties.Count})
            }
          }
          this.countscenic=temp
          var populationvalue = document.createElement("pre");
          var populationlist='';
          for (let i = 0; i <this.countscenic.length ; i++) {
            populationlist=populationlist+
              `<li>${this.countscenic[i].name}<p style="float:right;margin:0px">${(this.countscenic[i].count+10)*10}</p></li>`;
          }
          populationvalue.innerHTML =
            "&nbsp&nbsp<b>所选景点</b>"+"<b style=\"float:right;margin-right: 30px;\">热度</b>"+
            `<ol  style="margin-top: 0px;height: auto;width: 200px;top: 30px">
              ${populationlist}
                </ol>`;
          if(populationContainer.hasChildNodes()){
            populationContainer.replaceChild(populationvalue,this.oldChild.hot)
            this.oldChild.hot=populationvalue
          }else{
            this.oldChild.hot=populationvalue
            populationContainer.appendChild(populationvalue)
          }


          if(this.map.getSource("geojson")===undefined){
            this.map.addSource("geojson", {
              type: "geojson",
              data: linestring
            });
            this.map.addLayer({
              id: "距离分析",
              type: "line",
              source: "geojson",
              paint: {
                "line-width": 2.5,
                "line-color": "#3182bd"
              },
              layout: {
                "line-cap": "round",
                "line-join": "round"
              },
              // filter: ["in", "$type", "LineString"]
            });

          }else{
            this.map.getSource("geojson").setData(linestring)
          }
          if(this.map.getSource("attractionsource")===undefined){
              this. map.addSource("attractionsource", {
                type: "geojson",
                data: geojson
              });
              this. map.addLayer({
                id: "人流量分析",
                type: "circle",
                source: "attractionsource",
                minzoom: 7,
                paint: {
                  "circle-radius":10,
                  "circle-color": [
                    "interpolate",
                    ["linear"],
                    ["get", "Count"],
                    1,
                    "rgb(26,152,80)",
                    100,
                    "rgb(145,207,96)",
                    500,
                    "rgb(217,239,139)",
                    1000,
                    "rgb(254,224,139)",
                    5000,
                    "rgb(252,141,89)",
                    10000,
                    "rgb(215,48,39)"
                  ],
                  // "circle-opacity": ["interpolate", ["linear"], ["zoom"], 5, 0, 10, 1],
                },
                filter: ["in", "$type", "Point"]
              });
          }else{
            this.map.getSource("attractionsource").setData(geojson)
          }
        }},
    mouseDownHandleelse(event) {
      this.moveDataelse.x = event.pageX - this.$refs.kongtiao.offsetLeft
      this.moveDataelse.y = event.pageY - this.$refs.kongtiao.offsetTop
      event.currentTarget.style.cursor = 'move'
      window.onmousemove = this.mouseMoveHandleelse
    },
    mouseMoveHandleelse(event) {
      let moveLeft = event.pageX - this.moveDataelse.x + 'px'
      let moveTop = event.pageY - this.moveDataelse.y + 'px'
      this.$refs.kongtiao.style.left = moveLeft
      this.$refs.kongtiao.style.top = moveTop
    },
    mouseUpHandleelse(event) {
      window.onmousemove = null
      event.currentTarget.style.cursor = 'move'
    },
    mouseDownHandleelseE(event) {
      this.moveDataelseChart.x = event.pageX - this.$refs.echarts.offsetLeft
      this.moveDataelseChart.y = event.pageY - this.$refs.echarts.offsetTop
      event.currentTarget.style.cursor = 'move'
      window.onmousemove = this.mouseMoveHandleelseE
    },
    mouseMoveHandleelseE(event) {
      let moveLeft = event.pageX - this.moveDataelseChart.x + 'px'
      let moveTop = event.pageY - this.moveDataelseChart.y + 'px'
      this.$refs.echarts.style.left = moveLeft
      this.$refs.echarts.style.top = moveTop
    },
    mouseUpHandleelseE(event) {
      window.onmousemove = null
      event.currentTarget.style.cursor = 'move'
    }
    },
    watch:{
      checkedList(newValue,oldValue){

        let selecteddata=this.poidata.filter(x=>this.checkedList.indexOf(x.id)>-1)
        let temp = selecteddata.map(x=>x.id)
        this.$EventBus.$emit("newID",temp)
        let geojsondata = GeoJSON.parse(selecteddata,{"Point":["lon","lat"],include:['name',"id"]})
        this.selectedJSON=geojsondata
        this.getget()
        // console.log(geojsondata)
        // console.log(JSON.parse(JSON.stringify(geojsondata)))
        // console.log(this.map.getSource("attractionlayer"))
        // this.map.getSource("attractionlayer").setData(JSON.parse(JSON.stringify(geojsondata)))
      },
      poidata(n,o){
        let temp = this.poidata.map(x=>x.id)
        this.$EventBus.$emit("newID",temp)
        this.getAlLMyData()
        this.getget()
      }

    }

  };


</script>

<style scoped>
@import url("https://api.mapbox.com/mapbox-gl-js/v2.4.1/mapbox-gl.css");
#map {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
}


#features{
  overflow: scroll;
  position: absolute;
  top: 10%;
  right: 5%;
  /*bottom: 0;*/
  backdrop-filter: blur(2px);
  width: fit-content;
  background-color: rgba(255,255,255,0.6);
  border-radius: 12px;
  box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
  padding: 5px;
  height: fit-content;
  max-height: 70%;
  scrollbar-width: none;
}
#features::-webkit-scrollbar {
  display: none; /* Chrome Safari */
}

.poiInfo{
  margin: 12px 4px;
  padding: 2px;
  text-align: left;
}


body {
  margin: 0;
  padding: 0;
}

#menu {
  background: #fff;
  position: absolute;
  z-index: 1;
  top: 56px;
  left: 50px;
  border-radius: 12px;
  width: 100px;
  /*border: 1px solid rgba(0,0,0,0.4);*/
  font-family: 'Open Sans', sans-serif;
  backdrop-filter: blur(4px);
  background-color: rgba(255,255,255,0.6);
  box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
}

/*nav a{*/
/*  font-size: 5px;*/
/*  color: #404040;*/
/*  display: block;*/
/*  margin: 0;*/
/*  padding: 5px;*/
/*  text-decoration: none;*/
/*  border-bottom: 1px solid rgba(0,0,0,0.25);*/
/*  text-align: center;*/
/*}*/

#menu a:last-child {
  border: none;
}

#menu a:hover {
  background-color: #f8f8f8;
  color: #404040;
}
/*a:active  !*表示鼠标长按下*!*/
#menu a:active {
  background-color: #3887be;
  color: #ffffff;
}

#menu a:active:hover {
  background: #3074a4;
}
.distance-container {
  margin: auto;
  background-color: rgba(222, 235, 247, 0.5);
  position: absolute;
  top: 10px;
  left: 500px;
  z-index: 1;
  boreder:12px;
}
.population-container {
  margin: auto;
  background-color: rgba(222, 235, 247, 0.5);
  position: absolute;
  top: 10px;
  left: 740px;
  z-index: 1;
}
.distance-container {
  margin: auto;
  background-color: rgba(222, 235, 247, 0.5);
  position: absolute;
  top: 60px;
  left: 39%;
  z-index: 1;
  position: absolute;
  border-radius: 21px;
  padding: 2px;
  box-shadow: rgba(0, 0, 0, 0.24) 0px 6px 12px;
  /* font-weight: bold; */
  /* font-family: system-ui; */
}
.population-container {
  margin: auto;
  /* position: absolute; */
  background-color: rgba(255, 255, 255, 0.7);
  padding: 12px;
  border-radius: 12px;
  position: absolute;
  /* top: 20px; */
  backdrop-filter: blur(4px);
  top: 173px;
  left: 55px;
  z-index: 1;
  overflow: scroll;
  height: fit-content;
  max-height: 75%;
}
*::-webkit-scrollbar {

  display: none; /* Chrome Safari */

}

div#echartsDisplay {
  background: rgba(255,255,255,0.8);
  position: absolute;
  border-radius: 42px;
  padding: 13px;
  width: fit-content;
  height: fit-content;
  top: 140px;
  left: 528px;
}
</style>
