<template>
  <div id="timeline">
    <div>{{ notice }}</div>
    <div v-if="active">
      <div class="blogContent" v-for="(blog,index) in myBlog" :key="blog.data">
        <span></span>
        <p style="font-weight:bold;font-size:15px;">{{ blog.userName }} <i
          class="el-icon-delete-solid"
          v-if="$store.state.username === blog.userName"
          style="color:	#2F4F4F"
          @click="delete_it(index)"
        ></i></p>

        <p style="font-size:4px;color: #545c64;">
          于{{ blog.data }}发布于<span @click="gotoPlace(blog.location)"
                                   style="font-weight: bold; font-size: 5px;"
        >{{ blog.attrName }}</span
        >
        </p>
        <div class="blogContentDetail">
          <p style="font-family:'Microsoft YaHei;font-size:18px;';">
            {{ blog.content }}
          </p>
          <div
            v-if="blog.image[0] !== 'http://localhost:3000/getimage?image=null'"
          >
            <div class="imageDisplay" v-for="img in blog.image" :key="img">
              <span
              ><img @click="$store.commit('previewImgM',img)" :src="img" alt="error"
              /></span>
            </div>
          </div>
<!--          <el-dialog :modal="false" :visible.sync="previewActive" class="dialog">-->
<!--            <img style="width:100%;height:100%;" :src="previewURL" alt=""/>-->
<!--          </el-dialog>-->
        </div>
        <span></span>
      </div>
    </div>
  </div>
</template>

<script>
Date.prototype.Format = function (fmt) {
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

let baseURl = "http://localhost:3000/getimage?image=";
import axios from "axios";

export default {
  name: "timeline",
  props: {
    id: {
      type: Number,
      default: -1
    }
  },
  data() {
    return {
      myBlog: [],
      previewActive: false,
      previewURL: "",
      active: undefined
    };
  },
  async mounted() {
    await this.initialData();
  },
  methods: {
    delete_it(index) {
      this.$confirm("是否删除该游博?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          let that = this;
          let url =
            "http://121.5.235.15/api/v2/zhouyou/_table/yb?filter=yb_content%20=%20%27" +
            this.myBlog[index].content +
            "%27";
          let params = {
            params: {
              api_key:
                "956eed8e98667eca2722be6afc37e123212466565cab5df2f7e653d206f3e3c0"
            }
          };
          axios
            .delete(url, params)
            .then(function (r) {
              if (r.data.resource.length !== 0) {
                that.initialData();
              } else {
                this.$message.error("删除失败");
              }
            })
            .catch(r => {
            });
        })
        .catch(() => {
        });
    },
    async initialData() {
      let myBlog = [];
      let requestsURl;
      if (this.id === -1) {
        requestsURl =
          "http://121.5.235.15/api/v2/zhouyou/_table/yb?fields=*&order=yb_id%20DESC";
      } else if (this.id >= 0) {
        requestsURl = `http://121.5.235.15/api/v2/zhouyou/_table/yb?fields=*&order=yb_id%20DESC&filter=attraction_id=${this.id}`;
      }
      let response = await axios.get(requestsURl, {
        params: {
          api_key:
            "956eed8e98667eca2722be6afc37e123212466565cab5df2f7e653d206f3e3c0"
        }
      });
      let searchbox = {
        user: [],
        attr: []
      };
      let data = response.data.resource;
      if (data.length === 0) {
        this.active = false;
      } else {
        this.active = true;
      }
      let lastData = "";

      for (let index = 0; index < data.length; index++) {
        if (lastData === data[index].yb_date) {
          myBlog[myBlog.length - 1].image.push(
            `${baseURl}${data[index].yb_imgs}`
          );
        } else {
          let blog = {
            userId: data[index].user_id,
            attrId: data[index].attraction_id,
            content: data[index].yb_content,
            image: [`${baseURl}${data[index].yb_imgs}`],
            data: new Date(parseInt(data[index].yb_date)).Format("yy-MM-dd")
          };
          myBlog.push(blog);
        }
        lastData = data[index].yb_date;
      }
      //整合数据
      for (let ind = 0; ind < myBlog.length; ind++) {
        let u = myBlog[ind].userId.toString();
        let a = myBlog[ind].attrId.toString();
        //用户
        if (searchbox.user[u] === undefined) {
          searchbox.user[u] = [ind];
        } else {
          searchbox.user[u].push(ind);
        }
        //景点
        if (searchbox.attr[a] === undefined) {
          searchbox.attr[a] = [ind];
        } else {
          searchbox.attr[a].push(ind);
        }
      }

      console.log(searchbox);
      //处理userId获取userName
      for (let key in searchbox.user) {
        let res = await axios.get(
          `http://121.5.235.15/api/v2/zhouyou/_table/Users?fields=user_name&filter=user_id=${key}`,
          {
            params: {
              api_key:
                "956eed8e98667eca2722be6afc37e123212466565cab5df2f7e653d206f3e3c0"
            }
          }
        );
        searchbox.user[key].map(x => {
          myBlog[x].userName = res.data.resource[0].user_name;
        });
      }
      //处理景点名称
      for (let key in searchbox.attr) {
        let res = await axios.get(
          `http://121.5.235.15/api/v2/zhouyou/_table/attractions?fields=attraction_name,attraction_lat,attraction_lon&filter=attraction_id=${key}`,
          {
            params: {
              api_key:
                "956eed8e98667eca2722be6afc37e123212466565cab5df2f7e653d206f3e3c0"
            }
          }
        );
        searchbox.attr[key].map(x => {
          myBlog[x].attrName = res.data.resource[0].attraction_name;
          myBlog[x].location = [res.data.resource[0].attraction_lat, res.data.resource[0].attraction_lon];
        });
      }
      this.myBlog = myBlog;
      // console.log(myBlog)
    },
    imgPreview(url) {
      this.previewURL = url;
      console.log(url)
      this.previewActive = true;
    },
    gotoPlace(lngLat) {
      console.log(lngLat)
    }
  },
  computed: {
    notice() {
      if (this.active === undefined) {
        return "加载中";
      } else if (this.active === true) {
        return "";
      } else if (this.active === false) {
        return "目前还没有评论呢 不如写下第一个评论";
      }
    }
  }
};
</script>

<style>
#timeline {
  overflow-y: scroll;
  height: 100%;
}

::-webkit-scrollbar {
  width: 0 !important;
}

.blogContent {
  border-radius: 12px;
  backdrop-filter: blur(5px);
  text-align: left;
  box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
  /*background-color: transparent;*/
  margin: 8px 3px;

}

img {
  width: 2rem;
  height: 2rem;
  margin: 2px 2px;
  max-width: 100%;
  max-height: 100%;
}

.imageDisplay {
  display: inline-block;
}

.blogContentDetail {
  /*border: 1px solid black;*/
  /*border-radius: 2px;*/
}

p {
  margin: 4px 8px;
}

img {
  margin: 4px 8px;
}

textarea {
  max-width: 170px;
}
/deep/ .el-dialog__wrapper.dialog{
  display: contents !important;
}
</style>
