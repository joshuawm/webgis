<template>
  <div id="god">
    <div id="map"></div>
    <div class="basemapSwitch">
      <div class="switchPanel">
        <div class="styles">
          <img
            :src="require('./assets/default.png')"
            alt="默认"
            @click="mapChange('default')"
          />
          <p @click="mapChange('default')">默认</p>
        </div>
        <div class="styles">
          <img
            :src="require('./assets/bubble.png')"
            alt="bubble"
            @click="mapChange('bubble')"
          />
          <p @click="mapChange('bubble')">bubble</p>
        </div>
        <div class="styles">
          <img
            :src="require('./assets/sateline.jpg')"
            alt="卫星"
            @click="mapChange('satellite')"
          />
          <p @click="mapChange('satellite')">卫星</p>
        </div>
      </div>
      <div class="switchText">
        底图切换
      </div>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
// import {EventBus} from "./eventBus"
import mapboxgl from "@mapgis/mapbox-gl";

//INITIAL SERIES

//图标文件
import jingdian from "./assets/jingdian32px.png";
import meishi from "./assets/meishijiayin 32px.png";
import jiudian from "./assets/jiudian32px.png";
//GeoJSON
import attractiondata from "./data/attractions.json";
//GeoJSON占位数据
import emptyGeoJSON from "./data/empty.json";

//popup事件
import popupComponets from "./components/popupcontent";
const popup = Vue.extend(popupComponets);
export default {
  name: "basemap",
  data() {
    return {
      map: undefined,
      marker: undefined,
      styleStore:[
        {
          name:"default",
          style:"mapbox://styles/joshuamwong/ckte9azm523g217juhpczqo5q"
        },
        {
          name:"bubble",
          style:"mapbox://styles/joshuamwong/cku0ntnkl4oqg17nwxmvdf244"
        },
        {
          name:"stateline",
          style:"mapbox://styles/joshuamwong/cku0nu05e4p5j17nvzfsyb5xv"
        }
      ]

    };
  },
  mounted() {
    this.initialMap();
    this.initialALayer();

    //监听事件
    this.$EventBus.$on("update", data => {
      console.log(data);
      this.update(data.theid, data.geojson);
    });

    this.$EventBus.$on("log", ji => {
      console.log("recevied");
    });

    this.$EventBus.$on("marker", info => {
      console.log(info);
      if (this.marker === undefined) {
        this.marker = new mapboxgl.Marker({
          color: "#568bfe",
          draggable: false
        })
          .setLngLat([info.lat, info.lng])
          .addTo(this.map);
      } else {
        this.marker.setLngLat([info.lat, info.lng]);
      }

      this.map.panTo([info.lat, info.lng]);
      // new popup({
      //   propsData:{
      //     popupInfo:popupinfo
      //   }
      // }).$mount("#popupcontent")
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
      //attractions
      let that = this
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
      //meishi
      this.map.on("load", () => {
        this.map.loadImage(meishi, (error, image) => {
          if (error) {
            console.log(error);
          } else {
            this.map.addImage("meishiImage", image);
          }

          this.map.addSource("meishiSource", {
            type: "geojson",
            data: emptyGeoJSON
          });
          this.map.addLayer({
            id: "meishiLayer",
            type: "symbol",
            source: "meishiSource",
            layout: {
              "icon-image": "meishiImage",
              "text-field": "{catering_name}",
              "text-anchor": "right",
              "text-font": ["Open Sans Bold"],
              "text-line-height": 1.2,
              "text-size": 12,
              "text-offset": [-1, 0]
            }
          });
        });
      });
      this.map.on("click", "meishiLayer", e => {
        new mapboxgl.Popup({ anchor: "right", className: "pop-up" })
          .setLngLat([e.lngLat.lng, e.lngLat.lat])
          .setHTML("<div id='popupcontent'></div>")
          .addTo(this.map);
        new popup({
          propsData: {
            infos: {
              infos: {
                id: e.features[0].properties.catering_id,
                typ: "caterings",
                userID: undefined
              }
            }
          }
        }).$mount("#popupcontent");
        // this.map.panTo([e.lngLat.lng,e.lngLat.lat])
        this.map.jumpTo({ around: [e.lngLat.lng, e.lngLat.lat] });
      });

      //jiudian
      this.map.on("load", () => {
        this.map.loadImage(jiudian, (error, image) => {
          if (error) {
            console.log(error);
          } else {
            this.map.addImage("jiudianImage", image);
          }

          this.map.addSource("jiudianSource", {
            type: "geojson",
            data: emptyGeoJSON
          });
          this.map.addLayer({
            id: "jiudianLayer",
            type: "symbol",
            source: "jiudianSource",
            layout: {
              "icon-image": "jiudianImage",
              "text-field": "{hotel_name}",
              "text-anchor": "right",
              "text-font": ["Open Sans Bold"],
              "text-line-height": 1.2,
              "text-size": 12,
              "text-offset": [-1, 0]
            }
          });
        });
      });
      this.map.on("click", "jiudianLayer", e => {
        new mapboxgl.Popup({ anchor: "right", className: "pop-up" })
          .setLngLat([e.lngLat.lng, e.lngLat.lat])
          .setHTML("<div id='popupcontent'></div>")
          .addTo(this.map);
        new popup({
          propsData: {
            infos: {
              infos: {
                id: e.features[0].properties.hotel_id,
                typ: "hotels",
                userID: undefined
              }
            }
          }
        }).$mount("#popupcontent");
        this.map.panTo([e.lngLat.lng, e.lngLat.lat]);
      });
    },
    update(id, geojson) {
      console.log(id);
      console.log(geojson);
      this.map.getSource(id).setData(geojson);
    },
    async mapChange(data) {
      this.map.once("styledata", this.addMaineLayer);
      this.map.on("load", () => {
        // add layer to the map on load

        addMaineLayer(this.map);
      });
      switch (data) {
        case "default":
          this.map.setStyle(
            "mapbox://styles/joshuamwong/ckte9azm523g217juhpczqo5q"
          );
          break;
        case "satellite":
          this.map.setStyle(
            "mapbox://styles/joshuamwong/cku0nu05e4p5j17nvzfsyb5xv"
          );
          break;
        case "bubble":
          this.map.setStyle(
            "mapbox://styles/joshuamwong/cku0ntnkl4oqg17nwxmvdf244"
          );
          break;
      }
    },
    addMaineLayer() {
      //attractions
      this.map.loadImage(jingdian, (error, image) => {
        if (error) {
          console.log(error);
        } else {
          this.map.addImage("jingdianImage", image);
        }

        this.map.addSource("maine", {
          type: "geojson",
          data: attractiondata
        });

        this.addLayerBefore(
          {
            id: "maine",
            type: "symbol",
            source: "maine",
            layout: {
              "icon-image": "jingdianImage",
              "text-field": "{name}",
              "text-anchor": "right",
              "text-font": ["Open Sans Bold"],
              "text-line-height": 1.2,
              "text-size": 12,
              "text-offset": [-1, 0]
            }
          },
          "waterway-label"
        );
      });
      this.map.on("click", "maine", e => {
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
      });

      //catering
      this.map.loadImage(meishi, (error, image) => {
        if (error) {
          console.log(error);
        } else {
          this.map.addImage("meishiImage", image);
        }

        this.map.addSource("meishiSource", {
          type: "geojson",
          data: emptyGeoJSON
        });
        this.addLayerBefore(
          {
            id: "meishiLayer",
            type: "symbol",
            source: "meishiSource",
            layout: {
              "icon-image": "meishiImage",
              "text-field": "{catering_name}",
              "text-anchor": "right",
              "text-font": ["Open Sans Bold"],
              "text-line-height": 1.2,
              "text-size": 12,
              "text-offset": [-1, 0]
            }
          },
          "watermelon"
        );
      });
      this.map.on("click", "meishiLayer", e => {
        new mapboxgl.Popup({ anchor: "right", className: "pop-up" })
          .setLngLat([e.lngLat.lng, e.lngLat.lat])
          .setHTML("<div id='popupcontent'></div>")
          .addTo(this.map);
        new popup({
          propsData: {
            infos: {
              infos: {
                id: e.features[0].properties.catering_id,
                typ: "caterings",
                userID: undefined
              }
            }
          }
        }).$mount("#popupcontent");
        // this.map.panTo([e.lngLat.lng,e.lngLat.lat])
        this.map.jumpTo({ around: [e.lngLat.lng, e.lngLat.lat] });
      });

      //hotels
      this.map.loadImage(jiudian, (error, image) => {
        if (error) {
          console.log(error);
        } else {
          this.map.addImage("jiudianImage", image);
        }

        this.map.addSource("jiudianSource", {
          type: "geojson",
          data: emptyGeoJSON
        });
        this.addLayerBefore(
          {
            id: "jiudianLayer",
            type: "symbol",
            source: "jiudianSource",
            layout: {
              "icon-image": "jiudianImage",
              "text-field": "{hotel_name}",
              "text-anchor": "right",
              "text-font": ["Open Sans Bold"],
              "text-line-height": 1.2,
              "text-size": 12,
              "text-offset": [-1, 0]
            }
          },
          "hohotel"
        );
      });
      this.map.on("click", "jiudianLayer", e => {
        new mapboxgl.Popup({ anchor: "right", className: "pop-up" })
          .setLngLat([e.lngLat.lng, e.lngLat.lat])
          .setHTML("<div id='popupcontent'></div>")
          .addTo(this.map);
        new popup({
          propsData: {
            infos: {
              infos: {
                id: e.features[0].properties.hotel_id,
                typ: "hotels",
                userID: undefined
              }
            }
          }
        }).$mount("#popupcontent");
        this.map.panTo([e.lngLat.lng, e.lngLat.lat]);
      });
    },
    addLayerBefore(layer, beforeId) {
      // check beforeId defined and exists on the map
      const beforeLayer = Boolean(beforeId) && this.map.getLayer(beforeId);
      if (beforeLayer && beforeId === beforeLayer.id)
        this.map.addLayer(layer, beforeId);
      else {
        console.log(
          `Not found layer with id '${beforeId}'.\nLayer '${layer.id}' added without before.`
        );
        this.map.addLayer(layer);
      }
    }
  },
  components: {}
};
</script>

<style scoped>
@import url("https://api.mapbox.com/mapbox-gl-js/v2.4.1/mapbox-gl.css");
/deep/ .mapboxgl-popup-content{
  width: fit-content;
  height: fit-content;
  background-color: rgba(255,255,255,0.8);
  box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
  border-radius: 14px;

}
#god{
  position: absolute;
  height: 100%;
  width: 100%;
}
#map {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  pointer-events: all;
}
.pop-up {
  color: #f3f3dd;
  background-color: #91785d;
  border-color: #91785d;
  max-width: 50px;
  box-shadow: 3px 3px 2px #8b5d33;
  font-family: "Oswald";
}
p {
  font-size: 16px;
}
.basemapSwitch {
  position: absolute;
  bottom: 15%;
  left: 3%;
  width: -moz-fit-content;
  width: fit-content;
}
.switchPanel {
  display: none;
  background-color: beige;
}
.basemapSwitch:hover .switchPanel {
  display: flex;
  background-color: rgba(255,255,255,0.8);
  backdrop-filter: blur(3px);
  border-radius: 12px;
  box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
  margin: 2px 8px;
}
.styles{
  margin: 6px 3px;
  text-align: center;
}
img{
  box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
  border-radius: 6px;
  border: 1px solid black;
}
p{
  text-align: center;
  font-family: 'Microsoft Yahei', 'Times New Roman', Times, serif;
  margin-top: 3px;
}
.switchText{
  background-color: rgba(255,255,255,0.8);
  backdrop-filter: blur(3px);
  border-radius: 6px;
  box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
  padding: 8px;
  font-weight: bold;
}
.basemapSwitch:hover .switchText{
  display: none;
}
</style>
