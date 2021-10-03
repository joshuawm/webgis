<template>
  <div>
    <div id="map"></div>
  </div>
</template>

<script>
import mapboxgl from "@mapgis/mapbox-gl";
import jingdanimage from "../../assets/icon/jingdian32px.png";
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
    bufferradius: {
      type: Number
    }
  },
  data() {
    return {};
  },
  components: {},
  mounted() {
    this.$EventBus.$on("buffer_km", circlekm => {
      this.bufferradius = circlekm;
    });
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
            "text-color": "#FF8247"
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
            console.log(pointsfeatures)
          let popupinfo = {
            id: pointsfeatures[0].properties.id,
            type: "attractions"
          };
          new popup({
            propsData: {
              popupInfo: popupinfo
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
  methods: {}
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
</style>
