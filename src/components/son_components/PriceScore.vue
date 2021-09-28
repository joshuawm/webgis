<template>
  <div>
    <div id="map"></div>
    <div class="basemapSwitch">
      <div class="switchPanel">
        <div>
          <img src="src/components/data/default.png" alt="默认" @click="mapChange('default')" />
          <span>默认</span>
        </div>
        <div>
          <img src="src/components/data/bubble.png" alt="bubble" @click="mapChange('bubble')" />
          <span>bubble</span>
        </div>
        <div>
          <img src="src/components/data/sateline.jpg" alt="卫星" @click="mapChange('satellite')" />
          <span>卫星</span>
        </div>
      </div>
      <div>底图切换</div>
    </div>
    <div class="charts">
      <echarts></echarts>
    </div>

  </div>

</template>

<script>
import mapboxgl from "@mapgis/mapbox-gl";
import axios from "axios"
import attractiondata from "../data/attractionsosm.json";
import emptyGeoJSON from "../data/empty.json"
import jingdian from "../../assets/icon/jingdian32px.png";
import echarts from "./echarts";
import Vue from "vue"

export default {
  name: "PriceScore",
  data(){
    return{
      map:undefined
    }
  },
  mounted()  {
    this.initialMap()
    this.initialLayer()
    this.$EventBus.$on("flyto",(latLng)=>{
      this.map.flyTo({
        center:latLng,
        speed:2
      })
    })
  },
  methods:{
    async initialMap(){
      mapboxgl.accessToken ="pk.eyJ1Ijoiam9zaHVhbXdvbmciLCJhIjoiY2tzaXRlOXcyMHVhNzJ2bnN4aG11NW10aiJ9.RdgXiHX8GNMNWTr2X92ruQ"
      this.map=new mapboxgl.Map({
        container:"map",
        style:"mapbox://styles/joshuamwong/ckte9azm523g217juhpczqo5q",
        center:[114.405906,30.534768],
        zoom:12
      })
      let navigatorController = new  mapboxgl.NavigationControl()
      this.map.addControl(navigatorController,"top-left")

    },
    async initialLayer(){
      //attractions
      this.map.on("load",()=>{
        this.map.loadImage(jingdian,(error,image)=> {
          if (error) {
            console.log(error)
          } else {
            this.map.addImage("jingdianImage", image)
          }

          // this.map.addSource("attractionSource", {
          //   type: 'geojson',
          //   data: attractiondata
          // })
          this.map.addSource("attractiondata",{
            type:"geojson",
            data:attractiondata
          })
          this.map.addLayer({
            id: "attractionLayer",
            type: "symbol",
            source: "attractiondata",
            layout: {
              "icon-image": "jingdianImage",
              "text-field": "{name}",
              "text-anchor": "right",
              'text-font': ['Open Sans Bold'],
              "text-line-height": 1.2,
              "text-size": 12,
              "text-offset":[-1,0]
            }
          })
        })
      })
      this.map.on("click","attractionLayer",(e)=>{
        if (e.features[0].properties.id!==undefined){
          this.$EventBus.$emit("selectChange",Number(e.features[0].properties.id))
        }
      })
    },
    async mapChange(data){
      switch (data){
        case "default":
          this.map.setStyle("mapbox://styles/joshuamwong/ckte9azm523g217juhpczqo5q")
          break
        case "satellite":
          this.map.setStyle("mapbox://styles/joshuamwong/cku0nu05e4p5j17nvzfsyb5xv")
          break;
        case "bubble":
          this.map.setStyle("mapbox://styles/joshuamwong/cku0ntnkl4oqg17nwxmvdf244")
          break;
      }
      const addLayer = (layer, beforeId) => this.map.addLayer(layer, beforeId);

      this.addLayerBefore(addLayer,{
        id: "attractionLayer",
        type: "symbol",
        source: {
          type:"geojson",
          data:attractiondata
        },
        layout: {
          "icon-image": "jingdianImage",
          "text-field": "{name}",
          "text-anchor": "right",
          'text-font': ['Open Sans Bold'],
          "text-line-height": 1.2,
          "text-size": 12,
          "text-offset":[-1,0]
        }
      },"attractionLayer")

      },
    addLayerBefore(addLayerFn, layer, beforeId) {
      // check beforeId defined and exists on the map
      const beforeLayer = Boolean(beforeId) && this.map.getLayer(beforeId);
      if (beforeLayer && beforeId === beforeLayer.id) addLayerFn(layer, beforeId);
      else {
        console.warn(
          `Not found layer with id '${beforeId}'.\nLayer '${
            layer.id
          }' added without before.`
        );
        addLayerFn(layer);
      }
    }
  },
  components:{
    echarts
  }
}
</script>

<style scoped>
@import url('https://api.mapbox.com/mapbox-gl-js/v2.4.1/mapbox-gl.css');

#map{
  position: absolute;
  top: 60px;
  bottom: 0;
  width: 100%;
}
.charts{
  background-color: beige;
  position: absolute;
  left:50%;
  top: 10%;
  width: 50%;
  height: 50%;
}
.basemapSwitch{
  position: absolute;
  bottom: 5%;
  left: 3%;
}
.switchPanel{
  display: none;
}
.basemapSwitch:hover .switchPanel{
  display: block;
}
</style>
