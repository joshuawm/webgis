<template>
<div id="map"></div>    
</template>

<script>
import mapboxgl from "@mapgis/mapbox-gl"
export default {
    name:"igserver",
    mounted(){
      mapboxgl.accessToken ="pk.eyJ1Ijoiam9zaHVhbXdvbmciLCJhIjoiY2tzaXRlOXcyMHVhNzJ2bnN4aG11NW10aiJ9.RdgXiHX8GNMNWTr2X92ruQ";
      map=new mapboxgl.Map({
          container:"map",
          
      })
    }
}
</script>

<style scoped>

</style>