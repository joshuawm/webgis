<template>
<div id="echarts">
  <div id="allDisplay">
  <!-- <div class="littleButton" v-for="op in options"><button @click="buttonProcess(op)">{{op.name}}</button></div> -->
<!--  <p style="font-weight: bold;font-family: 'Microsoft Yahei', 'Times New Roman', Times, serif;font-size: 20px;text-align: center;margin: 2px 4px;">{{displayTitle}}</p>-->
    <p style="font-weight: bold;font-family: 'Microsoft Yahei', 'Times New Roman', Times, serif;font-size: 20px;text-align: center;margin: 2px 4px;">景点价格评分分析图</p>
  <div class="littleButton">
    <div class="littleButtonZone">
<!--    <span style="margin: 2px 4px">区域</span>-->
    <button v-if="ButtonActive.dataType" ref="jingdian" @click="buttonProcess('景点')">景点</button>
    <button v-if="ButtonActive.dataType" ref="meishi"  @click="buttonProcess('美食')">景点附近美食</button>
    </div>
    <div class="littleButtonZone">
<!--      <span style="margin: 2px 4px">类型</span>-->
    <button v-if="ButtonActive.type"  ref="jiage"  @click="buttonProcess('价格')">价格分析</button>
    <button v-if="ButtonActive.type" ref="pingfen"  @click="buttonProcess('评分')">评分分析</button>
    <!-- <button v-if="ButtonActive.style" @click="buttonProcess('单个')">单个</button> -->
    <button v-if="ButtonActive.style" ref="zonghe"  @click="buttonProcess('综合')">价格评分综合分析</button>
    </div>

  </div>
  <div>
  </div>
  <!--    删除按钮-->
  <div>
    <div class="poiButtons">
  <div style="margin: 1px 2px" v-for="item in POIname" :key="item.name" class="buttonDisplay">
    <span style="margin: 5px 5px;font-family: 'Microsoft Yahei', 'Times New Roman', Times, serif;font-weight: normal;font-size: 12px;">&nbsp;{{item.name}}</span><button :disabled="id.length===1?true:false" class="el-icon-circle-close deletebutton" @click="deletePOI(item.id)"></button>
  </div>
      <div class="buttonDisplay searchicon"  @click="searchbarActive=!searchbarActive" ><span style="margin: 5px 1px;font-size: 12px;" class="el-icon-search"></span></div>
      <div v-if="searchbarActive" class="buttonDisplay" > <div class="globalinput"><global-input /></div></div>
    </div></div>
  <div class="chartsdisplay"><div id="scorePrice"></div></div>
  </div>
</div>
</template>

<script>
import GlobalInput from "./globalInput"
import * as echarts from "echarts"
import axios from "axios"

  // 比较函数
function compare(p){
    return function (m,n){
        return n[p]-m[p]}}


// //价格从大排序
// let i ="http://121.5.235.15/api/v2/zhouyou/_table/Caterings?limit=10&order=catering_avg_price%20DESC"
// //评分从大排序
// let p ="http://121.5.235.15/api/v2/zhouyou/_table/Caterings?limit=10&order=catering_score%20DESC"
export default {
  name: "echarts",
  props:{

  },
  data(){
    return {
      Chart: null,
      id:[12],
      globalData:undefined,
      displayTitle:"",
      searchbarActive:false,
      POIname:[],
      op:{
        dataType:"Caterings",
        type:"catering_score",
        style:"AOI",
        refresh:true
      },
      ButtonActive:{
        dataType:true, // 美食 酒店
        type:true,  // 评分 价格
        style:true // 单个 综合
      },
      dataStore:{
        "Caterings":{
          "score":"catering_score",
          "price":"catering_avg_price",
          "name":"catering_name"
        },
        "Hotels":{
          "score":"hotel_score",
          "price":"hotel_avg_price",
          "name":"hotel_name"
        },
        "Attractions":{
          "price":"attraction_price",
          "score":"attraction_ratting",
          "name":"attraction_name"
        }
      },
      options: [
        {
          name: "价格前50",
          url: "http://121.5.235.15/api/v2/zhouyou/_table/Caterings?limit=50&order=catering_avg_price%20DESC",
          title: "湖北省餐饮价格前50排名",
          active: false
        },
        {
          name: "价格前10",
          url: "http://121.5.235.15/api/v2/zhouyou/_table/Caterings?limit=10&order=catering_avg_price%20DESC",
          title: "湖北省餐饮价格前10排名",
          active: false
        }
        // {
        //   name: "评分前50",
        //   url: "http://121.5.235.15/api/v2/zhouyou/_table/Caterings?limit=50&order=catering_score%20DESC",
        //   title: "湖北省餐饮评分前50排名(100分制)",
        //   active: false
        // },
        // {
        //   name: "评分前10",
        //   url: "http://121.5.235.15/api/v2/zhouyou/_table/Caterings?limit=10&order=catering_score%20DESC",
        //   title: "湖北省餐饮评分前10排名(100分制)",
        //   active: false
        // }
      ],
      basedata: {
        price: null,
        score: null,
        legend: null
      },
      AOIoption: {
        title: {
          text: '',
          left: '15%'
        },
        tooltip: {
          trigger: 'axis'
        },
        grid: {
          left: '5%',
          right: '15%',
          bottom: '10%'
        },
        xAxis: {
          data: null
        },
        yAxis: {},
        toolbox: {
          right: 10,
          feature: {
            dataZoom: {
              yAxisIndex: 'none'
            },
            restore: {},
            saveAsImage: {}
          }
        },
        visualMap: {
          top: 50,
          right: 10,
          pieces: [{
            gt: 0,
            lte: 20,
            color: '#93CE07'
          }, {
            gt: 20,
            lte: 40,
            color: '#FBDB0F'
          }, {
            gt: 40,
            lte: 60,
            color: '#FC7D02'
          }, {
            gt: 60,
            lte: 80,
            color: '#FD0100'
          }, {
            gt: 80,
            lte: 100,
            color: '#AA069F'
          }, {
            gt: 100,
            color: '#AC3B2A'
          }],
          outOfRange: {
            color: '#999'
          }
        },
        series: []
      },
      barStackOption: {
        tooltip: {
          trigger: 'axis',
          axisPointer: {            // Use axis to trigger tooltip
            type: 'shadow'        // 'shadow' as default; can also be 'line' or 'shadow'
          }
        },
        title:{
          text:"",
          left:"15%"
        },
        legend: {
          data: null
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'value'
        },
        yAxis: {
          type: 'category',
          data: null
        },
        series: []
      },
      clickedColor:"#add8e6",
      unclickColor:"transparent",
      clickedText:"#f5f5f7",
      uncliedText:"#000000"
    }
  },
  components:{
    GlobalInput
  },
  async mounted() {
    this.$EventBus.$on("newID",(value)=>{
      if(value.length>0){
        this.id=value
        this.refreshMydata()
      }
    })
    this.Chart =echarts.init(document.getElementById("scorePrice"))
    // await this.getData("http://121.5.235.15/api/v2/zhouyou/_table/Caterings?limit=50&order=catering_avg_price%20DESC","global")
    let ress = await axios.get("http://121.5.235.15/api/v2/zhouyou/_table/attractions?fields=attraction_id&limit=3&order=attraction_ratting%20DESC",{
      params: {
        api_key: '956eed8e98667eca2722be6afc37e123212466565cab5df2f7e653d206f3e3c0'
      }
    })
    this.id=await ress.data.resource.map(x=>x.attraction_id)
    await this.refreshMydata()

    this.$EventBus.$on("selectChange",async (data)=>{
      if(typeof data === "number"){
        console.log(this.id.indexOf(data))
        if(this.id.indexOf(data)===-1){
          console.log(data)
          this.id.push(data)
          await this.refreshMydata()
        }
        console.log(this.id)
        console.log(this.POIname)
      }else {
        console.log("传参不是数字 nothing happens")
      }

    })

    this.$EventBus.$on("delete",async (data)=>{
      await this.deletePOI(data)
    })

    this.whatsmystyle()
  },
  methods:{
    async refreshMydata(){
          let attrId=""
          let requestsURL
          for (let index =0;index<this.id.length;index++){
            if(index===0){
                attrId=`(attraction_id=${this.id[index]})`
            }else if(index > 0){
              attrId=`${attrId} OR (attraction_id=${this.id[index]})`
            }
          }
          let temp=[]
          for (let key in this.dataStore[this.op.dataType]){
            temp.push(this.dataStore[this.op.dataType][key])
          }
          temp=temp.join(",")
          requestsURL=`http://121.5.235.15/api/v2/zhouyou/_table/${this.op.dataType}?fields=${temp}&filter=${attrId}`
          await this.getData(requestsURL,"base")//后面只要不是global就行
          this.displayTitle = await this.getAttrName(attrId)
          let title="" //安抚作用 无效果
          if(this.op.style==="AOI"){
            if (/score/.test(this.op.type)) {
              //价格
              console.log("score")
              await this.loadLayerAOI("score",title,this.basedata)
            }else if(/price/.test(this.op.type)){
              console.log("price")
              await this.loadLayerAOI("price",title,this.basedata)
            }
          }else if(this.op.style==="stack"){
            console.log("barstack")
            await this.barStack(title,this.basedata)
          }
    },
    async buttonProcess(ops){
      console.log(ops)
      switch (ops) {
        case "景点" :
          if(this.op.dataType!=="Attractions"){
            this.op.refresh=true
          }
          this.op.dataType="Attractions"
          break;
        case "美食" :
          if(this.op.dataType!=="Caterings"){
            this.op.refresh=true
          }
          this.op.dataType="Caterings"
          break;
        case "酒店":
          if(this.op.dataType!=="Hotels"){
            this.op.refresh=true
          }
          this.op.dataType="Hotels"
          break;
        case "评分":
          if(this.op.type!==this.dataStore[this.op.dataType].score){
            this.op.refresh=true
          }
          this.op.type=this.dataStore[this.op.dataType].score
          this.op.style="AOI"
          break;
        case "价格":
          if(this.op.type!==this.dataStore[this.op.dataType].price){
            this.op.refresh=true
          }
          this.op.type=this.dataStore[this.op.dataType].price
          this.op.style="AOI"
        case "单个":
          if(this.op.style!=="AOI"){
            this.op.refresh=true
          }
          this.op.style="AOI"
          break;
        case "综合":
          if(this.op.style!=="stack"){
            this.op.refresh=true
          }
          this.op.style="stack"
          break;
      }
      console.log(this.op)
      if(this.op.refresh){
        this.refreshMydata()
        this.whatsmystyle()
      }
    },
    async getData(url,type){
      let res = await axios.get(url,{
        params: {
          api_key: '956eed8e98667eca2722be6afc37e123212466565cab5df2f7e653d206f3e3c0'
        }
      })
      let data = res.data.resource
      let temp={}
      if(data.length>0) {
        temp.legend =await data.map((x) => {
          return x[this.dataStore[this.op.dataType].name]
        })
        temp.price = await data.map((x) => {
          if (x[this.dataStore[this.op.dataType].price]=== 0) {
            x[this.dataStore[this.op.dataType].price] = 25
          }
          return {name:x[this.dataStore[this.op.dataType].name], value: x[this.dataStore[this.op.dataType].price]}
        })
        temp.score = await data.map((x) => {
          if (x[this.dataStore[this.op.dataType].score] === null) {
            x[this.dataStore[this.op.dataType].score] = 3
          }
          return {name: x[this.dataStore[this.op.dataType].name], value: x[this.dataStore[this.op.dataType].score]}
        })
      }
      if(type==="global"){
        this.globalData=temp
        console.log(this.globalData)
      }else {
        this.basedata=temp
      }
    },
    async loadLayerAOI(type,name,data){
      this.AOIoption.xAxis.data=data.legend
      // this.AOIoption.title.text=name
      let seriesA
      if(type==="price"){
          seriesA= {
            name: name,
            type: 'line',
            data: data.price.map((x)=>{
              return x.value
            }),
            markLine: {
              silent: true,
              lineStyle: {
                color: '#333'
              },
              data: [{
                yAxis: 20
              }, {
                yAxis: 40
              }, {
                yAxis: 60
              }, {
                yAxis: 80
              }, {
                yAxis: 100
              }]
            }
          }
      }
      else if(type==="score"){
          seriesA= {
          name: name,
          type: 'line',
          data: data.score.map((x)=>{
            return x.value*20
          }),
          markLine: {
            silent: true,
            lineStyle: {
              color: '#333'
            },
            data: [{
              yAxis: 20
            }, {
              yAxis: 40
            }, {
              yAxis: 60
            }, {
              yAxis: 80
            }, {
              yAxis: 100
            }]
          }
        }
      }

        this.AOIoption.series=[seriesA]
        // this.AOIoption.series.push(seriesA)
      this.Chart.setOption(this.AOIoption,true)
    },
    async barStack(name,data) {
      let pricedata= data.price.map(x=>x.value)
      let scoredata = data.score.map(x=>x.value)
      scoredata=scoredata.map(x=>Math.round(x/5*50))
      let maxPrice=Math.max(...pricedata)
      pricedata=pricedata.map(x=>Math.round((maxPrice-x)/maxPrice*50))
      //整合为数组对象
      let all=[]
      for (let index =0;index <pricedata.length;index++){
        let sum = pricedata[index]+scoredata[index]
        let temp={
          name:data.legend[index],
          sum:sum,
          price:pricedata[index],
          score:scoredata[index]
        }
        all.push(temp)
      }
      all.sort(compare("sum"))
      all.reverse()
      //price
      let seriesB = {
        name: '价格指数',
        type: 'bar',
        stack: 'total',
        label: {
          show: true
        },
        emphasis: {
          focus: 'series'
        },
        data: all.map(x=>x.price)
      }
      //score
      let seriesC = {
        name: '评分',
        type: 'bar',
        stack: 'total',
        label: {
          show: true
        },
        emphasis: {
          focus: 'series'
        },
        data: all.map(x=>x.score)
      }
      this.barStackOption.series = [seriesC,seriesB]
      this.barStackOption.legend.data = ["price","score"]
      this.barStackOption.yAxis.data = all.map(x=>x.name)
      // this.barStackOption.title.text=name
      this.Chart.setOption(this.barStackOption,true)


    },
    async getAttrName(idStrings){
      let res = await axios.get(`http://121.5.235.15/api/v2/zhouyou/_table/attractions?fields=attraction_name,attraction_id&filter=${idStrings}`,{
        params:{
          api_key:'956eed8e98667eca2722be6afc37e123212466565cab5df2f7e653d206f3e3c0'
        }
      })
      let data =  res.data.resource
      let desc=""
      if(data.length>=1){
        this.POIname=[]
      for (let index=0;index<data.length;index++){
        if (data.length===1) {
          desc=data[index].attraction_name
        }
        else if(index<data.length-1){
          desc=`${desc} ${data[index].attraction_name},`
        }
        else if(index===data.length-1){
          desc=`${desc} ${data[index].attraction_name}`
        }
        this.POIname.push({name:data[index].attraction_name,id:data[index].attraction_id})
      }}else{
        desc="无数据"
      }
      desc=`${desc}分析`
      return desc


    },
    //me 标题太长处理程序,默认是8
    async longTitle(text,gap){
      let length =  text.length
      let floor = Math.floor(length/gap)
      let newTitle=""
      for(let index = 0;index<=floor;index++){
        let start = index*gap
        let end = (index+1)*gap
        if(end>length){
          end=length
        }
        console.log(text.slice(start,end))
        newTitle=`${newTitle}${text.slice(start,end)}\n`
      }
      return newTitle
    },
    async deletePOI(data){
      if(typeof data === "number"){
        let index = this.id.indexOf(data)
        if(index===-1){
          console.log("id 中不存在此数据 nothing happens")
        }
        else{
          this.id=this.id.filter((x)=>{
            return x!==data
          })
          await this.refreshMydata()
        }
      }else {
        console.log("传参不是数字 nothing happens")
      }

    },
    whatsmystyle(){
          if(this.op.dataType==="Attractions"){
            this.$refs.jingdian.style.backgroundColor=this.clickedColor
            this.$refs.jingdian.style.backdropFilter="blur(5px)"
            this.$refs.meishi.style.backgroundColor=this.unclickColor
          }else if(this.op.dataType==="Caterings"){
            this.$refs.meishi.style.backgroundColor=this.clickedColor
            this.$refs.jingdian.style.backgroundColor=this.unclickColor
          }


          if(this.op.style==="stack"){
            console.log("stack了")
            this.$refs.zonghe.style.backgroundColor=this.clickedColor
            this.$refs.jiage.style.backgroundColor=this.unclickColor
            this.$refs.pingfen.style.backgroundColor=this.unclickColor
          }else if(this.op.style==="AOI"){
          if(this.op.type===this.dataStore[this.op.dataType].price){
            console.log("pprice了")
            this.$refs.jiage.style.backgroundColor=this.clickedColor
            this.$refs.zonghe.style.backgroundColor=this.unclickColor
            this.$refs.pingfen.style.backgroundColor=this.unclickColor
          }else if(this.op.type===this.dataStore[this.op.dataType].score) {
            console.log("score了")
            this.$refs.pingfen.style.backgroundColor=this.clickedColor
            this.$refs.jiage.style.backgroundColor=this.unclickColor
            this.$refs.zonghe.style.backgroundColor=this.unclickColor
          }
      }}
    },
  computed:{
}
}
</script>

<style scoped>
p{
  text-align: center;
}

#scorePrice{
  width: 600px;
  /*min-height: 50%;*/
  height: 300px;
  /*background-color: rgba(255,255,255,0.4);*/
  margin: 12px 9px;
  background: rgba(255,255,255,0.8);
  border-radius: 12px;
}
button{
  margin: 3px 3px;
  background-color: white;
  border-radius: 40px;
}
.deletebutton{
  background:transparent;
  /*border-radius: 6px;*/
  border: #f3f3dd;
}
.buttonDisplay{
  border-radius: 12px;
  background:transparent;
  border: 1px solid black;
  /*width: fit-content;*/
  min-width: 8px;
  font-size: 6px;
}
.searchicon{
  width: 14px;
  margin-left: 4px;
  text-align: center;

}
.chartsdisplay{
  border-radius: 12px;
  border: 1px solid lightsteelblue;
  margin: 5px 6px;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;
}
.globalinput{
  width: 150px;
  height: 10px;

}
.littleButton{
display: flex;
justify-content: flex-start;
}
.littleButtonZone{
  border-radius: 20px;
  border: 1px solid black;
  padding: 3px;
  margin: 8px 12px;
}
.poiButtons{
  width: 660px;
  display: flex;
  flex-wrap: wrap;
}
</style>
