<template>
  <div>
    <div id="map"></div>
  </div>
</template>

<script>
import mapboxgl from "@mapgis/mapbox-gl";
import Vue from "vue";
import VueComponentAPI from "@vue/composition-api";
import attractionsCount from "../data/attractionsCount.json";
Vue.use(VueComponentAPI);

export default {
  name: "map",
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
      center: this.$store.state.mapCenter,
      zoom: this.$store.state.mapZoom
    });
    let navigatorController = new mapboxgl.NavigationControl();
    map.addControl(navigatorController, "top-left");
    map.on("load", () => {
      map.addSource("attractionsource", {
        type: "geojson",
        data: attractionsCount
      });
      //景点注记
      map.addLayer({
        id: "attractionLayer",
        type: "symbol",
        source: "attractionsource",
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
      //开始构造景点人流量的热力图
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
            ["get", "count"],
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
            ["interpolate", ["linear"], ["get", "count"], 1, 1, 1000, 4],
            10,
            ["interpolate", ["linear"], ["get", "count"], 1, 5, 1000, 20]
          ],
          // Color circle by earthquake magnitude
          "circle-color": [
            "interpolate",
            ["linear"],
            ["get", "count"],
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
    });
    map.on("click", "attractionvisit-point", function(e) {
      console.log("tesdt");
      var sentence = "";
      if (e.features[0].properties.count < 1000) {
        sentence = "该景点人数适宜，可放心前往";
      } else {
        sentence = "该景点人数可能较多，请谨慎前往";
      }
      new mapboxgl.Popup({className:"popClass"})
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
/deep/ .popClass{
  border-radius: 12px;
  backdrop-filter: blur(3px);
  background-color: rgba(255,255,255,0.72);
}
/deep/ .mapboxgl-popup-content {
  position: relative;
  background: transparent;
  border-radius: 3px;
  /* box-shadow: 0 1px 2px rgb(0 0 0 / 10%); */
  padding: 10px 10px 15px;
  pointer-events: auto;
}
</style>
