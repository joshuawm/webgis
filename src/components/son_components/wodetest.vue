<template>
  <div>
    <div id="map"></div>
    <div id="god">
    <div id="youyustart">
      <div>
        <div id="functionZone" >
          <span style="font-weight: bold;font-family: 'Microsoft Yahei', 'Times New Roman', Times, serif;margin:3px 20px;">{{userInfo.user.userName}}</span>
          <span class="el-icon-notebook-2 funcButton" @click="myInfoActive=true;favorAndtraceActive=false;youyuActive=false;">我的信息</span>
          <span class="el-icon-bell funcButton">我的消息</span>
          <span class="el-icon-star-off funcButton" @click="favorAndtraceActive=true;myInfoActive=false;youyuActive=false;">我的收藏</span>
          <span class="el-icon-s-custom funcButton" @click="youyuActive=true;myInfoActive=false;favorAndtraceActive=false;">游友</span>
        </div>
      </div>
      <div v-if="myInfoActive" id="myInfo">
        <div>
          <div style="text-align: right;margin-right: 20px;" ><span class="el-icon-circle-close" @click="myInfoActive=false;"></span></div>
          <input v-model="userInfo.user.userName" disabled></input><br>
          <input v-model="userInfo.user.userPhone" disabled ></input> <span class="el-icon-edit"></span><br>
          <input v-model="userInfo.user.userEmail" disabled ></input> <span class="el-icon-edit"></span>
        </div>
      </div>
    </div>

    <div id="flexbaby">
    <div id="rightall">
      <div v-if="favorAndtraceActive" id="favorAndtrace">
        <div style="text-align: right;"><span class="el-icon-circle-close" style="margin-top: 1px;" @click="favorAndtraceActive=false;"></span></div>
        <span style="margin-left: 5px;font-weight: bold;font-family: 'Microsoft Yahei', 'Times New Roman', Times, serif;">景点收藏</span>
        <div class="favorite">
          <div v-for="favor in userInfo.favorite">
            <button class="favorButton" @click="goto(favor.lngLat)">{{favor.name}}</button>
          </div>
        </div>
        <span style="margin-left: 5px;font-weight: bold;font-family: 'Microsoft Yahei', 'Times New Roman', Times, serif;">轨迹收藏</span>
        <div class="trace">
          <div v-for="trace in userInfo.trace">
            <button class="traceButton" @click="goto(trace.trace[0])">{{trace.name}}</button>
          </div>
        </div>
      </div>

      <div id="rightDrag" ref="kongtiao" >
        <div id="rightflex" >
            <div v-if="youyuActive" id="youyu">
              <div style="text-align: right;margin-right: 20px;" ></div>
              <div @mousedown="mouseDownHandleelse($event)" @mouseup="mouseUpHandleelse($event)"><el-row><el-col :span="12" ><div style="text-align: center" ><span @click="ybActive=true;xyActive=false;">游博</span></div></el-col><el-col :span="10" ><div  style="text-align: center"><span @click="xyActive=true;ybActive=false;">寻友</span></div></el-col><el-col :span="2"><span class="el-icon-circle-close" style="margin-top: 1px;" @click="youyuActive=false;"></span></el-col></el-row></div>
              <div id="sendPanel">
                <div class="sendButton"><span class="el-icon-circle-plus-outline"></span></div>
                <div class="sendChoicePanel">
                  <span>游博</span> <span>游友</span>
                </div>
              </div>
              <div class="content">
                <div  v-if="ybActive" id="yb">
                  <div class="timeline">
                    <timeline></timeline>
                  </div>
                </div>
                <div v-if="xyActive" id="xy">
                  <div class="xyclass"><find-friends></find-friends></div>
                </div>
              </div>
          </div>

        </div>
      </div>

      <!--    收藏与轨迹-->

    </div>
    <div id="leftall">



    </div>
    </div>
  </div>

  </div>
</template>

<script>
import mapboxgl from "@mapgis/mapbox-gl";
import axios from "axios";
import geojson from "geojson";
import randomColor from "randomcolor";
import walkman from "../../assets/icon/arrow-right32px.png";
import timeline from "./timelineyb";
import findFriends from "./findFriends";

export default {
 name:"newWode",
  components:{
   timeline,
    findFriends
  },
  data(){
   return{
     map:null,
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
     traceDetail:{
       desc:"轨迹详情",
       traceDetail:"",
       traceActive:false
     },
     backPic:null,
     userID:null,
     xyActive:true,
     ybActive:false,
     youyuActive:true,
     favorAndtraceActive:false,
     myInfoActive:false,
     moveDataelse: {
       x: null,
       y: null
     }


   }
  },
 async mounted() {
   //bug 用户id不正确
   this.userID=await this.$store.state.user_id

   //initialMap
   mapboxgl.accessToken ="pk.eyJ1Ijoiam9zaHVhbXdvbmciLCJhIjoiY2tzaXRlOXcyMHVhNzJ2bnN4aG11NW10aiJ9.RdgXiHX8GNMNWTr2X92ruQ"
  this.map=await new mapboxgl.Map({
    container:"map",
    style:"mapbox://styles/joshuamwong/ckte9azm523g217juhpczqo5q",
    center:[114.405906,30.534768],
    zoom:12,
    attributionControl: false
  })
   this.initialUserInfo()
 },
  methods:{
    async initialUserInfo(){
      //杂项
      //杂项-用户名
        //bug
      let ress = await axios.get(`http://121.5.235.15/api/v2/zhouyou/_table/users?fields=*&filter=user_id=2`,{
        params: {
          api_key: '956eed8e98667eca2722be6afc37e123212466565cab5df2f7e653d206f3e3c0'
        }
      })
      console.log(ress)
      this.userInfo.user={
        userName:ress.data.resource[0].user_name,
        userPhone:ress.data.resource[0].user_phone,
        userEmail:ress.data.resource[0].user_email
      }
      // this.backPic="https://api.mapbox.com/styles/v1/joshuamwong/cku82uhhz09k018pdij5r2ml5/static/geojson({\"type\":\"FeatureCollection\",\"features\":[{\"type\":\"Feature\",\"geometry\":{\"type\":\"Point\",\"coordinates\":[114.3718,30.5702]},\"properties\":{\"attraction_id\":151,\"attraction_name\":\"湖北美术馆\"}},{\"type\":\"Feature\",\"geometry\":{\"type\":\"Point\",\"coordinates\":[114.4132,30.5467]},\"properties\":{\"attraction_id\":191,\"attraction_name\":\"东湖梅园\"}},{\"type\":\"Feature\",\"geometry\":{\"type\":\"Point\",\"coordinates\":[114.3543,30.558]},\"properties\":{\"attraction_id\":239,\"attraction_name\":\"汉秀剧场\"}},{\"type\":\"Feature\",\"geometry\":{\"type\":\"Point\",\"coordinates\":[114.429948,30.550553]},\"properties\":{\"attraction_id\":243,\"attraction_name\":\"武汉植物园\"}}]})/auto/445x204?access_token=pk.eyJ1Ijoiam9zaHVhbXdvbmciLCJhIjoiY2tzaXRlOXcyMHVhNzJ2bnN4aG11NW10aiJ9.RdgXiHX8GNMNWTr2X92ruQ"

      //收藏景点-请求数据
        //bug
      let resfavor = await axios.get(`http://121.5.235.15/api/v2/zhouyou/_table/attraction_favorites?fields=*&filter=user_id=2`,{
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
        //bug
      let traceyb= await axios.get(`http://121.5.235.15/api/v2/zhouyou/_table/yb?fields=attraction_id&filter=user_id=2`,{
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
        console.log(favordata)
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
        console.log(this.userInfo)
        console.log(pointGeoJSON)
        this.map.on("load",()=>{
          this.map.addLayer({
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
            }
          })
        })



        //初始化一个路线详情
        let l= Array.from(new Set(this.userInfo.trace[0].attr_names))
        this.traceDetail.traceDetail=l.join("==>")
      }

      //轨迹显示
    },
    goto(lngLat){
      this.map.flyTo({
        center:lngLat
        // zoom:14
      })
    },
    mouseDownHandleelse (event) {
      this.moveDataelse.x = event.pageX - this.$refs.kongtiao.offsetLeft
      this.moveDataelse.y = event.pageY - this.$refs.kongtiao.offsetTop
      event.currentTarget.style.cursor = 'move'
      window.onmousemove = this.mouseMoveHandleelse
    },
    mouseMoveHandleelse (event) {
      let moveLeft = event.pageX - this.moveDataelse.x + 'px'
      let moveTop = event.pageY - this.moveDataelse.y + 'px'
      this.$refs.kongtiao.style.left = moveLeft
      this.$refs.kongtiao.style.top = moveTop
    },
    mouseUpHandleelse (event) {
      window.onmousemove = null
      event.currentTarget.style.cursor = 'move'
      console.log('鼠标松开了')
    }


  }
}
</script>

<style scoped>
@import url("https://api.mapbox.com/mapbox-gl-js/v2.4.1/mapbox-gl.css");
#map {
  width: 100%;
  /*height: 100%;*/
  position: absolute;
  top: 10%;
  bottom: 4%;
}

#flexbaby{
  /*display: flex;*/
  z-index: 2;
}
#leftall{
  width: fit-content;
  margin-left: 5%;
}
#rightall{
  width: 50%;
  position: absolute;
  top: 15%;
  right: 0%;
}
#rightDrag{
  position: fixed;
  /*cursor: pointer;*/
  left: 75%;
}
#rightflex{
  /*float: right;*/
  /*position: fixed;*/
  /*cursor: pointer;*/
  /*backdrop-filter: blur(2px);*/
  border-radius: 12px;
  /*position: absolute;*/
  /*z-index: 2;*/
  box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
  width: fit-content;
  display: flex;
  flex-direction: column-reverse;
  flex-wrap: wrap;
  align-content: stretch;
  align-items: flex-start;
  justify-content: flex-end;
  background-color: rgba(255,255,255,0.8);

}
#youyu{
  width: fit-content;
}
#myInfo{
  width: fit-content;
  margin: 24px 2px;
  background-color: rgba(255,255,255,0.8);
  box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
}
#favorAndtrace{
  /*backdrop-filter: blur(2px);*/
  float: right;
  top: 27%;
  background-color: transparent;
  border-radius: 12px;
  position: absolute;
  /*top: 15%;*/
  width: 25%;
  left: 70%;
  /*z-index: 2;*/
}
/*#favorAndtrace:hover{*/
/*  background-color: rgba(255,255,255,0.8);*/
/*}*/
.content{
  width: 300px;
  height: 100%;

}
#youyu{
  min-height: 60%;
}
#yb{
  width: 100%;
  backdrop-filter: blur(2px);
  box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
}
#xy{
  width: 100%;
}
.favorite{
  display: flex;
  flex-wrap: wrap;
}
#youyustart{
  position: absolute;
  left: 4%;
  top: 12%;
}
.favorButton{
  border:1px solid black;
  border-radius: 12px;
  backdrop-filter: blur(2px);
  box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
  margin: 12px 5px;
}
.traceButton{
  border:1px solid black;
  border-radius: 12px;
  backdrop-filter: blur(2px);
  box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
  margin: 12px 5px;
}
/deep/ .el-input__inner{
  background-color: transparent;
  background-image: none;
  border-radius: 4px;
  border: 1px solid transparent;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  color: #606266;
  display: inline-block;
  font-size: 6px;
  height: 20px;
  line-height: 40px;
  outline: 0;
  padding: 0 15px;
  -webkit-transition: border-color .2s cubic-bezier(.645,.045,.355,1);
  transition: border-color .2s cubic-bezier(.645,.045,.355,1);
  width: fit-content;
}
.funcButton{
  margin: 4px 12px;
}
#functionZone{
  backdrop-filter: blur(2px);
  width: fit-content;
  background-color: rgba(255,255,255,0.6);
  border-radius: 12px;
  box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
  padding: 5px;

}
.sendChoicePanel{
  display: none;
}
#sendPanel:hover .sendChoicePanel{
  display: block;
  background-color: rgba(255,255,255,0.6);
  border-radius: 12px;
  box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
  padding: 5px;
  z-index: 4;
}
</style>
