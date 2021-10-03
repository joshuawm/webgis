<template>
  <div id="timeline " :style="{ height: screenHeight }">
    <div class="blogContent" v-for="(blog, index) in myBlog" :key="index">
      <span></span>
      <span style="display: inline-block"
        ><p style="font-weight:bold;font-size:15px;">
          {{ blog.userName }}
        </p></span
      >
      <span style="display: inline-block"
        ><i
          class="el-icon-delete-solid"
          v-if="$store.state.username === blog.userName"
          style="color:	#2F4F4F"
          @click="delete_it(index)"
        ></i
      ></span>
      <p style="font-size:4px;color: #545c64;">
        于{{ blog.data }}发布于<span
          style="font-weight: bold; font-size: 5px;"
          >{{ blog.attrName }}</span
        >
      </p>
      <div class="blogContentDetail">
        <p style="font-family:'楷体;font-size:20px;';">
          {{ blog.content }}
        </p>
        <div
          v-if="blog.image[0] !== 'http://localhost:3000/getimage?image=null'"
        >
          <div class="imageDisplay" v-for="img in blog.image" :key="img">
            <span><img @click="imgPreview(img)" :src="img" alt="error"/></span>
          </div>
        </div>
        <el-dialog :modal="false" :visible.sync="previewActive">
          <img style="width:100%;height:100%;" :src="previewURL" alt="" />
        </el-dialog>
      </div>
      <span></span>
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

let baseURl = "http://localhost:3000/getimage?image=";
import axios from "axios";
export default {
  name: "timeline",
  props: {},
  data() {
    return {
      myBlog: [],
      previewActive: false,
      previewURL: "",
      screenHeight: window.innerHeight - 60 - 40 - 60 + "px"
    };
  },
  mounted() {
    this.initialData();
    window.onresize = () => {
      return (() => {
        this.screenHeight = window.innerHeight - 60 - 40 - 60 + "px";
      })();
    };
  },
  methods: {
    async initialData() {
      let myBlog = [];
      let response = await axios.get(
        "http://121.5.235.15/api/v2/zhouyou/_table/yb?fields=*&order=yb_id%20DESC",
        {
          params: {
            api_key:
              "956eed8e98667eca2722be6afc37e123212466565cab5df2f7e653d206f3e3c0"
          }
        }
      );
      let searchbox = {
        user: [],
        attr: []
      };
      let data = response.data.resource;
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
            data: new Date(parseInt(data[index].yb_date)).Format(
              "yy-MM-dd hh:mm"
            )
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
          `http://121.5.235.15/api/v2/zhouyou/_table/attractions?fields=attraction_name&filter=attraction_id=${key}`,
          {
            params: {
              api_key:
                "956eed8e98667eca2722be6afc37e123212466565cab5df2f7e653d206f3e3c0"
            }
          }
        );
        searchbox.attr[key].map(x => {
          myBlog[x].attrName = res.data.resource[0].attraction_name;
        });
      }
      this.myBlog = myBlog;
      // console.log(myBlog)
    },
    imgPreview(url) {
      this.previewURL = url;
      this.previewActive = true;
    },
    delete_it(index) {
      this.$confirm("是否删除该游博?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          let that = this;
          // this.myBlog[index].content
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
            .then(function(r) {
              if (r.data.resource.length !== 0) {
                that.initialData();
              } else {
                this.$message.error("删除失败");
              }
            })
            .catch(r => {});
        })
        .catch(() => {});
    }
  }
};
</script>

<style>
::-webkit-scrollbar {
  width: 0 !important;
}
.blogContent {
  border-radius: 12px;
  background-color: beige;
  text-align: left;
  margin: 8px 3px;
}
img {
  width: 4rem;
  height: 4rem;
  margin: 2px 2px;
  max-width: 100%;
  max-height: 100%;
}
.imageDisplay {
  display: inline-block;
}
p {
  margin: 4px 8px;
}
img {
  margin: 4px 8px;
}
#timeline {
  background-color: rgb(255, 255, 255);
}
</style>
