<template>
<div>

<div id="map"></div>
<global-select></global-select>
</div>

</template>

<script>
import Vue from "vue"
// import {EventBus} from "./eventBus"
import mapboxgl from "@mapgis/mapbox-gl";


//INITIAL SERIES

//图标文件
import jingdian from "../assets/icon/jingdian32px.png"
import meishi from "../assets/icon/meishijiayin 32px.png"
import jiudian from "../assets/icon/jiudian32px.png"
//GeoJSON
import attractiondata from "./data/attractions.json";
import cateringsdata from "./data/caterings.json"
import hotelsdata from "./data/hotels.json"
//GeoJSON占位数据
import emptyGeoJSON from "./data/empty.json"
import GlobalSelect from "./son_components/globalSelect";

//popup事件
import popupComponets from "./son_components/popupcontent"
import * as echarts from "echarts"

const popup = Vue.extend(popupComponets)
export default {
  name: "basemap",
  data(){
    return{
      map:undefined,
      marker:undefined
    }
  },
  mounted() {
    this.initialMap()
    this.initialALayer()
    this.threeDBarChart()

    //监听事件
    this.$EventBus.$on("update",(data)=>{
      this.update(data.theid,data.geojson)
    })

    this.$EventBus.$on("log",(ji)=>{
      console.log("recevied")
    })

    this.$EventBus.$on("marker",(info)=>{
      console.log(info)
      if(this.marker===undefined){
      this.marker=new mapboxgl.Marker({
      color:"#568bfe",
      draggable:false
      })
      .setLngLat([info.lat,info.lng]).addTo(this.map)
      }else{
        this.marker.setLngLat([info.lat,info.lng])
      }

      this.map.panTo([info.lat,info.lng])
      // new popup({
      //   propsData:{
      //     popupInfo:popupinfo
      //   }
      // }).$mount("#popupcontent")
    })

    this.$EventBus.$on("markerClear",()=>{
      if(this.marker!==undefined){
        this.marker.remove()
        this.marker=undefined
      }

  })
  },
  methods:{
    initialMap() {
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
    initialALayer(){
      //attractions
      this.map.on("load",()=>{
        this.map.loadImage(jingdian,(error,image)=> {
          if (error) {
            console.log(error)
          } else {
            this.map.addImage("jingdianImage", image)
          }

          this.map.addSource("attractionSource", {
            type: 'geojson',
            data: attractiondata
          })

          this.map.addLayer({
            id: "attractionLayer",
            type: "symbol",
            source: "attractionSource",
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
        new mapboxgl.Popup({anchor:"right"}).setLngLat([e.lngLat.lng,e.lngLat.lat]).setHTML("<div id='popupcontent'></div>").addTo(this.map)
        let popupinfo={
          id:e.features[0].properties.attraction_id,
          type:"attractions"
        }
        new popup({
          propsData:{
            popupInfo:popupinfo
          }
        }).$mount("#popupcontent")
        this.map.panTo([e.lngLat.lng,e.lngLat.lat])
      })

      //meishi
      this.map.on("load",()=>{
        this.map.loadImage(meishi,(error,image)=>{
          if(error){console.log(error)}
          else {this.map.addImage('meishiImage',image)}

          this.map.addSource("meishiSource",{
            type:"geojson",
            data:emptyGeoJSON
          })
          this.map.addLayer({
            id: "meishiLayer",
            type: "symbol",
            source: "meishiSource",
            layout: {
              "icon-image": "meishiImage",
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
      this.map.on("click","meishiLayer",(e)=>{
        new mapboxgl.Popup().setLngLat([e.lngLat.lng,e.lngLat.lat]).setHTML("<div id='popupcontent'></div>").addTo(this.map)
        let popupinfo={
          id:e.features[0].properties.attraction_id,
          type:"caterings"
        }
        new popup({
          propsData:{
            popupInfo:popupinfo
          }
        }).$mount("#popupcontent")
        // this.map.panTo([e.lngLat.lng,e.lngLat.lat])
        this.map.jumpTo({"around":[e.lngLat.lng,e.lngLat.lat],"zoom":18})
      })

      //jiudian
      this.map.on("load",()=>{
        this.map.loadImage(jiudian,(error,image)=>{
          if(error){console.log(error)}
          else {this.map.addImage('jiudianImage',image)}

          this.map.addSource("jiudianSource",{
            type:"geojson",
            data:emptyGeoJSON
          })
          this.map.addLayer({
            id: "jiudianLayer",
            type: "symbol",
            source: "jiudianSource",
            layout: {
              "icon-image": "jiudianImage",
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
      this.map.on("click","jiudianLayer",(e)=>{
        new mapboxgl.Popup().setLngLat([e.lngLat.lng,e.lngLat.lat]).setHTML("<div id='popupcontent'></div>").addTo(this.map)
        let popupinfo={
          id:e.features[0].properties.attraction_id,
          type:"hotels"
        }
        new popup({
          propsData:{
            popupInfo:popupinfo
          }
        }).$mount("#popupcontent")
        this.map.panTo([e.lngLat.lng,e.lngLat.lat])
      })
    },
    threeDBarChart(){
      this.map.on("load",()=>{
        this.map.addLayer({
          id:"3dLayer",
          filter:['>',"attraction_id",100],
          type:"fill-extrusion",
          source:{
            type:"geojson",
            data:attractiondata
          },
          paint:{
            'fill-extrusion-color': '#aaa',
            'fill-extrusion-height':1000,
            'fill-extrusion-base':100
          }
        })
      })

    },
    update(id,geojson){
      console.log(id)
      console.log(geojson)
      this.map.getSource(id).setData(geojson)
    }
  },
  components:{
    GlobalSelect
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
global-select{
pointer-events: all;
}
#map{

}
</style>
