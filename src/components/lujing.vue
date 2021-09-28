<template>
  <div>
    <div id="map"></div>
    <div id="instructions"></div>
    <div>
      <el-row>
        <el-button @click="cleanMarks()" type="primary">清除当前路线</el-button>
        <el-button @click="routeOptimize()" type="primary">路径优化</el-button>
      </el-row>
    </div>

    <div style="margin-top: 20px">
      <el-radio-group v-model="radio1" size="medium" @change="changeModel()">
        <el-radio label="1" border>按选择景点顺序</el-radio>
        <el-radio label="2" border>按最短路径</el-radio>
      </el-radio-group>
    </div>
  </div>
</template>

<script>
import GeoJSON from "geojson";
import mapboxgl from "@mapgis/mapbox-gl";
import axios from "axios";
// import {defineCompoent,createApp,ref,nextTick } from "@vue/composition-api"
import Vue from "vue";
import attractiondata from "./data/attractions.json";
//load image
import jingdanimage from "../assets/icon/jingdian32px.png";

export default {
  name: "lujing",

  data() {
    return {
      map: undefined,
      mapMarkers: undefined, //Marks数组
      pointArray: undefined, //路径点的数组
      point_data: "", //按景点点击顺序生成的url
      pointFlag: 0, //是否第一次点击的标志位
      radio1: "1", //激活单选框
      lujignModel: 0, //路径选择模式，默认是0
      start: {}, //起点信息
      end: {}, //终点信息
      point_X: null, //景点API查询后该景点的坐标
      point_Y: null, //景点API查询后该景点的坐标
      attraction_name: "", //景点API查询后该景点的名字
      routeOrder: "", //路径规划后景点名称顺序
      instructionsData: {}, //常规路径API返回的数据
    };
  },
  setup() {},
  mounted() {
    // add the JavaScript here

    /*****这部分是mapbox gl 自带的地图******* 
        mapboxgl.accessToken = 'pk.eyJ1IjoicGFuZ3hpYW5nIiwiYSI6ImNrdDlnNmpwaDFicGUydHBlNnpkaWMzb2YifQ.gaEytDHJl-UD3e1h5JB_Ew';
        const map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [114.906320907278, 30.3857247757487], // starting position
            zoom: 12
        });

**********************************************/
    this.initialMap();
    this.initialALayer();
    this.test();
    /*********************************************/
  },
  methods: {
    /*******这部分是天地图 *****************************/
    initialMap() {
      //加载地图
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
            tiandituKey,
        ],
        //栅格瓦片的分辨率
        tileSize: 256,
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
            tiandituKey,
        ],
        //栅格瓦片的分辨率
        tileSize: 256,
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
            tiandituKey,
        ],
        //栅格瓦片的分辨率
        tileSize: 256,
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
            tiandituKey,
        ],
        //栅格瓦片的分辨率
        tileSize: 256,
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
            tiandituKey,
        ],
        tileSize: 256,
      };
      //实例化Map对象加载地图
      this.map = new mapboxgl.Map({
        crs: "EPSG:4326",
        maxBounds: [
          [-180, -90],
          [180, 90],
        ],
        zoom: 6,
        center: [114.906320907278, 30.3857247757487],
        container: "map",
        style: {
          version: 8,
          glyphs: "http://fonts.openmaptiles.org/{fontstack}/{range}.pbf",
          sources: {
            vecsrc: vecsrc,
            cvasrc: cvasrc,
            imgsrc: imgsrc,
            ciasrc: ciasrc,
            tersrc: tersrc,
          },
          layers: [
            {
              id: "vecsrc",
              type: "raster",
              source: "vecsrc",
              minzoom: 0,
              maxzoom: 22,
            },
            {
              id: "cvasrc",
              type: "raster",
              source: "cvasrc",
              minzoom: 0,
              maxzoom: 22,
            },
          ],
        },
      });
    },

    initialALayer() {
      this.map.on("load", () => {
        this.map.loadImage(jingdanimage, (error, image) => {
          if (error) {
            console.log(error);
          } else {
            this.map.addImage("jingdian", image);
          }

          this.map.addSource("attractionlayer", {
            type: "geojson",
            data: attractiondata,
          });

          this.map.addLayer({
            id: "attractionLayer",
            type: "symbol",
            source: "attractionlayer",
            layout: {
              "icon-image": "jingdian",
              "text-field": "{name}",
              "text-anchor": "right",
              "text-font": ["Open Sans Bold"],
              "text-line-height": 1.2,
              "text-size": 12,
              "text-offset": [-1, 0],
            },
          });
        });
      });
    },

    async getInfo(poiID, that) {
      let requestsURL = `http://121.5.235.15/api/v2/zhouyou/_table/Attractions?fields=*&filter=attraction_id=${poiID.toString()}&limit=10`;
      await axios
        .get(requestsURL, {
          params: {
            api_key:
              "956eed8e98667eca2722be6afc37e123212466565cab5df2f7e653d206f3e3c0",
          },
        })
        .then(function (response) {
          if (response.data !== undefined) {
            let m = response.data.resource[0];

            that.point_X = m.attraction_lat;
            that.point_Y = m.attraction_lon;
            that.attraction_name = m.attraction_name;
          }
        })
        .catch((re) => console.log("获取失败"));
    },

    test() {
      // mapboxgl.accessToken = 'pk.eyJ1IjoicGFuZ3hpYW5nIiwiYSI6ImNrdDlnNmpwaDFicGUydHBlNnpkaWMzb2YifQ.gaEytDHJl-UD3e1h5JB_Ew'; //官网的mapbox gl token
      mapboxgl.accessToken =
        "pk.eyJ1IjoicGFuZ3hpYW5nIiwiYSI6ImNrdDlnNjB5NjE1aXEyd3BobDk5bzl6eDcifQ.StO2ou5aRA50kbu17CzXmw"; //我的mapbox gl 的token

      //Mark储存
      this.mapMarkers = [];
      //景点选择储存
      this.pointArray = [];

      //监听事件
      this.map.on("load", () => {
        //let point_data;

        this.map.on("click", "attractionLayer", async (e) => {
          // create a function to make a directions request
          let poiID = e.features[0].properties.attraction_id; //获取当前点击景点的poiID

          await this.getInfo(poiID, this);

          // console.log(e.lngLat.lng,e.lngLat.lat)

          //gerRoute函数： 通过url获取导航的信息，并绘图
          async function getRoute(point_data, map) {
            // make a directions request using cycling profile

            const query = await fetch(
              //`https://api.mapbox.com/directions/v5/mapbox/cycling/114.906320907278,30.3857247757487;114.306320907278,30.4057247757487?steps=true&geometries=geojson&language=chinese&access_token=${mapboxgl.accessToken}`,//发给mapbox的API
              //`https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&language=zh-Hans&access_token=${mapboxgl.accessToken}`,
              `https://api.mapbox.com/directions/v5/mapbox/driving/${point_data}?steps=true&geometries=geojson&language=zh-Hans&access_token=${mapboxgl.accessToken}`,

              { method: "GET" }
            );
            const json = await query.json();
            const data = json.routes[0];
            const route = data.geometry.coordinates;
            const geojson = {
              type: "Feature",
              properties: {},
              geometry: {
                type: "LineString",
                coordinates: route,
              },
            };

            // if the route already exists on the map, we'll reset it using setData
            //先查询是否已经存在"route"图层，如果已经存在，通过getSource.setData来发送数据；若未存在，直接创建该图层

            if (map.getSource("Point_Source")) {
              map.getSource("Point_Source").setData(geojson);
            }
            // otherwise, we'll make a new request
            else {
              map.addSource("Point_Source", {
                type: "geojson",
                data: geojson,
              }),
                map.addLayer({
                  id: "route",
                  type: "line",
                  source: "Point_Source",
                  layout: {
                    "line-join": "round",
                    "line-cap": "round",
                  },
                  paint: {
                    //  "line-color": "#3887be",#000000
                    "line-color": "#3887be",
                    "line-width": 5,
                    "line-opacity": 0.75,
                  },
                });
            }

            // add turn instructions here at the end
            // get the sidebar and add the instructions
            //这部分是设置导航栏的详细信息
            const instructions = document.getElementById("instructions");
            const steps = data.legs[0].steps;

            let tripInstructions = "";

            for (const step of steps) {
              tripInstructions += `<li>${step.maneuver.instruction}</li>`;
            }

            instructions.innerHTML = `<p><strong>Trip duration: ${Math.floor(
              data.duration / 60
            )} min 🚴 </strong></p><ol>${tripInstructions}</ol>`;
          }

          if (this.lujignModel == 0) {
            //按景点选择顺序模式

            const marker = new mapboxgl.Marker({
              color: "#000000",
              draggable: true,
            })
              .setLngLat([this.point_X, this.point_Y])
              .addTo(this.map);

            this.mapMarkers.push(marker); //将Marks的信息储存到mapMarkers数组中,便于后面的清除

            if (this.pointFlag == 0) {
              //第一次点击
              this.point_data =
                this.point_X.toString() + "," + this.point_Y.toString();
              this.pointFlag = 1;
            } else {
              //第二次点击之后
              this.point_data =
                this.point_data +
                ";" +
                this.point_X.toString() +
                "," +
                this.point_Y.toString(); //构造url请求的坐标点
              // console.log(this.point_data);
              getRoute(this.point_data, this.map);
            }
          } else if (this.lujignModel == 1) {
            //最短路径模式

            if (this.pointFlag == 0) {
              this.pointFlag = 1;
              //第一次点击,选择起点
              this.start = {
                name: `${this.attraction_name}`,
                lat: `${this.point_X}`,
                lng: `${this.point_Y}`,
              };

              const marker = new mapboxgl.Marker({
                color: "#22c32e", //绿色
                draggable: true,
              })
                .setLngLat([this.point_X, this.point_Y])
                .addTo(this.map);

              this.mapMarkers.push(marker); //将Marks的信息储存到mapMarkers数组中,便于后面的清除
            } else if (this.pointFlag == 1) {
              //第二次点击，选择终点
              this.pointFlag = 2;
              this.end = {
                name: `${this.attraction_name}`,
                lat: `${this.point_X}`,
                lng: `${this.point_Y}`,
              };

              const marker = new mapboxgl.Marker({
                color: "#ff0000", //红色
                draggable: true,
              })
                .setLngLat([this.point_X, this.point_Y])
                .addTo(this.map);

              this.mapMarkers.push(marker); //将Marks的信息储存到mapMarkers数组中,便于后面的清除
            } else {
              //选择途径点
              //将当次选择的景点坐标储存到pointArray数组中

              //console.log("长度为："+this.pointArray.length)
              this.pointArray[this.pointArray.length] = {
                name: `${this.attraction_name}`, //防止因为Name是0出现null
                lat: `${this.point_X}`,
                lng: `${this.point_Y}`,
              };

              const marker = new mapboxgl.Marker({
                color: "#1E90FF", //蓝色
                draggable: true,
              })
                .setLngLat([this.point_X, this.point_Y])
                .addTo(this.map);

              this.mapMarkers.push(marker); //将Marks的信息储存到mapMarkers数组中,便于后面的清除
            }
            //
          } else {
            console.log("选择模式错误，模式不存在！！！！");
          }
        });
      });
    },

    //清除Marks和路径的函数
    cleanMarks() {
      console.log("成功清除");

      this.mapMarkers.forEach((marker) => marker.remove());

      this.mapMarkers = [];

      if (this.map.getLayer("route")) {
        this.map.removeLayer("route"); //删除图层
      }
      if (this.map.getSource("Point_Source")) {
        this.map.removeSource("Point_Source"); //删除图层的源
      }

      this.pointFlag = 0; //标志位清零
      this.point_data = " "; //url请求清零
      this.pointArray = []; //清空路径优化的数组
    },

    //获取路径优化
    routeOptimize() {
      function RouteXL_API_Connector() {
        this.tour = function (locations, success_callback, error_callback) {
          // Init the request object
          var httpRequest = new XMLHttpRequest();
          if (!httpRequest) {
            alert("Cannot create an XMLHttpRequest instance");
            return false;
          }

          // Set up the request and send it
          httpRequest.open("POST", "https://api.routexl.com/tour");
          httpRequest.setRequestHeader(
            "Content-Type",
            "application/x-www-form-urlencoded"
          );
          httpRequest.setRequestHeader(
            "Authorization",
            "Basic " + btoa("pangxiang:Pang2076529+..")
          );
          var params = "locations=" + JSON.stringify(locations);
          httpRequest.send(params);

          // Receive the response
          httpRequest.onreadystatechange = function () {
            if (httpRequest.readyState === XMLHttpRequest.DONE) {
              if (httpRequest.status === 200) {
                success_callback(httpRequest.responseText);
              } else {
                error_callback(httpRequest.responseText);
              }
            }
          };
        };
      }

      async function getRoute(point_data, map) {
        // make a directions request using cycling profile

        const query = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${point_data}?steps=true&geometries=geojson&language=zh-Hans&access_token=${mapboxgl.accessToken}`,

          { method: "GET" }
        );
        const json = await query.json();
        const data = json.routes[0];
        const route = data.geometry.coordinates;
        const geojson = {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: route,
          },
        };

        // if the route already exists on the map, we'll reset it using setData
        //先查询是否已经存在"route"图层，如果已经存在，通过getSource.setData来发送数据；若未存在，直接创建该图层

        if (map.getSource("Point_Source")) {
          map.getSource("Point_Source").setData(geojson);
        }
        // otherwise, we'll make a new request
        else {
          map.addSource("Point_Source", {
            type: "geojson",
            data: geojson,
          }),
            map.addLayer({
              id: "route",
              type: "line",
              source: "Point_Source",
              layout: {
                "line-join": "round",
                "line-cap": "round",
              },
              paint: {
                //  "line-color": "#3887be",#000000
                "line-color": "#3887be",
                "line-width": 5,
                "line-opacity": 0.75,
              },
            });
        }

        // add turn instructions here at the end
        // get the sidebar and add the instructions
        //这部分是设置导航栏的详细信息
        that.instructionsData = data;
      }

      //构造数组
     
        
       
        this.pointArray.unshift(this.start); //将start放入数组头部
        this.pointArray.push(this.end); //将end放入数组尾部
      



      // Init API connector
      var r = new RouteXL_API_Connector();
      console.log(this.pointArray);
    

      let that = this;

      // Get the tour
      r.tour(
        this.pointArray,
        async function (result) {
          // Success注意！返回的result是一个string
          //console.log( typeof result ); typeof用于判断数据类型   注意！返回的result是一个string

          let routeResult = JSON.parse(result); //将result转为Json对象方便使用
          let pointStr = ""; //这个是构建点的坐标字符串url

          //console.log("API函数内的：")
          // let routeOrder = ''

          for (let j = 0; j < that.pointArray.length; j++) {
            if (j == 0) {
              that.routeOrder = routeResult.route[j].name;
            } else {
              that.routeOrder =
                that.routeOrder + "→" + routeResult.route[j].name;
            }

            for (let k = 0; k < that.pointArray.length; k++) {
              if (routeResult.route[j].name == that.pointArray[k].name) {
                //console.log(routeResult.route[j].name)
                //console.log(pointArray[k].lat)
                if (that.pointArray[k].name == that.end.name) {
                  //如果是终点，那么在pointStr后不用再加  ;   号
                  pointStr =
                    pointStr +
                    `${that.pointArray[k].lat},${that.pointArray[k].lng}`;
                } else {
                  pointStr =
                    pointStr +
                    `${that.pointArray[k].lat},${that.pointArray[k].lng};`;
                }
              }
            }
          }

          console.log(that.routeOrder);

          await getRoute(pointStr, that.map); //画线

          /************这部分是根据路径API查询后得到的导航信息 */
          const instructions = document.getElementById("instructions");
          const steps = that.instructionsData.legs[0].steps;
          let tripInstructions = "";

          instructions.innerHTML = `<p><strong>Trip duration: ${Math.floor(
            that.instructionsData.duration / 60 //计算路程总时间
          )} min 🚴 </strong></p><ol>${that.routeOrder}</ol>`; //routeOrder是景点路径的顺序
        },
        function (error) {
          // Error
          console.log(error);
        }
      );
    },

    changeModel() {
      this.lujignModel = !this.lujignModel;
      console.log("当前模式为：" + this.lujignModel);
    },
  },
};
</script>



<style scoped>
@import url("https://api.mapbox.com/mapbox-gl-js/v2.4.1/mapbox-gl.css");
#map {
  position: absolute;
  top: 60px;
  bottom: 0;
  width: 100%;
}
#instructions {
  position: absolute;
  margin: 20px;
  width: 10%;
  top: 200px;
  bottom: 60%;
  padding: 20px;
  background-color: #fff;
  overflow-y: scroll;
  font-family: sans-serif;
}
</style>