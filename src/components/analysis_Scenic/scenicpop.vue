<template>
  <div id="godDamn">
  <div class="popup">
    <div class="basicinfos">
  <el-row >
    <el-col :span="24">
      <el-image class="infoPic" :src="info.imgsrc"  :key="info.imgsrc" alt="景点展示图片" v-if="more"></el-image>
    </el-col>
  </el-row>

  <el-row>
    <el-col :span="24">
      <el-row>
        <el-col :span="20"><div class="name"><span >{{info.title}}</span></div></el-col>
      </el-row>
      <template v-if="info.ratting !== undefined"><el-rate v-if="more" :value="info.ratting" disabled show-score text-color="#ff9900" score-template="{value}"></el-rate></template>
      <el-row>
      <el-col :span="20">
        <p v-if="info.city !== undefined">
          {{info.city}}
          <span :style="covid19Notice">{{covid19Area}}</span>
        </p>

      </el-col>
     <el-col :span="4"><el-button type="text" @click="addFavorite">{{buttonactive.FavoriteActive}}</el-button></el-col>
      </el-row>
      <template v-if="info.shotdesc !== undefined" ><span v-if="!more">{{info.shotdesc}}</span></template>
    </el-col>
  </el-row>
  </div>
<!--    </el-col>-->

    <div class="moreinfos" v-if="more">
      <template v-if="attractionmore">
      <el-row>
        <el-col :span="3.8"><el-button type="text" @click="morechoice('desc')" :disabled="buttonactive.desc">简介</el-button> </el-col>
        <el-col :span="6.8"><el-button type="text" @click="morechoice('spend')" :disabled="buttonactive.spend" >游玩时间</el-button> </el-col>
        <el-col :span="6.8"><el-button type="text" @click="morechoice('policy')" :disabled="buttonactive.policy" >景区政策</el-button> </el-col>
        <el-col :span="6.8"><el-button @click="morechoice('price')" type="text" :disabled="buttonactive.price" >票价</el-button> </el-col>
      </el-row>

      <el-scrollbar style="height: 150px; width: auto;" tag="span"><span>{{moreContentCom}}</span></el-scrollbar>

<!--      <p v-if="info.desc">简介: {{info.desc}}</p>-->
<!--      <p v-if="info.spend">游玩时间:{{info.spend}}</p>-->
<!--      <p v-if="info.policy">景区政策:{{info.policy}}</p>-->
<!--      <p v-if="info.price">票价:{{info.price}}</p>-->
      </template>
    </div>

    <el-row>
      <el-col :span="4"><el-button  @click="moreinfo" type="text">{{moreText}}</el-button></el-col>
    </el-row>

  </div>

  </div>

</template>

<script>
import axios from "axios"

let dic ={
  attraction:{
    id:"attraction_id",
    name:"attraction_name",
    imgsrc: "attraction_gallery",
    rating: "attraction_ratting",
    tags:"attraction_tags",
    shortdesc:"attraction_feature",
    lat:"attraction_lat",
    lng:"attraction_lng",
    spend:"attraction_play_spend_time",
    desc:"attraction_description",
    policy:"attraction_special_policy",
    price:"attraction_price",
    city:"attraction_city"

  },
}


export default {
  name: "popupcontent",
  props:{
    popupInfo:{
      type:Object
    }
  },
  data(){
    return{
      more:false,
      morecontent:"",
      openComment:false,
      commentContent:"",
      commentsList:{},
      buttonactive:{
        desc:true,
        spend: false,
        policy:false,
        price: false,
        FavoriteActive:undefined
      },
      covid19Area:"低风险",
      attractionmore:false,
      moreText:"更多",
      info:{
        title:"example",
        tags:["tag1","tag2"],
        imgsrc: "https://www.google.com.hk/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png",
        ratting:0
      }
    }
  },
  methods:{
    async getInfo(poiID){
      let requestsURL
      let queryword
      if(this.popupInfo.type="attractions"){
        requestsURL= `http://121.5.235.15/api/v2/zhouyou/_table/Attractions?fields=*&filter=${dic.attraction.id}=${this.popupInfo.id}&limit=10`
        queryword="attraction"
      }
      console.log(requestsURL)
      let response =  await axios.get(requestsURL,
        {
          params: {
            api_key: '956eed8e98667eca2722be6afc37e123212466565cab5df2f7e653d206f3e3c0'
          }
        })
      if (response.data !== undefined){
        let m= response.data.resource[0]
        if(m !== undefined){
          this.info.title=m[dic[queryword].name]
          this.info.imgsrc=m[dic[queryword].imgsrc]
          this.info.ratting = m[dic[queryword].rating]
          this.info.tags= m[dic[queryword].tags]===null?[]:m[dic[queryword].tags].split("|")
          this.info.shotdesc=m[dic[queryword].shortdesc]
          this.info.spend=m[dic[queryword].spend]
          this.info.desc=m[dic[queryword].desc]
          this.info.price=m[dic[queryword].price]
          this.info.policy=m[dic[queryword].policy]
          this.info.city=m[dic[queryword].city]

        }
      }

      if(this.popupInfo.type === "attractions"){
        this.attractionmore=true
        console.log(this.attractionmore)
      }
      this.covid19AreaCom()
    },
    moreinfo(){
      this.more = !this.more
      this.morecontent=this.info.desc
      this.more ? this.moreText="收起":this.moreText="更多"
    },
    morechoice(type){
      this.morecontent=this.info[type]
      //全部变成false(全部激活button)
      this.buttonactive.desc=false
      this.buttonactive.spend=false
      this.buttonactive.policy=false
      this.buttonactive.price=false
      //再改变个别
      this.buttonactive[type]=true
    },
    addFavorite(){
      if(this.buttonactive.FavoriteActive==="收藏"){
      this.buttonactive.FavoriteActive="取消收藏"
      this.$store.commit("favoriteChange","add",this.poiID)
      }else if(this.buttonactive.FavoriteActive==="取消收藏"){
        this.buttonactive.FavoriteActive="收藏"
        this.$store.commit("favoriteChange","delete",this.poiID)
      }
    },
    isFavorite(){
      let list = JSON.parse(this.$store.state.favorite)
      if(list.indexOf(this.poiID) > -1){
        this.buttonactive.FavoriteActive="取消收藏"
      }else{
        this.buttonactive.FavoriteActive="收藏"
      }
    },
    covid19AreaCom(){
      if(this.info.city !== undefined){
        axios.get("https://diqu.gezhong.vip/api.php").then((res)=>{
          console.log(res)
          //先判断省份一致
          let ree = RegExp(this.info.city)
          let highcity = res.data.data.highlist.filter(x=>/湖北/.test(x.province) && ree.test(`湖北-${x.city}`))
          console.log(highcity)
          if(highcity.length>0){
            console.log("高了")
            this.covid19Area= "高风险"
          }else{
            let medcity = res.data.data.middlelist.filter(x=>/湖北/.test(x.province) && ree.test(`湖北-${x.city}`))
            if(medcity.length>0){
              this.covid19Area= "中风险"
            }else{
              this.covid19Area="低风险"
            }
          }
        })
      }
      else {
        this.covid19Area="数据不全"
      }
    },
    commentSubmit(){
      console.log(this.commentContent)
    },


  },
  computed:{
    covid19Notice(){
      if(this.covid19Area==="低风险"){
        return{
          "color":"green"
        }
      }else if(this.covid19Area==="中风险"){
        return {
          "color":"orange"
        }
      }else if(this.covid19Area === "高分险"){
        return {
          "color":"red"
        }
      }else if(this.covid19Area === "数据不全"){
        return {
          "display":"none"
        }
      }
    },
    moreContentCom(){
      if(this.morecontent===null){
        return "暂无"
      }else{
        return this.morecontent
      }
    }

  },
  mounted() {
    this.getInfo(this.poiID)
    // this.isFavorite()

  }


}
</script>

<style scoped>
@import url("//unpkg.com/element-ui@2.3.9/lib/theme-chalk/index.css");
.popup{
  max-height: 400px;
  min-width: 200px;
}

.moreinfos{
  max-width: 200px;
  height: auto;
}
.basicinfos{
  max-width: 200px;
}

.name{
  font-family: "Microsoft YaHei";
  font-weight: bold;
  font-size: large;
}
.tags{
  font-family: "Microsoft YaHei";
  color: #545c64;
}
.favor{
  width: 20%;
  height: 20%;
}
.infoPic{
  height: 100px;
}

.comment{
  max-height: 400px;
  min-width: 200px;
  margin: 6px 2px;
}
#godDamn{
  display: flex;
  justify-content: flex-start;
}
.commentSubmitButton{
  width: 6rem;
  height: 2rem;
  background-color: white;
  border: white;
  border-radius: 3px;
}
.commentList{
  background-color: beige;
  border: 2px solid white;
}
</style>

<!--//info document:-->
<!--info.title 景点名称-->
<!--info.imageSrc:景点图片的链接-->
<!--info.desc:景点简介-->
<!--info.price:景点价格-->
<!--info.tags:景点标签 是个array-->
<!--info.contentList:景点内容列表-->
