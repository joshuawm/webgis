<template>
  <div>
    <div id="map"></div>
    <div id="loading" ref="loading">
      <span class="el-icon-loading"></span>
    </div>
    <div id="extended">
      <button id="appendtolist" @click="appendclick">添加至分析列表</button>
      <div class="buttonHeight">
        <div id="buttonChoice">
          <div
            class="button"
            v-for="button in buttons"
            :key="button"
            @click="choice(button)"
          >
            <span>{{ button }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import mapboxgl from "@mapgis/mapbox-gl";
import jingdanimage from "../assets/jingdian32px.png";
import popupComponets from "./scenicpop";
import axios from "axios";
import geojson from "geojson";
const popup = Vue.extend(popupComponets);
export default {
  name: "zhouyou",
  data() {
    return {
      map: null,
      sourceID: "source_geojsonID",
      typedata: {},
      buttons: [
        "5A景区",
        "4A景区",
        "3A景区",
        "自然",
        "山水",
        "文化",
        "历史",
        "展馆",
        "休闲",
        "运动",
        "体验",
        "儿童",
        "城市",
        "街区",
        "民族",
        "红色"
      ]
    };
  },
  components: {},
  mounted() {
    this.initmap();
    this.$EventBus.$on("choiceclassify", data => {
      this.classchoice(data);
    });
  },
  methods: {
    initmap() {
      let that = this;
      mapboxgl.accessToken =
        "pk.eyJ1Ijoiam9zaHVhbXdvbmciLCJhIjoiY2tzaXRlOXcyMHVhNzJ2bnN4aG11NW10aiJ9.RdgXiHX8GNMNWTr2X92ruQ";
      this.map = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/joshuamwong/ckte9azm523g217juhpczqo5q",
        center: that.$store.state.mapCenter,
        zoom: that.$store.state.mapZoom
      });
      let navigatorController = new mapboxgl.NavigationControl();
      this.map.addControl(navigatorController, "top-left");
      this.map.on("load", () => {
        this.map.loadImage(jingdanimage, (error, image) => {
          if (error) {
            console.log(error);
          } else {
            this.map.addImage("jingdian", image);
          }
          const canvas = this.map.getCanvasContainer();
          canvas.style.cursor = "crosshair";
          this.map.addSource(this.sourceID, {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: {
                geometry: {
                  type: "Point",
                  coordinates: []
                },
                properties: {
                  name: "",
                  address: ""
                }
              }
            }
          });
          this.map.addLayer({
            id: "addressdisplay",
            type: "symbol",
            source: this.sourceID,
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
      });
      this.map.on("click", "addressdisplay", e => {
        new mapboxgl.Popup({ anchor: "right" })
          .setLngLat(e.lngLat)
          .setHTML("<div id='popup_scenic'></div>")
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
        }).$mount("#popup_scenic");
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
    },
    async choice(command) {
      this.$refs.loading.style.display = "block";
      let url01 =
        "http://121.5.235.15/api/v2/zhouyou/_table/Attractions?fields=*&filter=attraction_tags%20like%20%20%27";
      var choiceurl = "";
      if (
        command === "5A景区" ||
        command === "4A景区" ||
        command === "3A景区"
      ) {
        choiceurl = url01 + "%25" + command + "%25" + "%27";
      } else {
        choiceurl = url01 + "%25" + command + "%25" + "%27";
      }
      let coordinateslist = [];
      let geoclassify;
      let response = await axios.get(choiceurl, {
        params: {
          api_key:
            "956eed8e98667eca2722be6afc37e123212466565cab5df2f7e653d206f3e3c0"
        }
      });
      let classify_data = response.data.resource;
      await classify_data.forEach(item =>
        coordinateslist.push({
          lng: item.attraction_lon,
          lat: item.attraction_lat,
          name: item.attraction_name,
          addresss: item.attraction_city,
          id: item.attraction_id
        })
      );
      //coordinateslist每种类型的数据  坐标串的形式
      geoclassify = await geojson.parse(coordinateslist, {
        Point: ["lng", "lat"],
        properties: ["name", "address", "id"]
      });
      this.classchoice(geoclassify);
      this.$refs.loading.style.display = "none";
    },
    classchoice(data) {
      if (this.map.getSource("source_geojsonID") === undefined) {
        setTimeout(() => {
          this.map.getSource("source_geojsonID");
        }, 100);
        this.typedata = data;
      } else {
        this.map.getSource("source_geojsonID").setData(data);
        this.typedata = data;
      }
    },
    appendclick() {
      alert("是否将已选择景点全部加入分析列表");
      let temp = this.typedata.features.map(x => {
        return x.properties.id;
      });
      this.$store.commit("curd_list2analysis", { type: "add", value: temp });
      // this.$EventBus.$emit("typelist",this.typedata.features);
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
  height: 100%;
  pointer-events: all;
}
/*#appendtolist {*/
/*  position: absolute;*/
/*  z-index: 1;*/
/*  top: 10px;*/
/*  right: 10px;*/
/*  border-radius: 3px;*/
/*  width: 150px;*/
/*}*/
.button {
  background-clip: border-box;
  border-radius: 12px;
  backdrop-filter: blur(3px);
  color: #f5f5f7;
  background-color: rgba(29, 29, 31, 0.72);
  margin: 3px 3px;
  padding: 8px;
  cursor: pointer;
}
.button:active{
  background-color: rgba(29, 29, 31, 1);
}
.button:hover {
  color: white;
}
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
#appendtolist:active{
  background-color: rgba(29, 29, 31, 1);
}
#buttonChoice {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -ms-flex-wrap: wrap;
  flex-wrap: nowrap;
  height: 400px;
  width: fit-content;
  flex-direction: column;
  overflow: scroll;
}
#extended {
  width: 10%;
  position: absolute;
  top: 14%;
  right: 3%;
  z-index: 2;
}
#loading {
  position: absolute;
  left: 50%;
  transform: scale(2);
  top: 10%;
  display: none;
}
.buttonHeight {
  height: 50%;
  float: right;
}
::-webkit-scrollbar {
  width: 0 !important;
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
