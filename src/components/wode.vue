<template>
  <div>
<div class="oimiGod">
  <div class="flex">
            <div class="leftbox">
            <!-- 用户信息展示区 -->
            <div class="userbox">
            <div :style="userInfoCom" class="userInfo">
                    <p class="username">{{userInfo.user.userName}}</p>
                    <p class="intro">当前您收藏景点共有<span class="numDisplay">{{userInfo.favorite.length}}</span>个</p>
                    <p class="intro">收藏轨迹有<span class="numDisplay">{{userInfo.trace.length}}</span>个</p>
            </div>
            </div>

            <!-- 收藏区 -->
            <div class="favorbox">
            <div class="favoritemaps">
            <p>&nbsp;&nbsp;&nbsp;&nbsp;我的收藏</p>
                <div class="buttons">
                    <span v-for="favor in userInfo.favorite" :key="favor.name">
                        <button class="button"   @click="pantoToThis(favor.lngLat,'favor');getAttractionData(favor.lngLat,favor.name)">{{favor.name}}</button>
                    </span>
                    <el-button @click="routeOptimize()" type="primary">获取路径规划</el-button>
                    <el-button @click="cleanMarks()" type="primary">清除路径规划</el-button>
                    
                </div>
               
            <div id="favoritemap">
              <div id="instructions"></div>

            </div>
              
            
              <span>&nbsp;&nbsp;</span>

            </div>
            </div>
            </div>

            <!-- 轨迹区 -->
            <div class="tracebox">
            <div class="tracemaps">
            <p>&nbsp;&nbsp;&nbsp;&nbsp;我的轨迹</p>
            <span class="hideOver">{{traceDetail}}</span>
                <div class="buttons">
                    <span v-for="trace in userInfo.trace" :key="trace.name">
                        <!-- <button round class="button" v-bind:style="trace.colorStyle" @click="pantoToThis(trace.trace[0],'trace')">{{trace.name}}</button> -->
                        <button round class="button" @click="pantoToThis(trace.trace[0],'trace')">{{trace.name}}</button>
                    </span>
                    <br>
                  <el-button type="text"  @click="traceDetailfunc" >{{traceDetail.desc}}</el-button>
                  <p v-if="traceDetail.traceActive" class="traceDetailStyle">{{traceDetail.traceDetail}}</p>
                </div>

            <div id="tracemap"></div>
            <span>&nbsp;&nbsp;</span>
            </div>
            </div>
</div>
</div>
  </div>
</template>

<script>
import mapboxgl from "@mapgis/mapbox-gl"
import geojson from "geojson"
import axios from "axios"
import randomColor from "randomcolor"
import walkman from "../assets/icon/arrow-right32px.png"
import mapMarker from "../assets/icon/map-marker.png"

export default {
name:"wode",
components:{
},
mounted(){
    this.userID=this.$store.state.user_id
    console.log(this.userID)
    this.initialMap("tracemap")
    this.initialMap("favoritemap")
    this.initialUserInfo()
},
data(){
    return {
        favormap:undefined,
        tracemap:undefined,
        traceDetail:{
          desc:"轨迹详情",
          traceDetail:"",
          traceActive:false
        },
        userInfo:{
            user:{
              userName:"Joshua"
            },
            favorite:[
                {
                    name:"武汉大学",
                    lngLat:[114.405906,30.534768]
                }
            ],
            trace:[
                {
                    name:"trace1",
                    trace:[140,30]
                }
            ]
        },
        backPic:null,
        //下面是PX新增的
        pointArray:[],//路径规划的数组
        routeOrder:"",//路径规划后的路径顺序
        start:{},//路径规划的起点
        end:{},//路径规划的终点
        clikTimes:0,//点击次数
        favoriteMarks:[],//将Mark存入数组便于清除
    }
},

methods:{
    async initialMap(containerID){
        let mapInfo={
            container:containerID,
            style:"mapbox://styles/joshuamwong/ckte9azm523g217juhpczqo5q",
            center:[114.405906,30.534768],
            zoom:12,
            attributionControl: false
        }
        mapboxgl.accessToken ="pk.eyJ1Ijoiam9zaHVhbXdvbmciLCJhIjoiY2tzaXRlOXcyMHVhNzJ2bnN4aG11NW10aiJ9.RdgXiHX8GNMNWTr2X92ruQ"

        if(containerID==="tracemap"){
            mapInfo.container=containerID
            this.tracemap = new mapboxgl.Map(mapInfo)
        }else if(containerID==="favoritemap"){
            mapInfo.container="favoritemap"
            this.favormap=new mapboxgl.Map(mapInfo)
            this.favormap.loadImage(mapMarker,(error,image)=>{
              if(error){console.log("load images failed")}
              this.favormap.addImage("marker",image)
          })
        }

    },
    //To Do
    async renderMap(geojson){
        this.map.addSource("geosource",{
            type:geojson,
            data:geojson
        })
    },
    async pantoToThis(lngLat,type){
      console.log(lngLat)
        if(type==="favor"){
            this.favormap.flyTo({
                center:lngLat,
                zoom:14
            })
        }else if(type==="trace"){
            this.tracemap.flyTo({
                center:lngLat,
                zoom:8
            })
          let result = this.userInfo.trace.filter(theTrace=>theTrace.trace[0]===lngLat)
          if(result.length>0){
            this.traceDetail.traceDetail=result[0].attr_names.join("==>")
          }
        }

    },
    async initialUserInfo(){
        //杂项
        //杂项-用户名
        let ress = await axios.get(`http://121.5.235.15/api/v2/zhouyou/_table/users?fields=*&filter=user_id=${this.userID}`,{
          params: {
            api_key: '956eed8e98667eca2722be6afc37e123212466565cab5df2f7e653d206f3e3c0'
          }
        })
        this.userInfo.user={
          userName:ress.data.resource[0].user_name,
          userPhone:ress.data.resource[0].user_phone,
          userEmail:ress.data.resource[0].user_email
        }
        // this.backPic="https://api.mapbox.com/styles/v1/joshuamwong/cku82uhhz09k018pdij5r2ml5/static/geojson({\"type\":\"FeatureCollection\",\"features\":[{\"type\":\"Feature\",\"geometry\":{\"type\":\"Point\",\"coordinates\":[114.3718,30.5702]},\"properties\":{\"attraction_id\":151,\"attraction_name\":\"湖北美术馆\"}},{\"type\":\"Feature\",\"geometry\":{\"type\":\"Point\",\"coordinates\":[114.4132,30.5467]},\"properties\":{\"attraction_id\":191,\"attraction_name\":\"东湖梅园\"}},{\"type\":\"Feature\",\"geometry\":{\"type\":\"Point\",\"coordinates\":[114.3543,30.558]},\"properties\":{\"attraction_id\":239,\"attraction_name\":\"汉秀剧场\"}},{\"type\":\"Feature\",\"geometry\":{\"type\":\"Point\",\"coordinates\":[114.429948,30.550553]},\"properties\":{\"attraction_id\":243,\"attraction_name\":\"武汉植物园\"}}]})/auto/445x204?access_token=pk.eyJ1Ijoiam9zaHVhbXdvbmciLCJhIjoiY2tzaXRlOXcyMHVhNzJ2bnN4aG11NW10aiJ9.RdgXiHX8GNMNWTr2X92ruQ"

        //收藏景点-请求数据
        let resfavor = await axios.get(`http://121.5.235.15/api/v2/zhouyou/_table/attraction_favorites?fields=*&filter=user_id=${this.userID}`,{
          params: {
            api_key: '956eed8e98667eca2722be6afc37e123212466565cab5df2f7e653d206f3e3c0'
          }
        })
        let attraction_id=resfavor.data.resource.map(x=>x.attraction_id)
        console.log(attraction_id)
        // let attraction_id=[1,2,3,4,5,6,7,8,9]

        //轨迹-请求数据
          //存储整个轨迹的数据
        let traceList=[]
      //游博轨迹
        let traceyb= await axios.get(`http://121.5.235.15/api/v2/zhouyou/_table/yb?fields=attraction_id&filter=user_id=${this.userID}`,{
          params: {
            api_key: '956eed8e98667eca2722be6afc37e123212466565cab5df2f7e653d206f3e3c0'
          }
        })

        let ybTraceID = await traceyb.data.resource.map(x=>x.attraction_id)
        let ybTrace ={trace:ybTraceID,name: "游博轨迹"}
        traceList.push(ybTrace)

        // let traceList = [
        //     {trace:[63,79,86,78,95,58],name:"trace1"},
        //     {trace:[1,2,3,4,5,6,7],name:"trace2"},
        //     {trace:[382,455,298,292,343,481],name:"trace3"}
        // ]

        //汇总两者的数据,减小请求次数
        let theID = attraction_id
        for (let index = 0;index < traceList.length;index++){
            theID=theID.concat(traceList[index].trace)
        }
        //去重重复ID
        theID = Array.from(new Set(theID))

        let filter = theID.map((x)=>{
            return `(attraction_id = ${x})`
        })
        //获得数据
        let filterURL=encodeURIComponent(filter.join(" OR "))
        let requestsURL= `http://121.5.235.15/api/v2/zhouyou/_table/Attractions?fields=attraction_name,attraction_id,attraction_lat,attraction_lon&filter=${filterURL}`

        let res = await axios.get(requestsURL,{
            params:{
                api_key: '956eed8e98667eca2722be6afc37e123212466565cab5df2f7e653d206f3e3c0'
            }
        })
        let data = await res.data.resource
        if(data !== undefined){
            //数据分流-收藏景点
            let favordata = data.filter((x)=>{
              if(attraction_id.indexOf(x.attraction_id) > -1){
                    return true
                }
            })
            for (let indexx =0 ;indexx<favordata.length;indexx++){
              favordata[indexx].attraction_lon=parseFloat(favordata[indexx].attraction_lon).toFixed(4)
              favordata[indexx].attraction_lat=parseFloat(favordata[indexx].attraction_lat).toFixed(4)
            }
            //生成按钮-收藏景点
            this.userInfo.favorite=favordata.map((x)=>{
                return {
                    name:x.attraction_name,
                    id:x.attraction_id,
                    lngLat:[parseFloat(x.attraction_lat).toFixed(4),parseFloat(x.attraction_lon).toFixed(4)]
                }
            })
            //生成GeoJosn-收藏景点
            let pointGeoJSON= await geojson.parse(favordata,{Point:["attraction_lon","attraction_lat"],include:["attraction_id","attraction_name"]})
            let pointGeoJSONback= await geojson.parse(favordata,{Point:["attraction_lon","attraction_lat"],include:[]})

            //数据分流-轨迹显示
            let temp
            let tempp
            let names
            //轨迹中的景点数据存储
            let tracePOI=[]
            for (let i = 0 ;i < traceList.length;i++){
                tempp=[]
                names=[]
                  for (let j = 0;j<traceList[i].trace.length;j++){
                      //获取所需景点id
                      temp = data.filter((x)=>{
                           return x.attraction_id===traceList[i].trace[j]
                      })
                      names.push(temp[0].attraction_name)
                      tempp.push([temp[0].attraction_lat,temp[0].attraction_lon])
                      tracePOI.push({
                        name:temp[0].attraction_name,
                        id:temp[0].attraction_id,
                        attraction_lat:temp[0].attraction_lat.toFixed(4),
                        attraction_lon:temp[0].attraction_lon.toFixed(4)
                      })
                  }
                  if(tempp !== []){
                      traceList[i].trace=tempp
                      traceList[i].color=randomColor({luminosity:"dark"})
                      traceList[i].colorStyle={"background-color":traceList[i].color}
                      traceList[i].attr_names=names
                  }
            }
            this.userInfo.trace=traceList
            //生成轨迹-GeoJSON
            let traceGeoJSON=geojson.parse(traceList,{LineString:"trace",include:["color"]})
            let traceGeoJSONback=geojson.parse(traceList,{LineString:"trace",include:[]})
            //轨迹景点-GeoJSON
            let POIGeoJSON=geojson.parse(tracePOI,{Point:["attraction_lon","attraction_lat"],include:["id","name"]})
            //轨迹显示

            //杂项-背景图片的生成
            let backGroundGeoJSON={
                "type": "FeatureCollection",
                "features": []
            }
            let newtraceFeature=traceGeoJSONback.features.filter(x=>x.geometry.coordinates.length>1)
            if(newtraceFeature.length>=1){
                backGroundGeoJSON.features=pointGeoJSONback.features.concat(newtraceFeature)
            }else{
                backGroundGeoJSON.features=pointGeoJSONback.features
            }          
            console.log(backGroundGeoJSON)
            let tem=JSON.stringify(backGroundGeoJSON)
            this.backPic=`https://api.mapbox.com/styles/v1/joshuamwong/cku82uhhz09k018pdij5r2ml5/static/geojson(${tem})/auto/440x200?access_token=pk.eyJ1Ijoiam9zaHVhbXdvbmciLCJhIjoiY2tzaXRlOXcyMHVhNzJ2bnN4aG11NW10aiJ9.RdgXiHX8GNMNWTr2X92ruQ`
            this.favormap.on("load",()=>{
                this.favormap.addLayer({
                    id: "favorLayer",
                    type: "symbol",
                    source: {
                        type:"geojson",
                        data:pointGeoJSON
                    },
                    layout: {
                    "text-field": "{attraction_name}",
                    "text-anchor": "right",
                    'text-font': ['Open Sans Bold'],
                    "text-line-height": 1.2,
                    "text-size": 12,
                    "text-offset":[-1,0],
                    "icon-image": "marker"
                    }
                })
        })
            console.log(traceGeoJSON)
            this.tracemap.on("load",()=>{
                this.tracemap.addLayer({
                    id:"traceLayer",
                    type:"line",
                    source:{
                        type:"geojson",
                        data:traceGeoJSON,
                        lineMetrics: true
                    },
                    layout: {
                        'line-join': 'round',
                        'line-cap': 'round'
                        },
                    // paint: {
                    //     'line-color': ['get','color'],
                    //     'line-width': 2
                    //     }
                    paint: {
                    'line-color': 'red',
                    'line-width': 4,
                    // 'line-gradient' must be specified using an expression
                    // with the special 'line-progress' property
                    'line-gradient': [
                      'interpolate',
                      ['linear'],
                      ['line-progress'],
                      0, "blue",
                      0.1, "royalblue",
                      0.3, "cyan",
                      0.5, "lime",
                      0.7, "yellow",
                      1, "red"
                    ]
                  }
                })

              this.tracemap.addLayer({
                id:"POI",
                type:"symbol",
                source:{
                  type:"geojson",
                  data:POIGeoJSON
                },
                layout: {
                  "text-field": "{name}",
                  "text-anchor": "right",
                  'text-font': ['Open Sans Bold'],
                  "text-line-height": 1.2,
                  "text-size": 6,
                  "text-offset":[-1,0],
                }
              })
              this.tracemap.loadImage(walkman,(error,image)=>{
                if(error){console.log(error)}
                else {
                  this.tracemap.addImage("walkman", image)
                  this.tracemap.addLayer({
                    id:"arrow",
                    type:"symbol",
                    source:{
                      type:"geojson",
                      data:traceGeoJSON
                    },
                    layout:{
                      "symbol-placement":"line",
                      "symbol-spacing":50,
                      "icon-image":"walkman",
                      "icon-size":0.3
                    }

                  })
                }
              })

            })

            //初始化一个路线详情
            let l= Array.from(new Set(this.userInfo.trace[0].attr_names))
            this.traceDetail.traceDetail=l.join("==>")
        }

        //轨迹显示




    },
    traceDetailfunc(){
      this.traceDetail.traceActive = !this.traceDetail.traceActive
    },

    //获取路径优化
    routeOptimize() {
      //路径规划API函数，得到一个规划后的路径顺序
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
      //根据输入的景点顺序获取路径数据，并画线
      async function getRoute(point_data, map) {//point_data是坐标字符串,map是地图
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

          await getRoute(pointStr, that.favormap); //pointStr是最后得到的坐标顺序，画线

          /************这部分是根据路径API查询后得到的导航信息 */
          const instructions = document.getElementById("instructions");
          const steps = that.instructionsData.legs[0].steps;
          let tripInstructions = "";

          instructions.innerHTML = `<p><strong>Trip duration: ${Math.floor(
            that.instructionsData.duration / 60 //计算路程总时间
          )} min 🚗 </strong></p><ol>${that.routeOrder}</ol>`; //routeOrder是景点路径的顺序
        },
        function(error) {
          // Error
          console.log(error);
        }
      );

      // this.pointArray = [];
      // this.routeOrder ="";
      this.getMark();//打标记   
    }, 
    //获取点击景点的信息，将信息存入数组pointArray
    getAttractionData(lngLat,name){

      if(this.clikTimes==0){
          this.clikTimes = 1;
              this.start = {
                name: `${name}`,
                lat: `${lngLat[0]}`,
                lng: `${lngLat[1]}`
              };
       console.log("起点")         
      }else if(this.clikTimes==1){
        this.clikTimes = 2;
              this.end = {
                name: `${name}`,
                lat: `${lngLat[0]}`,
                lng: `${lngLat[1]}`
              };  
      console.log("终点")   
      }else{
              this.pointArray[this.pointArray.length] = {
                name: `${name}`,
                lat: `${lngLat[0]}`,
                lng: `${lngLat[1]}`
              };
        console.log("过程点") 
        console.log(this.pointArray)
        
      }


      


      
    },
    //打标记
    getMark(){

          for (let j = 0; j < this.pointArray.length; j++) {
            console.log([this.pointArray[j].lat,this.pointArray[j].lng]);
            const marker = new mapboxgl.Marker({
              color: "#22c32e" //绿色
            })
              .setLngLat([this.pointArray[j].lat,this.pointArray[j].lng])
              .addTo(this.favormap);

             this.favoriteMarks.push(marker);//将Mark存入数组中便于清除

          }      


    },
    //清除Marks和路径的函数
    cleanMarks(){
      
      this.favoriteMarks.forEach(marker => marker.remove());//清除上一次的标记
      this.clikTimes=0;  //路径规划后将点击次数清零
      this.pointArray=[];//清空

      //删除route图层
      if (this.favormap.getLayer("route")) {
        this.favormap.removeLayer("route"); //删除图层
      }
      if (this.favormap.getSource("Point_Source")) {
        this.favormap.removeSource("Point_Source"); //删除图层的源
      }

    }  

    },


computed:{
  userInfoCom(){
    return{
    "height": "12em",
    "border": "6px solid #ffffff",
    "border-radius": "24px",
    // "background-color": "beige"
    "background":`url('${this.backPic}')`,
    "background-size":"cover",
    "color":"white"
    }
  }
}
}
</script>

<style>
@import url('https://api.mapbox.com/mapbox-gl-js/v2.4.1/mapbox-gl.css');
/*.userInfo{*/
/*    height: 12em;*/
/*    background-color: beige;*/

/*    border: 6px solid #ffffff;*/
/*    border-radius: 24px;*/
/*}*/
.username{
    text-align:right;
    font-size:30px;
    margin: 24px;
}
.numDisplay{
    font-size:28px;
}
.hideOver{
    display: none;
}
.button:hover +.hideOver{
    display: block;
    font-size: 6px;
    color: burlywood;
}
.intro{
    text-align:right;
    margin: 2px;
}
.button {
	background-color:#ffffff;
	border-radius:28px;
	border:1px solid #0f1110;
	display:inline-block;
	cursor:pointer;
	color:#000000;
	font-family:Arial;
	font-size:8px;
    margin: 2px 2px;
	padding:6px 6px;
	text-decoration:none;
	/* text-shadow:0px 1px 0px #2f6627; */
}
.button:hover {
	background-color:#5cbf2a;
}
.button:active {
	position:relative;
	top:1px;
}
.favoritemaps{
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    color: white;
    background-color: gray;
    border: 6px solid #ffffff;
    border-radius: 24px;
}
.tracemaps{
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    color: white;
    background-color: gray;
    border: 5px solid #ffffff;
    border-radius: 24px;
}
p{
 font-family: 'Microsoft Yahei','Times New Roman', Times, serif;
 font-size: 26px;
 margin: 12px;
 text-align: right;


}
.traceDetailStyle{
  font-size: 5px;
  text-align: left;
  margin: 0px 0px;
}
#tracemap{
    width: inherit;
    /* height: 400px; */
    height: 44rem;
}
#favoritemap{
  width: inherit;
  /* height: 180px; */
  height: 34rem;
}
.flex{
  display: flex;
  height: 100%;
}
#oimiGod{
  bottom: 10%;
  background-color: beige;
}
/* .favorbox{
  width: 40%;
} */
.leftbox{
  width: 50%;
}
.tracebox{
  width: 50%;
}
#instructions {
  position: absolute;
  margin: 0px;
  width: 10%;
  right: 0px;
  top: 0px;
  bottom: 60%;
  padding: 0px;
  background-color: #fff;
  overflow-y: scroll;
  font-family: sans-serif;
  opacity: 0.7;
}

</style>
