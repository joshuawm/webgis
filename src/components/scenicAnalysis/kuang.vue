<template>
  <div id="map">
    <div id="map_show">
      <!--类别选择子组件-->
      <!--<classify-choice/>-->
    </div>
  </div>
</template>

<script>
import mapboxgl from "@mapgis/mapbox-gl";
import Vue from "vue";
import VueComponentAPI from "@vue/composition-api";
Vue.use(VueComponentAPI);
import attractiondata from "../data/attractions";

export default {
  name: "jingdianfenxi",
  data() {
    return {
      activeIndex: this.$store.state.analysis_show
    };
  },
  components: {},
  mounted() {
    //实例化Map对象加载地图
    mapboxgl.accessToken =
      "pk.eyJ1Ijoiam9zaHVhbXdvbmciLCJhIjoiY2tzaXRlOXcyMHVhNzJ2bnN4aG11NW10aiJ9.RdgXiHX8GNMNWTr2X92ruQ";
    const map = new mapboxgl.Map({
      container: "map_show",
      style: "mapbox://styles/joshuamwong/ckte9azm523g217juhpczqo5q",
      center: [114.405906, 30.534768],
      zoom: 12
    });
    let navigatorController = new mapboxgl.NavigationControl();
    map.addControl(navigatorController, "top-left");
    map.on("load", () => {
      map.boxZoom.disable();
      const popup = new mapboxgl.Popup({
        closeButton: false
      });
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
          "text-color": "#FF8247"
        },
        layout: {
          "text-field": "{name}",
          "text-anchor": "right",
          "text-font": ["Open Sans Bold"],
          "text-line-height": 1.2,
          "text-size": 8,
          "text-offset": [-1, 0]
        }
      });
      //被选中的景点 以圆的形式展现
      map.addLayer(
        {
          id: "Scenic-highlighted",
          type: "circle",
          source: "attractionlayer1",
          paint: {
            "circle-radius": 10,
            "circle-color": "yellow",
            "circle-opacity": 0.5
          },
          filter: ["in", "attraction_id", ""],
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
          if (features.length >= 1000) {
            return window.alert("Select a smaller number of features");
          }
          const fips = features.map(
            feature => feature.properties.attraction_id
          );
          map.setFilter("Scenic-highlighted", ["in", "attraction_id", ...fips]);
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
        popup
          .setLngLat(e.lngLat)
          .setText(features[0].properties.name)
          .addTo(map);
      });
    });
  },
  methods: {
    // handleOpen(key, keyPath) {
    //   console.log(key, keyPath);
    // },
    // handleClose(key, keyPath) {
    //   console.log(key, keyPath);
    // },
    selectchoice(key, keyPath) {
      this.$store.commit("change_analysis_show", key);
    }
  }
};
</script>

<style scoped>
@import url("https://api.mapbox.com/mapbox-gl-js/v2.4.1/mapbox-gl.css");
/* #map {
  position: absolute;
  top: 60px;
  bottom: 0;
  width: 100%;
} */
#map_show {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  pointer-events: all;
}
</style>
