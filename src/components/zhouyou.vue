<template>
  <div>
    <div id='map'></div>
    <v-global-select id="select"/>
    <ui></ui>
  </div>
</template>

<script>
// import geojsonvt from "geojson-vt"
import mapboxgl from '@mapgis/mapbox-gl'
import popupcomponent from "./son_components/popupcontent"
// import {defineCompoent,createApp,ref,nextTick } from "@vue/composition-api"
import Vue from "vue"
import VueComponentAPI from "@vue/composition-api"
Vue.use(VueComponentAPI)

import attractiondata from "./data/attractions.json"
import globalSelect from "./son_components/globalSelect";
//load image
import jingdanimage from "../assets/icon/jingdian32px.png"
ui
const popup = Vue.extend(popupcomponent)
export default {
  name: "map",
  data(){
    return{

    };
  },
  components:{
    'v-global-select':globalSelect,
  },
  setup(){
  },
  mounted() {
    //加载地图
    let tiandituKey='f5347cab4b28410a6e8ba5143e3d5a35';
    var vecsrc = {
      //来源类型为栅格瓦片
      "type": "raster",
      'tiles': [
        //来源请求地址，请求天地图提供的全球矢量地图WMTS服务
        "http://t" + Math.round(Math.random() * 7) +
        ".tianditu.gov.cn/vec_c/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=c&FORMAT=tiles"
        + "&TILECOL=" + '{x}' + "&TILEROW=" + '{y}' + "&TILEMATRIX=" + '{z}'
        + "&tk=" + tiandituKey
      ],
      //栅格瓦片的分辨率
      'tileSize': 256
    };
    //实例化要加载的source来源对象（全球矢量中文注记）
    var cvasrc = {
      //来源类型为栅格瓦片
      "type": "raster",
      'tiles': [
        //来源请求地址，请求天地图提供的全球矢量中文注记WMTS服务
        "http://t" + Math.round(Math.random() * 7) + ".tianditu.gov.cn/cva_c/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=c&FORMAT=tiles" + "&TILECOL=" + '{x}' + "&TILEROW=" + '{y}' + "&TILEMATRIX=" + '{z}'
        + "&tk=" + tiandituKey
      ],
      //栅格瓦片的分辨率
      'tileSize': 256
    };
    //实例化要加载的source来源对象（全球影像图）
    var imgsrc = {
      //来源类型为栅格瓦片
      "type": "raster",
      'tiles': [
        //来源请求地址，请求天地图提供的全球影像图WMTS服务
        "http://t" + Math.round(Math.random() * 7) + ".tianditu.gov.cn/img_c/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=c&FORMAT=tiles" + "&TILECOL=" + '{x}' + "&TILEROW=" + '{y}' + "&TILEMATRIX=" + '{z}'
        + "&tk=" + tiandituKey
      ],
      //栅格瓦片的分辨率
      'tileSize': 256
    };
    //实例化要加载的source来源对象（全球影像中文注记）
    var ciasrc = {
      //来源类型为栅格瓦片
      "type": "raster",
      'tiles': [
        //来源请求地址，请求天地图提供的全球影像中文注记WMTS服务
        "http://t" + Math.round(Math.random() * 7) + ".tianditu.gov.cn/cia_c/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cia&STYLE=default&TILEMATRIXSET=c&FORMAT=tiles" + "&TILECOL=" + '{x}' + "&TILEROW=" + '{y}' + "&TILEMATRIX=" + '{z}'
        + "&tk=" + tiandituKey
      ],
      //栅格瓦片的分辨率
      'tileSize': 256
    };
    //实例化要加载的source来源对象（全球地形渲染图）
    var tersrc = {
      //来源类型为栅格瓦片
      "type": "raster",
      'tiles': [
        //来源请求地址，请求天地图提供的全球地形渲染图WMTS服务
        "http://t" + Math.round(Math.random() * 7) + ".tianditu.gov.cn/ter_c/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=ter&STYLE=default&TILEMATRIXSET=c&FORMAT=tiles" + "&TILECOL=" + '{x}' + "&TILEROW=" + '{y}' + "&TILEMATRIX=" + '{z}'
        + "&tk=" + tiandituKey
      ],
      'tileSize': 256
    };
    //实例化Map对象加载地图
    const map = new mapboxgl.Map({
      crs: "EPSG:4326",
      maxBounds: [[-180, -90], [180, 90]],
      zoom: 6,
      center: [114.312194,30.549265],
      container: 'map',
      style: {
        "version": 8,
        "glyphs": 'http://fonts.openmaptiles.org/{fontstack}/{range}.pbf',
        "sources": {
          "vecsrc": vecsrc,
          "cvasrc": cvasrc,
          "imgsrc": imgsrc,
          "ciasrc": ciasrc,
          "tersrc": tersrc,
        },
        "layers": [
          {
            "id": "tersrc",
            "type": "raster",
            "source": "tersrc",
            "minzoom": 0,
            "maxzoom": 22
          }
        ]
      }
    });
    map.on("load",()=>{
      map.loadImage(jingdanimage,(error,image)=> {
        if (error) {
          console.log(error)
        } else {
          map.addImage("jingdian", image)
        }

        map.addSource("attractionlayer", {
          type: 'geojson',
          data: attractiondata
        })

        map.addLayer({
          id: "attractionLayer",
          type: "symbol",
          source: "attractionlayer",
          layout: {
            "icon-image": "jingdian",
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

    map.on("click","attractionLayer",(e)=>{
      new mapboxgl.Popup().setLngLat([e.lngLat.lng,e.lngLat.lat]).setHTML("<div id='popupcontent'>popup content</div>").addTo(map)
      let pop = new popup({
        propsData:{
          poiID:e.features[0].properties.attraction_id
        }
      }).$mount("#popupcontent")
      map.panTo([e.lngLat.lng,e.lngLat.lat])
    })
  },
  methods:{

  },
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
#select{
  opacity:0.6;
}

</style>
