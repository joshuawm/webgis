<template>
  <div>
    <el-menu
      :default-active="activeIndex1"
      class="el-menu-demo"
      mode="horizontal"
      @select="handleSelect"
      background-color="#545c64"
      text-color="#fff"
      active-text-color="#ffd04b">
      <el-menu-item index="1" style="font-family: 华光行楷_CNKI,serif;font-size: 30px">周游</el-menu-item>
      <el-menu-item index="2" >景点分析</el-menu-item>
      <el-menu-item index="3" >特色路线</el-menu-item>
      <el-menu-item index="4" >游友</el-menu-item>
      <el-menu-item index="5" >我的</el-menu-item>
    </el-menu>
  </div>
</template>

<script>
export default {
  name: "nav-menu",
  data() {
    return {
      activeIndex1: this.$store.state.main_show
    };
  },
  methods: {
    handleSelect(key, keyPath) {
      this.$store.commit('change_main_show',key)
    }
  }
}
</script>

<style scoped>

</style>
