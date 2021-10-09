<template>
  <div>
    <div id="map_show"></div>
    <div id="similarShow"><pre id="features"></pre></div>
  </div>
</template>

<script>
import axios from "axios";
import geojson from "geojson";
import mapboxgl from "@mapgis/mapbox-gl";
import Vue from "vue";
import VueComponentAPI from "@vue/composition-api";
import attractionsCount from "../data/attractionsCount";
Vue.use(VueComponentAPI);
import popupComponets from "./scenicpop"
const popup = Vue.extend(popupComponets);
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import jingdanimage from "../assets/jingdian32px.png";
import attractiondata from "../data/attractions.json";

Vue.use(ElementUI);

export default {
  name: "jingdianfenxi",
  data() {
    return {
      popup1:undefined,
      activeIndex: this.$store.state.analysis_show,
      userId:0
    };
  },
  components: {},
  mounted() {
    //加载地图
    this.userId=this.$store.state.user_id
    //实例化Map对象加载地图
    mapboxgl.accessToken =
      "pk.eyJ1Ijoiam9zaHVhbXdvbmciLCJhIjoiY2tzaXRlOXcyMHVhNzJ2bnN4aG11NW10aiJ9.RdgXiHX8GNMNWTr2X92ruQ";
    const map = new mapboxgl.Map({
      container: "map_show",
      style: "mapbox://styles/joshuamwong/ckte9azm523g217juhpczqo5q",
      center: this.$store.state.mapCenter,
      zoom: this.$store.state.mapZoom,
    });
    let navigatorController = new mapboxgl.NavigationControl();
    map.addControl(navigatorController, "top-left");
    document.getElementById("features").innerHTML ="\n\n&nbsp;<b>点击景点将为您智能推荐相似景点</b>"
    map.on("load", () => {
      const mapDiv = document.getElementById("map_show");
      if (mapDiv.style.visibility === true) map.resize();
      map.resize();
      const popup = new mapboxgl.Popup({
        closeButton: false
      });
      const canvas = map.getCanvasContainer();
      canvas.style.cursor = "crosshair";
      map.loadImage(jingdanimage, (error, image) => {
        if (error) {
          console.log(error);
        } else {
          map.addImage("jingdian", image);
        }
        map.addSource("attractionlayer", {
          type: "geojson",
          data: attractionsCount
        });
        map.addLayer({
          id:"attractionLayer1",
          type: "symbol",
          source: "attractionlayer",
          paint: {
            "text-color": "black"
          },
          layout: {
            "icon-image": "jingdian",
            "text-field": "{name}",
            "text-anchor": "right",
            "text-font": ["Open Sans Bold"],
            "text-line-height": 1.2,
            "text-size": 12,
            "text-offset": [-1, 0]
          }
        });
      });

    });
    let that = this
    map.on("click", async function(e) {
      var features = map.queryRenderedFeatures(e.point);
      var scenic_type = [];
      var scenictype = [
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
      ];
      if (features.length !== 0) {
        let url01 =
          "http://121.5.235.15/api/v2/zhouyou/_table/Attractions?fields=*&filter=attraction_tags%20like%20%20%27";
        let resp = await axios.get(
          "http://121.5.235.15/api/v2/zhouyou/_table/Attractions?filter=attraction_id=" +
          features[0].properties.id,
          {
            params: {
              api_key:
                "956eed8e98667eca2722be6afc37e123212466565cab5df2f7e653d206f3e3c0"
            }
          }
        );
        //scenic_type鼠标下景点的类型
        scenic_type = resp.data.resource[0].attraction_tags.split("|");
        var scenictypedata = [];
        for (let t2 = 0; t2 < scenic_type.length; t2++) {
          let url_tmp = "";
          if (
            scenic_type[t2] === "5A景区" ||
            scenic_type[t2] === "4A景区" ||
            scenic_type[t2] === "3A景区"
          ) {
            url_tmp = url01 + "%25" + scenic_type[t2] + "%27";
          } else {
            url_tmp = url01 + scenic_type[t2] + "%27";
          }
          let resp = await axios.get(url_tmp, {
            params: {
              api_key:
                "956eed8e98667eca2722be6afc37e123212466565cab5df2f7e653d206f3e3c0"
            }
          });
          //scenictypedata是鼠标下类型的所有数据
          scenictypedata = scenictypedata.concat(resp.data.resource);
        }
        for (let i = 0; i < scenictypedata.length; i++) {
          for (let j = 0; j < attractionsCount.features.length; j++) {
            if (
              scenictypedata[i].attraction_id ===
              attractionsCount.features[j].properties.id
            ) {
              //更新scenictypedata 给数组的每一个元素添加Count属性
              scenictypedata[i].Count =
                attractionsCount.features[j].properties.count;
            }
          }
        }
        for (let i = 0; i < scenictypedata.length; i++) {
          scenictypedata[i].score = Math.max(
            scenictypedata[i].Count * scenictypedata[i].attraction_ratting,
            scenictypedata[i].Count,
            scenictypedata[i].attraction_ratting
          );
        }
        //将某类景点按照score 从大到小排列
        var scenictypelist = scenictypedata.sort(function(a, b) {
          return b.score - a.score;
        });
        if (scenictypelist.length > 15) {
          scenictypelist = scenictypelist.slice(1, 16);
        }
        let listring = "";
        for (let index = 0; index < 15; index++) {
          listring =
            listring +
            `<li>${scenictypelist[index].attraction_name}<button id="${index}" style="float:right;-webkit-border-radius: 28px; -moz-border-radius: 28px; border-radius: 28px; color: black;background-color: white; border: none;margin-right: 15px;">Go</button></li><br/>`;
        }
        document.getElementById("features").innerHTML =
          "<br><br>这里是" +
          `<b>${features[0].properties.name}</b>` +
          "<br><br><hr>推荐与其相似的景点：" +
          `<ol style='margin-top: 0px'>
            ${listring}
            </ol>`;
        for(let num =0;num<15;num++){
          document.getElementById(num.toString()).addEventListener('click',  ()=> {
            map.flyTo({
              center: [scenictypelist[num].attraction_lat,scenictypelist[num].attraction_lon]
            });
            if(this.popup1!==undefined&&this.popup1.isOpen()){
              this.popup1.remove();
            }
            this.popup1=new mapboxgl.Popup().setLngLat([scenictypelist[num].attraction_lat,scenictypelist[num].attraction_lon]).setHTML("<div id='popup_similar'></div>").addTo(map);
            let popupinfo={
              id:scenictypelist[num].attraction_id,
              type:"attractions"
            };
            new popup({
              propsData:{
                infos: {
                  infos: {
                    id: scenictypelist[num].attraction_id,
                    typ: "attractions",
                    userID: this.userId
                  }
                }
              }
            }).$mount("#popup_similar")

            map.panTo([scenictypelist[num].attraction_lat,scenictypelist[num].attraction_lon])
          });

        }


      }
    });
    map.on("wheel", function() {
      let range = map.getZoom();
      that.$store.commit("set_map_zoom", range);
      let c = map.getCenter();
      that.$store.commit("set_map_center", c);
    });
    map.on("move", function() {
      let range = map.getZoom();
      that.$store.commit("set_map_zoom", range);
      let c = map.getCenter();
      that.$store.commit("set_map_center", c);
    });
  },
  methods: {}
};
</script>

<style scoped>
@import url("https://api.mapbox.com/mapbox-gl-js/v2.4.1/mapbox-gl.css");
#map_show {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  pointer-events: all;
}

#features {
  position: absolute;
  right: 5%;
  width: 300px;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(5px);
  top: 8%;
  border-radius: 20px;
  box-shadow: 4px 12px 40px 6px rgb(0 0 0 / 9%);
  border: none;
  height: 70%;
  overflow: scroll;
  scrollbar-width: none;
  padding-left: 20px;
  padding-right: 10px;
  animation: heightani linear 2s ;
}

pre::-webkit-scrollbar {
  display: none; /* Chrome Safari */
}
@keyframes heightani {
  from{
    height: 0px;
    width: 20px;
  }
  to{
    height: 70%;
    width: 300px;
  }

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
