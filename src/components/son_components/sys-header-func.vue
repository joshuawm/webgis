<template>
  <div style="position: fixed;right: 40px">
    <div class="headers" id="sys-search-input" @click="init_search_result">
      <el-dropdown trigger="click" placement="bottom" style="top:0;">
        <el-input placeholder="搜索景点名称" v-model="search_input" style="margin-top: 10px;" clearable @keyup.native="judge_search_result" @clear="clearMarker"></el-input>
        <el-dropdown-menu slot="dropdown">
        <span style="display: inline-block"><el-dropdown-item style="height: 36px" v-for="(atn,index) in hots" :key="index" @click.native="select_attr(index)">
          {{atn.name}}
          <img src="../../assets/hot.svg" alt="" id="hot-top" v-if="showPrise">
        </el-dropdown-item></span>
          <span style="display: inline-block;margin-right: 40px"><el-dropdown-item v-for="(atn,index) in hots" :key="index"></el-dropdown-item></span>
          <span style="display: inline-block;margin-right: 40px"><el-dropdown-item v-for="(atn,index) in hots" :key="index"></el-dropdown-item></span>
        </el-dropdown-menu>
      </el-dropdown>
    </div>


    <div class="headers" id="sys-search" >
      <el-button class="el-buttons" plain icon="el-icon-search" @click="search_attr"></el-button>
    </div>
    <div class="headers" id="sys-download" @click="screen_download">
      <el-button class="el-buttons" plain icon="el-icon-download"></el-button>
    </div>
    <div class="headers" id="sys-user" style="margin-left: 200px;margin-right: 40px">
      <el-dropdown class="el-buttons" placement="bottom" trigger="click">
        <el-button type="primary" icon="el-icon-user"></el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item @click.native="logout">退出登录</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import axios from "axios";

import home from "../../view/home";

export default {
  name: "sys-header-func",
  data(){
    return{
      search_input:'',
      hots:[''],
      showPrise:true,
      search_results:[],
      params:{
        params:{
          api_key:'956eed8e98667eca2722be6afc37e123212466565cab5df2f7e653d206f3e3c0'
        }
      },
    }
  },
  methods:{
    logout:function (){
      this.$store.commit('logout');
      this.$router.push('./')
    },
    init_search_result:function (){
      let that = this;
      that.showPrise = true;
      let url = 'http://121.5.235.15/api/v2/zhouyou/_table/attraction_hot_top?fields=hot_name';
      axios
        .get(url,that.params)
        .then(function (resp){
          that.hots = [];
          for (let i in resp.data.resource) {
            that.hots.push({name:resp.data.resource[i].hot_name})
          }
        })
    },
    get_like_result(){
      let that = this;

      //my Edition
      //搜索字段范围
      let searchList={
        attractions:[
          "attraction_name","attraction_city","attraction_en_name","attraction_tags","attraction_feature"
        ]
      }

      let filterbox = []
      for (let index=0 ;index < searchList.attractions.length;index++){
        let temp = `(${searchList.attractions[index]} like %${that.search_input}%)`
        filterbox.push(temp)
      }
      let filterString=filterbox.join(" OR ")
      let filterURl = encodeURIComponent(filterString)

      let requestsURL= `http://121.5.235.15/api/v2/zhouyou/_table/Attractions?fields=attraction_name,attraction_id,attraction_lat,attraction_lon&filter=${filterURl}&limit=10`
      console.log("get_like_result")
      axios.get(requestsURL,
        {
          params: {
            api_key: '956eed8e98667eca2722be6afc37e123212466565cab5df2f7e653d206f3e3c0'
          }
        })
        .then(function (resp){
          that.search_results = [];
          that.hots = [];
          let tmp = '';
          for (let i in resp.data.resource) {

            tmp ={
              name:resp.data.resource[i].attraction_name,
              lat:resp.data.resource[i].attraction_lat,
              lng:resp.data.resource[i].attraction_lon,
              id:resp.data.resource[i].attraction_id
            } ;
            that.hots.push(tmp);
            that.search_results.push(tmp)
          }
        });

    },
    judge_search_result:function (){
      let that = this;
      that.search_input = that.search_input.replace(/\s*/g,'');
      if (!that.search_input){
        that.init_search_result();
      }
      else{
        that.get_like_result();
      }
    },
    select_attr:function (ind){
      this.search_input = this.hots[ind].name
      console.log(this.hots[ind].name) //这里获取了下拉菜单中的景点名称
      let info={
        lat:this.hots[ind].lat,
        lng:this.hots[ind].lng,
        id:this.hots[ind].id
      }
      this.$EventBus.$emit("marker",info)

    },
    search_attr:function (){
      let that = this;

      //my Edition
      //搜索字段范围
      let searchList={
        attractions:[
          "attraction_name","attraction_city","attraction_en_name","attraction_tags","attraction_feature"
        ]
      }

      let filterbox = []
      for (let index=0 ;index < searchList.attractions.length;index++){
        let temp = `(${searchList.attractions[index]} like %${that.search_input}%)`
        filterbox.push(temp)
      }
      let filterString=filterbox.join(" OR ")
      let filterURl = encodeURIComponent(filterString)

      let requestsURL= `http://121.5.235.15/api/v2/zhouyou/_table/Attractions?fields=attraction_name,attraction_id&filter=${filterURl}&limit=10`
      console.log("search_attr")
      axios.get(requestsURL,
        {
          params: {
            api_key: '956eed8e98667eca2722be6afc37e123212466565cab5df2f7e653d206f3e3c0'
          }
        })
        .then(function (resp){
          let tmp = resp.data.resource;
          if(!tmp.length <= 0){
            console.log(tmp[0].attraction_name)
          }
          else{
            that.$message({
              message: "未查询到相关信息",
              type: 'warning'
            });
          }
        });
    },
    screen_download(){
      this.$emit('screen_download')
    },
    clearMarker(){

      this.$EventBus.$emit("markerClear")
    }
  },
  mounted() {

    this.init_search_result();
  }
}
</script>

<style scoped>
.headers{
  display:inline-block;
  height: 60px;
  vertical-align: top;
}
.el-buttons{
  margin-top: 10px;
  width: 40px;
  height: 40px;
  padding-left: 30%;
}
#hot-top{
  height: 20px;
  width: 20px;
  vertical-align: center;
}
</style>
