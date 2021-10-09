<template>
  <div>
    <div id="map"></div>
    <div id="loading" ref="loading">
      <span class="el-icon-loading"></span>
    </div>
  <div id="secMenu">
    <div class="secFlex">
    <div class="specialPanel">
      <div class="specialText text"><span>特色路线</span></div>
      <div class="specialHidden">
        <p class="choice" @click="FalseAll();openControl.hongseRoute=true;">红色</p>
        <p class="choice" @click="FalseAll();openControl.minzuRoute=true;">民族</p>
      </div>
    </div>
    <div class="customePanel"  >
      <div class="customeText text"><span>自定义路线</span></div>
      <div class="customeHidden">
        <p class="choice" @click="FalseAll();ProcessClick('1-1-1');openControl.customeRoute=true;">顺序生成路线</p>
        <p class="choice" @click="FalseAll();ProcessClick('1-1-2');openControl.customeRoute=true;">最短路线</p>
      </div>
    </div>
    <div class="routePanel">
      <div class="routeText text"><span>路线中心</span></div>
      <div class="routeHidden">
        <p class="choice" @click="FalseAll();menuSelect('1-2-1');openControl.routeMy=true;">我的路线</p>
        <p class="choice" @click="FalseAll();menuSelect('2-4');openControl.routeShare=true;">分享的路线</p>
      </div>
    </div>
  </div>
  </div>
  <div id="right">

      <div id="instructions"></div>
    </div>

<!--    特色路线-->
  <div id="routeDisplay"  >
    <div class="HongseRouteFlex" v-if="openControl.hongseRoute">
      <div class="routeItem" @click="ProcessClick('2-1-1')"><span>伟人足迹</span></div>
      <div class="routeItem" @click="ProcessClick('2-1-2')"><span>红色经典</span></div>
      <div class="routeItem" @click="ProcessClick('2-1-3')"><span>红色宝藏</span></div>
      <div class="routeItem" @click="ProcessClick('2-1-4')"><span>建军策源</span></div>
      <div class="routeItem" @click="ProcessClick('2-1-5')"><span>红色英烈</span></div>
    </div>
    <div class="MinzuRouteFlex" v-if="openControl.minzuRoute">
      <div class="routeItem" @click="ProcessClick('2-2-1')"><span>土家风光</span></div>
      <div class="routeItem" @click="ProcessClick('2-2-2')"><span>土家风情</span></div>
      <div class="routeItem" @click="ProcessClick('2-2-3')"><span>土司遗址</span></div>
    </div>
  </div>
    <!-- <div id="search"><v-globalSelect /></div> -->
<!--    路线中心-->
<div id="routeCenter" ref="kongtiao" @mousedown="mouseDownHandleelse($event)" @mouseup="mouseUpHandleelse($event)">
    <div class="routeMy" v-if="openControl.routeMy"><el-table
      :data="tableData"
      style="width: 100%"
      max-height="250"
    >
      <el-table-column
        fixed
        prop="user_route_name"
        label="路线名称"
        width="100"
      >
      </el-table-column>
      <el-table-column
        prop="userName"
        label="用户名称"
        width="100"
      >
      </el-table-column>
      <el-table-column
        prop="route_creat_time"
        label="创建时间"
        width="200"
      >
      </el-table-column>
      <el-table-column
        prop="route_attraction_name"
        label="景点路线"
        width="150"
      >
      </el-table-column>

      <el-table-column :data="tableData" fixed="right" label="操作" width="120">
        <template slot-scope="scope">
          <el-button
            @click.native.prevent="
                              showUserRoute(scope.$index, tableData)
                            "
            type="text"
            size="small"
          >
            显示
          </el-button>
          <el-button
            @click.native.prevent="
                              deleteUserRoute(scope.$index, tableData)
                            "
            type="text"
            size="small"
          >
            删除
          </el-button>
          <el-button
            id="shareButton"
            @click.native.prevent="
                              shareUserRoute(scope.$index, tableData,$event)
                            "
            type="text"
            size="small"
          >
            {{tableData[scope.$index].route_shareFlag===1?"取消分享":"分享"}}
          </el-button>
        </template>
      </el-table-column>
    </el-table></div>
    <div class="routeShare" v-if="openControl.routeShare"><el-table
      :data="shareTableData"
      style="width: 100%"
      max-height="250"
    >
      <el-table-column
        fixed
        prop="user_route_name"
        label="路线名称"
        width="100"
      >
      </el-table-column>
      <el-table-column
        prop="userName"
        label="用户名称"
        width="100"
      >
      </el-table-column>
      <el-table-column
        prop="route_creat_time"
        label="创建时间"
        width="200"
      >
      </el-table-column>
      <el-table-column
        prop="route_attraction_name"
        label="景点路线"
        width="150"
      >
      </el-table-column>

      <el-table-column fixed="right" label="操作" width="60">
        <template slot-scope="scope">
          <el-button
            @click.native.prevent="
                              showUserRoute(scope.$index, shareTableData)
                            "
            type="text"
            size="small"
          >
            显示
          </el-button>
        </template>
      </el-table-column>
    </el-table></div>
</div>
<!--自定义路线-->
<div id="customeRoute" v-if="openControl.customeRoute" >
  <div v-if="this.ButtonFlag == 1">
    <el-button @click="cleanMarks()" type="primary">清除已选路线</el-button>
    <el-button @click="open" type="primary">保存当前路线</el-button>
    <!-- <el-button @click="saveRoute()" type="primary">保存特色路线</el-button> -->
    <el-button v-if="this.ButtonFlag_optimiz == 1" @click="routeOptimize()" type="primary">最佳路径</el-button>

  </div>

</div>
    <!-- 出行方式 -->
    <div id="dropdown">
      <el-dropdown @command="handleCommand">
        <el-button type="primary" split-button="true">
          出行方式<i class="el-icon-arrow-down el-icon--right"></i>
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="a">驾驶</el-dropdown-item>
          <el-dropdown-item command="b">骑行</el-dropdown-item>
          <el-dropdown-item command="c">步行</el-dropdown-item>
          <el-dropdown-item command="d">公交</el-dropdown-item>

        </el-dropdown-menu>
      </el-dropdown>
    </div>
</div>
</template>

<script>
import GeoJSON from "geojson";
import mapboxgl from "@mapgis/mapbox-gl";
import axios from "axios";
// import {defineCompoent,createApp,ref,nextTick } from "@vue/composition-api"

import attractiondata from "./data/attractions.json";
import minzuData from "./data/minzu.json";
import hongseData from "./data/hongse.json";

import * as turf from "@turf/turf/turf.min.js";

// TODO新导入的包，需要"npm install jaquery"  和 "npm install coordtransform "
import $ from 'jquery'
import coordtransform from "coordtransform"

//load image
//TODO 把红色景点的图标更换了 把jingdian32px.png复制了一个  名字改成jingdian32p.png
import jingdanimage from "./assets/jingdian32px.png";
import hongseimage from "./assets/jingdian32p.png";

export default {
  name: "lujing",
  components: {
  },

  data() {
    return {
      tableData: [],//已保存路线表格的数据
      shareTableData:[],//分享路线表格的数据
      map: undefined,
      mapMarkers: undefined, //Marks数组
      pointArray: undefined, //路径点的数组
      point_data: "", //按景点点击顺序生成的url
      pointFlag: 0, //是否第一次点击的标志位
      radio1: "1", //激活单选框
      radio: "0", //激活单选框
      radio2: "0",
      lujignModel: 0, //路径选择模式，默认是0
      start: {}, //起点信息
      end: {}, //终点信息
      point_X: null, //景点API查询后该景点的坐标
      point_Y: null, //景点API查询后该景点的坐标
      attraction_name: "", //景点API查询后该景点的名字
      routeOrder: "", //路径规划后景点名称顺序
      instructionsData: {}, //常规路径API返回的数据
      route_attraction_id_Array: [], //将route_attraction_id存入数组，便于上传
      route_attraction_name_Array: [],
      route_zuobiaoArry_Array: [],
      RedRouteMarkArry: [], //红色经典Marks,便于清除
      MinzuMarkArry: [], //民族景点Marks,便于清除
      emptyGeojson: { type: "FeatureCollection", features: [] }, //空的Geojson
      zoomNum: 0, //缩放级数
      get_minzu_Data: {}, //转换为GeoJSON后的minzu数据
      get_hongse_Data: {},
      ZoomFlag: 1, //打开菜单自定义路线的时候才显示聚类和按钮
      ButtonFlag: 0, //整个按钮div的标志位
      ButtonFlag_optimiz: 0 ,//路径优化按键的标注位,
      traffiMode:"driving", //walking,cycling,driving交通方式
      baiduInputArray:[],
      shareFlag:"分享",
      zoomLevel:10, //点击不同的路线,动态改变缩放等级
      lastIndex:null,
      openControl:{
        //特色路线
        specialRoute:false,
        hongseRoute:false,
        minzuRoute:false,
        //自定义路线
        customeRoute:false,
        //路线中心
        routeMy:false,
        routeShare:false
      },
      startRoute:0,
      moveDataelse: {
        x: null,
        y: null
      }


    };
  },
  setup() {},
  mounted() {
    //this.initialMap();
    this.initialMap2();
    this.transData(); //将民族和红色的数据转为GEOJSON
    this.initialALayer();
    this.test();
    //this.guiji2([114.90632090728, 30.385724775749],[112.644097, 31.215108],this.map);
    //this.guiji2([114.89765690728, 30.415087775749],[113.108647, 31.358733],this.map);
    this.$EventBus.$on("panto", value => {
      //JSON.stringify()
      this.map.panTo(value);

      this.map.flyTo({
        center: value, //要移动到的坐标中心
        zoom: 16,
        speed: 2,
        curve: 1,
        easing(t) {
          return t;
        }
      });
    });

    /*********************************************/
  },
  methods: {
    //MyFunction
    ProcessClick(key){
      if(/1-1/.test(key)){
        if(/1-1/.test(this.lastIndex)){
          this.menuSelect(key)
          this.lastIndex=key
        }else{
          this.handleClose(key)
          this.handleClose('2')
          this.handleOpen('1')
          this.handleOpen('1-1')
          this.menuSelect(key)
          this.lastIndex=key
        }
      }else if(/^2/.test(key)){
        if(/^2/.test(this.lastIndex)){
          this.menuSelect(key)
          this.lastIndex=key
        }else{
          this.handleClose('1')
          if(/2-1/.test(key)){
            this.handleOpen('2-1')
          }else if(/2-2/.test(key)){
            this.handleOpen('2-2')
          }
          this.menuSelect(key)
          this.lastIndex=key
        }
      }


      if(this.lastIndex!==null){
        this.handleClose(this.lastIndex)
      }
    },
    FalseAll(){
      for(let item in this.openControl){
        this.openControl[item]=false
      }
    },
    mouseDownHandleelse(event) {
      this.moveDataelse.x = event.pageX - this.$refs.kongtiao.offsetLeft
      this.moveDataelse.y = event.pageY - this.$refs.kongtiao.offsetTop
      event.currentTarget.style.cursor = 'move'
      window.onmousemove = this.mouseMoveHandleelse
    },
    mouseMoveHandleelse(event) {
      let moveLeft = event.pageX - this.moveDataelse.x + 'px'
      let moveTop = event.pageY - this.moveDataelse.y + 'px'
      this.$refs.kongtiao.style.left = moveLeft
      this.$refs.kongtiao.style.top = moveTop
    },
    mouseUpHandleelse(event) {
      window.onmousemove = null
      event.currentTarget.style.cursor = 'move'
      console.log('鼠标松开了')
    },
    //庞氏
    initialMap2() {
      let that = this;
      mapboxgl.accessToken =
        "pk.eyJ1Ijoiam9zaHVhbXdvbmciLCJhIjoiY2tzaXRlOXcyMHVhNzJ2bnN4aG11NW10aiJ9.RdgXiHX8GNMNWTr2X92ruQ";
      this.map = new mapboxgl.Map({
        container: "map",
        style:"mapbox://styles/joshuamwong/ckte9azm523g217juhpczqo5q",
        // style: "mapbox://styles/mapbox/streets-v11",
        center: that.$store.state.mapCenter,
        zoom: that.$store.state.mapZoom
      });
    },

    initialALayer() {
      let that = this;
      //常规景点图层
      this.map.on("load", () => {
        this.map.loadImage(jingdanimage, (error, image) => {
          if (error) {
            console.log(error);
          } else {
            this.map.addImage("jingdian", image);
          }

          this.map.addSource("attractionlayer", {
            type: "geojson",
            data: this.emptyGeojson
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
              "text-offset": [-1, 0]
            }
          });
        });
      });

      //红色景点和民族景点图层
      this.map.on("load", () => {
        this.map.loadImage(hongseimage, (error, image) => {
          if (error) {
            console.log(error);
          } else {
            this.map.addImage("hongseimage", image);
          }

          this.map.addSource("teseLayer", {
            type: "geojson",
            data: this.emptyGeojson
          });

          this.map.addLayer({
            id: "teseLayer",
            type: "symbol",
            source: "teseLayer",
            layout: {
              "icon-image": "hongseimage",
              "text-field": "{attraction_name}",
              "text-anchor": "right",
              "text-font": ["Open Sans Bold"],
              "text-line-height": 1.2,
              "text-size": 12,
              "text-offset": [-1, 0]
            }
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
        });
      });



      // this.myaddCluster(attractiondata,this.map)
      this.addCluster(attractiondata); //显示聚类

      this.getNowZoom();
    },

    async getInfo(poiID, that) {
      let requestsURL = `http://121.5.235.15/api/v2/zhouyou/_table/Attractions?fields=*&filter=attraction_id=${poiID.toString()}&limit=10`;
      await axios
        .get(requestsURL, {
          params: {
            api_key:
              "956eed8e98667eca2722be6afc37e123212466565cab5df2f7e653d206f3e3c0"
          }
        })
        .then(function(response) {
          if (response.data !== undefined) {
            let m = response.data.resource[0];

            that.point_X = m.attraction_lat;
            that.point_Y = m.attraction_lon;
            that.attraction_name = m.attraction_name;
          }
        })
        .catch(re => {console.log("获取失败")});
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
        let that = this
        this.map.on("click", "attractionLayer", async e => {
          let poiID = e.features[0].properties.id; //获取当前点击景点的poiID
          console.log(poiID);
          await this.getInfo(poiID, this);
          console.log(this.point_X, this.point_Y, this.attraction_name, poiID);

          // console.log(e.lngLat.lng,e.lngLat.lat)

          //gerRoute函数： 通过url获取导航的信息，并绘图
          async function getRoute(point_data, map, routeOrder) {
            // make a directions request using cycling profile
            // console.log("本次按顺序选择坐标数据为："+point_data)
            const query = await fetch(
              //`https://api.mapbox.com/directions/v5/mapbox/cycling/114.906320907278,30.3857247757487;114.306320907278,30.4057247757487?steps=true&geometries=geojson&language=chinese&access_token=${mapboxgl.accessToken}`,//发给mapbox的API
              //`https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&language=zh-Hans&access_token=${mapboxgl.accessToken}`,
              `https://api.mapbox.com/directions/v5/mapbox/${that.traffiMode}/${point_data}?steps=true&geometries=geojson&language=zh-Hans&access_token=${mapboxgl.accessToken}`,

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
                coordinates: route
              }
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
                data: geojson
              }),
                map.addLayer({
                  id: "route",
                  type: "line",
                  source: "Point_Source",
                  layout: {
                    "line-join": "round",
                    "line-cap": "round"
                  },
                  paint: {
                    //  "line-color": "#3887be",#000000
                    "line-color": "#3887be",
                    "line-width": 5,
                    "line-opacity": 0.75
                  }
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

            const distance = (data.distance / 1000).toFixed(2);
            instructions.innerHTML = `<p><strong>预计时间: ${Math.floor(data.duration / 60 )} min </strong>
            <p><strong>总路程：${distance} km </strong></p>
            </p><strong>游览顺序：${routeOrder}</strong>`;
          }

          if (this.lujignModel == 0&&this.startRoute==1) {
            //按景点选择顺序模式

            const marker = new mapboxgl.Marker({
              color: "#000000",
              draggable: true
            })
              .setLngLat([this.point_X, this.point_Y])
              .addTo(this.map);

            this.mapMarkers.push(marker); //将Marks的信息储存到mapMarkers数组中,便于后面的清除
            this.route_attraction_id_Array.push(poiID);
            this.route_attraction_name_Array.push(this.attraction_name);
            this.route_zuobiaoArry_Array.push([this.point_X, this.point_Y]);

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

              this.getRouteOrder(this.route_attraction_name_Array);
              getRoute(this.point_data, this.map, this.routeOrder);
            }
          } else if (this.lujignModel == 1&&this.startRoute==1) {
            //最短路径模式
            this.route_attraction_id_Array.push(poiID);
            this.route_attraction_name_Array.push(this.attraction_name);
            this.route_zuobiaoArry_Array.push([this.point_X, this.point_Y]);



            if (this.pointFlag == 0) {
              this.pointFlag = 1;
              //第一次点击,选择起点
              this.start = {
                name: `${this.attraction_name}`,
                lat: `${this.point_X}`,
                lng: `${this.point_Y}`
              };

              const marker = new mapboxgl.Marker({
                color: "#22c32e", //绿色
                draggable: true
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
                lng: `${this.point_Y}`
              };

              const marker = new mapboxgl.Marker({
                color: "#ff0000", //红色
                draggable: true
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
                lng: `${this.point_Y}`
              };

              const marker = new mapboxgl.Marker({
                color: "#1E90FF", //蓝色
                draggable: true
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
      // console.log("成功清除");

      this.mapMarkers.forEach(marker => marker.remove());
      this.RedRouteMarkArry.forEach(marker => marker.remove());
      this.MinzuMarkArry.forEach(marker => marker.remove());

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
      this.route_attraction_id_Array = [];
      this.route_attraction_name_Array = [];
      this.route_zuobiaoArry_Array = [];
      this.routeOrder = "";
    },
    //获取路径优化
    routeOptimize() {

      function RouteXL_API_Connector() {
        this.tour = function(locations, success_callback, error_callback) {
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
          httpRequest.onreadystatechange = function() {
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
          `https://api.mapbox.com/directions/v5/mapbox/${that.traffiMode}/${point_data}?steps=true&geometries=geojson&language=zh-Hans&access_token=${mapboxgl.accessToken}`,

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
            coordinates: route
          }
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
            data: geojson
          }),
            map.addLayer({
              id: "route",
              type: "line",
              source: "Point_Source",
              layout: {
                "line-join": "round",
                "line-cap": "round"
              },
              paint: {
                //  "line-color": "#3887be",#000000
                "line-color": "#3887be",
                "line-width": 5,
                "line-opacity": 0.75
              }
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

      let that = this;

      // Get the tour
      r.tour(
        this.pointArray,
        async function(result) {
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

          that.point_data = pointStr;

          await getRoute(pointStr, that.map); //pointStr是最后得到的坐标顺序，画线

          /************这部分是根据路径API查询后得到的导航信息 */
          const instructions = document.getElementById("instructions");
          const steps = that.instructionsData.legs[0].steps;
          let tripInstructions = "";


          const distance = (that.instructionsData.distance / 1000).toFixed(2);
          instructions.innerHTML = `<p><strong>预计时间: ${Math.floor(that.instructionsData.duration / 60 )} min </strong>
            <p><strong>总路程：${distance} km </strong></p>
            </p><strong>游览顺序：${that.routeOrder}</strong>`;
        },
        function(error) {
          // Error
          console.log(error);
        }
      );
    },
    //这个是保存特色路线的，调用sendLujing函数，将路线发送到数据库,需要修改里面的的名字
    saveRoute() {
      this.route_attraction_id_Array = JSON.stringify(
        this.route_attraction_id_Array
      ); //转为数组字符串
      this.route_attraction_name_Array = JSON.stringify(
        this.route_attraction_name_Array
      ); //转为数组字符串
      this.route_zuobiaoArry_Array = JSON.stringify(
        this.route_zuobiaoArry_Array
      );
      this.sendLujing(
        "民族",
        this.route_attraction_id_Array,
        this.route_attraction_name_Array,
        this.point_data,
        this.route_zuobiaoArry_Array
      );
      console.log("保存成功");
    },
    //将特色路线发送到数据库
    async sendLujing(
      route_tag,
      route_attraction_id,
      route_attraction_name,
      route_zuobiao,
      route_zuobiaoArry
    ) {
      let requestsURL = `http://121.5.235.15/api/v2/zhouyou/_table/route?api_key=956eed8e98667eca2722be6afc37e123212466565cab5df2f7e653d206f3e3c0`;
      let data = {
        resource: [
          {
            route_tag: `${route_tag}`,
            route_attraction_id: `${route_attraction_id}`,
            route_attraction_name: `${route_attraction_name}`,
            route_zuobiao: `${route_zuobiao}`,
            route_zuobiaoArry: `${route_zuobiaoArry}`
          }
        ]
      };

      await axios
        .post(requestsURL, data)
        .then(function(response) {
          console.log("上传成功");
        })
        .catch(re => console.log("上传失败"));
    },
    //将自定义路线发送到数据库
    async sendUserRoute(
      route_name,
      route_attraction_id,
      route_attraction_name,
      route_zuobiao,
      route_zuobiaoArry
    ) {
      var myDate = new Date();
      let that = this
      let save_time = myDate.toLocaleString()
      let requestsURL = `http://121.5.235.15/api/v2/zhouyou/_table/user_route?api_key=956eed8e98667eca2722be6afc37e123212466565cab5df2f7e653d206f3e3c0`;
      let data = {
        resource: [
          {
            user_route_name: `${route_name}`,
            user_route_attraction_id: `${route_attraction_id}`,
            user_route_attraction_name: `${route_attraction_name}`,
            user_route_zuobiao: `${route_zuobiao}`,
            user_route_zuobiaoArry: `${route_zuobiaoArry}`,
            user_route_date:`${myDate.toLocaleString()}`,
            user_id:that.$store.state.user_id,
            user_name:`${that.$store.state.username}`

          }
        ]
      };

      await axios
        .post(requestsURL, data)
        .then(function(response) {
          console.log("上传成功");
        })
        .catch(re => console.log("上传失败"));
    },
    //根据radio的value值选择显示不同的路线
    displayRedRoute(value) {
      // this.$refs.loading.style.display="block !important"
      let that = this;
      this.mapMarkers.forEach(marker => marker.remove());
      this.RedRouteMarkArry.forEach(marker => marker.remove());
      this.MinzuMarkArry.forEach(marker => marker.remove());

      async function getRouteInfo(route_tag, value) {
        // let requestsURL= `http://121.5.235.15/api/v2/zhouyou/_table/Attractions?fields=*&filter=attraction_id=${poiID.toString()}&limit=10`
        let requestsURL = `http://newhappy.xyz/api/v2/zhouyou/_table/route?filter=route_tag=${encodeURI(
          route_tag
        ).toString()}`;
        let response = await axios.get(requestsURL, {
          params: {
            api_key:
              "956eed8e98667eca2722be6afc37e123212466565cab5df2f7e653d206f3e3c0"
          }
        });
        console.log(response);
        if (response.data !== undefined) {
          let m = response.data.resource;

          that.getRouteOrder(JSON.parse(m[value - 1].route_attraction_name));
          that.getRoute(m[value - 1].route_zuobiao, that.map);
          that.point_data = m[value - 1].route_zuobiao;

          let a = JSON.parse(m[value - 1].route_zuobiaoArry);

          for (let j = 0; j < a.length; j++) {
            const marker = new mapboxgl.Marker({
              color: "#22c32e" //绿色
            })
              .setLngLat(a[j])
              .addTo(that.map);

            that.RedRouteMarkArry.push(marker);
          }

          that.map.flyTo({
            center: a[1], //要移动到的坐标中心
            zoom: 13,
            speed: 2,
            curve: 1,
            easing(t) {
              return t;
            }
          });
        }
      }

      getRouteInfo("红色", value);
      // this.$refs.loading.style.display="none !important"
    },
    //根据radio的value值选择显示不同的路线
    displayMinzuRoute(value) {
      // this.$refs.loading.style.display="block !important"
      console.log(value);
      let that = this;
      this.mapMarkers.forEach(marker => marker.remove());
      this.RedRouteMarkArry.forEach(marker => marker.remove());
      this.MinzuMarkArry.forEach(marker => marker.remove());

      async function getRouteInfo(route_tag, value) {
        // let requestsURL= `http://121.5.235.15/api/v2/zhouyou/_table/Attractions?fields=*&filter=attraction_id=${poiID.toString()}&limit=10`
        let requestsURL = `http://newhappy.xyz/api/v2/zhouyou/_table/route?filter=route_tag=${encodeURI(
          route_tag
        ).toString()}`;
        let response = await axios.get(requestsURL, {
          params: {
            api_key:
              "956eed8e98667eca2722be6afc37e123212466565cab5df2f7e653d206f3e3c0"
          }
        });
        console.log(response);
        if (response.data !== undefined) {
          let m = response.data.resource;
          console.log(m[0].route_zuobiao);

          let a = JSON.parse(m[value - 1].route_zuobiaoArry);

          for (let j = 0; j < a.length; j++) {
            const marker = new mapboxgl.Marker({
              color: "#22c32e" //绿色
            })
              .setLngLat(a[j])
              .addTo(that.map);

            that.MinzuMarkArry.push(marker);
          }

          that.getRouteOrder(JSON.parse(m[value - 1].route_attraction_name));
          that.getRoute(m[value - 1].route_zuobiao, that.map);
          that.point_data = m[value - 1].route_zuobiao;
          that.map.flyTo({
            center: a[1], //要移动到的坐标中心
            zoom: 9,
            speed: 2,
            curve: 1,
            easing(t) {
              return t;
            }
          });
        }
      }

      getRouteInfo("民族", value);
      // this.$refs.loading.style.display="none !important"
    },
    //根据传入的user_route_name名字显示用户已保存路线
    displayUserRoute(user_route_id) {
      let that = this;
      this.mapMarkers.forEach(marker => marker.remove());
      this.RedRouteMarkArry.forEach(marker => marker.remove());
      this.MinzuMarkArry.forEach(marker => marker.remove());

      async function getRouteInfo(user_route_id) {
        // let requestsURL= `http://121.5.235.15/api/v2/zhouyou/_table/Attractions?fields=*&filter=attraction_id=${poiID.toString()}&limit=10`
        let requestsURL = `http://121.5.235.15/api/v2/zhouyou/_table/user_route/${user_route_id}?`;
        let response = await axios.get(requestsURL, {
          params: {
            api_key:
              "956eed8e98667eca2722be6afc37e123212466565cab5df2f7e653d206f3e3c0"
          }
        });
        console.log(response);
        if (response.data !== undefined) {
          let m = response.data;
          console.log(m)
          console.log(m.user_route_zuobiao);

          let a = JSON.parse(m.user_route_zuobiaoArry);

          for (let j = 0; j < a.length; j++) {
            const marker = new mapboxgl.Marker({
              color: "#22c32e" //绿色
            })
              .setLngLat(a[j])
              .addTo(that.map);

            that.MinzuMarkArry.push(marker);
          }

          that.getRoute(m.user_route_zuobiao, that.map);
          that.point_data=m.user_route_zuobiao;

          that.map.flyTo({
            center: a[1], //要移动到的坐标中心
            zoom: 8,
            speed: 2,
            curve: 1,
            easing(t) {
              return t;
            }
          });
        }
      }

      getRouteInfo(user_route_id);
    },
    //获取当前用户的所有已保存的路线
    //TODO
    getUserALLroute() {
      let that = this;
      async function getRouteInfo() {
        // let requestsURL= `http://121.5.235.15/api/v2/zhouyou/_table/Attractions?fields=*&filter=attraction_id=${poiID.toString()}&limit=10`
        let requestsURL = `http://121.5.235.15/api/v2/zhouyou/_table/user_route?filter=user_name=${that.$store.state.username}`;
        let response = await axios.get(requestsURL, {
          params: {
            api_key:
              "956eed8e98667eca2722be6afc37e123212466565cab5df2f7e653d206f3e3c0"
          }
        });
        console.log(response);
        if (response.data !== undefined) {
          let m = response.data.resource;
          console.log(m[0].user_route_zuobiao);

          for (let j = 0; j < m.length; j++) {
            let tableData_info = {
              user_route_name: m[j].user_route_name,
              userName: `${that.$store.state.username}`,
              route_attraction_name: m[j].user_route_attraction_name,
              route_creat_time:m[j].user_route_date,
              route_shareFlag:m[j].user_route_shareFlag,
              user_route_id:m[j].user_route_id

            };

            that.tableData.push(tableData_info);




          }
        }

        console.log(that.tableData)
      }

      getRouteInfo();
    },
    //通过调用 displayUserRoute()，并将当前获取点击的路线名称传给它，将该路线显示出来
    showUserRoute(index, rows) {
      //index是当前点击的行数，rows是所有行的信息数组
      //rows.splice(index, 1);

      console.log(index,rows)
      this.displayUserRoute(rows[index].user_route_id);

      this.getRouteOrder(JSON.parse(rows[index].route_attraction_name));
      // console.log(this.routeOrder);
    },
    //删除用户已保存路线
    //TODO 增加一个删除成功后的提示

    deleteUserRoute(index, rows) {
      async function deleteLujing(user_route_id) {
        let requestsURL =
          `http://121.5.235.15/api/v2/zhouyou/_table/user_route/${user_route_id}?api_key=956eed8e98667eca2722be6afc37e123212466565cab5df2f7e653d206f3e3c0`;
        let data = {
          data: {
            resource: [
              {

              }
            ]
          }
        };

        await axios
          .delete(requestsURL, data)
          .then(function(response) {
            rows.splice(index, 1);
            console.log("删除成功");
          })
          .catch(re => console.log("删除失败"));
      }

      deleteLujing(rows[index].user_route_id);
    },
    //这个是根据传入的点坐标获取路径并绘制路径,用于已保存路线，和特色路线调用
    async getRoute(point_data, map) {
      // make a directions request using cycling profile

      mapboxgl.accessToken =
        "pk.eyJ1IjoicGFuZ3hpYW5nIiwiYSI6ImNrdDlnNjB5NjE1aXEyd3BobDk5bzl6eDcifQ.StO2ou5aRA50kbu17CzXmw"; //我的mapbox gl 的token

      const query = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/${this.traffiMode}/${point_data}?steps=true&geometries=geojson&language=zh-Hans&access_token=${mapboxgl.accessToken}`,

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
          coordinates: route //route是一个数组形如[[1,2],[3,4],[5,6]]
        }
      };
      //console.log(route)

      // if the route already exists on the map, we'll reset it using setData
      //先查询是否已经存在"route"图层，如果已经存在，通过getSource.setData来发送数据；若未存在，直接创建该图层

      if (map.getSource("Point_Source")) {
        map.getSource("Point_Source").setData(geojson);
      }
      // otherwise, we'll make a new request
      else {
        map.addSource("Point_Source", {
          type: "geojson",
          data: geojson
        }),
          map.addLayer({
            id: "route",
            type: "line",
            source: "Point_Source",
            layout: {
              "line-join": "round",
              "line-cap": "round"
            },
            paint: {
              //  "line-color": "#3887be",#000000
              "line-color": "#3887be",
              "line-width": 5,
              "line-opacity": 0.75
            }
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

            const distance = (data.distance / 1000).toFixed(2);
            instructions.innerHTML = `<p><strong>预计时间: ${Math.floor(data.duration / 60 )} min </strong>
            <p><strong>总路程：${distance} km </strong></p>
            </p><strong>游览顺序：${this.routeOrder}</strong>`;
    },
    //上传用户当前要保存的路线
    saveUserRoute(name) {
      this.route_attraction_id_Array = JSON.stringify(
        this.route_attraction_id_Array
      ); //转为数组字符串
      this.route_attraction_name_Array = JSON.stringify(
        this.route_attraction_name_Array
      ); //转为数组字符串
      this.route_zuobiaoArry_Array = JSON.stringify(
        this.route_zuobiaoArry_Array
      );
      this.sendUserRoute(
        name,
        this.route_attraction_id_Array,
        this.route_attraction_name_Array,
        this.point_data,
        this.route_zuobiaoArry_Array
      );
    },
    //调用saveUserRoute(name)函数，将路线名称传给它，并上传
    open() {
      this.$prompt("请输入保存路线的名字", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消"
      })
        .then(({ value }) => {
          this.$message(
            {
              type: "success",
              message: "保存成功: " + value
            },
            this.saveUserRoute(value)
          );
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "取消输入"
          });
        });
    },
    //侧边栏展开时会触发的事件
    handleOpen(key, keyPath) {
      console.log(key, keyPath);

      switch (key) {
        case "1":
          this.cleanMarks();
          this.cleanLayerData("特色"); //这部分是清除掉特色图层的意思
          this.ZoomFlag = 1;
          break;

        case "1-1":
          this.cleanMarks();
          this.ButtonFlag = 1;
          break;

        case "2":
          this.cleanMarks();
          this.cleanLayerData("普通");
          this.cleanLayerData("聚类");
          this.ZoomFlag = 0;
          this.ButtonFlag = 0;
          break;

        case "2-1":
          this.cleanMarks();
          this.cleanLayerData("普通");
          this.sendLayerData("红色");
          //this.sendJuleiData("红色")
          break;
        case "2-2":
          this.cleanMarks();
          this.cleanLayerData("普通");
          this.sendLayerData("民族");
          //this.sendJuleiData("民族")
          break;
      }
    },
    //侧边栏关闭时会触发的事件
    handleClose(key, keyPath) {
      switch (key) {
        case "1":
          this.cleanMarks();
          this.cleanLayerData("普通");
          break;
        case "2":
          this.cleanMarks();
          this.cleanLayerData("特色");
          break;

        case "2-1":
          this.cleanMarks();
          this.cleanLayerData("特色");
          break;
        case "2-2":
          this.cleanMarks();
          this.cleanLayerData("特色");
          break;
      }
    },
    //根据打开的函数，执行不同的命令
    menuSelect(key) {
      console.log(key)
      switch (key) {
        // 自定义路线
        case "1-1-1":
          this.lujignModel = 0;
          this.ButtonFlag_optimiz = 0;
          this.cleanMarks();
          this.startRoute=1;//开始路线模式
          break;
        case "1-1-2":
          this.lujignModel = 1;
          this.ButtonFlag_optimiz = 1;
          this.cleanMarks();
          this.startRoute=1;
          break;

        case "1-2-1": //显示用户已保存路线
          this.tableData = []; //先清空上次残留的表格内容
          this.getUserALLroute();
          this.startRoute=0;
          break;

        case "2-1-1":
          this.displayRedRoute(1);
          this.startRoute=0;
          break;
        case "2-1-2":
          this.displayRedRoute(2);
          this.startRoute=0;
          break;
        case "2-1-3":
          this.displayRedRoute(3);
          this.startRoute=0;
          break;
        case "2-1-4":
          this.displayRedRoute(4);
          this.startRoute=0;
          break;
        case "2-1-5":
          this.displayRedRoute(5);
          this.startRoute=0;
          break;

        case "2-2-1":
          this.displayMinzuRoute(1);
          this.startRoute=0;
          break;
        case "2-2-2":
          this.displayMinzuRoute(2);
          this.startRoute=0;
          break;
        case "2-2-3":
          this.displayMinzuRoute(3);
          this.startRoute=0;
          break;

         case "2-4":
          this.shareTableData = []
          this.getShareUserALLroute()
           this.startRoute=0;
          break;


      }
    },
    //切换红色景点和民族景点的图层
    initialALayer2(layerName) {
      //民族景点图层
      if (layerName == "民族") {
        console.log("创建民族图层");

        if (this.map.getSource("teseLayer")) {
          this.map.getSource("teseLayer").setData(this.get_minzu_Data);
        }
      } else {
        //红色景点图层
        console.log("创建红色图层");

        if (this.map.getSource("teseLayer")) {
          console.log("图层存在");
          this.map.getSource("teseLayer").setData(this.get_hongse_Data);
        } else {
          console.log("图层不存在");
        }
      }
    },
    addCluster(geojson) {
      this.map.on("load", () => {
        // map.add
        this.map.addSource("julei", {
          type: "geojson",
          data: geojson,
          cluster: true,
          clusterMaxZoom: 14, // 聚合最大级别
          clusterRadius: 50 // 聚合半径
        });

        this.map.addLayer({
          id: "clusters",
          type: "circle",
          source: "julei",
          filter: ["has", "point_count"],
          paint: {
            "circle-color": [
              "step",
              ["get", "point_count"],
              "#51bbd6",
              100,
              "#f1f075",
              750,
              "#f28cb1"
            ],
            "circle-radius": [
              "step",
              ["get", "point_count"],
              20,
              100,
              30,
              750,
              40
            ],
            "circle-stroke-color": "#FFFFFF",
            "circle-stroke-width": 5
          }
        });

        this.map.addLayer({
          id: "cluster-count",
          type: "symbol",
          source: "julei",
          filter: ["has", "point_count"],
          layout: {
            "text-field": "{point_count_abbreviated}",
            "text-font": ["Open Sans Bold"],
            "text-size": 12
          }
        });

        this.map.addLayer({
          id: "unclustered-point",
          type: "circle",
          source: "julei",
          filter: ["!", ["has", "point_count"]],
          paint: {
            "circle-color": "#11b4da",
            "circle-radius": 4,
            "circle-stroke-width": 1,
            "circle-stroke-color": "#fff"
          }
        });
      });
    },
    //暂时未使用
    myaddCluster(geojson, map) {
      map.on("load", () => {
        // Add a new source from our GeoJSON data and
        // set the 'cluster' option to true. GL-JS will
        // add the point_count property to your source data.
        map.addSource("julei", {
          type: "geojson",
          // Point to GeoJSON data. This example visualizes all M1.0+ earthquakes
          // from 12/22/15 to 1/21/16 as logged by USGS' Earthquake hazards program.
          data: geojson,
          cluster: true,
          clusterMaxZoom: 14, // Max zoom to cluster points on
          clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
        });

        map.addLayer({
          id: "clusters",
          type: "circle",
          source: "julei",
          filter: ["has", "point_count"],
          paint: {
            // Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
            // with three steps to implement three types of circles:
            //   * Blue, 20px circles when point count is less than 100
            //   * Yellow, 30px circles when point count is between 100 and 750
            //   * Pink, 40px circles when point count is greater than or equal to 750
            "circle-color": [
              "step",
              ["get", "point_count"],
              "#51bbd6",
              100,
              "#f1f075",
              750,
              "#f28cb1"
            ],
            "circle-radius": [
              "step",
              ["get", "point_count"],
              20,
              100,
              30,
              750,
              40
            ]
          }
        });

        map.addLayer({
          id: "cluster-count",
          type: "symbol",
          source: "julei",
          filter: ["has", "point_count"],
          layout: {
            "text-field": "{point_count_abbreviated}",
            "text-font": ["Open Sans Bold"],
            "text-size": 12
          }
        });

        map.addLayer({
          id: "unclustered-point",
          type: "circle",
          source: "julei",
          filter: ["!", ["has", "point_count"]],
          paint: {
            "circle-color": "#11b4da",
            "circle-radius": 4,
            "circle-stroke-width": 1,
            "circle-stroke-color": "#fff"
          }
        });

        // inspect a cluster on click
        map.on("click", "clusters", e => {
          const features = map.queryRenderedFeatures(e.point, {
            layers: ["clusters"]
          });
          const clusterId = features[0].properties.cluster_id;
          map
            .getSource("julei")
            .getClusterExpansionZoom(clusterId, (err, zoom) => {
              if (err) return;

              map.easeTo({
                center: features[0].geometry.coordinates,
                zoom: zoom
              });
            });
        });

        // When a click event occurs on a feature in
        // the unclustered-point layer, open a popup at
        // the location of the feature, with
        // description HTML from its properties.
        map.on("click", "unclustered-point", e => {
          const coordinates = e.features[0].geometry.coordinates.slice();
          const mag = e.features[0].properties.mag;
          const tsunami = e.features[0].properties.tsunami === 1 ? "yes" : "no";

          // Ensure that if the map is zoomed out such that
          // multiple copies of the feature are visible, the
          // popup appears over the copy being pointed to.
          while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
          }

          new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(`magnitude: ${mag}<br>Was there a tsunami?: ${tsunami}`)
            .addTo(map);
        });

        map.on("mouseenter", "clusters", () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", "clusters", () => {
          map.getCanvas().style.cursor = "";
        });
      });
    },
    //获得当前的ZOOM级数，zoomNum当前组件全局变量
    getNowZoom() {
      /*
              //当鼠标滚动时，触发事件，获取当前地图缩放级别
            this.map.on("wheel", function () {
                console.log("A wheel event occurred.");
                var range = this.map.getZoom();
                console.log(range);
            });
*/
      //当鼠标滚动时，触发事件，获取当前地图缩放级别
      this.map.on("wheel", () => {
        //console.log('A wheel event occurred.');
        this.zoomNum = this.map.getZoom(); //获取当前地图缩放级别
        //console.log(this.zoomNum);

        if (this.zoomNum > 8 && this.ZoomFlag == 1) {
          this.map.getSource("attractionlayer").setData(attractiondata);
          this.map.getSource("julei").setData(this.emptyGeojson);
        } else if (this.zoomNum < 8 && this.ZoomFlag == 1) {
          this.map.getSource("attractionlayer").setData(this.emptyGeojson);
          this.map.getSource("julei").setData(attractiondata);
        }
      });
    },
    //这个是为了切换attrationLayer,minzuLayer,hongseLayer的显示
    cleanLayerData(name) {
      //普通，特色，聚类
      if (name == "普通") {
        if (this.map.getSource("attractionlayer")) {
          this.map.getSource("attractionlayer").setData(this.emptyGeojson);
        }
      } else if (name == "特色") {
        if (this.map.getSource("teseLayer")) {
          this.map.getSource("teseLayer").setData(this.emptyGeojson);
        }
      } else if (name == "聚类") {
        if (this.map.getSource("julei")) {
          this.map.getSource("julei").setData(this.emptyGeojson);
        }
      }
    },
    sendLayerData(name) {
      //普通，红色，民族
      if (name == "普通") {
        if (this.map.getSource("attractionlayer")) {
          this.map.getSource("attractionlayer").setData(attractiondata);
        }
      } else if (name == "红色") {
        if (this.map.getSource("teseLayer")) {
          this.map.getSource("teseLayer").setData(this.get_hongse_Data);
        }
      } else if (name == "民族") {
        if (this.map.getSource("teseLayer")) {
          this.map.getSource("teseLayer").setData(this.get_minzu_Data);
        }
      }
    },
    //控制聚类juleiLayer图层的显示
    sendJuleiData(name) {
      //普通，红色，民族
      if (name == "普通") {
        if (this.map.getSource("julei")) {
          this.map.getSource("julei").setData(attractiondata);
        }
      } else if (name == "红色") {
        if (this.map.getSource("julei")) {
          this.map.getSource("julei").setData(this.get_hongse_Data);
        }
      } else if (name == "民族") {
        if (this.map.getSource("julei")) {
          this.map.getSource("julei").setData(this.get_minzu_Data);
        }
      }
    },
    //转换minzu 和 hongse 数据为GeoJSON
    transData() {
      this.get_minzu_Data = GeoJSON.parse(minzuData.RECORDS, {
        Point: ["attraction_lon", "attraction_lat"]
      }); //将民族景点json转为GeoJSON

      this.get_hongse_Data = GeoJSON.parse(hongseData.RECORDS, {
        Point: ["attraction_lon", "attraction_lat"]
      }); //将红色景点json转为GeoJSON
    },
    //将路线name数组传入，可以取得其带箭头的路线
    getRouteOrder(array) {
      this.routeOrder = "";

      for (let j = 0; j < array.length; j++) {
        if (j == 0) {
          this.routeOrder = array[j];
        } else {
          this.routeOrder = this.routeOrder + "→" + array[j];
        }
      }
      console.log(this.routeOrder);
    },
    //飞行轨迹的显示(暂时未使用)
    guiji(map) {
      // San Francisco
      var origin = [114.90632090728, 30.385724775749];

      // Washington DC
      var destination = [112.644097, 31.215108];

      // A simple line from origin to destination.
      var route = {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: [origin, destination]
            }
          }
        ]
      };

      // A single point that animates along the route.
      // Coordinates are initially set to origin.
      var point = {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {},
            geometry: {
              type: "Point",
              coordinates: origin
            }
          }
        ]
      };

      // Calculate the distance in kilometers between route start/end point.
      var lineDistance = turf.lineDistance(route.features[0], "kilometers");

      var arc = [];

      // Number of steps to use in the arc and animation, more steps means
      // a smoother arc and animation, but too many steps will result in a
      // low frame rate
      var steps = 500;

      // Draw an arc between the `origin` & `destination` of the two points
      for (var i = 0; i < lineDistance; i += lineDistance / steps) {
        var segment = turf.along(route.features[0], i, "kilometers");
        arc.push(segment.geometry.coordinates);
      }

      // Update the route with calculated arc coordinates
      route.features[0].geometry.coordinates = arc;

      // Used to increment the value of the point measurement against the route.
      var counter = 0;

      map.on("load", function() {
        console.log("轨迹成功");
        // Add a source and layer displaying a point which will be animated in a circle.
        map.addSource("route", {
          type: "geojson",
          data: route
        });

        map.addSource("point", {
          type: "geojson",
          data: point
        });

        map.addLayer({
          id: "route",
          source: "route",
          type: "line",
          paint: {
            "line-width": 2,
            "line-color": "#007cbf"
          }
        });

        map.addLayer({
          id: "point",
          source: "point",
          type: "symbol",
          layout: {
            //布局
            "icon-image": "airport-15",
            // "icon-image": "jingdian",
            "icon-rotate": ["get", "bearing"],
            "icon-rotation-alignment": "map",
            "icon-allow-overlap": true,
            "icon-ignore-placement": true
          }
        });

        function animate() {
          // Update point geometry to a new position based on counter denoting
          // the index to access the arc.
          point.features[0].geometry.coordinates =
            route.features[0].geometry.coordinates[counter];

          // Calculate the bearing to ensure the icon is rotated to match the route arc
          // The bearing is calculate between the current point and the next point, except
          // at the end of the arc use the previous point and the current point
          point.features[0].properties.bearing = turf.bearing(
            turf.point(
              route.features[0].geometry.coordinates[
                counter >= steps ? counter - 1 : counter
              ]
            ),
            turf.point(
              route.features[0].geometry.coordinates[
                counter >= steps ? counter : counter + 1
              ]
            )
          );

          // Update the source with this new data.
          map.getSource("point").setData(point);

          // Request the next frame of animation so long the end has not been reached.
          if (counter < steps) {
            requestAnimationFrame(animate);
          }

          counter = counter + 1;
        }
        /***
                document.getElementById('replay').addEventListener('click', function() {
                    // Set the coordinates of the original point back to origin
                    point.features[0].geometry.coordinates = origin;


                    // Update the source layer
                    map.getSource('point').setData(point);

                    // Reset the counter
                    counter = 0;

                    // Restart the animation.
                    animate(counter);
                });
*/
        // Start the animation.
        animate(counter);
      });
    },
    //飞行轨迹的显示(使用)
    guiji2(origin, destination, map) {//起点坐标，终点坐标，地图
      // A simple line from origin to destination.
      var route = {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: [origin, destination]
            }
          }
        ]
      };

      // A single point that animates along the route.
      // Coordinates are initially set to origin.
      var point = {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {},
            geometry: {
              type: "Point",
              coordinates: origin
            }
          }
        ]
      };

      //生成随机数的函数
      function randomNum(minNum, maxNum) {
        switch (arguments.length) {
          case 1:
            return parseInt(Math.random() * minNum + 1, 10);
            break;
          case 2:
            return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10);
            break;
          default:
            return 0;
            break;
        }
      }

      // Calculate the distance in kilometers between route start/end point.
      var lineDistance = turf.lineDistance(route.features[0], "kilometers");

      var arc = [];

      // Number of steps to use in the arc and animation, more steps means
      // a smoother arc and animation, but too many steps will result in a
      // low frame rate
      var steps = 500; //总步长，步长越大飞行速度越慢，越小飞行速度越快

      // Draw an arc between the `origin` & `destination` of the two points
      for (var i = 0; i < lineDistance; i += lineDistance / steps) {
        var segment = turf.along(route.features[0], i, "kilometers");
        arc.push(segment.geometry.coordinates);
      }

      // Update the route with calculated arc coordinates
      route.features[0].geometry.coordinates = arc;

      // Used to increment the value of the point measurement against the route.
      var counter = 0;

      let num = randomNum(0, 100000); //生成source的随机名字
      let sourceRouteName = "route" + num;
      let sourcePointName = "point" + num;

      map.on("load", function() {
        console.log("轨迹成功");
        // Add a source and layer displaying a point which will be animated in a circle.
        map.addSource(sourceRouteName, {
          type: "geojson",
          data: route
        });

        map.addSource(sourcePointName, {
          type: "geojson",
          data: point
        });

        map.addLayer({
          id: sourceRouteName,
          source: sourceRouteName,
          type: "line",
          paint: {
            "line-width": 2,
            "line-color": "#007cbf"
          }
        });

        map.addLayer({
          id: sourcePointName,
          source: sourcePointName,
          type: "symbol",
          layout: {
            //布局
            "icon-image": "airport-15",
            // "icon-image": "jingdian",
            "icon-rotate": ["get", "bearing"],
            "icon-rotation-alignment": "map",
            "icon-allow-overlap": true,
            "icon-ignore-placement": true
          }
        });

        function animate() {
          // Update point geometry to a new position based on counter denoting
          // the index to access the arc.
          point.features[0].geometry.coordinates =
            route.features[0].geometry.coordinates[counter];

          // Calculate the bearing to ensure the icon is rotated to match the route arc
          // The bearing is calculate between the current point and the next point, except
          // at the end of the arc use the previous point and the current point
          point.features[0].properties.bearing = turf.bearing(
            turf.point(
              route.features[0].geometry.coordinates[
                counter >= steps ? counter - 1 : counter
              ]
            ),
            turf.point(
              route.features[0].geometry.coordinates[
                counter >= steps ? counter : counter + 1
              ]
            )
          );

          // Update the source with this new data.
          map.getSource(sourcePointName).setData(point);

          // Request the next frame of animation so long the end has not been reached.
          if (counter < steps) {
            requestAnimationFrame(animate);
          }

          counter = counter + 1;
        }

        function replay() {
          // Set the coordinates of the original point back to origin
          point.features[0].geometry.coordinates = origin;

          // Update the source layer
          map.getSource(sourcePointName).setData(point);

          // Reset the counter
          counter = 0;

          // Restart the animation.
          animate(counter);
        }

        // Start the animation.
        animate(counter);
        setTimeout(setInterval(replay, 10000), 10000); //先等待第一次animate执行完毕再循环执行animate
      });
    },

    //下拉菜单控制交通方式
    handleCommand(command) {
      switch (command) {
        case "a":
          this.$message('交通方式选择为' + "驾驶");
          this.traffiMode = "driving"

          if(this.point_data!= ""){
            this.getRoute(this.point_data,this.map)
          }else{console.log("尚未选择景点")}

          break;

        case "b":
          this.$message('交通方式选择为' + "骑行");
          this.traffiMode = "cycling"
          if(this.point_data!= ""){
            this.getRoute(this.point_data,this.map)
          }else{console.log("尚未选择景点")}
          break;

        case "c":
          this.$message('交通方式选择为' + "步行");
          this.traffiMode = "walking"
          if(this.point_data!= ""){
            this.getRoute(this.point_data,this.map)
          }else{console.log("尚未选择景点")}
          break;

        case "d":
          this.$message('交通方式选择为' + "公交");
          if(this.point_data!= ""){
            this.getBaiduRoute() ;
          }else{console.log("尚未选择景点")}

          break;
      }
    },

    //百度API的公交路径规划，只能实现两点间的导航
    getBaiduRoute(){
      let that = this;
      this.getInputBaiduArray(this.point_data);//获取起始点
      // console.log(that.baiduInputArray[0][1],that.baiduInputArray[0][0])
      // console.log(that.baiduInputArray[that.baiduInputArray.length-1][1],that.baiduInputArray[that.baiduInputArray.length-1][0])

		$.ajax({//输入的坐标30,114
		// url: `https://api.map.baidu.com/directionlite/v1/transit?origin=${that.baiduInputArray[0][1]},${that.baiduInputArray[0][0]}&destination=${that.baiduInputArray[that.baiduInputArray.length-1][1]},${that.baiduInputArray[that.baiduInputArray.length-1][0]}&coord_type=wgs84&ak=4O9Syn1TmTLpFtEfpabuCcioOptWlW2V`,
    url: `https://api.map.baidu.com/directionlite/v1/transit?origin=${that.baiduInputArray[0][1]},${that.baiduInputArray[0][0]}&destination=${that.baiduInputArray[1][1]},${that.baiduInputArray[1][0]}&coord_type=wgs84&ak=4O9Syn1TmTLpFtEfpabuCcioOptWlW2V`,
    type: 'GET',
		async:false,//设置同步。ajax默认异步
		dataType: 'jsonp',
		jsonp:'callback',//传递给请求处理程序或页面的，用以获得jsonp回调函数名的参数名(默认为:callback)
		jsonpCallback:"callback",//自定义的jsonp回调函数名称，默认为jQuery自动生成的随机函数名
		timeout: 5000,
		contentType: 'application/json; charset=utf-8',
		success:  function (response){
				console.log(response) //返回的坐标：114,30

           if(response.status==0){  //请求状态成功

                    console.log(response.result.routes[0].steps.length)
                    let steps = response.result.routes[0].steps
                    let path ="" //坐标信息

                    for(let j =0;j<steps.length;j++){
                        console.log(steps[j][0].instruction) //路线提示信息

                        if(j==0){
                            path = steps[j][0].path
                        }else{
                          path = path + ";" +steps[j][0].path
                        }

                    }
                    that.transBDtoWGS84(that.getBaiduPath(path));


                //这部分是设置导航栏的详细信息

                const instructions = document.getElementById("instructions");

                let tripInstructions = ""; //导航的步骤
                let duration = Math.floor( response.result.routes[0].duration / 60)
                let price = response.result.routes[0].price
                let distance = response.result.routes[0].distance /1000

                for (let j =0;j<steps.length;j++) {
                  tripInstructions += `<li>${steps[j][0].instruction}</li>`;
                }
                instructions.innerHTML = `<p><strong>预计时间: ${duration} min </strong>
                <p><strong>总路程：${distance} km </strong></p>
                <p><strong>总票价： ${price} rmb </strong></p>
                </p><ol>${tripInstructions}</ol>`;


           }else{
                //这部分是设置导航栏的详细信息

                const instructions = document.getElementById("instructions");
                instructions.innerHTML = `<p><strong>抱歉！无法找到合适的公交方案！ </strong></p>`;


           }






			}
		})

    },

    //将输入的point_data字符串转换为可以作为百度API的输入,这个会改变全局baiduInputArray
    //输入point_data:"1,2;3,4;5;6",返回为[[1,2],[3,4],[5,6]]数组
    getInputBaiduArray(point_data){//我也不知道这写的是什么垃圾
        console.log(point_data)
        let baiduInputArray1 = new Array();//定义一个新数组
        let baiduInputArray2 = new Array();//定义一个新数组
        let baiduInputArray3 = new Array();//定义一个新数组

        baiduInputArray1 = point_data.split(";")

        for(let j =0;j<baiduInputArray1.length;j++){
              baiduInputArray2[j]= baiduInputArray1[j].split(",")
              baiduInputArray3[j]=[parseFloat(baiduInputArray2[j][0]),parseFloat(baiduInputArray2[j][1])]

        }


      this.baiduInputArray =  baiduInputArray3
      return baiduInputArray3
    },

    //将输入的str字符串转换为可以route数组，便于后面的画路径线
    //输入str:"1,2;3,4;5;6",返回为[[1,2],[3,4],[5,6]]数组
    getBaiduPath(str){//我也不知道这写的是什么垃圾

        let baiduInputArray1 = new Array();//定义一个新数组
        let baiduInputArray2 = new Array();//定义一个新数组
        let baiduInputArray3 = new Array();//定义一个新数组

        baiduInputArray1 = str.split(";")

        for(let j =0;j<baiduInputArray1.length;j++){

              baiduInputArray2[j]= baiduInputArray1[j].split(",")
              baiduInputArray3[j]=[parseFloat(baiduInputArray2[j][0]),parseFloat(baiduInputArray2[j][1])]

        }
      return baiduInputArray3
    },


    // 百度坐标转WGS84
    transBDtoWGS84(arr){
      let bd09togcj02 = []
      let gcj02towgs84 = []


    for(let k = 0;k<arr.length;k++){
     bd09togcj02.push(coordtransform.bd09togcj02(arr[k][0],arr[k][1]));
     gcj02towgs84.push(coordtransform.gcj02towgs84(bd09togcj02[k][0],bd09togcj02[k][1]));
    }

     this.drawRoute(gcj02towgs84,this.map)

    return gcj02towgs84
    },

    //传入route数组，画路径线路
    drawRoute(routeArr,map){


      let route = routeArr
      const geojson = {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: route //route是一个数组形如[[1,2],[3,4],[5,6]]
        }
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
          data: geojson
        }),
          map.addLayer({
            id: "route",
            type: "line",
            source: "Point_Source",
            layout: {
              "line-join": "round",
              "line-cap": "round"
            },
            paint: {
              //  "line-color": "#3887be",#000000
              "line-color": "#3887be",
              "line-width": 5,
              "line-opacity": 0.75
            }
          });
      }





    },
    //获取用户分享路线
    getShareUserALLroute() {
    let that = this;
    async function getRouteInfo() {

      let requestsURL = `http://121.5.235.15/api/v2/zhouyou/_table/user_route?filter=user_route_shareFlag=1`;
      // https://newhappy.xyz/api/v2/zhouyou/_table/user_route?filter=user_route_shareFlag%20=%201
      let response = await axios.get(requestsURL, {
        params: {
          api_key:
            "956eed8e98667eca2722be6afc37e123212466565cab5df2f7e653d206f3e3c0"
        }
      });
      console.log(response);
      if (response.data !== undefined) {
        let m = response.data.resource;
        console.log(m[0].user_route_zuobiao);
        for (let j = 0; j < m.length; j++) {
          let tableData_info = {
            user_route_name: m[j].user_route_name,
            userName: m[j].user_name,
            route_attraction_name: m[j].user_route_attraction_name,
            route_creat_time:m[j].user_route_date,
            route_shareFlag:m[j].user_route_shareFlag,
            user_route_id :m[j].user_route_id

          };

          that.shareTableData.push(tableData_info);




        }
      }

    }

      getRouteInfo();
    },


    //增加一个用户分享自定义路线的功能
    shareUserRoute(index, rows,val){
      // console.log(rows[index].user_route_name)
      // console.log( typeof rows[index].user_route_name)

      if(val.target.innerText == "分享"){

        val.target.innerText = "取消分享";

        this.changeShareFlag(rows[index].user_route_id,1)

        }
      else if(val.target.innerText == "取消分享"){

        val.target.innerText = "分享";

        this.changeShareFlag(rows[index].user_route_id,0)



        }


    },
    // 修改服务器数据，传入需要修改的路线id，修改其状态 ：未收藏0  已收藏1
    async changeShareFlag(user_route_id,user_route_shareFlag){//路线名 ， 收藏状态
// https://newhappy.xyz/api/v2/zhouyou/_table/user_route/28
// let requestsURL = `http://121.5.235.15/api/v2/zhouyou/_table/user_route/${encodeURI(user_route_name)}?id_field=user_route_name&api_key=956eed8e98667eca2722be6afc37e123212466565cab5df2f7e653d206f3e3c0`;
 let requestsURL = `http://121.5.235.15/api/v2/zhouyou/_table/user_route/${user_route_id}?api_key=956eed8e98667eca2722be6afc37e123212466565cab5df2f7e653d206f3e3c0`;
      let data = {
            user_route_shareFlag:`${user_route_shareFlag}`
      };

      await axios
        .put(requestsURL, data)
        .then(function(response) {
          console.log("修改成功");
        })
        .catch(re => console.log("修改失败"));


    },


    testButton(){
      console.log(this.shareTableData)
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
}

#loading{
  position: absolute;
  left: 50%;
  transform: scale(2);
  top: 10%;
  display: none;
}

#right{
  position: absolute;
  margin: 20px;
  width: 15%;
  right: 0px;
  top: 13%;
  bottom: 26%;
}
#instructions {
  height: 100%;
  background-color: rgba(222, 235, 247, 0.3);
  backdrop-filter: blur(7px);
  box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
  overflow-y: scroll;
  font-family: sans-serif;
  opacity: 0.7;
  animation: textChange 2s ;
}
#routeDisplay {
    display: block;
    position: absolute;
    top: 10%;
    left: 77%;
}
/deep/ .el-table__fixed-right-patch {
  position: absolute;
  top: -1px;
  right: 0;
  background-color: transparent;
}
button.el-button.el-button--text.el-button--small{
  background: transparent;
  color: black;

}
#routeCenter{
  display: block;
  position: absolute;
  top: 18%;
  left: 31%;
}

/deep/ .el-table__body-wrapper::-webkit-scrollbar {
  /*width: 0;宽度为0隐藏*/
  width: 0px;
}
.el-table__body-wrapper::-webkit-scrollbar-thumb {
  border-radius: 2px;
  height: 50px;
  background: #eee;
}
.el-table__body-wrapper::-webkit-scrollbar-track {
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  border-radius: 2px;
  background: rgba(0, 0, 0, 0.4);
}
*::-webkit-scrollbar {

  display: none; /* Chrome Safari */

}
/*el-button修改*/
.el-button--primary {
  color: #000;
  background-color: rgba(222, 235, 247, 0.3);
  border-color: transparent;
  box-shadow: rgb(100 100 111 / 20%) 0px 7px 29px 0px;
}
.el-button {
  display: inline-block;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  background: rgba(29, 29, 31, 0.72);
  border: 1px solid black;
  color: #f5f5f7;
  -webkit-appearance: none;
  text-align: center;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  outline: 0;
  margin: 0;
  -webkit-transition: .1s;
  transition: .1s;
  font-weight: 500;
  padding: 12px 20px;
  font-size: 14px;
  border-radius: 4px;
}
.el-dropdown-menu {
  position: absolute;
  top: 0;
  left: 0;
  padding: 10px 0;
  margin: 5px 0;
  background-color: transparent;
  border: 1px solid #EBEEF5;
  backdrop-filter: blur(4px);
  border-radius: 4px;
  -webkit-box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
  box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
}
.el-popper .popper__arrow {
  border-width: 6px;
  display: none;
  -webkit-filter: drop-shadow(0 2px 12px rgba(0, 0, 0, .03));
  filter: drop-shadow(0 2px 12px rgba(0, 0, 0, .03));
}



#button {
  position: absolute;
  margin: 40px;
  left: 400px;
  top: 70px;
}
/* 下拉菜单 */


  .el-dropdown-link {
    cursor: pointer;
    color: #409EFF;
  }
  .el-icon-arrow-down {
    font-size: 12px;
  }

#search {
  position: absolute;
  margin: 0px;
  left: 250px;
  top: 60px;
}

/* my Style */
#secMenu{
  position: absolute;
  width: 100%;
  top: 0;
  left: 0;
  right:0;
  z-index: 2;
}
.secFlex{
  display: flex;
  /*height: 60px;*/
  width: 100%;
  height: 40px;
  /*background-color: transparent;*/
  background-color: rgba(29,29,31,0.72);
  box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
  backdrop-filter: blur(5px);
}
.text{
  /*text-align: center;*/
  cursor:default;
  height: fit-content;
  padding: 6px;
  width: 100%;
  color: #f5f5f7;
}
.specialPanel{
  margin-left: 122px;
  height: fit-content;
  width: 130px;
  text-align: center;
}
.customePanel{
  margin-left: 30px;
  height: fit-content;
  width: 130px;
  text-align: center;
}
.routePanel{
  margin-left: 30px;
  height: fit-content;
  width: 130px;
  text-align: center;
}
.specialPanel:hover .specialHidden{
  display: block;
  height: fit-content;
  cursor: pointer;
  color: #f5f5f7;
  /*background-color: transparent;*/
  background-color: rgba(29,29,31,0.72);
  box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
  border-radius: 12px;
  backdrop-filter: blur(5px);
}
.customePanel:hover .customeHidden{
  display: block;
  height: fit-content;
  cursor: pointer;
  /*background-color: transparent;*/
  color: #f5f5f7;
  background-color: rgba(29,29,31,0.72);
  box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
  border-radius: 12px;
  backdrop-filter: blur(5px);
}
.routePanel:hover .routeHidden{
  display: block;
  height: fit-content;
  cursor: pointer;
  /*background-color: transparent;*/
  color: #f5f5f7;
  background-color: rgba(29,29,31,0.72);
  box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
  border-radius: 12px;
  backdrop-filter: blur(5px);
}
.specialPanel:hover .specialText{
  background-color: transparent;
  color: #f5f5f7;
  -webkit-backdrop-filter: blur(5px);
  /* backdrop-filter: blur(5px); */
  cursor: pointer;
/* border-radius: 10px;*/

}
.customePanel:hover .customeText{
  background-color: transparent;
  color: #f5f5f7;
  -webkit-backdrop-filter: blur(5px);
  /* backdrop-filter: blur(5px); */
  cursor: pointer;
  /* border-radius: 10px;*/
}
.routePanel:hover .routeText{
  background-color: transparent;
  color: #f5f5f7;
  -webkit-backdrop-filter: blur(5px);
  /* backdrop-filter: blur(5px); */
  cursor: pointer;
  /* border-radius: 10px;*/
}
.choice:hover{
background-clip: border-box;
  background-color: transparent;
/*background-color: rgba(29,29,31,0.72);*/
backdrop-filter: blur(2px);
border-radius: 12px;
color: #f5f5f7;
}
.choice{
position: relative;
padding: 6px 3px;
margin-top: 6px;
margin-left: 3px;
font-size: inherit;
text-align: center;

}
.specialHidden{
display: none;
}
.customeHidden{
display: none;
}
.routeHidden{
display: none;
}
.HongseRouteFlex{
display: flex;
}
.MinzuRouteFlex{
display: flex;
}
.routeItem{
backdrop-filter: blur(3px);
background-color: rgba(29, 29, 31, 0.7);
box-shadow: rgb(100 100 111 / 20%) 0px 7px 29px 0px;
border-radius: 12px;
color: #f5f5f7;
margin: 5px 5px;
padding: 6px;
cursor: pointer;
}
div#dropdown {
  position: absolute;
  top: 43px;
  right: 15px;
}
div#customeRoute{
  position: absolute;
  top: 43px;
  right: 135px;
}
/*动画*/
@keyframes textChange {
  from{
    width: 0px;
    background-color: rgba(222, 235, 247, 1);
    backdrop-filter: blur(0px);
  }
  to{
    width: 100%;
    background-color: rgba(222, 235, 247, 0.3);
    backdrop-filter: blur(7px);
  }
}
/deep/ .el-table,

.el-table__expanded-cell {
  background-color: rgba(222, 235, 247, 0.3);
  backdrop-filter: blur(7px);
  box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
  overflow: hidden;


}

/deep/.el-table th {
  background-color: transparent !important;

}

/deep/.el-table tr {
  background-color: transparent !important;

}
/deep/ tr.el-table_row.hover-row{
  background-color: transparent;
}
</style>
