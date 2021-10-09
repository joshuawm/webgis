<template>
  <div>
    <div id="map"></div>
    <div id="extended">
      <button id="appendtolist" @click="appendclick">添加至分析列表</button>
    </div>
  </div>
</template>

<script>
import jingdanimage from "../assets/jingdian32px.png";
import mapboxgl from "@mapgis/mapbox-gl";
import Vue from "vue";
import VueComponentAPI from "@vue/composition-api";
Vue.use(VueComponentAPI);
import attractiondata from "../data/attractions.json";
import popupComponets from "./scenicpop";
const popup = Vue.extend(popupComponets);

export default {
  name: "jingdianfenxi",
  data() {
    return {
      activeIndex: this.$store.state.analysis_show,
      kuangfeatures: {}
    };
  },
  components: {},
  mounted() {
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
      let that = this;
      alert("请同时按住shift键和鼠标左键进行框选");
      map.loadImage(jingdanimage, (error, image) => {
        if (error) {
          console.log(error);
        } else {
          map.addImage("jingdian", image);
        }
        map.boxZoom.disable();
        const canvas = map.getCanvasContainer();
        let start;
        let current;
        let box;
        map.addSource("attractionlayer1", {
          type: "geojson",
          data: attractiondata
        });
        //景点注记
        map.addLayer({
          id: "attractionLayer1",
          type: "symbol",
          source: "attractionlayer1",
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
          }
        });
        //被选中的景点
        map.addLayer(
          {
            id: "Scenic-highlighted",
            type: "symbol",
            source: "attractionlayer1",
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
            filter: ["in", "id", ""],
            minzoom: 0,
            maxzoom: 22
          }
          // 'settlement-label'
        );
        canvas.addEventListener("mousedown", mouseDown, true);
        //计算鼠标的位置
        function mousePos(e) {
          const rect = canvas.getBoundingClientRect();
          return new mapboxgl.Point(
            e.clientX - rect.left - canvas.clientLeft,
            e.clientY - rect.top - canvas.clientTop
          );
        }
        //鼠标按下 鼠标和shift同时按下 记录鼠标初始位置start 添加MouseMove mouseup keydowm监听事件
        function mouseDown(e) {
          if (!(e.shiftKey && e.button === 0)) return;
          map.dragPan.disable();
          document.addEventListener("mousemove", onMouseMove);
          document.addEventListener("mouseup", onMouseUp);
          document.addEventListener("keydown", onKeyDown);

          start = mousePos(e);
        }
        //box大小
        function onMouseMove(e) {
          current = mousePos(e);
          if (!box) {
            box = document.createElement("div");
            box.classList.add("boxdrawchoice");
            canvas.appendChild(box);
          }
          const minX = Math.min(start.x, current.x),
            maxX = Math.max(start.x, current.x),
            minY = Math.min(start.y, current.y),
            maxY = Math.max(start.y, current.y);

          const pos = `translate(${minX}px, ${minY}px)`;
          box.style.transform = pos;
          box.style.width = maxX - minX + "px";
          box.style.height = maxY - minY + "px";
          box.style.backgroundColor = "rgba(56, 135, 190,0.5)";
          box.style.border = "2px solid #3887be";
        }
        //移除box
        function onMouseUp(e) {
          finish([start, mousePos(e)]);
        }
        //按esc提前结束
        function onKeyDown(e) {
          // If the ESC key is pressed
          if (e.keyCode === 27) finish();
        }
        //结束 移除鼠标键盘的事件监听
        function finish(bbox) {
          // Remove these events now that finish has been called.
          document.removeEventListener("mousemove", onMouseMove);
          document.removeEventListener("keydown", onKeyDown);
          document.removeEventListener("mouseup", onMouseUp);
          if (box) {
            box.parentNode.removeChild(box);
            box = null;
          }
          if (bbox) {
            //找到原图层中拉框内所有被渲染的点
            const features = map.queryRenderedFeatures(bbox, {
              layers: ["attractionLayer1"]
            });
            that.kuangfeatures = features;
            if (features.length >= 1000) {
              return window.alert("Select a smaller number of features");
            }
            const fips = features.map(feature => feature.properties.id);
            map.setFilter("Scenic-highlighted", ["in", "id", ...fips]);
          }
          map.dragPan.enable();
        }
        map.on("click", e => {
          const features = map.queryRenderedFeatures(e.point, {
            layers: ["Scenic-highlighted"]
          });
          // Change the cursor style as a UI indicator.
          map.getCanvas().style.cursor = features.length ? "pointer" : "";
          if (!features.length) {
            popup.remove();
            return;
          }
          new mapboxgl.Popup({ anchor: "right" })
            .setLngLat(e.lngLat)
            .setHTML("<div id='popup_kuang'></div>")
            .addTo(map);
          let popupinfo = {
            id: features[0].properties.id,
            type: "attractions"
          };
          new popup({
            propsData: {
              infos: {
                infos: {
                  id: features[0].properties.id,
                  typ: "attractions",
                  userID: this.$store.state.user_id
                }
              }
            }
          }).$mount("#popup_kuang");
          map.panTo([e.lngLat.lng, e.lngLat.lat]);
        });
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
    });
  },
  methods: {
    selectchoice(key, keyPath) {
      this.$store.commit("change_analysis_show", key);
    },
    appendclick() {
      alert("是否将已选择景点全部加入分析列表");
      //分发拉框内的景点数据
      let temp = this.kuangfeatures.map(x => {
        return x.properties.id;
      });
      console.log(this.kuangfeatures);
      console.log(temp);
      this.$store.commit("curd_list2analysis", { type: "add", value: temp });
      console.log("kuang:");
      console.log(this.kuangfeatures);
    }
  }
};
</script>

<style scoped>
@import url("https://api.mapbox.com/mapbox-gl-js/v2.4.1/mapbox-gl.css");
button {
  position: relative;
  background-clip: border-box;
  border-radius: 12px;
  backdrop-filter: blur(3px);
  color: #f5f5f7;
  background-color: rgba(29, 29, 31, 0.72);
  margin: 3px 3px;
  padding: 8px;
  border: none;
  float: right;
  font-weight: bold;
  font-size: inherit;
  font-family: "Microsoft Yahei", "Times New Roman", Times, serif;
  cursor: pointer;
}
#extended {
  width: 35%;
  position: absolute;
  top: 14%;
  right: 3%;
  z-index: 2;
}
#map {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  pointer-events: all;
}
/deep/ .mapboxgl-popup-content{
  width: fit-content;
  height: fit-content;
  background-color: rgba(255,255,255,0.8);
  box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
  border-radius: 14px;

}
/*controller叛变计划*/
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
