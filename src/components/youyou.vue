<template>
  <div id="body-all">
    <div id="l_r">
      <split-pane :min-percent="15" :default-percent="15" split="vertical">
        <template slot="paneL">
          <div id="left_all">
            <el-tabs
              v-model="activeName"
              @tab-click="handleClick"
              :stretch="true"
            >
              <el-tab-pane label="游博" name="1">
                <el-popover
                  placement="right-start"
                  width="365"
                  trigger="manual"
                  v-model="visible"
                >
                  <div class="editor-after-div">
                    <el-input
                      type="textarea"
                      :autosize="{ minRows: 4, maxRows: 8 }"
                      placeholder="说点儿什么呢..."
                      v-model="textarea1"
                    >
                    </el-input>
                    <div>
                      <span>选择景点:</span>
                    </div>
                    <el-input
                      placeholder="点击地图景点以获取位置信息"
                      v-model="this.$store.state.jingdianName"
                      :disabled="true"
                      style="width: 60%"
                    ></el-input>
                    <div>
                      <span>选择图片:</span>
                    </div>
                    <el-upload
                      :on-success="success_handle"
                      :before-upload="before_upload"
                      class="updata-after-upload"
                      style="display: inline-block"
                      ref="upload"
                      action="http://127.0.0.1:3000/images"
                      multiple="multiple"
                      list-type="picture-card"
                      :auto-upload="false"
                      :limit="20"
                    >
                      <i slot="default" class="el-icon-plus"></i>
                      <div slot="file" slot-scope="{ file }">
                        <img
                          class="el-upload-list__item-thumbnail"
                          :src="file.url"
                          alt=""
                        />
                        <span class="el-upload-list__item-actions">
                          <span
                            class="el-upload-list__item-preview"
                            @click="handlePictureCardPreview(file)"
                          >
                            <i class="el-icon-zoom-in"></i>
                          </span>
                          <span
                            v-if="!disabled"
                            class="el-upload-list__item-delete"
                            @click="handleRemove(file)"
                          >
                            <i class="el-icon-delete"></i>
                          </span>
                        </span>
                      </div>
                    </el-upload>
                    <el-dialog :modal="false" :visible.sync="dialogVisible">
                      <img width="100%" :src="dialogImageUrl" alt="" />
                    </el-dialog>
                    <el-button
                      style="width: 100%"
                      size="small"
                      type="success"
                      @click="submitUpload"
                      >发布</el-button
                    >
                  </div>
                  <el-button
                    slot="reference"
                    style="width: 100%"
                    @click="shows"
                    >{{ yb_content }}</el-button
                  >
                </el-popover>
                <time-line :id="-2" ref="timeline"></time-line>
              </el-tab-pane>
              <el-tab-pane label="寻友" name="2">
                <el-popover
                  placement="right-start"
                  width="365"
                  trigger="manual"
                  v-model="visible_xy"
                >
                  <div class="editor-after-div">
                    <el-input
                      type="textarea"
                      :autosize="{ minRows: 2, maxRows: 4 }"
                      placeholder="说点儿什么呢..."
                      v-model="textarea2"
                    >
                    </el-input>
                    <div v-if="$store.state.xyjingdian.length === 0">
                      <i class="el-icon-s-promotion"></i
                      ><span style="">点击地图添加景点</span>
                    </div>
                    <div v-if="$store.state.xyjingdian.length !== 0">
                      <el-table
                        :data="$store.state.xyjingdian"
                        style="width: 100%"
                        max-height="250"
                      >
                        <el-table-column
                          fixed
                          prop="name"
                          label="景点"
                          width="150"
                        >
                        </el-table-column>
                        <el-table-column fixed="right" label="操作" width="120">
                          <template slot-scope="scope">
                            <el-button
                              @click.native.prevent="
                                deleteRow(scope.$index, tableData)
                              "
                              type="text"
                              size="small"
                            >
                              移除
                            </el-button>
                          </template>
                        </el-table-column>
                      </el-table>
                    </div>
                    <el-button
                      style="width: 100%;margin-top:20px"
                      size="small"
                      type="success"
                      @click="fabu"
                      >发布</el-button
                    >
                  </div>
                  <el-button
                    slot="reference"
                    style="width: 100%"
                    @click="shows_xy"
                    >{{ xy_content }}</el-button
                  >
                </el-popover>
                <find-friend id="xy" ref="xy"></find-friend
              ></el-tab-pane>
            </el-tabs>
            <el-dialog
              :modal="false"
              :visible.sync="dialogVisible_message"
              width="20%"
              title="消息"
            >
              <div>
                <el-tabs
                  id="message_dialog"
                  v-model="activeName_message"
                  @tab-click="handleClick_message"
                  :stretch="true"
                  center="true"
                >
                  <el-tab-pane label="我收到的" name="1">
                    <div>
                      <span v-if="get_messages.length === 0">这里空空如也</span>
                      <div v-if="get_messages.length !== 0">
                        <div
                          class="getMessage"
                          v-for="(message, index) in get_messages"
                          :key="message.xyhf_content"
                          @click="readit(index)"
                        >
                          <el-row
                            ><el-col :span="12"
                              ><span style="font-size:18px;font-weight:bold;"
                                ><span style="font-size:8px;">From: </span
                                >{{ message.user_name }}</span
                              ></el-col
                            >
                            <el-col :span="8"
                              ><span
                                style="font-size:8px;font-weight:lighter;"
                                >{{
                                  new Date(Number(message.xyhf_date)).Format(
                                    "yy-MM-dd hh:mm"
                                  )
                                }}</span
                              ></el-col
                            >
                            <el-col :span="4"
                              ><span style="right:10%;"
                                ><el-badge
                                  v-if="message.xyhf_is_read === 1"
                                  value="new"
                                ></el-badge></span></el-col
                          ></el-row>
                          <p style="font-size:16px;margin:3px 8px;">
                            {{ message.xyhf_content }}
                          </p>
                          <div>
                            <span class="el-icon-phone"></span
                            ><span>{{ message.user_phone }}</span
                            ><br />
                            <span class="el-icon-s-comment"></span
                            ><span>{{ message.user_email }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </el-tab-pane>
                  <el-tab-pane label="我发送的" name="2">
                    <div>
                      <span v-if="send_messages.length === 0"
                        >什么消息也没有</span
                      >
                      <div v-if="send_messages.length !== 0">
                        <div
                          class="sendMessage"
                          v-for="message in send_messages"
                          :key="message.xyhf_content"
                        >
                          <el-row
                            ><el-col :span="20"
                              ><span style="font-size:18px;font-weight:bold;"
                                ><span style="font-size:8px;">To: </span
                                >{{ message.user_name }}</span
                              ></el-col
                            ></el-row
                          >
                          <p style="font-size:16px;margin:3px 8px;">
                            {{ message.xyhf_content }}
                          </p>
                          <el-row>
                            <el-col :span="20"
                              ><span
                                style="font-size:8px;font-weight:lighter;"
                                >{{
                                  new Date(Number(message.xyhf_date)).Format(
                                    "yy-MM-dd hh:mm"
                                  )
                                }}</span
                              ></el-col
                            >
                          </el-row>
                        </div>
                      </div>
                    </div>
                  </el-tab-pane>
                </el-tabs>
              </div>
            </el-dialog>
          </div>
        </template>
        <template slot="paneR">
          <div id="right_all">
            <v-maplayer id="map_show" />
            <div class="w">
              <div class="winBody">
                <el-button
                  type="info"
                  icon="el-icon-message"
                  circle
                  @click="show_message"
                ></el-button>
              </div>
            </div>
          </div>
        </template>
      </split-pane>
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
import FindFriend from "../components/son_components/findFriends.vue";
import maplayer from "./son_components/maplayer";
import axios from "axios";
import Vue from "vue";
Vue.prototype.$axios = axios;
import TimeLine from "./son_components/timelineyb.vue";
export default {
  name: "youyou",
  components: {
    "v-maplayer": maplayer,
    TimeLine,
    FindFriend
  },
  data() {
    return {
      activeName: "1",
      activeName_message: "1",
      dialogImageUrl: "",
      dialogVisible: false,
      visible: false,
      visible_xy: false,
      yb_content: "发布游博",
      textarea1: "",
      textarea2: "",
      disabled: false,
      youbo_time: null,
      have_files: false,
      xy_content: "发布寻友",
      winwidth: document.documentElement.clientWidth + "px",
      winheight: document.documentElement.clientHeight + "px",
      dialogVisible_message: false,
      send_messages: [],
      get_messages: []
    };
  },
  mounted() {
    this.get_data_messages();
  },

  methods: {
    handleClick_message() {
      this.get_data_messages();
    },
    async get_data_messages() {
      let get_messages = null
      let send_messages = null
      let that = this;
      let get_url = `http://121.5.235.15/api/v2/zhouyou/_table/xunyou_huifu?order=xyhf_date%20DESC&filter=(xyhf_user_id_ed=${that.$store.state.user_id})`;
      let send_url = `http://121.5.235.15/api/v2/zhouyou/_table/xunyou_huifu?order=xyhf_date%20DESC&filter=(xyhf_user_id=${that.$store.state.user_id})`;
      let p = {
        params: {
          api_key:
            "956eed8e98667eca2722be6afc37e123212466565cab5df2f7e653d206f3e3c0"
        }
      };
      let r01 = await axios.get(get_url, p);
      get_messages = await r01.data.resource;
      for (let i = 0; i < that.get_messages.length; i++) {
        let url = `http://121.5.235.15/api/v2/zhouyou/_table/users/${that.get_messages[i].xyhf_user_id}?fields=user_name%2Cuser_phone%2Cuser_email`;
        let r02 = await axios.get(url, p);
        get_messages[i].user_name = r02.data.user_name;
        get_messages[i].user_phone = r02.data.user_phone;
        get_messages[i].user_email = r02.data.user_email;
      }
      let r03 = await axios.get(send_url, p);
      send_messages = await r03.data.resource;
      for (let i = 0; i < that.send_messages.length; i++) {
        let url = `http://121.5.235.15/api/v2/zhouyou/_table/users/${that.send_messages[i].xyhf_user_id_ed}?fields=user_name`;
        let r04 = await axios.get(url, p);
        send_messages[i].user_name = r04.data.user_name;
      }
      this.get_messages = get_messages
      this.send_messages = send_messages
    },
    show_message() {
      this.dialogVisible_message = true;
      this.get_data_messages();
    },
    fabu() {
      let that = this;
      if (
        that.textarea2 === "" &&
        that.$store.state.xyjingdianID.length === 0
      ) {
        this.$message({
          message: "位置或文本不可为空",
          type: "warning"
        });
      } else {
        let xys = {
          resource: {
            xy_user_id: that.$store.state.user_id,
            xy_content: that.textarea2,
            xy_attractions: JSON.stringify({
              resource: that.$store.state.xyjingdianID
            }),
            date: Date.parse(new Date()).toString()
          }
        };
        let p = {
          params: {
            api_key:
              "956eed8e98667eca2722be6afc37e123212466565cab5df2f7e653d206f3e3c0"
          }
        };
        axios
          .post("http://121.5.235.15/api/v2/zhouyou/_table/xunyou", xys, p)
          .then(r => {
            that.$store.commit("remove_xy_data");
            that.shows_xy();
            that.textarea2 = "";
            setTimeout(() => {
              that.$refs.xy.initial();
            }, 100);
          })
          .catch(r => {});
      }
    },
    before_upload: function(file) {
      if (file) {
        this.have_files = true;
      }
    },
    success_handle: function(res) {
      if (res["on_off"] !== false) {
        let imgname =
          res["files"][0]["path"] +
          "." +
          res["files"][0]["originalname"].split(".").pop();
        let yb = {
          resource: {
            attraction_id: this.$store.state.jingdianID,
            user_id: this.$store.state.user_id,
            yb_content: this.textarea1,
            yb_imgs: imgname,
            yb_date: this.youbo_time.toString()
          }
        };
        let p = {
          params: {
            api_key:
              "956eed8e98667eca2722be6afc37e123212466565cab5df2f7e653d206f3e3c0"
          }
        };
        console.log('yb')
        console.log(yb)
        axios
          .post("http://121.5.235.15/api/v2/zhouyou/_table/yb", yb, p)
          .then(function(resp) {})
          .catch(function(resp) {});
      } else {
        this.$message({
          message: "发布失败",
          type: "error"
        });
      }
      setTimeout(() => this.$refs.timeline.initialData(), 100);
    },
    handleClick: function(tab, event) {
      this.$refs.xy.initial();
      this.$refs.timeline.initialData();
    },
    handleRemove(file) {
      let uploadFiles = this.$refs.upload.uploadFiles;
      for (let i = 0; i < uploadFiles.length; i++) {
        if (uploadFiles[i]["url"] === file.url) {
          uploadFiles.splice(i, 1);
        }
      }
    },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },
    submitUpload() {
      this.youbo_time = Date.parse(new Date());
      if (this.$store.state.jingdianID !== null && this.textarea1 !== "") {
        this.$refs.upload.submit();
        if (this.have_files) {
          this.have_files = false;
          setTimeout(() => {
            this.$refs.upload.clearFiles();
            this.textarea1 = "";
            this.shows();
          }, 100);
        } else {
          // 没有图片
          let yb = {
            resource: {
              attraction_id: this.$store.state.jingdianID,
              user_id: this.$store.state.user_id,
              yb_content: this.textarea1,
              yb_date: this.youbo_time.toString()
            }
          };
          let p = {
            params: {
              api_key:
                "956eed8e98667eca2722be6afc37e123212466565cab5df2f7e653d206f3e3c0"
            }
          };
          axios
            .post("http://121.5.235.15/api/v2/zhouyou/_table/yb", yb, p)
            .then(function(resp) {})
            .catch(function(resp) {});
          this.textarea1 = "";
          this.shows();
        }
        setTimeout(() => this.$refs.timeline.initialData(), 100);
      } else {
        this.$message({
          message: "位置和文本不可为空",
          type: "warning"
        });
      }
    },
    shows_xy() {
      this.visible_xy = !this.visible_xy;
      this.$store.commit("set_xy_fb", this.visible_xy);
      if (this.visible_xy === false) {
        this.xy_content = "发布寻友";
      } else {
        this.xy_content = "取消发布";
      }
    },
    shows() {
      this.visible = !this.visible;
      this.$store.commit("set_yb_fb", this.visible);
      if (this.visible === false) {
        this.yb_content = "发布游博";
      } else {
        this.yb_content = "取消发布";
      }
    },
    deleteRow(index, rows) {
      this.$store.commit("remove_xy_jingdian", index);
    },
    readit(index) {
      console.log(1);
      console.log(this.send_messages);
      let that = this;
      that.send_messages;
      if (that.get_messages[index].xyhf_is_read === 1) {
        let url = `http://121.5.235.15/api/v2/zhouyou/_table/xunyou_huifu/${that.get_messages[index].xyhf_id}`;
        axios
          .put(
            url,
            {
              xyhf_is_read: 0
            },
            {
              params: {
                api_key:
                  "956eed8e98667eca2722be6afc37e123212466565cab5df2f7e653d206f3e3c0"
              }
            }
          )
          .then(r => {
            that.get_data_messages();
          })
          .catch(r => {});
      }
    }
  }
};
</script>

<style scoped>
#body-all {
  position: absolute;
  top: 68px;
  right: 0;
}
#right_all {
  padding-left: 13px;
  position: absolute;
  width: 100%;
  height: 100vh;
}
.editor-after-div >>> .el-upload {
  margin-top: 5px;
  width: 65px;
  height: 65px;
  text-align: center;
  line-height: 65px;
  margin-bottom: 5px;
}

.editor-after-div >>> .el-upload-list__item-thumbnail {
  width: 65px;
  height: 65px;
}
.editor-after-div >>> .el-upload-list__item {
  margin-top: 5px;
  width: 65px;
  height: 65px;
  margin-bottom: 5px;
}
::-webkit-scrollbar {
  width: 0 !important;
}
#timeline {
  overflow-y: scroll;
  overflow-x: hidden;
  height: 100%;
}
#xy {
  overflow-y: scroll;
  overflow-x: hidden;
  height: 100%;
}
.winBody {
  position: fixed !important;
  right: 10px;
  bottom: 10px;
}
#message_dialog {
  height: 500px;
  overflow-y: scroll;
  overflow-x: hidden;
}
.getMessage {
  background-color: beige;
  border-radius: 12px;
  padding: 6px;
  margin: 6px 2px;
}
.sendMessage {
  background-color: beige;
  border-radius: 12px;
  padding: 6px;
  margin: 6px 2px;
}
</style>
