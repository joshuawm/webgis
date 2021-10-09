<template>
  <div>
    <div id="map"></div>
    <div id="distance" class="distance-container" ref="kongtiao" @mousedown="mouseDownHandleelse($event)" @mouseup="mouseUpHandleelse($event)"></div>
  </div>
</template>

<script>
import mapboxgl from "@mapgis/mapbox-gl";
import * as turf from "@turf/turf";
import jingdanimage from "../assets/jingdian32px.png";
import attractiondata from "../data/attractions.json";
import Vue from "vue";
import VueComponentAPI from "@vue/composition-api";
Vue.use(VueComponentAPI);

export default {
  name: "distance_anlysis",
  data() {
    return {
      moveDataelse: {
        x: null,
        y: null
      }
    };
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
  methods: {
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
      console.log('鼠标松开了')
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
.distance-container {
  margin: auto;
  background-color: rgba(222, 235, 247, 0.5);
  position: absolute;
  top: 10px;
  left: 50px;
  z-index: 1;
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
.distance-container {
  margin: auto;
  background-color: rgba(222, 235, 247, 0.5);
  position: absolute;
  top: 60px;
  left: 48%;
  z-index: 1;
  position: absolute;
  border-radius: 21px;
  padding: 2px;
  box-shadow: rgba(0, 0, 0, 0.24) 0px 6px 12px;
  /* font-weight: bold; */
  /* font-family: system-ui; */
}
</style>
