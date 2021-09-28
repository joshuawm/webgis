<template>
  <div>
    <!-- <classify-choice  style="margin-top: 30px"></classify-choice> -->
    <div id="map"></div>
    <div></div>
  </div>
</template>

<script>
import mapboxgl from "@mapgis/mapbox-gl";
// import classd from "./beautyspot-choice/classify-choice.vue"
// import distancec from "./beautyspot-choice/distance-choice"

export default {
  name: "zhouyou",
  data() {
    return {
      map: null,
      sourceID: "source_geojsonID"
    };
  },
  components: {
    // 'classify-choice':classd,
    // 'distance-choice':distancec
  },
  mounted() {
    this.initmap();
    this.$EventBus.$on("choiceclassify", data => {
      this.classchoice(data);
    });
  },
  methods: {
    initmap() {
      // console.log(this.$store.state.choice);
      // mapboxgl.setRTLTextPlugin(
      //   "https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.js"
      // );
      mapboxgl.accessToken =
        "pk.eyJ1Ijoiam9zaHVhbXdvbmciLCJhIjoiY2tzaXRlOXcyMHVhNzJ2bnN4aG11NW10aiJ9.RdgXiHX8GNMNWTr2X92ruQ";
      this.map = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/joshuamwong/ckte9azm523g217juhpczqo5q",
        center: [114.405906, 30.534768],
        zoom: 12
      });
      let navigatorController = new mapboxgl.NavigationControl();
      this.map.addControl(navigatorController, "top-left");
      this.map.on("load", () => {
        this.map.addSource(this.sourceID, {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: {
              geometry: {
                type: "Point",
                coordinates: []
              }
            }
          }
        });
        this.map.addLayer({
          id: "addressdisplay",
          type: "circle",
          source: this.sourceID,
          paint: {
            "circle-radius": 5,
            "circle-color": "yellow",
            "circle-opacity": 0.5
          },
          minzoom: 0,
          maxzoom: 22
        });
      });
      this.map.on("click", "addressdisplay", function(e) {
        new mapboxgl.Popup()
          .setLngLat([e.lngLat.lng, e.lngLat.lat])
          .setHTML(
            `<b>${e.features[0].properties.name}</b>` +
              "<br>" +
              "此景点位于: " +
              `<b>${e.features[0].properties.address}</b>`
          )
          .addTo(this.map);
      });
    },
    classchoice(data) {
      this.map.getSource(this.sourceID).setData(data);
    },
    boxchoice(data) {
      alert(data);
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
