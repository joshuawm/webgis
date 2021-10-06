<template>
  <div>
    <div id="crystalMenu">
      <div class="crystalPanel">
      <div class="poiSelectPanel">
          <div class="poiSelectText text"><span>景点选择</span></div>
          <div class="poiSelectHidden">
            <p class="choice" >类型选择</p>
            <p class="choice" @click="gotod('1-2')">距离选择</p>
            <p class="choice" @click="gotod('1-3-1')">拉框选择</p>
          </div>
        </div>
      <div class="analysisPanel">
          <div class="analysisText text">
            <span>景点分析&nbsp;&nbsp;&nbsp;</span>
          </div>
          <div class="analysisHidden">
            <p class="choice" @click="gotod('2-1-0')">距离分析</p>
            <p class="choice"  @click="gotod('2-1-1')">价格评分分析</p>
            <p class="choice"  @click="gotod('2-1-3')">人流量分析</p>
            <p class="choice"  @click="gotod('2-1-4')">景点分析列表</p>
          </div>
        </div>
      <div class="trafficPanel" @click="gotod('3')">
          <div class="trafficText text" ><span>相似景点推荐</span></div>
        </div>
      </div>

      </div>

    <div class="custome">
          <similar v-if="index === '3'"></similar>
          <traffic v-if="index === '2-1-3'"></traffic>
          <distanceanlysis v-if="index === '2-1-0'"></distanceanlysis>
          <select-by-distance v-if="index === '1-2'"></select-by-distance>
          <select-by-type v-if="index='1-1'"></select-by-type>
          <kuang v-if="index === '1-3-1'"></kuang>
<!--          <price-score v-if="theIndex === '2-1-1'"></price-score>-->
          <listtoanalysis v-if="index ==='2-1-4'"></listtoanalysis>
  </div>


  </div>
</template>

<script>
import { defineComponent } from "@vue/composition-api";
import similar from "./analysis_Scenic/similar.vue";
import traffic from "./analysis_Scenic/trafficAna.vue";
import SelectByDistance from "./analysis_Scenic/distanceSelect.vue";
import SelectByType from "./analysis_Scenic/typeSelect.vue";
import kuang from "./analysis_Scenic/kuang.vue";
import distanceanlysis from "./analysis_Scenic/distance_anlysis"
// import PriceScore from "./scenicAnalysis/PriceScore.vue"
import listtoanalysis from "./analysis_Scenic/listtoanalysis"




export default defineComponent({
  name: "hddhshfd",
  components: {
    similar,
    traffic,
    SelectByDistance,
    SelectByType,
    kuang,
    distanceanlysis,
    // PriceScore,
    listtoanalysis
  },
  data() {
    return {
      index:"3",
      theIndex: "2-1-0",
      typeSelectActive: false,
      stepActive: 0,
      minPercent: 10, // 往右拖动最小为15，往左最小为
      stepBoxWidth: null
    };
  },
  mounted() {

  },
  methods: {

    resize(data) {
      const sp = this.$refs.sp;
      sp.percent > 10 && (sp.percent = 10);
    },

    checkinfo(){
      alert("您的覆盖范围是"+this.bufferradius_km+"km,请双击进行景点选择")
      this.$EventBus.$emit("buffer_km",this.bufferradius_km)
    },
    gotod(value){

      this.index=value
      return
    }
  },
  watch:{
    theIndex(newValue,oldValue){
      console.log("oldvalue",oldValue)
      console.log("newValue",newValue)
    },
    index(n,o){
      console.log(n)
    }
  }

});
</script>
<style scoped>
.choice{
  position: relative;
  padding: 6px 3px;
  margin-top: 6px;
  margin-left: 3px;
  font-size: inherit;
  text-align: center;

}
.crystalPanel{
  display: flex;
  margin: 6px 34px;
  width: fit-content;
  background-color: transparent;
  /*height: 60px;*/
}

#crystalMenu{
  position: absolute;
  top: 5%;
  left: 5%;
  z-index: 2;
}
.trafficPanel{
  width: 130px;
  height: 100%;
}
.poiSelectPanel{
width: 130px;
height: fit-content;
}
.analysisPanel{
  width: 130px;
  height: fit-content;
}
.analysisText{
  border-right:1px solid black;
}
.poiSelectText{
  border-right:1px solid black;
}
.trafficText{

}
.text{
  text-align: center;

  height: fit-content;
  padding: 10px;
}
.poiSelectPanel:hover .poiSelectHidden{
  display: block;
  height: fit-content;
  /*background-color: transparent;*/
  background-color: rgba(255,255,255,0.6);
  box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
  border-radius: 12px;
  backdrop-filter: blur(5px);
}
.analysisPanel:hover .analysisHidden{
  display: block;
  height: fit-content;
  /*background-color: transparent;*/
  background-color: rgba(255,255,255,0.6);
  box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
  border-radius: 8px;
  backdrop-filter: blur(5px);
}
.poiSelectPanel:hover .poiSelectText{

  background-color: rgba(255,255,255,0.2);
  backdrop-filter: blur(5px);
}
.analysisPanel:hover .analysisText{
  background-color: rgba(255,255,255,0.2);
  backdrop-filter: blur(5px);
}
.trafficPanel:hover .trafficText{
  background-color: rgba(255,255,255,0.2);
  backdrop-filter: blur(5px);
}
.choice:hover{
  background-clip: border-box;
  background-color: rgba(255,255,255,0.2);
  backdrop-filter: blur(2px);
  border-radius: 5px;
}
.analysisHidden{
  display: none;
}
.poiSelectHidden{
  display: none;
}

.crystalPanel{
  height: 40px;
  /*background-color: transparent;*/
  background-color: rgba(255,255,255,0.6);
  box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
  border-radius: 12px;
  backdrop-filter: blur(5px);
}



</style>

