<template>
  <div id="body-all">
    <el-row style="background-color: #545c64;height: 60px">
      <v-navMenu class="headers"/>
      <v-h-func class="headers" @screen_download="download_screen"></v-h-func>
    </el-row>
    <div id='main' ref="screen">
      <v-zhouyou v-if="$store.state.main_show==='1'"/>
      <v-fenxi v-if="$store.state.main_show==='2'" />
      <v-lujing v-if="$store.state.main_show==='3'"/>
      <v-youyou v-if="$store.state.main_show==='4'"/>
      <v-wode v-if="$store.state.main_show==='5'"/>
    </div>


  </div>

</template>

<script>

import navMenu from '../components/son_components/nav-menu';
import s_header_func from "../components/son_components/sys-header-func";
import youyou from "../components/youyou";
import map from "../components/basemap.vue"
import wode from "../components/wode.vue"
import lujing from "../components/lujing.vue"
import fenxi from "../components/jingdianfenxi"

export default {
  name: "home",
  data() {
    return {}
  },
  components: {
    'v-navMenu': navMenu,
    'v-h-func': s_header_func,
    'v-zhouyou': map,
    'v-youyou': youyou,
    'v-wode':wode,
    "v-lujing":lujing,
    "v-fenxi":fenxi
  },
  methods: {
    download_screen: function () {
      let ref = this.$refs.screen;
      this.html2canvas(ref, {
        useCORS: true
      })
        .then(canvas => {
          let dataURL = canvas.toDataURL("image/png");
          this.dataURL = dataURL;
          let creatDom = document.createElement("a");
          document.body.appendChild(creatDom);
          creatDom.href = dataURL;
          creatDom.download = "my_pic";
          creatDom.click();
        })
        .catch(err => {
          this.$message({
            message: "图片生成失败",
            type: "error"
          });
        });
    },
  }
}
</script>

<style scoped>
#body-all {
  width: 100%;
  height: 100vh;
  position: fixed;
  background-size: 100% 100%;
  margin-top: -8px;
  margin-left: -8px;
}

.headers {
  display: inline-block;
  height: 80px;
  vertical-align: top;
}
#main{
  width: 100%;
  height: 100%;
}
</style>
