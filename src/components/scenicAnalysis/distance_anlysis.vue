<template>
  <div>
    <div id="map"></div>
    <div id="distance" class="distance-container"></div>
  </div>
</template>

<script>
import mapboxgl from "@mapgis/mapbox-gl";
import * as turf from "@turf/turf";
import jingdanimage from "../../assets/icon/jingdian32px.png";
import attractiondata from "../data/attractions.json";
import Vue from "vue";
import VueComponentAPI from "@vue/composition-api";
Vue.use(VueComponentAPI);

export default {
export default {
  name: "distance_anlysis",
  data() {
    return {};
  },
  components: {},
  mounted() {
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
    var distanceContainer = document.getElementById("distance");
    //利用一个GeoJSON对象来储存测量对象
    var geojson = {
      type: "FeatureCollection",
      features: []
    };
    //在点之间绘制线
    var linestring = {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: []
      }
    };
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
      map.on("click", function(e) {
        var features = map.queryRenderedFeatures(e.point, {
          layers: ["measure-points"]
        });
        //一个点一个点往地图中添加
        if (geojson.features.length > 1) geojson.features.pop();
        distanceContainer.innerHTML = "";
        //地图中有一个点，移除；并且开始重绘
        if (features.length) {
          var id = features[0].properties.id;
          geojson.features = geojson.features.filter(function(point) {
            return point.properties.id !== id;
          });
        } else {
          var point = {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [e.lngLat.lng, e.lngLat.lat]
            },
            properties: {
              id: String(new Date().getTime())
            }
          };
          //将点数据写入geojson
          geojson.features.push(point);
        }
        if (geojson.features.length > 1) {
          linestring.geometry.coordinates = geojson.features.map(function(
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
        map.getSource("geojson").setData(geojson);
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
body {
  margin: 0;
  padding: 0;
}
.distance-container {
  margin: auto;
  background-color: rgba(222, 235, 247, 0.5);
  position: absolute;
  top: 10px;
  left: 50px;
  z-index: 1;
}
</style>
