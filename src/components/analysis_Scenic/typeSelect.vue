<template>
  <div>
    <div id="map"></div>
  </div>
</template>

<script>
  import Vue from "vue"
import mapboxgl from "@mapgis/mapbox-gl";
import jingdanimage from "../../assets/icon/jingdian32px.png"
import popupComponets from "./scenicpop"
const popup = Vue.extend(popupComponets);
export default {
  name: "zhouyou",
  data() {
    return {
      map: null,
      sourceID: "source_geojsonID"
    };
  },
  components: {

  },
  mounted() {
    this.initmap();
    this.$EventBus.$on("choiceclassify", data => {
      this.classchoice(data);
    });
  },
  methods: {
    initmap() {
      let that=this
      mapboxgl.accessToken =
        "pk.eyJ1Ijoiam9zaHVhbXdvbmciLCJhIjoiY2tzaXRlOXcyMHVhNzJ2bnN4aG11NW10aiJ9.RdgXiHX8GNMNWTr2X92ruQ";
      this.map = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/joshuamwong/ckte9azm523g217juhpczqo5q",
        center: that.$store.state.mapCenter,
        zoom: that.$store.state.mapZoom,
      });
      let navigatorController = new mapboxgl.NavigationControl();
      this.map.addControl(navigatorController, "top-left");
      this.map.on("load", () => {
        this.map.loadImage(jingdanimage, (error, image) => {
          if (error) {
            console.log(error)
          } else {
            this.map.addImage("jingdian", image)
          }
          const canvas = this.map.getCanvasContainer();
          canvas.style.cursor = "crosshair";
          this.map.addSource(this.sourceID, {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              "features": {
                "geometry": {
                  "type": "Point",
                  "coordinates": []
                },
                "properties": {
                  "name": "",
                  "address": ""
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
              'text-font': ['Open Sans Bold'],
              "text-line-height": 1.2,
              "text-size": 12,
              "text-offset": [-1, 0]
            },
            minzoom: 0,
            maxzoom: 22
          });
        });
      });
      this.map.on("click", "addressdisplay", (e) =>{
        new mapboxgl.Popup({anchor:"right"}).setLngLat(e.lngLat).setHTML("<div id='popup_scenic'></div>").addTo(this.map);
        let popupinfo={
          id:e.features[0].properties.id,
          type:"attractions"
        };
        new popup({
          propsData:{
            popupInfo:popupinfo
          }
        }).$mount("#popup_scenic");
        this.map.panTo([e.lngLat.lng,e.lngLat.lat])
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
    classchoice(data) {
      console.log(data)
      if (this.map.getSource( "source_geojsonID")===undefined){
        setTimeout(()=>{this.map.getSource( "source_geojsonID")},100)
      }
      else {
        this.map.getSource( "source_geojsonID").setData(data);
      }
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
#boxchoice {
  position: absolute;
  left: 100px;
  top: 79px;
}
#dtancechoice {
  position: absolute;
}
</style>
