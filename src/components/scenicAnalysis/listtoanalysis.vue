<template>
  <div>
    <div id="map"></div>
    <pre id="features"></pre>
    <nav id="menu"></nav>
  </div>
</template>

<script>
  import mapboxgl from "@mapgis/mapbox-gl";
  import * as turf from "@turf/turf";
  import jingdanimage from "../../assets/icon/jingdian32px.png";
  import attractiondata from "../data/attractions.json";
  import attractionsCount from "../data/attractionsCount.json";
  import Vue from "vue";
  import VueComponentAPI from "@vue/composition-api";
  import popupComponets from "./scenicpop";
  const popup = Vue.extend(popupComponets);
  Vue.use(VueComponentAPI);

    export default {
      name: "listtoanalysis",
      data() {
        return {
          totalsceniclist:[]
        };
      },
      components: {},
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
        let navigatorController = new mapboxgl.NavigationControl();
        map.addControl(navigatorController, "top-left");
        //利用一个GeoJSON对象来储存测量对象
        var geojson = {
          type: "FeatureCollection",
          features: []
        };
        //添加类别选择数据
        this.$EventBus.$on("typelist", data => {
          this.totalsceniclist=this.totalsceniclist.concat(data);
          console.log("typechoice:")
          console.log(this.totalsceniclist)
        });
        //添加距离选择数据
        this.$EventBus.$on("distancelist", data => {
          this.totalsceniclist=this.totalsceniclist.concat(data);
          console.log("distancechoice:")
          console.log(this.totalsceniclist)
        });
        //添加拉框选择数据
        this.$EventBus.$on("kuanglist", data => {
          this.totalsceniclist=this.totalsceniclist.concat(data);
          console.log("kuangchoice:")
          console.log(this.totalsceniclist)
        });
        //添加单个景点选择数据 data为单个景点的ID数据
        this.$EventBus.$on("appendtoanalysis", data => {
          for (let i = 0; i <attractionsCount.features.length ; i++) {
            data===attractionsCount.features[i].properties.id?geojson=attractionsCount.features[i]:undefined;
          }
          this.totalsceniclist=this.totalsceniclist.concat(geojson);
          // console.log("singlechoice")
          // console.log("所有的景点分析列表中的数据")
          // console.log(this.totalsceniclist)
          // console.log("数据长度")
          // console.log(this.totalsceniclist.length)
        });
        //当前分析列表的所有景点数据都存在totalsceniclist里
        var liststring='';
        for (let i = 0; i <this.totalsceniclist.length; i++) {
          liststring=
            liststring+
            `<li>${this.totalsceniclist[i].properties.name}</li><br/>`

        }
        document.getElementById("features").innerHTML ="<br><b>当前分析列表的景点有：</b>"
          + "<button  @click='refresh()' style='float:right;background-color: white;border: 0px'>刷新</button><br><hr>"
          +`<ol>
            ${liststring}
            </ol>`
          map.on("load", () => {
          map.loadImage(jingdanimage, (error, image) => {
            if (error) {
              console.log(error);
            } else {
              map.addImage("jingdian", image);
            }
            const canvas = map.getCanvasContainer();
            canvas.style.cursor = "crosshair";
            //添加注记和景点图标
            map.addSource("attractionlayer", {
              type: "geojson",
              data: attractiondata
            });
            map.addLayer({
              id: "attractionLayer",
              type: "symbol",
              source: "attractionlayer",
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
              },
              minzoom: 0,
              maxzoom: 22
            });
          });
          //点选景点
          map.on("click", "attractionLayer", (e) =>{
            console.log("click_yes")
            new mapboxgl.Popup({anchor:"right"}).setLngLat(e.lngLat).setHTML("<div id='list_scenic'></div>").addTo(map);
            let popupinfo={
              id:e.features[0].properties.id,
              type:"attractions"
            };
            new popup({
              propsData:{
                popupInfo:popupinfo
              }
            }).$mount("#list_scenic");
            map.panTo([e.lngLat.lng,e.lngLat.lat])
          });
          //添加距离分析的source 和 layer
          map.addSource("geojson", {
            type: "geojson",
            data: geojson
          });
          map.addLayer({
            id: "measure-points",
            type: "circle",
            source: "geojson",
            paint: {
              "circle-radius": 5,
              "circle-color": "#3182bd"
            },
            filter: ["in", "$type", "Point"]
          });
          map.addLayer({
            id: "measure-lines",
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
            filter: ["in", "$type", "LineString"]
          });
          geojson.features.push(this.totalsceniclist);
          if (geojson.features.length > 1) {
            linestring.geometry.coordinates = geojson.features.map(function (
              point
            ) {
              return point.geometry.coordinates;
            });
            //将线数据写入geojson
            geojson.features.push(linestring);
            var value = document.createElement("pre");
            value.textContent =
              "距离总和是:" +
              turf.lineDistance(linestring).toLocaleString() +
              "km";
            distanceContainer.appendChild(value);
          }
          //添加价格评分分析的source和layer
          //添加人流量分析的source 和 layer
          for (let i = 0; i < this.totalsceniclist.length; i++) {
            for (let j = 0; j < attractionsCount.features.length; j++) {
              if (
                this.totalsceniclist[i].properties.id ===
                attractionsCount.features[j].properties.id
              ) {
                //更新totalsceniclist给数组的每一个元素添加Count属性
                this.totalsceniclist[i].properties.Count =
                  attractionsCount.features[j].properties.count;
              }
            }
          }
          map.addSource("attractionsource", {
            type: "geojson",
            data: this.totalsceniclist
          });
          map.addLayer({
            id: "attractionvisit-heat",
            type: "heatmap",
            source: "attractionsource",
            maxzoom: 10,
            paint: {
              //每个景点的权重 将count作为权重的依据
              "heatmap-weight": [
                "interpolate",
                ["linear"],
                ["get", "Count"],
                1,
                0,
                1000,
                100
              ],
              "heatmap-intensity": [
                "interpolate",
                ["linear"],
                ["zoom"],
                5,
                1,
                10,
                5
              ],
              "heatmap-color": [
                "interpolate",
                ["linear"],
                ["heatmap-density"],
                0,
                "rgba(26,152,80,0)",
                0.2,
                "rgb(145,207,96)",
                0.4,
                "rgb(217,239,139)",
                0.6,
                "rgb(254,224,139)",
                0.8,
                "rgb(252,141,89)",
                1,
                "rgb(215,48,39)"
              ],
              "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 5, 2, 10, 20],
              "heatmap-opacity": ["interpolate", ["linear"], ["zoom"], 5, 1, 10, 0]
            }
          });
          map.addLayer({
            id: "attractionvisit-point",
            type: "circle",
            source: "attractionsource",
            minzoom: 7,
            paint: {
              "circle-radius": [
                "interpolate",
                ["linear"],
                ["zoom"],
                5,
                ["interpolate", ["linear"], ["get", "Count"], 1, 1, 1000, 4],
                10,
                ["interpolate", ["linear"], ["get", "Count"], 1, 5, 1000, 20]
              ],
              // Color circle by earthquake magnitude
              "circle-color": [
                "interpolate",
                ["linear"],
                ["get", "Count"],
                1,
                "rgba(26,152,80,0)",
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

              // Transition from heatmap to circle layer by zoom level
              "circle-opacity": ["interpolate", ["linear"], ["zoom"], 5, 0, 10, 1]
            }
          });
          map.on("click", "attractionvisit-point", function(e) {
            console.log("tesdt");
            var sentence = "";
            if (e.features[0].properties.count < 1000) {
              sentence = "该景点人数适宜，可放心前往";
            } else {
              sentence = "该景点人数可能较多，请谨慎前往";
            }
            new mapboxgl.Popup()
              .setLngLat([e.lngLat.lng, e.lngLat.lat])
              .setHTML(
                `<b>${e.features[0].properties.name}</b>` +
                "在携程的评论数量为: " +
                `<b>${e.features[0].properties.count.toString()}</b>` +
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

      },
      methods: {
        refresh() {
          alert("刷新列表数据")
          console.log("数据长度")
          console.log(this.totalsceniclist.length)
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
  body {
    margin: 0;
    padding: 0;
  }
  #features {
    position: absolute;
    top: 10px;
    right: 0;
    bottom: 0;
    width: 300px;
    height: 570px;
    overflow: auto;
    background: rgba(255, 255, 255, 0.8);
  }
  #menu {
    background: #fff;
    position: absolute;
    z-index: 1;
    top: 10px;
    left: 50px;
    border-radius: 3px;
    width: 100px;
    border: 1px solid rgba(0,0,0,0.4);
    font-family: 'Open Sans', sans-serif;
  }
  #menu  a{
    font-size: 13px;
    color: #404040;
    display: block;
    margin: 0;
    padding: 5px;
    text-decoration: none;
    border-bottom: 1px solid rgba(0,0,0,0.25);
    text-align: center;
  }

  #menu  a:last-child {
    border: none;
  }

  #menu  a:hover {
    background-color: #f8f8f8;
    color: #404040;
  }
  /*a:active  !*表示鼠标长按下*!*/
  #menu  a:active {
    background-color: #3887be;
    color: #ffffff;
  }

  #menu  a:active:hover {
    background: #3074a4;
  }
</style>
