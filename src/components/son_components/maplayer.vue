<template>
  <div>
    <div id="map"></div>
    <!-- <global-select></global-select> -->
  </div>
</template>

<script>
import Vue from "vue";
// import {EventBus} from "./eventBus"
import mapboxgl from "@mapgis/mapbox-gl";

//INITIAL SERIES

//图标文件
import jingdian from "../../assets/icon/jingdian32px.png";
import meishi from "../../assets/icon/meishijiayin 32px.png";
import jiudian from "../../assets/icon/jiudian32px.png";
//GeoJSON
import attractiondata from "../data/attractions.json";
//GeoJSON占位数据
import GlobalSelect from "../son_components/globalSelect";

//popup事件
import popupComponets from "../son_components/popupcontent";
const popup = Vue.extend(popupComponets);
export default {
  name: "basemap",
  data() {
    return {
      map: undefined,
      marker: undefined
    };
  },
  mounted() {
    this.initialMap();
    this.initialALayer();
    this.threeDBarChart();

    //监听事件
    this.$EventBus.$on("update", data => {
      this.update(data.theid, data.geojson);
    });

    this.$EventBus.$on("log", ji => {});

    this.$EventBus.$on("markers", info => {
      if (this.marker === undefined) {
        this.marker = new mapboxgl.Marker({
          color: "#568bfe",
          draggable: false
        })
          .setLngLat(info)
          .addTo(this.map);
      } else {
        this.marker.setLngLat(info);
      }

      // new popup({
      //   propsData:{
      //     popupInfo:popupinfo
      //   }
      // }).$mount("#popupcontent")
    });

    this.$EventBus.$on("gotolayer", lngLat => {
      this.map.flyTo({
        center: lngLat
      });
    });

    this.$EventBus.$on("markerClear", () => {
      if (this.marker !== undefined) {
        this.marker.remove();
        this.marker = undefined;
      }
    });
  },
  methods: {
    initialMap() {
      let that = this;
      mapboxgl.accessToken =
        "pk.eyJ1Ijoiam9zaHVhbXdvbmciLCJhIjoiY2tzaXRlOXcyMHVhNzJ2bnN4aG11NW10aiJ9.RdgXiHX8GNMNWTr2X92ruQ";
      this.map = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/joshuamwong/ckte9azm523g217juhpczqo5q",
        center: that.$store.state.mapCenter,
        zoom: that.$store.state.mapZoom,
        preserveDrawingBuffer: true
      });
      let navigatorController = new mapboxgl.NavigationControl();
      this.map.addControl(navigatorController, "top-left");
    },
    initialALayer() {
      let that = this;
      //attractions
      this.map.on("load", () => {
        this.map.loadImage(jingdian, (error, image) => {
          if (error) {
            console.log(error);
          } else {
            this.map.addImage("jingdianImage", image);
          }

          this.map.addSource("attractionSource", {
            type: "geojson",
            data: attractiondata
          });

          this.map.addLayer({
            id: "attractionLayer",
            type: "symbol",
            source: "attractionSource",
            layout: {
              "icon-image": "jingdianImage",
              "text-field": "{name}",
              "text-anchor": "right",
              "text-font": ["Open Sans Bold"],
              "text-line-height": 1.2,
              "text-size": 12,
              "text-offset": [-1, 0]
            }
          });
        });
      });
      this.map.on("click", "attractionLayer", e => {
        if (that.$store.state.ybstates !== false) {
          that.$store.commit("set_yb_jingdian", e.features[0].properties);
        } else if (that.$store.state.xystates !== false) {
          that.$store.commit("set_xy_jingdian", e.features[0].properties);
        } else {
          new mapboxgl.Popup({ anchor: "right", className: "pop-up" })
            .setLngLat([e.lngLat.lng, e.lngLat.lat])
            .setHTML("<div id='popupcontent'></div>")
            .addTo(this.map);
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
          }).$mount("#popupcontent");
          this.map.panTo([e.lngLat.lng, e.lngLat.lat]);
        }
      });

      this.map.on("wheel", function() {
        let range = that.map.getZoom();
        that.$store.commit("set_map_zoom", range);
        let c = that.map.getCenter();
        that.$store.commit("set_map_center", c);
      });
      this.map.on("move", function() {
        let range = that.map.getZoom();
        that.$store.commit("set_map_zoom", range);
        let c = that.map.getCenter();
        that.$store.commit("set_map_center", c);
      });
    },
    update(id, geojson) {
      this.map.getSource(id).setData(geojson);
    }
  },
  components: {
    GlobalSelect
  }
};
</script>

<style scoped>
@import url("https://api.mapbox.com/mapbox-gl-js/v2.4.1/mapbox-gl.css");
#map {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 100%;
}
global-select {
  pointer-events: all;
}
</style>
