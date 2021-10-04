<template>
  <div id="components-container">
    <split-pane
      ref="sp"
      @resize="resize"
      id="sp"
      :min-percent="10"
      :default-percent="10"
      split="vertical"
    >
      <template slot="paneL">
          <div id="choicelist">
            <el-row class="tac">
              <el-col :span="12">
                <el-menu
                  default-active="activeIndex"
                  class="el-menu-vertical-demo"
                  @select="selectchoice"

                >
                  <el-submenu index="1">
                    <template slot="title">
                      <i class="el-icon-location"></i>
                      <span>景点选择</span>
                    </template>
                    <el-menu-item-group>
                      <el-submenu index="1-1">
                        <template slot="title">按类别选择</template>
                        <el-menu-item index="1-1-1">5A</el-menu-item>
                        <el-menu-item index="1-1-2">4A</el-menu-item>
                        <el-menu-item index="1-1-3">3A</el-menu-item>
                        <el-menu-item divided index="1-1-4">自然</el-menu-item>
                        <el-menu-item index="1-1-5">山水</el-menu-item>
                        <el-menu-item index="1-1-6">文化</el-menu-item>
                        <el-menu-item index="1-1-7">历史</el-menu-item>
                        <el-menu-item index="1-1-8">展馆</el-menu-item>
                        <el-menu-item index="1-1-9">休闲</el-menu-item>
                        <el-menu-item index="1-1-10">运动</el-menu-item>
                        <el-menu-item index="1-1-11">体验</el-menu-item>
                        <el-menu-item index="1-1-12">儿童</el-menu-item>
                        <el-menu-item index="1-1-13">城市</el-menu-item>
                        <el-menu-item index="1-1-14">街区</el-menu-item>
                        <el-menu-item index="1-1-15">民族</el-menu-item>
                        <el-menu-item index="1-1-16">红色</el-menu-item>
                      </el-submenu>
                      <el-submenu index="1-2">
                        <template slot="title">按距离选择</template>
                        <el-menu-item index="1-2-1">1km范围</el-menu-item>
                        <el-menu-item index="1-2-2">5km范围</el-menu-item>
                        <el-menu-item index="1-2-3">10km范围</el-menu-item>
                          <el-menu-item  index="1-2-4" >
                            自定义范围
                          </el-menu-item>
                        <div v-if="theIndex==='1-2-4'">
                          <input  placeholder="请输入范围" v-model="bufferradius_km" class="inputradius"  @keyup.enter="checkinfo" >
                          <span class="km_text">km</span>
                        </div>
                      </el-submenu>
                    </el-menu-item-group>
                    <el-menu-item-group>
                      <el-menu-item index="1-3-1">拉框选择</el-menu-item>
                    </el-menu-item-group>
                  </el-submenu>
                  <el-submenu index="2">
                    <template slot="title">
                      <i class="el-icon-menu"></i>
                      <span>景点分析</span>
                    </template>
                    <el-menu-item-group>
                      <el-menu-item index="2-1-0">距离分析</el-menu-item>
                      <el-menu-item index="2-1-1">价格评分分析</el-menu-item>
                      <el-menu-item index="2-1-3">人流量分析</el-menu-item>
                      <el-menu-item index="2-1-4">景点分析列表</el-menu-item>
                    </el-menu-item-group>
                  </el-submenu>
                  <el-menu-item index="3">
                    <i class="el-icon-document"></i>
                    <span slot="title">相似景点推荐</span>
                  </el-menu-item>
                </el-menu>
              </el-col>
            </el-row>
          </div>
      </template>
      <template slot="paneR">
        <div class="custome">
          <similar v-if="theIndex === '3'"></similar>
          <traffic v-if="theIndex === '2-1-3'"></traffic>
          <distanceanlysis v-if="theIndex === '2-1-0'"></distanceanlysis>
          <select-by-distance
            v-if="theIndex === '1-2'"
            :bufferradius="1"
          ></select-by-distance>
          <select-by-distance
            v-if="theIndex === '1-2-1'"
            :bufferradius="1"
          ></select-by-distance>
          <select-by-distance
            v-if="theIndex === '1-2-2'"
            :bufferradius="5"
          ></select-by-distance>
          <select-by-distance
            v-if="theIndex === '1-2-3'"
            :bufferradius="10"
          ></select-by-distance>
          <select-by-distance
            v-if="theIndex === '1-2-4'"
            :bufferradius="radius_distance===undefined||null?1:radius_distance"
          ></select-by-distance>
          <select-by-type v-if="typeSelectActive"></select-by-type>
          <kuang v-if="theIndex === '1-3-1'"></kuang>
          <price-score v-if="theIndex === '2-1-1'"></price-score>
          <listtoanalysis v-if="theIndex ==='2-1-4'"></listtoanalysis>
        </div>
      </template>
    </split-pane>
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
import axios from "axios";
import geojson from "geojson";



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
      theIndex: "3",
      typeSelectActive: false,
      stepActive: 0,
      minPercent: 10, // 往右拖动最小为15，往左最小为
      stepBoxWidth: null
    };
  },
  mounted() {
    this.$EventBus.$on("bridge",(value)=>{
      console.log("bridgr ok")
      this.$store.commit("curd_list2analysis",{type:"add",value:value})
    })
  },
  methods: {
    selectchoice(key, keyPath) {
      this.theIndex = key;
      if (/1-1-[0-9]{1,2}/.test(key)) {
        this.typeSelectActive = true;
        switch (key) {
          case "1-1-1":
            this.choice("5A景区");
            break;
          case "1-1-2":
            this.choice("4A景区");
            break;
          case "1-1-3":
            this.choice("3A景区");
            break;
          case "1-1-4":
            this.choice("自然");
            break;
          case "1-1-5":
            this.choice("山水");
            break;
          case "1-1-6":
            this.choice("文化");
            break;
          case "1-1-7":
            this.choice("历史");
            break;
          case "1-1-8":
            this.choice("展馆");
            break;
          case "1-1-9":
            this.choice("休闲");
            break;
          case "1-1-10":
            this.choice("运动");
            break;
          case "1-1-11":
            this.choice("体验");
            break;
          case "1-1-12":
            this.choice("儿童");
            break;
          case "1-1-13":
            this.choice("城市");
            break;
          case "1-1-14":
            this.choice("街区");
            break;
          case "1-1-15":
            this.choice("民族");
            break;
          case "1-1-16":
            this.choice("红色");
            break;
        }
      } else {
        this.typeSelectActive = false;
      }
    },
    resize(data) {
      const sp = this.$refs.sp;
      sp.percent > 10 && (sp.percent = 10);
    },
    async choice(command) {
      let url01 =
        "http://121.5.235.15/api/v2/zhouyou/_table/Attractions?fields=*&filter=attraction_tags%20like%20%20%27";
      var choiceurl = "";
      if (
        command === "5A景区" ||
        command === "4A景区" ||
        command === "3A景区"
      ) {
        choiceurl = url01 + "%25" + command + "%25" + "%27";
      } else {
        choiceurl = url01 + "%25" + command + "%25" + "%27";
      }
      let coordinateslist = [];
      let geoclassify;
      let response = await axios.get(choiceurl, {
        params: {
          api_key:
            "956eed8e98667eca2722be6afc37e123212466565cab5df2f7e653d206f3e3c0"
        }
      });
      let classify_data = response.data.resource;
      await classify_data.forEach(item =>
        coordinateslist.push({
          lng: item.attraction_lon,
          lat: item.attraction_lat,
          name: item.attraction_name,
          addresss: item.attraction_city,
          id: item.attraction_id
        })
      );
      //coordinateslist每种类型的数据  坐标串的形式
      geoclassify = await geojson.parse(coordinateslist, {
        Point: ["lng", "lat"],
        properties: ["name", "address","id"],
      });
      this.$EventBus.$emit("choiceclassify", geoclassify);
    },
    checkinfo(){
      alert("您的覆盖范围是"+this.bufferradius_km+"km,请双击进行景点选择")
      this.$EventBus.$emit("buffer_km",this.bufferradius_km)
    }
  }
});
</script>
<style scoped>
#components-container {
  position: absolute;
  top: 60px;
  bottom: 0;
  width: 100%;
}
#choicelist {
  position: absolute;
  width: 376px;
  min-height: 15%;
  overflow-y:scroll;
  overflow-x:hidden;
  height:100%
}
::-webkit-scrollbar {
  width: 0 !important;
}
.custome {
  position: absolute;
  width: 100%;
  height: 100vh;
}
.sp > :nth-child(1) {
  display: none;
}
  .inputradius{
    text-align: center;
    height: 23px;
    margin-left: 30px;
    width: 80px;
  }
  .km_text{
    font-size: small;
  }

</style>

