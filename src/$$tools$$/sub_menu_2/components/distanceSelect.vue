<template>
  <div id="god">
    <div id="map"></div>

    <div id="extended">
      <button id="appendtolist" @click="appendclick">添加至分析列表</button>
      <div id="buttonChoice">
        <div class="button" v-for="dis in distance" :key="dis.name" @click="bufferradius=dis.value">
          <span>{{dis.name}}</span>
        </div>
        <div class="button">
          <label>自定义</label>
          <input v-model="customeDistance" @keydown.enter="Number(customeDistance)===(NaN|0)?alert('input valid value'):bufferradius=Number(customeDistance)"></input>
          <span class="el-icon-check" @click="Number(customeDistance)===(NaN|0)?alert('input valid value'):bufferradius=Number(ustomeDistance)"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import mapboxgl from "@mapgis/mapbox-gl";
import jingdanimage from "../assets/jingdian32px.png";
import Vue from "vue";
import VueComponentAPI from "@vue/composition-api";
import * as turf from "@turf/turf";
import attractiondata from "../data/attractions.json";
import popupComponets from "./scenicpop";
const popup = Vue.extend(popupComponets);
Vue.use(VueComponentAPI);

export default {
  name: "map",
  props: {

  },
  data() {
    return {
      ptswithcirdata:{},
      bufferradius:1,
      distance:[{name:"1km",value:1},{name:"5km",value:5},{name:"10km",value:10}],
      customeDistance:null,

    };
  },
  components: {},
  mounted() {
    let that = this
    //实例化Map对象加载地图
    mapboxgl.accessToken =
      "pk.eyJ1Ijoiam9zaHVhbXdvbmciLCJhIjoiY2tzaXRlOXcyMHVhNzJ2bnN4aG11NW10aiJ9.RdgXiHX8GNMNWTr2X92ruQ";
    const map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/joshuamwong/ckte9azm523g217juhpczqo5q",
      center: this.$store.state.mapCenter,
      zoom: this.$store.state.mapZoom
    });
    let navigatorController = new mapboxgl.NavigationControl();
    map.addControl(navigatorController, "top-left");
    map.on("load", () => {
      map.loadImage(jingdanimage, (error, image) => {
        if (error) {
          console.log(error);
        } else {
          map.addImage("jingdian", image);
        }
        const canvas = map.getCanvasContainer();
        canvas.style.cursor = "crosshair";
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
      });
      const canvas = map.getCanvasContainer();
      //鼠标按下的位置 即缓冲区的中心
      var buffercenter = [];
      //缓冲区的大小
      var bufferradius;
      let ptsWithincir;
      map.on("dblclick", e => {
        //记录鼠标按下的位置的经纬度buffercenter
        buffercenter[0] = e.lngLat.lng;
        buffercenter[1] = e.lngLat.lat;
        let b_circle;
        let circle_buffergson;
        //生成半径为bufferradius的缓冲区 circle_buffergson是缓冲区的Geojson数据
        circle_buffergson = buffer_circle(buffercenter, this.bufferradius);
        function buffer_circle(center, radius) {
          if (!circle_buffergson) {
            b_circle = document.createElement("div");
            b_circle.classList.add("bcirclechoice");
            canvas.appendChild(b_circle);
          }
          var point = turf.point(center);
          return turf.buffer(point, radius);
        }
        //结束 移除前一次形成的缓冲区
        finish(circle_buffergson);
        function finish(buffergson) {
          if (b_circle) {
            b_circle.parentNode.removeChild(b_circle);
            b_circle = null;
          }
          if (buffergson) {
            var pointscenic = attractiondata.features.map(x => {
              var pointscenic = x.geometry.coordinates;
              return pointscenic;
            });
            var all_points = turf.points(pointscenic);
            var searchWithin = turf.polygon(buffergson.geometry.coordinates);
            //在缓冲区内景点 Geojson 格式
            ptsWithincir = turf.pointsWithinPolygon(all_points, searchWithin);
            //数据传递

            that.ptswithcirdata=ptsWithincir
            // 缓冲区内的景点名字
            if (ptsWithincir.features.length !== 0) {
              for (let i = 0; i < ptsWithincir.features.length; i++) {
                var choicehighlight = attractiondata.features.filter(
                  item =>
                    item.geometry.coordinates[0] ===
                      ptsWithincir.features[i].geometry.coordinates[0] &&
                    item.geometry.coordinates[1] ===
                      ptsWithincir.features[i].geometry.coordinates[1]
                );
                ptsWithincir.features[i].properties.name =
                  choicehighlight[0].properties.name;
                ptsWithincir.features[i].properties.id =
                  choicehighlight[0].properties.id;
              }
            }
            if (ptsWithincir.features.length < 1) {
              return window.alert("该范围内没有景点");
            } else {
              alert(
                "该范围内有" +
                  ptsWithincir.features.length.toString() +
                  "个景区"
              );
            }
          }
        }
        if (
          (map.getSource("bfcirclesource") &&
            map.getSource("ptswithincirsource")) === undefined
        ) {
          //缓冲区 可视化
          map.addSource("bfcirclesource", {
            type: "geojson",
            data: circle_buffergson
          });
          map.addSource("ptswithincirsource", {
            type: "geojson",
            data: ptsWithincir
          });
          map.addLayer({
            id: "buffercircle",
            type: "fill",
            source: "bfcirclesource",
            paint: {
              "fill-color": "rgba(56, 135, 190, 0.5)"
            },
            minzoom: 0,
            maxzoom: 22
          });
          //在缓冲区内的景点
          map.addLayer({
            id: "withincircle",
            type: "symbol",
            source: "ptswithincirsource",
            paint: {
              "text-color": "#FF8247"
            },
            layout: {
              "icon-image": "jingdian",
              "text-field": "{name}",
              "text-anchor": "right",
              "text-font": ["Open Sans Bold"],
              "text-line-height": 1.2,
              "text-size": 12,
              "text-offset": [-1, 0]
            }
          });
        } else {
          //更新数据
          map.getSource("bfcirclesource").setData(circle_buffergson);
          map.getSource("ptswithincirsource").setData(ptsWithincir);
        }
      }),
        //鼠标悬浮在高亮的景点 会有景点名称的弹窗显示
      map.on("click", "withincircle", e => {
          const pointsfeatures = map.queryRenderedFeatures(e.point, {
            layers: ["withincircle"]
          });
          // 当鼠标点击高亮的景点时  鼠标改变style为pointer
          map.getCanvas().style.cursor = ptsWithincir.features.length
            ? "pointer"
            : "";
          if (!ptsWithincir.features.length) {
            popup.remove();
            return;
          }
          new mapboxgl.Popup({ anchor: "right" })
            .setLngLat(e.lngLat)
            .setHTML("<div id='popup_distance'></div>")
            .addTo(map);
          let popupinfo = {
            id: pointsfeatures[0].properties.id,
            type: "attractions"
          };
          new popup({
            propsData: {
              infos: {
                infos: {
                  id: e.features[0].properties.id,
                  typ: "attractions",
                  userID: this.$store.state.user_id
                }
              }
            }
          }).$mount("#popup_distance");
          map.panTo([e.lngLat.lng, e.lngLat.lat]);
        });
        let that = this
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
  },
  methods: {
    appendclick(){
      alert("是否将已选择景点全部加入分析列表");
      console.log(this.ptswithcirdata.features)
      let dat = this.ptswithcirdata.features.map(x=>{
        return x.properties.id
      })
      console.log(dat)
      this.$store.commit("curd_list2analysis",{type:"add",value:dat})
      // this.$EventBus.$emit("distancelist",this.ptswithcirdata.features);
      console.log("distance")
      console.log(this.ptswithcirdata.features)
    }
  },
  watch:{
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
  height: 100%;
  pointer-events: all;
}
/*#appendtolist {*/
/*  position: absolute;*/
/*  z-index: 1;*/
/*  top: 10px;*/
/*  right: 10px;*/
/*  border-radius: 3px;*/
/*  width: 150px;*/
/*}*/
.button{
  background-clip: border-box;
  border-radius: 12px;
  backdrop-filter: blur(3px);
  background-color: rgba(29,29,31,0.72);
  color: #f5f5f7;
  cursor: pointer;
  margin: 3px 3px;
  padding: 8px;
}
button{
  position: relative;
  background-clip: border-box;
  border-radius: 12px;
  backdrop-filter: blur(3px);
  background-color: rgba(29,29,31,0.72);
  color: #f5f5f7;
  margin: 3px 5px;
  padding: 8px;
  border: none;
  float: right;
  font-weight: bold;
  font-size: inherit;
  font-family: serif;
}
#buttonChoice{
  display: flex;
  flex-wrap: wrap;
}
#extended{
  width: 35%;
  position: absolute;
  top: 10%;
  right: 3%;
  z-index: 2;
}

input{
  width:50px;
  border-radius: 12px;
  background-color: rgba(255,255,255,0.2);
  border: none;
}
/deep/ .mapboxgl-popup-content{
  width: fit-content;
  height: fit-content;
  background-color: rgba(255,255,255,0.8);
  box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
  border-radius: 14px;

}
/deep/ .mapboxgl-control-container {
  position: absolute;
  right: 13.1%;
}
/deep/ .mapboxgl-ctrl-group:not(:empty) {
  /* box-shadow: 0 0 0 2px rgb(0 0 0 / 10%); */
  display: flex;
  box-shadow: 0 0 0 2px rgb(0 0 0 / 0%);
  border-radius: 0px;
  background: transparent;
}
/deep/ .mapboxgl-ctrl-top-left .mapboxgl-ctrl {
  margin: 0px;
  float: left;
}
/deep/ .mapboxgl-ctrl-group button {
  top: 0;
  right: 0;
  width: 40px;
  height: 40px;
  display: block;
  padding: 0;
  outline: none;
  border: 0;
  box-sizing: border-box;
  background-color: transparent;
  cursor: pointer;
  height: 40px;
  width: 40px;
}
/deep/ .mapboxgl-ctrl button.mapboxgl-ctrl-zoom-in .mapboxgl-ctrl-icon {
  background-image: url("../assets/plus.svg");
  background-size: cover;
  transform: scale(0.3);
}
/deep/ .mapboxgl-ctrl button.mapboxgl-ctrl-zoom-out .mapboxgl-ctrl-icon {
  background-image: url("../assets/minus.svg");
  background-size: cover;
  transform: scale(0.3);
}
/deep/ .mapboxgl-ctrl button.mapboxgl-ctrl-compass .mapboxgl-ctrl-icon {
  background-image: url("../assets/compass.svg");
  background-size: cover;
  transform: scale(0.45) !important;
}
</style>
