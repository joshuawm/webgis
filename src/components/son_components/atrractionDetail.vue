<template>
  <div>
<el-row>
  <el-row>
    <el-image src="info.imgSrc"></el-image>
  </el-row>
  <el-row>
    <p>{{info.name}}</p>
    <p>
      <template v-for="(tag) in info.tags" :key="tag">
        <span class="tag">{{tag}}</span>
      </template>
    </p>
    <p class="shortdesc">{{info.shortdesc}}</p>


  </el-row>

</el-row>
  </div>
</template>

<script>
export default {
  name: "atrractionDetail",
  props:{
    poiID:{
      type:Number
    }
  },
  data(){
    return{
      info:{}
    }
  }

}
</script>

<style scoped>

</style>
