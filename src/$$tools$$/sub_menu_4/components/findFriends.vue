<template>
  <div id="omiGod">
    <div
      class="finder"
      v-for="(finder, index) in Finders"
      :key="finder.content"
    >
      <span>&nbsp;</span>
      <el-row
        ><span class="mention">{{ finder.userName }}</span
        >&nbsp;<button
          v-if="finder.userName !== $store.state.username"
          @click="hello(index)"
        >
          🙋‍♀️</button
        ><button
          v-if="finder.userName === $store.state.username"
          @click="delete_xy(index)"
        >
          <i
            class="el-icon-delete-solid"
            style="color:	#2F4F4F"
            @click="delete_it(index)"
          ></i>
        </button>
      </el-row>
      <el-row
        ><span class="hello">{{ finder.date }}</span></el-row
      >
      <p>{{ finder.content }}</p>
      <div class="attrList" v-for="attr in finder.attrs" :key="attr.attrName">
        <div class="attrBox" @click="goto(attr.attrLoc,attr.attrId)">
          <span class="name"  :title="attr.attrDesc">{{ attr.attrName }}</span>
          <div class="hiddenB">
            <span>{{ attr.attrCity }}</span>
            <span>{{ attr.attrDesc }}</span>
          </div>
        </div>
      </div>
      <span>&nbsp;</span>
    </div>
  </div>
</template>

<script>
Date.prototype.Format = function(fmt) {
  var o = {
    "M+": this.getMonth() + 1, // 月份
    "d+": this.getDate(), // 日
    "h+": this.getHours(), // 小时
    "m+": this.getMinutes(), // 分
    "s+": this.getSeconds(), // 秒
    "q+": Math.floor((this.getMonth() + 3) / 3), // 季度
    S: this.getMilliseconds() // 毫秒
  };
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, this.getFullYear() + "");
  for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt))
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length)
      );
  return fmt;
};
// let finder = [
//   {
//     userName: "Taylor Swift",
//     userId: 13,
//     content: "folklore evermore What's next..",
//     stamp: 1632060589000,
//     attrId: [13, 26]
//   },
//   {
//     userName: "whtower",
//     userId: 14,
//     content: "你懂的😉",
//     stamp: 632129758000,
//     attrId: [98]
//   },
//   {
//     userName: "Evan",
//     userId: 16,
//     content: "好像很好玩的样子😍",
//     stamp: 132129758000,
//     attrId: [12]
//   }
// ];
import axios from "axios";
export default {
  name: "findFriends",
  data() {
    return {
      Finders: [],
      screenHeight: window.innerHeight - 60 - 40 - 60 + "px"
    };
  },
  mounted() {
    this.initial();
    window.onresize = () => {
      return (() => {
        this.screenHeight = window.innerHeight - 60 - 40 - 60 + "px";
      })();
    };
  },
  computed: {},
  methods: {
    delete_xy(index) {
      this.$confirm("是否删除该寻友?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          let that = this;
          // this.myBlog[index].content
          let url =
            "http://121.5.235.15/api/v2/zhouyou/_table/xunyou?filter=xy_content%20=%20%27" +
            this.Finders[index].content +
            "%27";
          let params = {
            params: {
              api_key:
                "956eed8e98667eca2722be6afc37e123212466565cab5df2f7e653d206f3e3c0"
            }
          };
          axios
            .delete(url, params)
            .then(function(r) {
              if (r.data.resource.length !== 0) {
                that.initial();
              } else {
                this.$message.error("删除失败");
              }
            })
            .catch(r => {});
        })
        .catch(() => {});
    },
    async initial() {
      let resdd = await axios.get(
        "http://121.5.235.15/api/v2/zhouyou/_table/xunyou?order=date%20DESC",
        {
          params: {
            api_key:
              "956eed8e98667eca2722be6afc37e123212466565cab5df2f7e653d206f3e3c0"
          }
        }
      );
      let userBox = [];
      let finder = resdd.data.resource.map(x => {
        userBox.push(x.xy_user_id);
        let temp = JSON.parse(x.xy_attractions);
        return {
          userId: x.xy_user_id,
          content: x.xy_content,
          stamp: x.date,
          attrId: temp.resource
        };
      });
      //读取用户的user name
      userBox = Array.from(new Set(userBox));
      let userNameString = "";
      for (let i = 0; i < userBox.length; i++) {
        if (i === 0) {
          userNameString = `(user_id=${userBox[i]})`;
        } else {
          userNameString = `${userNameString} OR (user_id=${userBox[i]})`;
        }
      }
      let resUsert = await axios.get(
        `http://121.5.235.15/api/v2/zhouyou/_table/users?fields=user_id,user_name&filter=${userNameString}`,
        {
          params: {
            api_key:
              "956eed8e98667eca2722be6afc37e123212466565cab5df2f7e653d206f3e3c0"
          }
        }
      );

      for (let p = 0; p < finder.length; p++) {
        let id = finder[p].userId;
        let temp = resUsert.data.resource.filter(x => x.user_id === id);
        if (temp) {
          finder[p].userName = temp[0].user_name;
        }
      }
      //假设用户id都存在
      //获取景点信息
      console.log(finder)
      for (let index = 0; index < finder.length; index++) {
        let i = "";
        if (finder[index].attrId.length > 0) {
          for (let hu = 0; hu < finder[index].attrId.length; hu++) {
            if (hu === 0) {
              i = `(attraction_id=${finder[index].attrId[hu]})`;
            } else {
              i = `${i} OR (attraction_id=${finder[index].attrId[hu]})`;
            }
          }
          let res = await axios.get(
            `http://121.5.235.15/api/v2/zhouyou/_table/attractions?fields=attraction_name,attraction_city,attraction_feature,attraction_lat,attraction_lon,attraction_id&filter=${i}`,
            {
              params: {
                api_key:
                  "956eed8e98667eca2722be6afc37e123212466565cab5df2f7e653d206f3e3c0"
              }
            }
          );
          let data = res.data.resource;
          finder[index].attrs = await data.map(x => {
            return {
              attrId:x.attraction_id,
              attrName: x.attraction_name,
              attrCity: x.attraction_city,
              attrDesc: x.attraction_feature,
              attrLoc: [x.attraction_lat, x.attraction_lon]
            };
          });
        }
        finder[index].date = await new Date(Number(finder[index].stamp)).Format(
          "yy-MM-dd hh:mm"
        );
      }
      this.Finders = finder;
    },
    hello(index) {
      this.$prompt("留言:", "对方将获取您的联系方式，是否继续?", {
        confirmButtonText: "确定",
        cancelButtonText: "取消"
      })
        .then(({ value }) => {
          let that = this;
          let url = "http://121.5.235.15/api/v2/zhouyou/_table/xunyou_huifu";
          let params = {
            params: {
              api_key:
                "956eed8e98667eca2722be6afc37e123212466565cab5df2f7e653d206f3e3c0"
            }
          };
          let resources = {
            resource: {
              xyhf_user_id: that.$store.state.user_id,
              xyhf_user_id_ed: that.Finders[index].userId,
              xyhf_content: value,
              xyhf_date: Date.parse(new Date()).toString()
            }
          };
          axios
            .post(url, resources, params)
            .then(r => {
              that.$message({
                type: "success",
                message: "发送成功!"
              });
            })
            .catch(r => {});
        })
        .catch(() => {});
    },
    goto(lngLat,id) {
      console.log(lngLat)
      this.$EventBus.$emit("gotolayer", lngLat);
      this.$EventBus.$emit("addPop",{lngLat:lngLat,id:id})
    }
  }
};
</script>

<style scoped>
#omiGod {
  height: 100%;
  overflow: scroll;
}

.finder {
  border-radius: 12px;
  backdrop-filter: blur(5px);
  box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
  text-align: left;
  margin: 8px 3px;
}
::-webkit-scrollbar {
  width: 0 !important;
}
span {
  margin: 2px 4px;
}
.mention {
  font-weight: bold;
  font-size: 15px;
  font-family: Arial;
}
.hello {
  font-weight: lighter;
  font-size: 6px;
  color: #545c64;
  margin: 4px 2px;
}
p {
  font-family: "Microsoft YaHei";
  font-size: 19px;
  margin: 10px 19px;
}
.card {
  margin: 4px 8px;
  /*border-radius: 4px;*/
  /*border-radius: 50% 20% / 10% 40%;*/
  border: 4px white;
  background-color: white;
  border-radius: 10px;
  box-shadow: 5px 5px rgba(0, 0, 0, 0.15);
  transition: all 0.4s ease;
}
.card:hover {
  box-shadow: 0px 0px rgba(0, 0, 0, 0.15);
}
.interactive {
  display: flex;
  justify-content: flex-start;
}
button {
  background-color: transparent;
  border-style: none;
  transform: scale(1.3);
}

.hiddenB {
  display: none;
}
.attrList {
  margin: 2px 10px;
  background-color: transparent;
  border: 1px solid black;
  border-radius: 7px;
  text-align: center;

}
.attrList:hover {
  background-color: rgba(255, 255, 255, 0.8);
  box-shadow: 5px 5px 2px 1px rgba(0, 0, 0, 0.2);
  border: 1px solid black;
  border-radius: 12px;
}
</style>
