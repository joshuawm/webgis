<template>
  <div id="godDamn">
    <div class="popup">
      <div class="basicinfos"  ref="basicinfo">
        <div style="width: fit-content;"><p>
          <el-image class="infoPic" :src="info.imgsrc" :key="info.imgsrc" alt="景点展示图片" v-if="more"></el-image>
        </p></div>
        <div class="name"><span>{{ info.title }}</span></div>
        <div class="name"><p class="cityy" v-if="info.city !== undefined">
          {{ info.city }}
          <span :style="covid19Notice">{{ covid19Area }}</span>
        </p></div>
        <div class="ratting">
          <template v-if="info.ratting !== null">
            <el-rate v-if="more" :value="info.ratting" disabled show-score text-color="#ff9900"
                     score-template="{value}" :texts="rattingText"></el-rate>
          </template>
          <template v-else><span>暂无评分</span></template>
        </div>
        <div v-if="more && popupInfo.typ==='attractions'"  class="tagsDisplay" >
          <div class="tagTangle" v-for="tag in info.tags" :key="tag">
            <span class="tagText">&nbsp;{{ tag }}&nbsp;</span>
          </div>
        </div>
      </div>


      <div class="moreinfos" v-if="more">
        <template v-if="attractionmore">
          <el-row>
            <el-col :span="3.8">
              <el-button type="text" @click="morechoice('desc')" :disabled="buttonactive.desc">简介</el-button>
            </el-col>
            <el-col :span="6.8">
              <el-button type="text" @click="morechoice('spend')" :disabled="buttonactive.spend">游玩时间</el-button>
            </el-col>
            <el-col :span="6.8">
              <el-button type="text" @click="morechoice('policy')" :disabled="buttonactive.policy">景区政策</el-button>
            </el-col>
            <el-col :span="6.8">
              <el-button @click="morechoice('price')" type="text" :disabled="buttonactive.price">票价</el-button>
            </el-col>
          </el-row>

          <el-scrollbar style="text-align:left; margin:1px 1px; height: 150px; width: 90%;" tag="span">
            <span>{{ moreContentCom }}</span>
            <div v-if="openComment" class="comment" >
              <timeline :id="this.popupInfo.id"></timeline>
            </div>
          </el-scrollbar>

          <!--      <p v-if="info.desc">简介: {{info.desc}}</p>-->
          <!--      <p v-if="info.spend">游玩时间:{{info.spend}}</p>-->
          <!--      <p v-if="info.policy">景区政策:{{info.policy}}</p>-->
          <!--      <p v-if="info.price">票价:{{info.price}}</p>-->
        </template>
      </div>
      <div v-if="popupInfo.typ==='attractions'" class="moreChoice">
        <div class="choiceFlex" >
          <el-button @click="moreinfo" type="text"><span class="el-icon-more"></span>{{ moreText }}</el-button>

          <el-button v-if="more" @click="commentButton" type="text"><span class="el-icon-chat-dot-square"></span>评论</el-button>
          <el-button  @click="appendto" type="text"><span class="el-icon-circle-plus-outline"></span>{{appendtoanlysis}}</el-button>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import axios from "axios"
import GeoJSON from "geojson"
import timeline from "./timeline";

let dic = {
  attraction: {
    id: "attraction_id",
    name: "attraction_name",
    imgsrc: "attraction_gallery",
    rating: "attraction_ratting",
    tags: "attraction_tags",
    shortdesc: "attraction_feature",
    lat: "attraction_lat",
    lng: "attraction_lng",
    spend: "attraction_play_spend_time",
    desc: "attraction_description",
    policy: "attraction_special_policy",
    price: "attraction_price",
    city: "attraction_city"

  },
  catering: {
    id: "catering_id",
    name: "catering_name",
    imgsrc: "catering_img",
    rating: "catering_score",
    tags: "catering_type",
    shortdesc: "attraction_feature",
    lat: "catering_lat",
    lng: "catering_lon",
    spend: "attraction_play_spend_time",
    desc: "attraction_description",
    policy: "attraction_special_policy",
    price: "catering_avg_price",
    city: "attraction_city"
  },
  hotels: {
    id: "hotel_id",
    name: "hotel_name",
    imgsrc: "hotel_img",
    rating: "hotel_score",
    tags: "hotel_star",
    shortdesc: "attraction_feature",
    lat: "hotel_lat",
    lng: "hotel_lon",
    address: "hotel_address",
    spend: "attraction_play_spend_time",
    desc: "attraction_description",
    policy: "attraction_special_policy",
    price: "attraction_price",
    city: "attraction_city"

  }
}


export default {
  name: "popupcontent",
  props: {
    infos: {
      type: Object
    }
  },
  data() {
    return {
      more: false,
      morecontent: "",
      openComment: false,
      commentContent: "",
      commentsList: {},
      basicShow:true,
      buttonactive: {
        desc: true,
        spend: false,
        policy: false,
        price: false,
        FavoriteActive: null
      },
      covid19Area: "低风险",
      attractionmore: false,
      moreText: "更多",
      info: {
        title: "example",
        tags: ["tag1", "tag2"],
        imgsrc: "https://www.google.com.hk/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png",
        ratting: 0
      },
      colors: ['#99A9BF', '#F7BA2A', '#FF9900'],
      ratting: null,
      rattingText: ['极差', '失望', '一般', '满意', '惊喜'],
      appendtoanlysis:"分析",
    }
  },
  methods: {
    async getInfo() {
      console.log(this.popupInfo)
      let requestsURL
      let queryword
      if (this.popupInfo.typ === "attractions") {
        requestsURL = `http://121.5.235.15/api/v2/zhouyou/_table/Attractions?fields=*&filter=${dic.attraction.id}=${this.popupInfo.id.toString()}&limit=10`
        queryword = "attraction"
      } else if (this.popupInfo.typ === "caterings") {
        console.log("caterings")
        requestsURL = `http://121.5.235.15/api/v2/zhouyou/_table/Caterings?fields=*&filter=${dic.catering.id}=${this.popupInfo.id.toString()}&limit=10`
        queryword = "catering"
      } else if (this.popupInfo.typ === "hotels") {
        requestsURL = `http://121.5.235.15/api/v2/zhouyou/_table/Hotels?fields=*&filter=${dic.hotels.id}=${this.popupInfo.id.toString()}&limit=10`
        queryword = "hotels"
      }
      console.log(requestsURL)
      let response = await axios.get(requestsURL,
        {
          params: {
            api_key: '956eed8e98667eca2722be6afc37e123212466565cab5df2f7e653d206f3e3c0'
          }
        })
      if (response.data !== undefined) {
        let m = response.data.resource[0]
        if (m !== undefined) {
          this.info.title = m[dic[queryword].name]
          this.info.imgsrc = m[dic[queryword].imgsrc]
          this.info.ratting = m[dic[queryword].rating]
          this.info.tags = m[dic[queryword].tags] === null ? [] : m[dic[queryword].tags].split("|")
          this.info.shotdesc = m[dic[queryword].shortdesc]
          this.info.spend = m[dic[queryword].spend]
          this.info.desc = m[dic[queryword].desc]
          this.info.price = m[dic[queryword].price]
          this.info.policy = m[dic[queryword].policy]
          this.info.city = m[dic[queryword].city]

        }
      }
      console.log(this.info)
      if (this.popupInfo.typ === "attractions") {
        this.attractionmore = true
      }
      this.covid19AreaCom()
      if (this.popupInfo.typ != "attractions") {
        this.moreinfo()
      }
    },
    moreinfo() {
      this.more = !this.more
      this.morecontent = this.info.desc
      this.more ? this.moreText = "收起" : this.moreText = "更多"
      if(!this.more){this.openComment=false}
      // if (this.popupInfo.typ === "attractions") {
      //   this.openComment = !this.openComment
      // }

    },
    morechoice(type) {
      this.morecontent = this.info[type]
      //全部变成false(全部激活button)
      this.buttonactive.desc = false
      this.buttonactive.spend = false
      this.buttonactive.policy = false
      this.buttonactive.price = false
      //再改变个别
      this.buttonactive[type] = true
    },
    addFavorite() {
      let that = this
      if (this.buttonactive.FavoriteActive === "收藏") {
        this.buttonactive.FavoriteActive = "取消收藏"
        //this.userID this.poiID
        axios.post('http://121.5.235.15/api/v2/zhouyou/_table/attraction_favorites', {
          resource: [{
            user_id: that.userID,
            attraction_id: that.popupInfo.id
          }]
        }, {
          params: {
            api_key: '956eed8e98667eca2722be6afc37e123212466565cab5df2f7e653d206f3e3c0'
          }
        }).then(r => {
          console.log("favorite works")
        }).catch(r => {
          console.log("fail to favorite")
        })
        // this.$store.commit("favoriteChange","add",this.poiID)
      } else if (this.buttonactive.FavoriteActive === "取消收藏") {
        let url = 'http://121.5.235.15/api/v2/zhouyou/_table/attraction_favorites?filter=(user_id%20=%20' + that.userID + ')%20AND%20(attraction_id%20=%20' + that.popupInfo.id + ')'
        axios.delete(url, {
          params: {
            api_key: '956eed8e98667eca2722be6afc37e123212466565cab5df2f7e653d206f3e3c0'
          }
        }).then(r => {
        }).catch(r => {
        })
        this.buttonactive.FavoriteActive = "收藏"
        // this.$store.commit("favoriteChange","delete",this.poiID)
      }
    },
    async isFavorite() {

      let res = await axios.get(`http://121.5.235.15/api/v2/zhouyou/_table/attraction_favorites?fields=attraction_id&filter=user_id=${this.userID}`, {
        params: {
          api_key: '956eed8e98667eca2722be6afc37e123212466565cab5df2f7e653d206f3e3c0'
        }
      })
      let list = await res.data.resource.map(x => x.attraction_id)
      if (list.indexOf(this.poiID) > -1) {
        this.buttonactive.FavoriteActive = "取消收藏"
        console.log("收藏了")
      } else {
        this.buttonactive.FavoriteActive = "收藏"
        console.log("没收藏")
      }
    },
    covid19AreaCom() {
      if (this.info.city !== undefined) {
        axios.get("https://diqu.gezhong.vip/api.php").then((res) => {
          console.log(res)
          //先判断省份一致
          let ree = RegExp(this.info.city)
          let highcity = res.data.data.highlist.filter(x => /湖北/.test(x.province) && ree.test(`湖北-${x.city}`))
          console.log(highcity)
          if (highcity.length > 0) {
            console.log("高了")
            this.covid19Area = "高风险"
          } else {
            let medcity = res.data.data.middlelist.filter(x => /湖北/.test(x.province) && ree.test(`湖北-${x.city}`))
            if (medcity.length > 0) {
              this.covid19Area = "中风险"
            } else {
              this.covid19Area = "低风险"
            }
          }
        })
      } else {
        this.covid19Area = "暂无数据"
      }
    },
    commentSubmit() {
      console.log(this.commentContent)
    },
    //单个景点的数据传递  通过景点的ID
    appendto(){
      alert("确定将此景点添加至分析列表？")
      this.$EventBus.$emit("bridge",this.poiID)
    },
    //获取餐饮数据
    async get_caterings(poiID) {
      let requestsURL = `http://121.5.235.15/api/v2/zhouyou/_table/caterings?filter=attraction_id=${poiID.toString()}` //获取与当前poiID景点绑定的美食店的详细数据
      let requestsURL2 = `http://121.5.235.15/api/v2/zhouyou/_table/caterings?filter=attraction_id=${poiID.toString()}&count_only=true`  //   获取与当前poiID景点共有几家美食店，只返回美食店的数量
      //http://121.5.235.15/api/v2/zhouyou/_table/caterings?filter=attraction_id=1&api_key=956eed8e98667eca2722be6afc37e123212466565cab5df2f7e653d206f3e3c0


      //这部分为获取美食店的数量
      let response2 = await axios.get(requestsURL2,
        {
          params: {
            api_key: '956eed8e98667eca2722be6afc37e123212466565cab5df2f7e653d206f3e3c0'
          }
        })
      let caterings_number = response2.data //该景点附近美食店的数量
      console.log("有几家美食店:   " + caterings_number);

      //这部分为获取美食店的地理位置和详细信息
      let response = await axios.get(requestsURL,
        {
          params: {
            api_key: '956eed8e98667eca2722be6afc37e123212466565cab5df2f7e653d206f3e3c0'
          }
        })

      let get_caterings_data = response.data.resource


      get_caterings_data = GeoJSON.parse(get_caterings_data, {Point: ['catering_lon', 'catering_lat']})//get_caterings_data已经更新为GeoJson数据格式


      //此部分为传输美食的坐标，将其显示
      let data = {}
      data.theid = "meishiSource"
      data.geojson = get_caterings_data
      this.$EventBus.$emit("update", data)


      console.log(get_caterings_data)

      if (response.data !== undefined) {
        let m = response.data.resource[0]                      //response.data是美食店的相关数据
        if (m !== undefined) {
          console.log("美食店名字：" + m.catering_name)

        }
      }

    },

    /****************获取酒店数据*************************/
    async get_hotels(poiID) {

      //这部分为再次通过poiID获取酒店的数据
      let requestsURL3 = `http://121.5.235.15/api/v2/zhouyou/_table/Attractions?fields=*&filter=attraction_id=${poiID.toString()}&limit=10`//获取酒店数据的URL
      let response = await axios.get(requestsURL3,
        {
          params: {
            api_key: '956eed8e98667eca2722be6afc37e123212466565cab5df2f7e653d206f3e3c0'
          }
        })

      if (response.data !== undefined) {
        var new_attraction_name = response.data.resource[0].attraction_name

      }
      console.log("当前景点名字是这个：" + new_attraction_name)


      let requestsURL = `http://121.5.235.15/api/v2/zhouyou/_table/hotels?filter=hotel_poi=${encodeURI(new_attraction_name).toString()}` //获取与当前poiID景点绑定的酒店的详细数据
      let requestsURL2 = `http://121.5.235.15/api/v2/zhouyou/_table/hotels?filter=hotel_poi=${encodeURI(new_attraction_name).toString()}&count_only=true`  //   获取与当前poiID景点共有几家酒店，只返回酒店的数量


      //这部分为获取酒店的数量
      let response3 = await axios.get(requestsURL2,
        {
          params: {
            api_key: '956eed8e98667eca2722be6afc37e123212466565cab5df2f7e653d206f3e3c0'
          }
        })
      let hotels_number = response3.data //该景点附近酒店的数量
      console.log("有几家酒店:  " + hotels_number);


      //这部分为获取酒店地理位置和详细信息
      let response2 = await axios.get(requestsURL,
        {
          params: {
            api_key: '956eed8e98667eca2722be6afc37e123212466565cab5df2f7e653d206f3e3c0'
          }
        })

      let get_hotels_data = response2.data.resource
      get_hotels_data = GeoJSON.parse(get_hotels_data, {Point: ['hotel_lon', 'hotel_lat']})//get_hotels_data已经更新为GeoJson数据格式


      //此部分为传输酒店的坐标，将其显示
      let data = {}
      data.theid = "jiudianSource"
      data.geojson = get_hotels_data
      this.$EventBus.$emit("update", data)

      console.log(get_hotels_data)

      if (response2.data !== undefined) {                      //response2.data是酒店的相关数据
        let m = response2.data.resource[0]
        if (m !== undefined) {
          console.log("酒店名字：" + m.hotel_name)

        }
      }

    },
    commentButton(){
      this.openComment=!this.openComment
      if(this.openComment){
        if (this.more){
          this.morechoice('desc')
          this.morecontent=""
          this.buttonactive.desc=false
        }
      }
      else{
        if(this.more){
          this.morechoice("desc")
        }
      }
    }
  },
  computed: {
    covid19Notice() {
      if (this.covid19Area === "低风险") {
        return {
          "color": "green"
        }
      } else if (this.covid19Area === "中风险") {
        return {
          "color": "orange"
        }
      } else if (this.covid19Area === "高分险") {
        return {
          "color": "red"
        }
      } else if (this.covid19Area === "数据不全") {
        return {
          "display": "none"
        }
      }
    },
    moreContentCom() {
      if (this.morecontent === null) {
        return "暂无"
      } else {
        return this.morecontent
      }
    }

  },
  async mounted() {
    this.popupInfo = await this.infos.infos
    await console.log(this.popupInfo)
    this.poiID=this.popupInfo.id
    this.userID = this.popupInfo.userID
    console.log(this.userID)
    this.getInfo()
    this.isFavorite()
    console.log(this.buttonactive)
    await console.log(this.popupInfo)
  },
  components: {
    timeline
  },
  watch:{
  }


}
</script>

<style scoped>
@import url("//unpkg.com/element-ui@2.3.9/lib/theme-chalk/index.css");

.popup {
  max-height: 450px;
  min-width: 200px;
  width: 315px;
}
#godDamn{
  display: block;
  background-color: transparent;
  backdrop-filter: blur(2px);
  border-radius: 14px;
}
.moreinfos {
  width: 100%;
  height: auto;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  align-content: center;
  justify-content: center;
  align-items: center;
}

.basicinfos {
  width: 100%;
  height: 30%;
  text-align: center;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  align-content: center;
  justify-content: center;
  align-items: center;
}

.name {
  font-family: "Microsoft YaHei";
  font-weight: bold;
  font-size: large;
}

.tags {
  font-family: "Microsoft YaHei";
  color: #545c64;
}

.favor {
  width: 20%;
  height: 20%;
}
/deep/ .el-row {
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  background-color: transparent !important;
  left: 0px;
  width: fit-content;
}
.infoPic {
  height: 100px;
}

.comment {
  position: relative;
  max-height: 450px;
  min-width: 200px;
  margin: 6px 2px;

}
/deep/ .el-scrollbar__bar.is-horizontal .el-scrollbar__thumb{
  display: none !important;
}
/deep/ .el-scrollbar__bar.is-vertical .el-scrollbar__thumb{
  display: none !important;
}
.commentSubmitButton {
  width: 3rem;
  height: 1.5rem;
  background-color: white;
  border: 1px solid black;
  border-radius: 12px;
  align-content: end;
}

.commentTimeline {
  position: absolute;
  height: 70%;
}
.moreChoice .el-row{
  width: 100%;
  left:2px;
}
div.tagsDisplay {
  display: flex;
  /* flex-direction: column; */
}
.tagTangle {
  background-color: transparent;
  border: 1px solid gray;
  border-radius: 6px;
  transform: scale(0.8);
  margin: -1px -2px;
  box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
}

span.tagText {
  font-size: x-small;
  font-weight: normal;
  font-family: 'Microsoft Yahei', 'Times New Roman', Times, serif;
}
.cityy{
  font-size: 4px;
  margin-left: 2px;
}
.choiceFlex{
  display: inline-flex;
}
/deep/ .mapboxgl-popup-close-button{
  transform: scale3d(1.5,1.5,1.5);
}
/deep/ .el-scrollbar__wrap {
  overflow: auto !important;
}
</style>

<!--//info document:-->
<!--info.title 景点名称-->
<!--info.imageSrc:景点图片的链接-->
<!--info.desc:景点简介-->
<!--info.price:景点价格-->
<!--info.tags:景点标签 是个array-->
<!--info.contentList:景点内容列表-->
