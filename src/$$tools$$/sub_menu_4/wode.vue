<template>
  <div>
    <div id="map"></div>
    <div id="god">
      <div id="headerFunctionZone">
        <div id="youyustart">
          <div>
            <div id="functionZone">
              <span
                style="font-weight: bold;font-family: 'Microsoft Yahei', 'Times New Roman', Times, serif;margin:3px 20px;">{{ userInfo.user.userName }}</span>
              <span class="funcButton"
                    @click="myInfoActive=true;favorAndtraceActive=false;youyuActive=false;">我的信息</span>
              <span class="funcButton" @click="show_message">我的消息</span>
              <span class="funcButton"
                    @click="favorAndtraceActive=true;myInfoActive=false;youyuActive=false;">我的收藏</span>
              <span class="funcButton"
                    @click="youyuActive=true;myInfoActive=false;favorAndtraceActive=false;">游友</span>
            </div>
          </div>
          <div v-if="myInfoActive" id="myInfo">
            <div>
              <div style="text-align: right;margin-right: 20px;"><span class="el-icon-circle-close"
                                                                       @click="myInfoActive=false;"></span></div>
              <input v-model="userInfo.user.userName" disabled></input><br>
              <input v-model="userInfo.user.userPhone" disabled></input><br>
              <input v-model="userInfo.user.userEmail" disabled></input>
            </div>
          </div>
        </div>
      </div>

      <div v-if="$store.state.previewURL!==null" class="previewImg">
        <div style="transform: scale(2)" class="el-icon-close" @click="$store.commit('previewImgM',null)"></div>
        <div><img :src="$store.state.previewURL" alt="预览" class="imgMe"></div>
      </div>

        <div id="rightall" ref="kongtiao">
          <div v-if="favorAndtraceActive" id="favorAndtrace">
            <div style="text-align: right;"><span class="el-icon-circle-close" style="margin-top: 1px;"
                                                  @click="favorAndtraceActive=false;"></span></div>
            <span
              style="margin-left: 5px;font-weight: bold;font-family: 'Microsoft Yahei', 'Times New Roman', Times, serif;">景点收藏</span>
            <div class="favorite">
              <div v-for="favor in userInfo.favorite">
                <button class="favorButton" @click="goto(favor.lngLat)">{{ favor.name }}</button>
              </div>
            </div>
            <span
              style="margin-left: 5px;font-weight: bold;font-family: 'Microsoft Yahei', 'Times New Roman', Times, serif;">轨迹收藏</span>
            <div class="trace">
              <div v-for="trace in userInfo.trace">
                <button class="traceButton" @click="goto(trace.trace[0])">{{ trace.name }}</button>
              </div>
            </div>
          </div>
          <div id="rightDrag">
            <div class="flexbaby">
              <div id="youbosend">
                <div v-if="youyuSend.yb" id="push_youbo" >
                  <div class="editor-after-div">
                    <el-input
                      type="textarea"
                      :autosize="{ minRows: 4, maxRows: 8 }"
                      placeholder="说点儿什么呢..."
                      v-model="textarea1"
                    >
                    </el-input>
                    <div>
                      <span>选择景点:</span>
                    </div>
                    <el-input
                      placeholder="点击地图景点以获取位置信息"
                      v-model="this.$store.state.jingdianName"
                      :disabled="true"
                      style="width: 60%"
                    ></el-input>
                    <div>
                      <span>选择图片:</span>
                    </div>
                    <el-upload
                      :on-success="success_handle"
                      :before-upload="before_upload"
                      class="updata-after-upload"
                      style="display: inline-block"
                      ref="upload"
                      action="http://127.0.0.1:3000/images"
                      multiple="multiple"
                      list-type="picture-card"
                      :auto-upload="false"
                      :limit="20"
                    >
                      <i slot="default" class="el-icon-plus"></i>
                      <div slot="file" slot-scope="{ file }">
                        <img
                          class="el-upload-list__item-thumbnail"
                          :src="file.url"
                          alt=""
                        />
                        <span class="el-upload-list__item-actions">
                          <span
                            class="el-upload-list__item-preview"
                            @click="handlePictureCardPreview(file)"
                          >
                            <i class="el-icon-zoom-in"></i>
                          </span>
                          <span
                            v-if="!disabled"
                            class="el-upload-list__item-delete"
                            @click="handleRemove(file)"
                          >
                            <i class="el-icon-delete"></i>
                          </span>
                        </span>
                      </div>
                    </el-upload>
                    <el-dialog :modal="false" :visible.sync="dialogVisible">
                      <img width="100%" :src="dialogImageUrl" alt=""/>
                    </el-dialog>
                    <p><el-button
                      style="width: 50%"
                      size="small"
                      type="success"
                      @click="submitUpload"
                    >发布
                    </el-button
                    >
                      <el-button
                        style="width: 37%"
                        size="small"
                        type="success"
                        @click="AllFalse"
                      >取消
                      </el-button
                      >
                    </p>

                  </div>

                </div>
                <div v-if="youyuSend.yy" id="push_xunyou">
                  <div class="editor-after-div">
                    <el-input
                      type="textarea"
                      :autosize="{ minRows: 2, maxRows: 4 }"
                      placeholder="说点儿什么呢..."
                      v-model="textarea2"
                    >
                    </el-input>
                    <div v-if="$store.state.xyjingdian.length === 0">
                      <i class="el-icon-s-promotion"></i
                      ><span style="">点击地图添加景点</span>
                    </div>
                    <div v-if="$store.state.xyjingdian.length !== 0" style="background-color: transparent">
                      <el-table
                        :data="$store.state.xyjingdian"
                        style="width: 100%;"
                        max-height="250"
                      >
                        <el-table-column
                          fixed
                          prop="name"
                          label="景点"
                          width="150"
                        >
                        </el-table-column>
                        <el-table-column fixed="right" label="操作" width="120" >
                          <template slot-scope="scope">
                            <el-button
                              @click.native.prevent="
                                deleteRow(scope.$index, tableData)
                              "
                              type="text"
                              size="small"
                            >
                              移除
                            </el-button>
                          </template>
                        </el-table-column>
                      </el-table>
                    </div>
                    <p>
                      <el-button
                        style="width: 50%;margin-top:20px"
                        size="small"
                        type="success"
                        @click="fabu"
                      >发布
                      </el-button
                      >
                      <el-button
                        style="width: 37%"
                        size="small"
                        type="success"
                        @click="AllFalse"
                      >取消
                      </el-button
                      >
                    </p>

                  </div>
                </div>
              </div>
              <div id="rightflex">
                <div v-if="youyuActive" id="youyu">
                  <div style="text-align: right;margin-right: 20px;"></div>
                  <div @mousedown="mouseDownHandleelse($event)" @mouseup="mouseUpHandleelse($event)">
                    <el-row>
                      <el-col :span="12">
                        <div style="text-align: center"><span @click="ybActive=true;xyActive=false;handleClick">游博</span></div>
                      </el-col>
                      <el-col :span="10">
                        <div style="text-align: center"><span @click="xyActive=true;ybActive=false;handleClick">寻友</span></div>
                      </el-col>
                      <el-col :span="2"><span class="el-icon-circle-close" style="margin-top: 1px;"
                                              @click="youyuActive=false;"></span></el-col>
                    </el-row>
                  </div>
                  <div class="content">
                    <div v-if="ybActive" id="yb">
                      <div class="timeline">
                        <timeline ref="timeline"></timeline>
                      </div>
                    </div>
                    <div v-if="xyActive" id="xy">
                      <div class="xyclass">
                        <find-friends ref="xy"></find-friends>
                      </div>
                    </div>
                  </div>

                </div>
                <div v-if="youyuActive"  id="sendPanel">


                  <div class="sendChoiceHidden" @click="send_youbo"><span class="sendButtonChoice">游博</span></div>
                  <div class="sendButton"><span style="transform: scale(2);" class="el-icon-circle-plus-outline"></span>
                  </div>
                  <div class="sendChoiceHidden" @click="send_xunyou"><span class="sendButtonChoice">寻友</span></div>


                </div>
              </div>
            </div>



          <!--    收藏与轨迹-->

        </div>
        <div id="dialog">
          <el-dialog
            :modal="false"
            :visible.sync="dialogVisible_message"
            width="20%"
            title="消息"
          >
            <div>
              <el-tabs
                id="message_dialog"
                v-model="activeName_message"
                @tab-click="handleClick_message"
                :stretch="true"
                center="true"
              >
                <el-tab-pane label="我收到的" name="1">
                  <div>
                    <span v-if="get_messages.length === 0">这里空空如也</span>
                    <div v-if="get_messages.length !== 0">
                      <div
                        class="getMessage messagePanel"
                        v-for="(message, index) in get_messages"
                        :key="message.xyhf_content"
                        @click="readit(index)"
                      >
                        <el-row
                        >
                          <el-col :span="12"
                          ><span style="font-size:18px;font-weight:bold;"
                          ><span style="font-size:8px;">From: </span
                          >{{ message.user_name }}</span
                          ></el-col
                          >
                          <el-col :span="8"
                          ><span
                            style="font-size:8px;font-weight:lighter;"
                          >{{
                              new Date(Number(message.xyhf_date)).Format(
                                "yy-MM-dd hh:mm"
                              )
                            }}</span
                          ></el-col
                          >
                          <el-col :span="4"
                          ><span style="right:10%;"
                          ><el-badge
                            v-if="message.xyhf_is_read === 1"
                            value="new"
                          ></el-badge></span></el-col
                          >
                        </el-row>
                        <p style="font-size:16px;margin:3px 8px;">
                          {{ message.xyhf_content }}
                        </p>
                        <div>
                            <span class="el-icon-phone"></span
                            ><span>{{ message.user_phone }}</span
                        ><br/>
                          <span class="el-icon-s-comment"></span
                          ><span>{{ message.user_email }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </el-tab-pane>
                <el-tab-pane label="我发送的" name="2">
                  <div>
                      <span v-if="send_messages.length === 0"
                      >什么消息也没有</span
                      >
                    <div v-if="send_messages.length !== 0">
                      <div
                        class="sendMessage messagePanel"
                        v-for="message in send_messages"
                        :key="message.xyhf_content"
                      >
                        <el-row
                        >
                          <el-col :span="20"
                          ><span style="font-size:18px;font-weight:bold;"
                          ><span style="font-size:8px;">To: </span
                          >{{ message.user_name }}</span
                          ></el-col
                          >
                        </el-row
                        >
                        <p style="font-size:16px;margin:3px 8px;">
                          {{ message.xyhf_content }}
                        </p>
                        <el-row>
                          <el-col :span="20"
                          ><span
                            style="font-size:8px;font-weight:lighter;"
                          >{{
                              new Date(Number(message.xyhf_date)).Format(
                                "yy-MM-dd hh:mm"
                              )
                            }}</span
                          ></el-col
                          >
                        </el-row>
                      </div>
                    </div>
                  </div>
                </el-tab-pane>
              </el-tabs>
            </div>
          </el-dialog>
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
import walkman from "./assets/arrow-right32px.png";
import timeline from "./components/timelineyb";
import findFriends from "./components/findFriends";
import attraction from "./data/attractions.json"
import jingdian from "../sub_menu_1/assets/jingdian32px.png";
import popupcontent from "./components/popupcontent";
import Vue from "vue"
const popup = Vue.extend(popupcontent)
let empty={
  type:"FeatureCollection",
  features:[]
}

export default {
  name: "newWode",
  components: {
    timeline,
    findFriends
  },
  data() {
    return {
      map: null,
      userInfo: {
        user: {
          userName: "Joshua"
        },
        favorite: [
          {
            name: "武汉大学",
            lngLat: [114.405906, 30.534768]
          }
        ],
        trace: [
          {
            name: "trace1",
            trace: [140, 30]
          }
        ]
      },
      traceDetail: {
        desc: "轨迹详情",
        traceDetail: "",
        traceActive: false
      },
      backPic: null,
      userID: null,
      xyActive: true,
      ybActive: false,
      youyuActive: true,
      favorAndtraceActive: false,
      myInfoActive: false,
      moveDataelse: {
        x: null,
        y: null
      },
      activeName: "1",
      activeName_message: "1",
      dialogImageUrl: "",
      dialogVisible: false,
      textarea1: "",
      textarea2: "",
      disabled: false,
      youbo_time: null,
      have_files: false,
      winwidth: document.documentElement.clientWidth + "px",
      winheight: document.documentElement.clientHeight + "px",
      dialogVisible_message: false,
      send_messages: [],
      get_messages: [],
      youyuSend:{
        yb:false,
        yy:false
      },
      thePOI:null,
      previewImg:null,
      thepop:null

    }
  },
  async mounted() {
    //bug 用户id不正确
    this.userID = await this.$store.state.user_id
    this.$EventBus.$on("gotolayer",value=>{
      if(this.map===null){
        map.flyTo({
          center:value
        })
      }else{
        this.map.flyTo({
          center:value
        })
      }
    })
    this.$EventBus.$on("addPop",v=>{
      if(this.thepop!==null){
        if(this.thepop.isOpen()){
          this.thepop.remove()
        }
      }
      if(this.map===null){
       this.thepop=new mapboxgl.Popup({ anchor: "right", className: "pop-up" })
          .setLngLat(v.lngLat)
          .setHTML("<div id='popupcontent'></div>")
          .addTo(map);

      }else{
        this.thepop=new mapboxgl.Popup({ anchor: "right", className: "pop-up" })
          .setLngLat(v.lngLat)
          .setHTML("<div id='popupcontent'></div>")
          .addTo(this.map);
      }
      new popup({
        propsData: {
          infos: {
            infos: {
              id: v.id,
              typ: "attractions",
              userID: this.$store.state.user_id
            }
          }
        }
      }).$mount("#popupcontent");
    })
    //initialMap
    mapboxgl.accessToken = "pk.eyJ1Ijoiam9zaHVhbXdvbmciLCJhIjoiY2tzaXRlOXcyMHVhNzJ2bnN4aG11NW10aiJ9.RdgXiHX8GNMNWTr2X92ruQ"
    this.map = await new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/joshuamwong/ckte9azm523g217juhpczqo5q",
      center: [114.405906, 30.534768],
      zoom: 12,
      attributionControl: false
    })
    this.initialUserInfo()
    this.get_data_messages()
    this.map.on("load",()=>{
        this.map.loadImage(jingdian, (error, image) => {
          if (error) {
            console.log(error);
          } else {
            this.map.addImage("jingdianImage", image);
          }})
      this.map.addSource("attractionSource",{
        type:"geojson",
        data:empty
      })
      this.map.addLayer({
        id: "attractionLayer",
        type: "symbol",
        source: "attractionSource",
        layout: {
          "icon-image": "jingdianImage",
          "text-field": "{name}",
          "text-anchor": "right",
          "text-font": ["Open Sans Bold"],
          "text-line-height": 1.2,
          "text-size": 12,
          "text-offset": [-1, 0]
        }
      });
    })
    this.map.on("click", "attractionLayer", e => {
      if (this.$store.state.ybstates !== false) {
        this.$store.commit("set_yb_jingdian", e.features[0].properties);
      } else if (this.$store.state.xystates !== false) {
        this.$store.commit("set_xy_jingdian", e.features[0].properties);
      }


    });
  },
  methods: {
    send_xunyou() {
      this.AllFalse()
      this.map.getSource("attractionSource").setData(attraction)
      this.youyuSend.yy=true
      this.$store.commit('set_xy_fb',true)
    },
    send_youbo() {
      this.AllFalse()
      this.map.getSource("attractionSource").setData(attraction)
      this.youyuSend.yb=true
      this.$store.commit('set_yb_fb',true)
    },
    AllFalse(){
      for(let i in this.youyuSend){
        this.youyuSend[i]=false
      }
      this.$store.commit('set_xy_fb',false)
      this.$store.commit('set_yb_fb',false)
      this.map.getSource("attractionSource").setData(empty)
    },
    async initialUserInfo() {
      //杂项
      //杂项-用户名
      //bug
      let ress = await axios.get(`http://121.5.235.15/api/v2/zhouyou/_table/users?fields=*&filter=user_id=${this.$store.state.user_id}`, {
        params: {
          api_key: '956eed8e98667eca2722be6afc37e123212466565cab5df2f7e653d206f3e3c0'
        }
      })
      console.log(ress)
      this.userInfo.user = {
        userName: ress.data.resource[0].user_name,
        userPhone: ress.data.resource[0].user_phone,
        userEmail: ress.data.resource[0].user_email
      }
      // this.backPic="https://api.mapbox.com/styles/v1/joshuamwong/cku82uhhz09k018pdij5r2ml5/static/geojson({\"type\":\"FeatureCollection\",\"features\":[{\"type\":\"Feature\",\"geometry\":{\"type\":\"Point\",\"coordinates\":[114.3718,30.5702]},\"properties\":{\"attraction_id\":151,\"attraction_name\":\"湖北美术馆\"}},{\"type\":\"Feature\",\"geometry\":{\"type\":\"Point\",\"coordinates\":[114.4132,30.5467]},\"properties\":{\"attraction_id\":191,\"attraction_name\":\"东湖梅园\"}},{\"type\":\"Feature\",\"geometry\":{\"type\":\"Point\",\"coordinates\":[114.3543,30.558]},\"properties\":{\"attraction_id\":239,\"attraction_name\":\"汉秀剧场\"}},{\"type\":\"Feature\",\"geometry\":{\"type\":\"Point\",\"coordinates\":[114.429948,30.550553]},\"properties\":{\"attraction_id\":243,\"attraction_name\":\"武汉植物园\"}}]})/auto/445x204?access_token=pk.eyJ1Ijoiam9zaHVhbXdvbmciLCJhIjoiY2tzaXRlOXcyMHVhNzJ2bnN4aG11NW10aiJ9.RdgXiHX8GNMNWTr2X92ruQ"

      //收藏景点-请求数据
      //bug
      let resfavor = await axios.get(`http://121.5.235.15/api/v2/zhouyou/_table/attraction_favorites?fields=*&filter=user_id=${this.$store.state.user_id}`, {
        params: {
          api_key: '956eed8e98667eca2722be6afc37e123212466565cab5df2f7e653d206f3e3c0'
        }
      })
      let attraction_id = resfavor.data.resource.map(x => x.attraction_id)
      console.log(attraction_id)
      // let attraction_id=[1,2,3,4,5,6,7,8,9]

      //轨迹-请求数据
      //存储整个轨迹的数据
      let traceList = []
      //游博轨迹
      //bug
      let traceyb = await axios.get(`http://121.5.235.15/api/v2/zhouyou/_table/yb?fields=attraction_id&filter=user_id=2`, {
        params: {
          api_key: '956eed8e98667eca2722be6afc37e123212466565cab5df2f7e653d206f3e3c0'
        }
      })

      let ybTraceID = await traceyb.data.resource.map(x => x.attraction_id)
      let ybTrace = {trace: ybTraceID, name: "游博轨迹"}
      traceList.push(ybTrace)

      // let traceList = [
      //     {trace:[63,79,86,78,95,58],name:"trace1"},
      //     {trace:[1,2,3,4,5,6,7],name:"trace2"},
      //     {trace:[382,455,298,292,343,481],name:"trace3"}
      // ]

      //汇总两者的数据,减小请求次数
      let theID = attraction_id
      for (let index = 0; index < traceList.length; index++) {
        theID = theID.concat(traceList[index].trace)
      }
      //去重重复ID
      theID = Array.from(new Set(theID))

      let filter = theID.map((x) => {
        return `(attraction_id = ${x})`
      })
      //获得数据
      let filterURL = encodeURIComponent(filter.join(" OR "))
      let requestsURL = `http://121.5.235.15/api/v2/zhouyou/_table/Attractions?fields=attraction_name,attraction_id,attraction_lat,attraction_lon&filter=${filterURL}`

      let res = await axios.get(requestsURL, {
        params: {
          api_key: '956eed8e98667eca2722be6afc37e123212466565cab5df2f7e653d206f3e3c0'
        }
      })
      let data = await res.data.resource
      if (data !== undefined) {
        //数据分流-收藏景点
        let favordata = data.filter((x) => {
          if (attraction_id.indexOf(x.attraction_id) > -1) {
            return true
          }
        })
        for (let indexx = 0; indexx < favordata.length; indexx++) {
          favordata[indexx].attraction_lon = parseFloat(favordata[indexx].attraction_lon).toFixed(4)
          favordata[indexx].attraction_lat = parseFloat(favordata[indexx].attraction_lat).toFixed(4)
        }
        //生成按钮-收藏景点
        this.userInfo.favorite = favordata.map((x) => {
          return {
            name: x.attraction_name,
            id: x.attraction_id,
            lngLat: [parseFloat(x.attraction_lat).toFixed(4), parseFloat(x.attraction_lon).toFixed(4)]
          }
        })
        console.log(favordata)
        //生成GeoJosn-收藏景点
        let pointGeoJSON = await geojson.parse(favordata, {
          Point: ["attraction_lon", "attraction_lat"],
          include: ["attraction_id", "attraction_name"]
        })
        let pointGeoJSONback = await geojson.parse(favordata, {
          Point: ["attraction_lon", "attraction_lat"],
          include: []
        })

        //数据分流-轨迹显示
        let temp
        let tempp
        let names
        //轨迹中的景点数据存储
        let tracePOI = []
        for (let i = 0; i < traceList.length; i++) {
          tempp = []
          names = []
          for (let j = 0; j < traceList[i].trace.length; j++) {
            //获取所需景点id
            temp = data.filter((x) => {
              return x.attraction_id === traceList[i].trace[j]
            })
            names.push(temp[0].attraction_name)
            tempp.push([temp[0].attraction_lat, temp[0].attraction_lon])
            tracePOI.push({
              name: temp[0].attraction_name,
              id: temp[0].attraction_id,
              attraction_lat: temp[0].attraction_lat.toFixed(4),
              attraction_lon: temp[0].attraction_lon.toFixed(4)
            })
          }
          if (tempp !== []) {
            traceList[i].trace = tempp
            traceList[i].color = randomColor({luminosity: "dark"})
            traceList[i].colorStyle = {"background-color": traceList[i].color}
            traceList[i].attr_names = names
          }
        }
        this.userInfo.trace = traceList
        //生成轨迹-GeoJSON
        let traceGeoJSON = geojson.parse(traceList, {LineString: "trace", include: ["color"]})
        let traceGeoJSONback = geojson.parse(traceList, {LineString: "trace", include: []})
        //轨迹景点-GeoJSON
        let POIGeoJSON = geojson.parse(tracePOI, {Point: ["attraction_lon", "attraction_lat"], include: ["id", "name"]})
        //轨迹显示

        //杂项-背景图片的生成
        let backGroundGeoJSON = {
          "type": "FeatureCollection",
          "features": []
        }
        let newtraceFeature = traceGeoJSONback.features.filter(x => x.geometry.coordinates.length > 1)
        if (newtraceFeature.length >= 1) {
          backGroundGeoJSON.features = pointGeoJSONback.features.concat(newtraceFeature)
        } else {
          backGroundGeoJSON.features = pointGeoJSONback.features
        }
        console.log(backGroundGeoJSON)
        let tem = JSON.stringify(backGroundGeoJSON)
        this.backPic = `https://api.mapbox.com/styles/v1/joshuamwong/cku82uhhz09k018pdij5r2ml5/static/geojson(${tem})/auto/440x200?access_token=pk.eyJ1Ijoiam9zaHVhbXdvbmciLCJhIjoiY2tzaXRlOXcyMHVhNzJ2bnN4aG11NW10aiJ9.RdgXiHX8GNMNWTr2X92ruQ`
        console.log(this.userInfo)
        console.log(pointGeoJSON)
        this.map.on("load", () => {
          this.map.addLayer({
            id: "favorLayer",
            type: "symbol",
            source: {
              type: "geojson",
              data: pointGeoJSON
            },
            layout: {
              "text-field": "{attraction_name}",
              "text-anchor": "right",
              'text-font': ['Open Sans Bold'],
              "text-line-height": 1.2,
              "text-size": 12,
              "text-offset": [-1, 0],
            }
          })
        })

        this.map.on("load",()=>{
              this.map.addLayer({
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
                    'line-width': 2,
                    // 'line-gradient' must be specified using an expression
                    // with the special 'line-progress' property
                    'line-gradient': [
                      'interpolate',
                      ['linear'],
                      ['line-progress'],
                      0, "black",
                      0.1, "royalblue",
                      0.3, "cyan",
                      0.5, "lime",
                      0.7, "yellow",
                      1, "red"
                    ]
                  }
                })
                
              this.map.addLayer({
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
              this.map.loadImage(walkman,(error,image)=>{
                if(error){console.log(error)}
                else {
                  this.map.addImage("walkman", image)
                  this.map.addLayer({
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
  
      
        }},
    goto(lngLat) {
      this.map.flyTo({
        center: lngLat
        // zoom:14
      })
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
    handleClick_message() {
      this.get_data_messages();
    },
    async get_data_messages() {
      let get_messages = null
      let send_messages = null
      let that = this;
      let get_url = `http://121.5.235.15/api/v2/zhouyou/_table/xunyou_huifu?order=xyhf_date%20DESC&filter=(xyhf_user_id_ed=${that.$store.state.user_id})`;
      let send_url = `http://121.5.235.15/api/v2/zhouyou/_table/xunyou_huifu?order=xyhf_date%20DESC&filter=(xyhf_user_id=${that.$store.state.user_id})`;
      let p = {
        params: {
          api_key:
            "956eed8e98667eca2722be6afc37e123212466565cab5df2f7e653d206f3e3c0"
        }
      };
      let r01 = await axios.get(get_url, p);
      get_messages = await r01.data.resource;
      for (let i = 0; i < that.get_messages.length; i++) {
        let url = `http://121.5.235.15/api/v2/zhouyou/_table/users/${that.get_messages[i].xyhf_user_id}?fields=user_name%2Cuser_phone%2Cuser_email`;
        let r02 = await axios.get(url, p);
        get_messages[i].user_name = r02.data.user_name;
        get_messages[i].user_phone = r02.data.user_phone;
        get_messages[i].user_email = r02.data.user_email;
      }
      let r03 = await axios.get(send_url, p);
      send_messages = await r03.data.resource;
      for (let i = 0; i < that.send_messages.length; i++) {
        let url = `http://121.5.235.15/api/v2/zhouyou/_table/users/${that.send_messages[i].xyhf_user_id_ed}?fields=user_name`;
        let r04 = await axios.get(url, p);
        send_messages[i].user_name = r04.data.user_name;
      }
      this.get_messages = get_messages
      this.send_messages = send_messages
    },
    show_message() {
      this.dialogVisible_message = true;
      this.get_data_messages();
    },
    fabu() {
      let that = this;
      if (
        that.textarea2 === "" &&
        that.$store.state.xyjingdianID.length === 0
      ) {
        this.$message({
          message: "位置或文本不可为空",
          type: "warning"
        });
      } else {
        let xys = {
          resource: {
            xy_user_id: that.$store.state.user_id,
            xy_content: that.textarea2,
            xy_attractions: JSON.stringify({
              resource: that.$store.state.xyjingdianID
            }),
            date: Date.parse(new Date()).toString()
          }
        };
        let p = {
          params: {
            api_key:
              "956eed8e98667eca2722be6afc37e123212466565cab5df2f7e653d206f3e3c0"
          }
        };
        axios
          .post("http://121.5.235.15/api/v2/zhouyou/_table/xunyou", xys, p)
          .then(r => {
            that.$store.commit("remove_xy_data");
            that.textarea2 = "";
            setTimeout(() => {
              that.$refs.xy.initial();
            }, 100);
            that.AllFalse()
          })
          .catch(r => {
          });
      }
    },
    before_upload: function (file) {
      if (file) {
        this.have_files = true;
      }
    },
    success_handle: function (res) {
      if (res["on_off"] !== false) {
        let imgname =
          res["files"][0]["path"] +
          "." +
          res["files"][0]["originalname"].split(".").pop();
        let yb = {
          resource: {
            attraction_id: this.$store.state.jingdianID,
            user_id: this.$store.state.user_id,
            yb_content: this.textarea1,
            yb_imgs: imgname,
            yb_date: this.youbo_time.toString()
          }
        };
        let p = {
          params: {
            api_key:
              "956eed8e98667eca2722be6afc37e123212466565cab5df2f7e653d206f3e3c0"
          }
        };
        console.log('yb')
        console.log(yb)
        axios
          .post("http://121.5.235.15/api/v2/zhouyou/_table/yb", yb, p)
          .then(function (resp) {
          })
          .catch(function (resp) {
          });
      } else {
        this.$message({
          message: "发布失败",
          type: "error"
        });
      }
      setTimeout(() => this.$refs.timeline.initialData(), 100);
      this.AllFalse()
    },
    handleClick: function () {
      this.$refs.xy.initial();
      this.$refs.timeline.initialData();
    },
    handleRemove(file) {
      let uploadFiles = this.$refs.upload.uploadFiles;
      for (let i = 0; i < uploadFiles.length; i++) {
        if (uploadFiles[i]["url"] === file.url) {
          uploadFiles.splice(i, 1);
        }
      }
    },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },
    submitUpload() {
      this.youbo_time = Date.parse(new Date());
      if (this.$store.state.jingdianID !== null && this.textarea1 !== "") {
        this.$refs.upload.submit();
        if (this.have_files) {
          this.have_files = false;
          setTimeout(() => {
            this.$refs.upload.clearFiles();
            this.textarea1 = "";
          }, 100);
        } else {
          // 没有图片
          let yb = {
            resource: {
              attraction_id: this.$store.state.jingdianID,
              user_id: this.$store.state.user_id,
              yb_content: this.textarea1,
              yb_date: this.youbo_time.toString()
            }
          };
          let p = {
            params: {
              api_key:
                "956eed8e98667eca2722be6afc37e123212466565cab5df2f7e653d206f3e3c0"
            }
          };
          axios
            .post("http://121.5.235.15/api/v2/zhouyou/_table/yb", yb, p)
            .then(function (resp) {
            })
            .catch(function (resp) {
            });
          this.textarea1 = "";
        }
        this.AllFalse()
        setTimeout(() => this.$refs.timeline.initialData(), 100);
      } else {
        this.$message({
          message: "位置和文本不可为空",
          type: "warning"
        });
      }
    },
    deleteRow(index, rows) {
      this.$store.commit("remove_xy_jingdian", index);
    },
    readit(index) {
      console.log(1);
      console.log(this.send_messages);
      let that = this;
      that.send_messages;
      if (that.get_messages[index].xyhf_is_read === 1) {
        let url = `http://121.5.235.15/api/v2/zhouyou/_table/xunyou_huifu/${that.get_messages[index].xyhf_id}`;
        axios
          .put(
            url,
            {
              xyhf_is_read: 0
            },
            {
              params: {
                api_key:
                  "956eed8e98667eca2722be6afc37e123212466565cab5df2f7e653d206f3e3c0"
              }
            }
          )
          .then(r => {
            that.get_data_messages();
          })
          .catch(r => {
          });
      }
    }


  }
}
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


#leftall {
  width: fit-content;
  margin-left: 5%;
}

#rightall {
  width: fit-content;
  position: fixed;
  top: 11%;
  right: 0%;
  height: 75%;
  animation-delay: 1s;
  animation-name: rightallMove;
  animation-duration: 2s;
}

#rightDrag {
  /*position: fixed;*/
  /*cursor: pointer;*/
  /*left: 75%;*/
  height: 100%;
  float: right;
}

#rightflex {
  /*float: right;*/
  /*position: fixed;*/
  /*cursor: pointer;*/
  /*backdrop-filter: blur(2px);*/
  border-radius: 12px;
  /*position: absolute;*/
  /*z-index: 2;*/
  box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;

  /*display: flex;*/
  /*flex-direction: column-reverse;*/
  /*flex-wrap: wrap;*/
  /*align-content: stretch;*/
  /*align-items: flex-start;*/
  /*justify-content: flex-end;*/
  background-color: rgba(255, 255, 255, 0.4);
  height: 100%;

}
.editor-after-div >>> .el-upload {
  margin-top: 5px;
  width: 65px;
  height: 65px;
  text-align: center;
  line-height: 65px;
  margin-bottom: 5px;
}

.editor-after-div >>> .el-upload-list__item-thumbnail {
  width: 65px;
  height: 65px;
}
.editor-after-div >>> .el-upload-list__item {
  margin-top: 5px;
  width: 65px;
  height: 65px;
  margin-bottom: 5px;
}

#youyu {

  height: 90%;

}

#myInfo {
  width: fit-content;
  margin: 24px 2px;
  background-color: rgba(255, 255, 255, 0.8);
  box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
}

#favorAndtrace {
    -webkit-backdrop-filter: blur(5px);
    backdrop-filter: blur(5px);
    float: right;
    top: 5%;
    background-color: (255, 255, 255, 0.8);
    -webkit-box-shadow: rgb(100 100 111 / 20%) 0px 7px 29px 0px;
    box-shadow: rgb(100 100 111 / 20%) 0px 7px 29px 0px;
    border-radius: 12px;
    position: absolute;
    /* top: 15%; */
    width: 100%;
    left: -12%;
    }

/*#favorAndtrace:hover{*/
/*  background-color: rgba(255,255,255,0.8);*/
/*}*/
.content {
  width: 300px;
  height: 100%;
}

/*我的消息弹窗调整*/
/deep/ .el-dialog {
  margin-top: 16vh !important;
}

#yb {
  width: 100%;
  backdrop-filter: blur(2px);
  box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
}

#xy {
  width: 100%;
  height: 100%;
}

.favorite {
  display: flex;
  flex-wrap: wrap;
}

/*统一大小*/
.xyclass {
  height: 100%;
}

#yb {
  height: 100%;
}

.timeline {
  height: 100%;
}

#youyustart {

}

.favorButton {
  border: 1px solid black;
  border-radius: 12px;
  backdrop-filter: blur(2px);
  box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
  margin: 12px 5px;
}

.traceButton {
  border: 1px solid black;
  border-radius: 12px;
  backdrop-filter: blur(2px);
  box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
  margin: 12px 5px;
}

/deep/ .el-input__inner {
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
  -webkit-transition: border-color .2s cubic-bezier(.645, .045, .355, 1);
  transition: border-color .2s cubic-bezier(.645, .045, .355, 1);
  width: fit-content;
}

.funcButton {
  margin: 4px 18px;

}

#functionZone {
  color: #f5f5f7;

}

#headerFunctionZone {
  width: 100%;
  height: 40px;
  /*background-color: transparent;*/
  background-color: rgba(29, 29, 31, 0.72);
  box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
  backdrop-filter: blur(5px);
}

.sendChoiceHidden {
  display: none;
}

#sendPanel:hover .sendChoiceHidden {
  display: block;
  text-align: center;
  width: fit-content;
  height: fit-content;

  /*z-index: 4;*/
}

.sendButtonChoice {
  width: fit-content;
  background-color: #67C23A;
  border-radius: 12px;
  padding: 5px;
}

/deep/ .el-dialog {
  width: fit-content;
  min-width: 350px;
  background-color: rgba(255, 255, 255, 0.6);
  border-radius: 12px;
  backdrop-filter: blur(5px);
  box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
}

/deep/ .el-row {
  left: 0px;
}

.messagePanel {
  border-radius: 12px;
  backdrop-filter: blur(2px);
  text-align: left;
  background-color: transparent;
  margin: 16px 12px;
  padding: 10px;
  box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
}

.sendButton {
  text-align: center;
  z-index: 4;
}

#sendPanel {
  height: 10%;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -ms-flex-line-pack: justify;
  -ms-flex-wrap: wrap;
  flex-wrap: wrap;
  -webkit-box-orient: horizontal;
  -webkit-box-direction: normal;
  -ms-flex-direction: row;
  flex-direction: row;
  -webkit-box-pack: space-evenly;
  -ms-flex-pack: space-evenly;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-content: space-around;
  justify-content: space-evenly;
}
.flexbaby{
  display: flex;
  align-items: flex-end;
}
/deep/ .el-upload--picture-card {
  background-color: transparent !important;
  border: 1px solid black !important;
  border-radius: 6px;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  width: 148px;
  height: 148px;
  line-height: 146px;
  vertical-align: top;
}
/deep/ .el-input.is-disabled .el-input__inner {
  background-color: transparent !important;
  border:1px solid black !important;
  color: black !important;
  cursor: not-allowed;
}
/deep/ .el-textarea__inner {
  display: block;
  resize: vertical;
  padding: 5px 15px;
  line-height: 1.5;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  width: 100%;
  font-size: inherit;
  color: black !important;
  background-color: transparent !important;

  border: 1px solid black !important;
  border-radius: 4px;
  -webkit-transition: border-color .2s cubic-bezier(.645,.045,.355,1);
  transition: border-color .2s cubic-bezier(.645,.045,.355,1);
}
#youbosend {
  width: 300px;
  height: fit-content;
  backdrop-filter: blur(3px);
  box-shadow: rgb(100 100 111 / 20%) 0px 7px 29px 0px;
  margin-right: 20px;
  background-color: rgba(255,255,255,0.4);
}
/deep/ .el-table,

.el-table__expanded-cell {
  background-color: transparent;

}

/deep/.el-table th {
  background-color: transparent !important;

}

/deep/.el-table tr {
  background-color: transparent !important;

}
.previewImg{
  position: absolute;
  padding: 6px;
  /* width: 37%; */
  left: 23%;
  width: fit-content;
  background: transparent;

}
img.imgMe {
  width: 37%;
  height: 37%;

}
#youyustart{
  position: relative;
  left: 5%;
  top: 24%;
}
@keyframes rightallMove {
  from{
    right: 50%;
  }to{
  right: 0%;
     }

}
/* 变色了*/
.favorButton:active{
  box-shadow: none;
  border:none;
  font-size: 20px;
}
/deep/ .mapboxgl-popup-content{
  width: fit-content;
  height: fit-content;
  background-color: rgba(255,255,255,0.8);
  box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
  border-radius: 14px;

}
</style>
