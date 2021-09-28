<template>
  <div>
<div class="oimiGod">
    <el-row>
        <el-col :span="12">
            <el-row>
            <!-- 用户信息展示区 -->
            <div class="userInfo">
                    <p class="username">{{userInfo.name}}</p>
                    <p class="intro">当前您收藏景点共有<span class="numDisplay">{{userInfo.favorite.length}}</span>个</p>
                    <p class="intro">收藏轨迹有<span class="numDisplay">{{userInfo.trace.length}}</span>个</p>
            </div>
            </el-row>

            <el-row>
            <!-- 收藏区 -->
            <div class="favoritemaps">
            <p>&nbsp;&nbsp;&nbsp;&nbsp;我的收藏</p>
                <div class="buttons">
                    <span v-for="favor in userInfo.favorite" :key="favor.name">
                        <button class="button"   @click="pantoToThis(favor.lngLat,'favor')">{{favor.name}}</button>
                    </span>
                </div>
            <div id="favoritemap"></div>
            </div>
            </el-row>
        </el-col>

        <el-col :span="12">
        <!-- 轨迹区 -->
        <div class="tracemaps">
        <p>&nbsp;&nbsp;&nbsp;&nbsp;我的轨迹</p>
        <span class="hideOver">{{traceDetail}}</span>
            <div class="buttons">
                <span v-for="trace in userInfo.trace" :key="trace.name">
                    <button round class="button" v-bind:style="trace.colorStyle" @click="pantoToThis(trace.trace[0],'trace')">{{trace.name}}</button>
                </span>
                <br>
              <el-button type="text"  @click="traceDetailfunc" >{{traceDetail.desc}}</el-button>
              <p v-if="traceDetail.traceActive" class="traceDetailStyle">{{traceDetail.traceDetail}}</p>
            </div>

        <div id="tracemap"></div>
        <span>&nbsp;&nbsp;</span>
        </div>
        </el-col>
    </el-row>
</div>
  </div>
</template>

<script>
import mapboxgl from "@mapgis/mapbox-gl"
import geojson from "geojson"
import axios from "axios"
import randomColor from "randomcolor"
import walkman from "../assets/icon/arrow-right32px.png"

export default {
name:"wode",
components:{
},
mounted(){
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
            name:"Joshua",
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
        }
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


        //收藏景点-请求数据
        let attraction_id=[1,2,3,4,5,6,7,8,9]
        // let filter = attraction_id.map((x)=>{
        //     return `(attraction_id = ${x})`
        // })
        //轨迹-请求数据
        let traceList = [
            {trace:[63,79,86,78,95,58],name:"trace1"},
            {trace:[1,2,3,4,5,6,7],name:"trace2"},
            {trace:[382,455,298,292,343,481],name:"trace3"}
        ]

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
            //生成按钮-收藏景点
            this.userInfo.favorite=favordata.map((x)=>{
                return {
                    name:x.attraction_name,
                    id:x.attraction_id,
                    lngLat:[x.attraction_lat,x.attraction_lon]
                }
            })
            //生成GeoJosn-收藏景点
            let pointGeoJSON= await geojson.parse(favordata,{Point:["attraction_lon","attraction_lat"],include:["attraction_id","attraction_name"]})
            console.log(pointGeoJSON)
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
                        attraction_lat:temp[0].attraction_lat,
                        attraction_lon:temp[0].attraction_lon
                      })
                  }
                  if(tempp !== []){
                      traceList[i].trace=tempp
                      traceList[i].color=randomColor({luminosity:"light"})
                      traceList[i].colorStyle={"background-color":traceList[i].color}
                      traceList[i].attr_names=names
                  }
            }
            this.userInfo.trace=traceList
            //生成轨迹-GeoJSON
            let traceGeoJSON=geojson.parse(traceList,{LineString:"trace",include:["color"]})
            //轨迹景点-GeoJSON
            let POIGeoJSON=geojson.parse(tracePOI,{Point:["attraction_lon","attraction_lat"],include:["id","name"]})
            console.log(traceGeoJSON)
            //轨迹显示

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
                    "text-offset":[-1,0]
                    }
                })
        })

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
                    'line-width': 8,
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
                      "icon-size":0.5
                    }

                  })
                }
              })

            })

            //初始化一个路线详情
            this.traceDetail.traceDetail=this.userInfo.trace[0].attr_names.join("==>")
        }

        //轨迹显示




        },

    traceDetailfunc(){
      this.traceDetail.traceActive = !this.traceDetail.traceActive
    }

    }
}
</script>

<style>
@import url('https://api.mapbox.com/mapbox-gl-js/v2.4.1/mapbox-gl.css');
.userInfo{
    height: 12em;
    background-color: beige;
    border: 6px solid #ffffff;
    border-radius: 24px;
}
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
    background-color: beige;
    border: 6px solid #ffffff;
    border-radius: 24px;
}
.tracemaps{
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    background-color: beige;
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
    height: 400px;
}
#favoritemap{
  width: inherit;
  height: 180px;
}
</style>
