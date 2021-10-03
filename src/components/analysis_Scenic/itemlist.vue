<template>
  <div id="choicelist">
    <el-row class="tac">
      <el-col :span="12">
        <el-menu
          default-active="activeIndex"
          class="el-menu-vertical-demo"
          @select="selectchoice">
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
                <el-menu-item index="1-2-1">10km范围</el-menu-item>
                <el-menu-item index="1-2-2">30km范围</el-menu-item>
                <el-menu-item index="1--2-3">50km范围</el-menu-item>
              </el-submenu>
            </el-menu-item-group>
            <el-menu-item-group>
              <el-menu-item index="1-3-1" >拉框选择</el-menu-item>
            </el-menu-item-group>
          </el-submenu>
          <el-submenu index="2">
            <template slot="title">
              <i class="el-icon-menu"></i>
              <span>景点分析</span>
            </template>
            <el-menu-item-group>
              <el-menu-item index="2-1-1">价格分析</el-menu-item>
              <el-menu-item index="2-1-2">评分分析</el-menu-item>
              <el-menu-item index="2-1-3">人流量分析</el-menu-item>
            </el-menu-item-group>
          </el-submenu>
          <el-menu-item index="3" >
            <i class="el-icon-document"></i>
            <span slot="title">相似景点推荐</span>
          </el-menu-item>
        </el-menu>
      </el-col>
    </el-row>
  </div>
</template>

<script>
    export default {
        name: "itemlist",
        data(){
        return{
          activeIndex:this.$store.state.analysis_show,
        };
      },
      methods: {
        selectchoice(key, keyPath){
          this.$store.commit('change_analysis_show',key)
        }
      }
    }
</script>

<style scoped>

</style>
