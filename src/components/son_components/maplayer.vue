<template>
  <div>
    <div id="map"></div>
  </div>
</template>

<script>
import mapboxgl from "@mapgis/mapbox-gl";

export default {
  name: "maplayer",
  data() {
    return {};
  },
  mounted() {
    this.initmap();
  },
  methods: {
    initmap() {
      let map;
      let tiandituKey = "f5347cab4b28410a6e8ba5143e3d5a35";
      var vecsrc = {
        //来源类型为栅格瓦片
        type: "raster",
        tiles: [
          //来源请求地址，请求天地图提供的全球矢量地图WMTS服务
          "http://t" +
            Math.round(Math.random() * 7) +
            ".tianditu.gov.cn/vec_c/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=c&FORMAT=tiles" +
            "&TILECOL=" +
            "{x}" +
            "&TILEROW=" +
            "{y}" +
            "&TILEMATRIX=" +
            "{z}" +
            "&tk=" +
            tiandituKey
        ],
        //栅格瓦片的分辨率
        tileSize: 256
      };
      //实例化要加载的source来源对象（全球矢量中文注记）
      var cvasrc = {
        //来源类型为栅格瓦片
        type: "raster",
        tiles: [
          //来源请求地址，请求天地图提供的全球矢量中文注记WMTS服务
          "http://t" +
            Math.round(Math.random() * 7) +
            ".tianditu.gov.cn/cva_c/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=c&FORMAT=tiles" +
            "&TILECOL=" +
            "{x}" +
            "&TILEROW=" +
            "{y}" +
            "&TILEMATRIX=" +
            "{z}" +
            "&tk=" +
            tiandituKey
        ],
        //栅格瓦片的分辨率
        tileSize: 256
      };
      //实例化要加载的source来源对象（全球影像图）
      var imgsrc = {
        //来源类型为栅格瓦片
        type: "raster",
        tiles: [
          //来源请求地址，请求天地图提供的全球影像图WMTS服务
          "http://t" +
            Math.round(Math.random() * 7) +
            ".tianditu.gov.cn/img_c/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=c&FORMAT=tiles" +
            "&TILECOL=" +
            "{x}" +
            "&TILEROW=" +
            "{y}" +
            "&TILEMATRIX=" +
            "{z}" +
            "&tk=" +
            tiandituKey
        ],
        //栅格瓦片的分辨率
        tileSize: 256
      };
      //实例化要加载的source来源对象（全球影像中文注记）
      var ciasrc = {
        //来源类型为栅格瓦片
        type: "raster",
        tiles: [
          //来源请求地址，请求天地图提供的全球影像中文注记WMTS服务
          "http://t" +
            Math.round(Math.random() * 7) +
            ".tianditu.gov.cn/cia_c/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cia&STYLE=default&TILEMATRIXSET=c&FORMAT=tiles" +
            "&TILECOL=" +
            "{x}" +
            "&TILEROW=" +
            "{y}" +
            "&TILEMATRIX=" +
            "{z}" +
            "&tk=" +
            tiandituKey
        ],
        //栅格瓦片的分辨率
        tileSize: 256
      };
      //实例化要加载的source来源对象（全球地形渲染图）
      var tersrc = {
        //来源类型为栅格瓦片
        type: "raster",
        tiles: [
          //来源请求地址，请求天地图提供的全球地形渲染图WMTS服务
          "http://t" +
            Math.round(Math.random() * 7) +
            ".tianditu.gov.cn/ter_c/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=ter&STYLE=default&TILEMATRIXSET=c&FORMAT=tiles" +
            "&TILECOL=" +
            "{x}" +
            "&TILEROW=" +
            "{y}" +
            "&TILEMATRIX=" +
            "{z}" +
            "&tk=" +
            tiandituKey
        ],
        tileSize: 256
      };
      mapboxgl.accessToken =
        "pk.eyJ1Ijoiam9zaHVhbXdvbmciLCJhIjoiY2tzaXRlOXcyMHVhNzJ2bnN4aG11NW10aiJ9.RdgXiHX8GNMNWTr2X92ruQ";
      map = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/joshuamwong/ckte9azm523g217juhpczqo5q",
        center: [114.405906, 30.534768],
        zoom: 12
      });
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
}
</style>
