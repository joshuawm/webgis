<template>
  <div>
    <div id="map"></div>
  </div>
</template>

<script>
// import geojsonvt from "geojson-vt"
import mapboxgl from "@mapgis/mapbox-gl";
// import {defineCompoent,createApp,ref,nextTick } from "@vue/composition-api"
import Vue from "vue";
import VueComponentAPI from "@vue/composition-api";
import * as turf from "@turf/turf";
Vue.use(VueComponentAPI);
// Vue.use(turf)
import attractiondata from "../data/attractions.json";

// const popup = Vue.extend(popupcomponent)
export default {
  name: "map",
  props: {
    bufferradius: {
      type: Number
    }
  },
  data() {
    return {};
  },
  components: {},
  setup() {},
  mounted() {
    //实例化Map对象加载地图
    mapboxgl.accessToken =
      "pk.eyJ1Ijoiam9zaHVhbXdvbmciLCJhIjoiY2tzaXRlOXcyMHVhNzJ2bnN4aG11NW10aiJ9.RdgXiHX8GNMNWTr2X92ruQ";
    const map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/joshuamwong/ckte9azm523g217juhpczqo5q",
      center: [114.405906, 30.534768],
      zoom: 12
    });
    let navigatorController = new mapboxgl.NavigationControl();
    map.addControl(navigatorController, "top-left");
    map.on("load", () => {
      const popup = new mapboxgl.Popup({
        closeButton: false
      });
      const canvas = map.getCanvasContainer();
      //鼠标按下的位置 即缓冲区的中心
      var buffercenter = [];
      //缓冲区的大小
      var bufferradius;
      map.addSource("attractionlayer", {
        type: "geojson",
        data: attractiondata
      });
      map.addLayer({
        id: "attractionLayer",
        type: "symbol",
        source: "attractionlayer",
        layout: {
          "text-field": "{name}",
          "text-anchor": "right",
          "text-font": ["Open Sans Bold"],
          "text-line-height": 1.2,
          "text-size": 12,
          "text-offset": [-1, 0]
        }
      });

      let ptsWithincir;
      map.on("click", e => {
        //记录鼠标按下的位置的经纬度buffercenter
        buffercenter[0] = e.lngLat.lng;
        buffercenter[1] = e.lngLat.lat;
        //后面需要根据选择动态生成bufferradius  单位是km
        // bufferradius=10;
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

            //缓冲区内的景点名字
            // if(ptsWithincir.features.length!==0){
            //   for(let i=0;i<ptsWithincir.features.length;i++){
            //     var choicehighlight=attractiondata.features.filter
            //     (item=>(item.geometry.coordinates[0]===ptsWithincir.features[i].geometry.coordinates[0])&&
            //       (item.geometry.coordinates[1]===ptsWithincir.features[i].geometry.coordinates[1]));
            //     console.log(choicehighlight[0]. properties.name);
            //   }
            // }
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
          //在缓冲区内的景点 以黄色小圆的形式展现
          map.addLayer({
            id: "withincircle",
            type: "circle",
            source: "ptswithincirsource",
            paint: {
              "circle-radius": 10,
              "circle-color": "yellow",
              "circle-opacity": 0.5
            },
            minzoom: 0,
            maxzoom: 22
          });
        } else {
          //更新数据
          map.getSource("bfcirclesource").setData(circle_buffergson);
          map.getSource("ptswithincirsource").setData(ptsWithincir);
        }
      }),
        //鼠标悬浮在高亮的景点 会有景点名称的弹窗显示
        map.on("mouseover", "withincircle", function(e) {
        
          // 当鼠标点击高亮的景点时  鼠标改变style为pointer
          map.getCanvas().style.cursor = ptsWithincir.features.length
            ? "pointer"
            : "";
          if (!ptsWithincir.features.length) {
            popup.remove();
            return;
          }
       if (ptsWithincir.features.length !== 0) {
              var choicehighlight = attractiondata.features.filter(
                item =>item.geometry.coordinates ===e.lngLat
              );
              var name=choicehighlight[0];
            
          }
             popup
            .setLngLat(e.lngLat)
            .setText(name)
            .addTo(map);
        });
    });
  },
  methods: {}
};
</script>

<style scoped>
@import url("https://api.mapbox.com/mapbox-gl-js/v2.4.1/mapbox-gl.css");
#map {
  position: absolute;
  top: 0px;
  bottom: 0;
  width: 100%;
}
.bcirclechoice {
  background: rgba(56, 135, 190, 0.1);
  border: 2px solid #3887be;
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
}
</style>
