<template>
  <div>
    <div id='map'></div>
  </div>
</template>

<script>
  import mapboxgl from '@mapgis/mapbox-gl'
  import Vue from "vue"
  import VueComponentAPI from "@vue/composition-api"
  import  * as turf from '@turf/turf'
  import attractionsCount from "../data/attractionsCount.json"
  Vue.use(VueComponentAPI)
  // Vue.use(turf)

  // const popup = Vue.extend(popupcomponent)
  export default {
    name: "map",
    data(){
      return{

      };
    },
    components:{
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
      mapboxgl.accessToken ="pk.eyJ1Ijoiam9zaHVhbXdvbmciLCJhIjoiY2tzaXRlOXcyMHVhNzJ2bnN4aG11NW10aiJ9.RdgXiHX8GNMNWTr2X92ruQ"
      const map=new mapboxgl.Map({
        container:"map",
        style:"mapbox://styles/joshuamwong/ckte9azm523g217juhpczqo5q",
        center:[114.405906,30.534768],
        zoom:12
      })
      let navigatorController = new mapboxgl.NavigationControl()
      map.addControl(navigatorController,"top-left")
      map.on("load",()=>{
        map.addSource("attractionsource", {
          type: 'geojson',
          data: attractionsCount
        })
        //景点注记
        map.addLayer({
          id: "attractionLayer",
          type: "symbol",
          source: "attractionsource",
          paint:{
            "text-color":"#FF8247"
          },
          layout: {
            "text-field": "{name}",
            "text-anchor": "right",
            'text-font': ['Open Sans Bold'],
            "text-line-height": 1.2,
            "text-size": 8,
            "text-offset":[-1,0]
          }
        });
        //开始构造景点人流量的热力图
        map.addLayer({
          id: "attractionvisit-heat",
          type: "heatmap",
          source: "attractionsource",
          maxzoom: 10,
          paint:{
            //每个景点的权重 将count作为权重的依据
            'heatmap-weight': [
              'interpolate',
              ['linear'],
              ['get', 'count'],
              1,
              0,
              1000,
              100
            ],
            'heatmap-intensity': [
              'interpolate',
              ['linear'],
              ['zoom'],
              5,
              1,
             10,
              5
            ],
            'heatmap-color': [
              'interpolate',
              ['linear'],
              ['heatmap-density'],
              0,
              'rgba(26,152,80,0)',
              0.2,
              'rgb(145,207,96)',
              0.4,
              'rgb(217,239,139)',
              0.6,
              'rgb(254,224,139)',
              0.8,
              'rgb(252,141,89)',
              1,
              'rgb(215,48,39)'
            ],
            'heatmap-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              5,
              2,
              10,
              20
            ],
            'heatmap-opacity': [
              'interpolate',
              ['linear'],
              ['zoom'],
              5,
              1,
              10,
              0
            ]
          }
        });
        map.addLayer(
          {
            'id': 'attractionvisit-point',
            'type': 'circle',
            'source': 'attractionsource',
            'minzoom': 7,
            'paint': {
              'circle-radius': [
                'interpolate',
                ['linear'],
                ['zoom'],
                5,
                ['interpolate', ['linear'], ['get', 'count'], 1, 1, 1000, 4],
                10,
                ['interpolate', ['linear'], ['get', 'count'], 1, 5, 1000, 20]
              ],
// Color circle by earthquake magnitude
              'circle-color': [
                'interpolate',
                ['linear'],
                ['get', 'count'],
                1,
                'rgba(26,152,80,0)',
               100,
                'rgb(145,207,96)',
                500,
                'rgb(217,239,139)',
               1000,
                'rgb(254,224,139)',
                5000,
                'rgb(252,141,89)',
                10000,
                'rgb(215,48,39)'
              ],

        // Transition from heatmap to circle layer by zoom level
              'circle-opacity': [
                'interpolate',
                ['linear'],
                ['zoom'],
                5,
                0,
                10,
                1
              ]
            }
          },
        );
      });
      map.on('click',"attractionvisit-point",function(e) {
            console.log("tesdt")
            var sentence="";
            if(e.features[0].properties.count<500){
              sentence ="该景点人数适宜，可放心前往"
            }
            else{
              sentence ="该景点人数可能较多，请谨慎前往"
            }
            new mapboxgl.Popup()
              .setLngLat([e.lngLat.lng,e.lngLat.lat])
              .setHTML(`<b>${e.features[0].properties.name}</b>`+'在马蜂窝的评论数量为: ' +`<b>${e.features[0].properties.count.toString()}</b>` + "<br>" + sentence)
              .addTo(map);
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
    top: 0;
    bottom: 0;
    width: 100%;
  }


</style>
