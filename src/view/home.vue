<template>
  <div id="body-all">
        <div id="theHeader">
      <div class="headers">
          <div><el-menu
            :default-active="activeIndex1"
            class="el-menu-demo"
            mode="horizontal"
            @select="handleSelect"
            background-color="#545c64"
            text-color="#fff"
            active-text-color="#ffd04b"
          >
            <el-menu-item :index="1" disabled ><div id="logo"></div></el-menu-item>
            <el-menu-item
              v-for="(item, index) in menus"
              :index="(index + 1).toString()"
              :key="index"
              v-show="$store.state.username || item.name === '周游'"
            >{{ item.name }}</el-menu-item
            >
          </el-menu></div>

      </div>
      <div class="headers_menu">
        <div style="position: fixed;right: 40px">
          <div
            class="headers_menu"
            id="sys-search-input"
            @click="init_search_result"
          >
            <el-dropdown trigger="click" placement="bottom" style="top:0;">
              <el-input
                placeholder="搜索景点名称"
                v-model="search_input"
                style="margin-top: 10px;"
                clearable
                @keyup.native="judge_search_result"
                @clear="clearMarker"
                v-show="$store.state.main_show === '1'"
              ></el-input>
              <el-dropdown-menu slot="dropdown">
                <span style="display: inline-block"
                  ><el-dropdown-item
                    style="height: 36px"
                    v-for="(atn, index) in hots"
                    :key="index"
                    @click.native="select_attr(index)"
                  >
                    {{ atn.name }}
                    <img
                      src="../assets/hot.svg"
                      alt=""
                      id="hot-top"
                      v-if="showPrise"
                    /> </el-dropdown-item
                ></span>
                <span style="display: inline-block;margin-right: 40px"
                  ><el-dropdown-item
                    v-for="(atn, index) in hots"
                    :key="index"
                  ></el-dropdown-item
                ></span>
                <span style="display: inline-block;margin-right: 40px"
                  ><el-dropdown-item
                    v-for="(atn, index) in hots"
                    :key="index"
                  ></el-dropdown-item
                ></span>
              </el-dropdown-menu>
            </el-dropdown>
          </div>

          <div class="headers_menu" id="sys-search">
            <el-button
              class="el-buttons"
              plain
              icon="el-icon-search"
              @click="search_attr"
              v-show="$store.state.main_show === '1'"
            ></el-button>
          </div>
          <div
            class="headers_menu"
            id="sys-download"
            v-show="$store.state.main_show === '1'"
            @click="download_screen"
          >
            <el-button
              class="el-buttons"
              plain
              icon="el-icon-download"
            ></el-button>
          </div>
          <div
             class="headers_menu"
            id="sys-user"
            style="margin-left: 200px;margin-right: 40px"
          >
            <el-dropdown
              class="el-buttons"
              placement="bottom"
              trigger="click"
              v-if="!$store.state.username"
            >
              <el-button type="primary" @click="toLogin">登录</el-button>
            </el-dropdown>
            <el-dropdown
              class="el-buttons"
              placement="bottom"
              trigger="click"
              v-if="$store.state.username"
            >
              <el-button type="primary" icon="el-icon-user"></el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item :disabled="true">{{
                  $store.state.username
                }}</el-dropdown-item>
                <el-dropdown-item @click.native="logout"
                  >退出登录</el-dropdown-item
                >
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </div>
      </div>
          <div v-if="$store.state.user_id===null||$store.state.user_id===0" class="guestMode" ><p title="您正处于游客模式 更多功能请右上角登录">游客模式</p></div>
        </div>
        <div id="main" ref="screen">
      <component ref="detail" :is="show_comp"></component>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import sub_menus from "../$$framework$$.json";

function loadComps() {
  let menus = [];
  let json_menus = sub_menus.tools;
  for (let i = 0; i < json_menus.length; i++) {
    if (json_menus[i].type === "menu") {
      menus.push({
        id: json_menus[i].id,
        name: json_menus[i].name,
        path: json_menus[i].jsPage
      });
    }
  }
  return menus;
}
function loadMyComponent() {
  let menus = loadComps();
  let myComponents = {};
  for (let index = 0; index < menus.length; index++) {
    myComponents[menus[index].id] = () =>
      import(`../$$tools$$/${menus[index].path}.vue`); //${menus[index].path}
  }

  return myComponents;
}

export default {
  name: "home",
  data() {
    return {
      comps: [],
      menus: loadComps(),
      search_input: "",
      hots: [""],
      showPrise: true,
      search_results: [],
      params: {
        params: {
          api_key:
            "956eed8e98667eca2722be6afc37e123212466565cab5df2f7e653d206f3e3c0"
        }
      },
      activeIndex1: this.$store.state.main_show,
      show_comp: null
    };
  },
  components: loadMyComponent(),
  created() {
    let comps = [];
    for (let i = 0; i < this.menus.length; i++) {
      comps.push(this.menus[i].id);
    }
    this.comps = comps;
    this.show_comp = this.comps[Number(this.$store.state.main_show) - 1];
  },

  methods: {
    download_screen: function() {
      let ref = this.$refs.screen;
      this.html2canvas(ref, {
        allowTaint: true,
        useCORS: true
      })
        .then(canvas => {
          let dataURL = canvas.toDataURL("image/png");
          this.dataURL = dataURL;
          let creatDom = document.createElement("a");
          document.body.appendChild(creatDom);
          creatDom.href = dataURL;
          creatDom.download = new Date().getTime() + ".png";
          creatDom.click();
        })
        .catch(err => {
          this.$message({
            message: "图片生成失败",
            type: "error"
          });
        });
    },
    logout() {
      this.$store.commit("logout");
      this.$router.push("./login");
    },
    init_search_result: async function() {
      let that = this;
      that.showPrise = true;
      that.hots = [];
      let url =
        "http://121.5.235.15/api/v2/zhouyou/_table/attraction_hot_top?fields=hot_name";
      let res = await axios.get(url, that.params);
      let string = "";
      for (let ii = 0; ii < res.data.resource.length; ii++) {
        if (ii === 0) {
          string = `(attraction_name=${res.data.resource[ii].hot_name})`;
        } else {
          string = `${string} OR (attraction_name=${res.data.resource[ii].hot_name})`;
        }
      }
      let resp = await axios.get(
        `http://121.5.235.15/api/v2/zhouyou/_table/attractions?fields=*&filter=${string}`,
        this.params
      );
      console.log(resp);
      for (let i in resp.data.resource) {
        that.hots.push({
          name: resp.data.resource[i].attraction_name,
          id: resp.data.resource[i].attraction_id,
          lat: resp.data.resource[i].attraction_lat,
          lng: resp.data.resource[i].attraction_lon
        });
      }
    },
    get_like_result() {
      let that = this;
      that.hots = [];
      this.showPrise = false;
      //my Edition
      //搜索字段范围
      let searchList = {
        attractions: [
          "attraction_name",
          "attraction_city",
          "attraction_en_name",
          "attraction_tags",
          "attraction_feature"
        ]
      };

      let filterbox = [];
      for (let index = 0; index < searchList.attractions.length; index++) {
        let temp = `(${searchList.attractions[index]} like %${that.search_input}%)`;
        filterbox.push(temp);
      }
      let filterString = filterbox.join(" OR ");
      let filterURl = encodeURIComponent(filterString);

      let requestsURL = `http://121.5.235.15/api/v2/zhouyou/_table/Attractions?fields=attraction_name,attraction_id,attraction_lat,attraction_lon&filter=${filterURl}&limit=10`;
      console.log("get_like_result");
      axios
        .get(requestsURL, {
          params: {
            api_key:
              "956eed8e98667eca2722be6afc37e123212466565cab5df2f7e653d206f3e3c0"
          }
        })
        .then(function(resp) {
          that.search_results = [];
          that.hots = [];
          let tmp = "";
          for (let i in resp.data.resource) {
            tmp = {
              name: resp.data.resource[i].attraction_name,
              lat: resp.data.resource[i].attraction_lat,
              lng: resp.data.resource[i].attraction_lon,
              id: resp.data.resource[i].attraction_id
            };
            that.hots.push(tmp);
            that.search_results.push(tmp);
          }
        });
    },
    judge_search_result: function() {
      let that = this;
      that.search_input = that.search_input.replace(/\s*/g, "");
      if (!that.search_input) {
        that.init_search_result();
      } else {
        that.get_like_result();
      }
    },
    select_attr: function(ind) {
      this.search_input = this.hots[ind].name;
      console.log(this.hots[ind].name); //这里获取了下拉菜单中的景点名称
      let info = {
        lat: this.hots[ind].lat,
        lng: this.hots[ind].lng,
        id: this.hots[ind].id
      };
      console.log("tiaozhuanel");
      this.$EventBus.$emit("marker", info);
    },
    search_attr: function() {
      let that = this;

      //my Edition
      //搜索字段范围
      let searchList = {
        attractions: [
          "attraction_name",
          "attraction_city",
          "attraction_en_name",
          "attraction_tags",
          "attraction_feature"
        ]
      };

      let filterbox = [];
      for (let index = 0; index < searchList.attractions.length; index++) {
        let temp = `(${searchList.attractions[index]} = ${that.search_input}%)`;
        filterbox.push(temp);
      }
      let filterString = filterbox.join(" OR ");
      let filterURl = encodeURIComponent(filterString);

      let requestsURL = `http://121.5.235.15/api/v2/zhouyou/_table/Attractions?fields=attraction_name,attraction_id,attraction_lat,attraction_lon&filter=${filterURl}&limit=10`;
      console.log("search_attr");
      axios
        .get(requestsURL, {
          params: {
            api_key:
              "956eed8e98667eca2722be6afc37e123212466565cab5df2f7e653d206f3e3c0"
          }
        })
        .then(resp => {
          let tmp = resp.data.resource;
          if (!tmp.length <= 0) {
            console.log(tmp[0].attraction_name);
            let temp = {
              lat: tmp[0].attraction_lat,
              lng: tmp[0].attraction_lon
            };
            this.$EventBus.$emit("marker", temp);
          } else {
            that.$message({
              message: "未查询到相关信息",
              type: "warning"
            });
          }
        });
    },
    clearMarker() {
      this.$EventBus.$emit("markerClear");
    },
    handleSelect(key, keyPath) {
      this.$store.commit("change_main_show", key);
      this.show_comp = this.comps[Number(this.$store.state.main_show) - 1];
    },
    toLogin() {
      this.$router.push("./login");
    }
  },
  mounted() {
    console.log(this.$store.state.user_id)
    this.init_search_result();
  }
};
</script>

<style scoped>
#body-all {
  width: 100%;
  height: 100vh;
  position: fixed;
  background-size: 100% 100%;
  margin-top: -8px;
  margin-left: -8px;
  backdrop-filter: blur(4px);
}

.headers {
  display: inline-block;
  height: 44px;
  vertical-align: top;
}
.headers_menu{
  display: inline-block;
  height: 60px;
  vertical-align: top;
}
.guestMode {
  display: inline-block;
  position: absolute;
  left:47.5%;
   height: 60px;
  color: #f5f5f7;
  font-size: small;
  cursor: default;
}
.guestMode p{
  height: 100%;
  line-height: 37px;
}
#main {
  width: 100%;
  height: 100%;
  position: relative;

}
#theHeader{
  width: 100%;
  height: 60px;
  box-sizing: border-box;
  background-color: rgba(0,0,0,0.8);

}
#logo{
  background-image: url("../$$tools$$/sub_menu_1/assets/zhouyoulogo01.svg");
  height: 60px;
  width: 80px;
  transform: scale(0.7);
  background-size: cover;
  background-repeat: no-repeat;
}
/deep/ .el-row {
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  background-color: transparent !important;
  left: 100px;
}
.el-dropdown-menu {
  position: absolute;
  top: 0;
  left: 0;
  padding: 10px 0;
  margin: 5px 0;
  background-color: #FFF;
  border: 1px solid #EBEEF5;
  border-radius: 4px;
  text-align: left;
  -webkit-box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
  box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
  transform: scale3d(1.01,1.01,1.01);
  transition: all .3s cubic-bezier(0,0,.5,1);
  color: #1d1d1f;
}
/deep/ .el-input__inner {
  -webkit-appearance: none;
  background-color: transparent;
  background-image: none;
  border-radius: 4px;
  border: none;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  color: #606266;
  display: inline-block;
  font-size: inherit;
  height: 40px;
  line-height: 40px;
  outline: 0;
  padding: 0 15px;
  -webkit-transition: border-color .2s cubic-bezier(.645,.045,.355,1);
  transition: border-color .2s cubic-bezier(.645,.045,.355,1);
  width: 100%;
}
.el-menu-demo{
  background-color: transparent !important;
}
img#hot-top {
  height: inherit;
  transform: scale(0.8);
  float: left;
}
/deep/ .el-menu-item{
  background-color: transparent !important;
  color: #f5f5f7 !important;
}
.el-button {
  display: inline-block;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  background: transparent;
  border: none;
  color: #f5f5f7;
  -webkit-appearance: none;
  text-align: center;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  outline: 0;
  -webkit-transition: .1s;
  transition: .1s;
  font-weight: 500;
  padding: 12px 20px;
  font-size: 14px;
  border-radius: 4px;
  height: 100%;
}
.el-dropdown {
  display: inline-block;
  position: relative;
  color: #606266;
  font-size: 14px;
  height: 100%;
}
/*选中的属性*/
/deep/ .el-menu-item.is-active{
  border-bottom:2px solid !important;
  color: white !important;
  border-bottom-color: white !important;
}
/*禁用*/
.el-menu-item.is-disabled {
  opacity: 1;
  cursor: default;
  background: 0 0!important;
}
</style>
