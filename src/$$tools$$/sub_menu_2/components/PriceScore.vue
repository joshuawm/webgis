<template>
  <div>
    <div id="map"></div>
    <div class="charts" ref="kongtiao" @mousedown="mouseDownHandleelse($event)" @mouseup="mouseUpHandleelse($event)">
      <echarts></echarts>
    </div>
<!--    底图切换已经屏蔽-->
<!--    <div class="basemapSwitch">-->
<!--      <div class="switchPanel">-->
<!--        <div>-->
<!--          <img src="" alt="默认" @click="mapChange('default')" />-->
<!--          <span>默认</span>-->
<!--        </div>-->
<!--        <div>-->
<!--          <img src="" alt="bubble" @click="mapChange('bubble')" />-->
<!--          <span>bubble</span>-->
<!--        </div>-->
<!--        <div>-->
<!--          <img src="" alt="卫星" @click="mapChange('satellite')" />-->
<!--          <span>卫星</span>-->
<!--        </div>-->
<!--      </div>-->
<!--      <div>底图切换</div>-->
<!--    </div>-->

  </div>
</template>

<script>
import mapboxgl from "@mapgis/mapbox-gl";
import axios from "axios";
import attractiondata from "../data/attractions.json";
import jingdian from "../assets/jingdian32px.png";
import echarts from "./echarts";

export default {
  name: "PriceScore",
  data() {
    return {
      map: undefined,
      moveDataelse: {
        x: null,
        y: null
      }
    };
  },
  mounted() {
    this.initialMap();
    this.initialLayer();
    this.$EventBus.$on("flyto", latLng => {
      this.map.flyTo({
        center: latLng,
        speed: 2
      });

    });
  },
  methods: {
    async initialMap() {
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
    },
    async initialLayer() {
      //attractions
      let that = this;
      this.map.on("load", () => {
        this.map.loadImage(jingdian, (error, image) => {
          if (error) {
            console.log(error);
          } else {
            this.map.addImage("jingdianImage", image);
          }

          this.addMaineLayer();

          // this.map.addSource("attractiondata",{
          //   type:"geojson",
          //   data:attractiondata
          // })
          // this.map.addLayer({
          //   id: "attractionLayer",
          //   type: "symbol",
          //   source: "attractiondata",
          //   layout: {
          //     "icon-image": "jingdianImage",
          //     "text-field": "{name}",
          //     "text-anchor": "right",
          //     'text-font': ['Open Sans Bold'],
          //     "text-line-height": 1.2,
          //     "text-size": 12,
          //     "text-offset":[-1,0]
          //   }
          // })
        });
      });
      this.map.on("click", "maine", e => {
        if (e.features[0].properties.id !== undefined) {
          this.$EventBus.$emit(
            "selectChange",
            Number(e.features[0].properties.id)
          );
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
    },
    mouseDownHandleelse (event) {
      this.moveDataelse.x = event.pageX - this.$refs.kongtiao.offsetLeft
      this.moveDataelse.y = event.pageY - this.$refs.kongtiao.offsetTop
      event.currentTarget.style.cursor = 'move'
      window.onmousemove = this.mouseMoveHandleelse
    },
    mouseMoveHandleelse (event) {
      let moveLeft = event.pageX - this.moveDataelse.x + 'px'
      let moveTop = event.pageY - this.moveDataelse.y + 'px'
      this.$refs.kongtiao.style.left = moveLeft
      this.$refs.kongtiao.style.top = moveTop
    },
    mouseUpHandleelse (event) {
      window.onmousemove = null
      event.currentTarget.style.cursor = 'move'
      console.log('鼠标松开了')
    }
  },
  components: {
    echarts
  }
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
.charts {
  height: fit-content;
  border-radius: 30px;
  border: 1px solid white;
  background-color: rgba(255,255,255,0.6);
  /*background: transparent;*/
  position: fixed;
  cursor: pointer;
  /*right: 5%;*/
  top: 18%;
  left: 50%;
  /*width: 35.6%;*/
  /*height: 50%;*/
  box-shadow: rgba(0, 0, 0, 0.24) 0px 6px 12px;
}
.basemapSwitch {
  position: absolute;
  bottom: 5%;
  left: 3%;
}
.switchPanel {
  display: none;
}
.basemapSwitch:hover .switchPanel {
  display: block;
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
/deep/ .mapboxgl-ctrl button.mapboxgl-ctrl-zoom-out .mapboxgl-ctrl-icon{
  background-image: url("../assets/minus.svg");
  background-size: cover;
  transform: scale(0.3);
}
/deep/ .mapboxgl-ctrl button.mapboxgl-ctrl-compass .mapboxgl-ctrl-icon{
  background-image: url("../assets/compass.svg");
  background-size: cover;
  transform: scale(0.45) !important;
}
</style>
