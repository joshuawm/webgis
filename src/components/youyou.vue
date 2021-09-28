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
                  placement="right"
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
                      v-model="jingdian"
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
                <time-line />
              </el-tab-pane>
              <el-tab-pane label="寻友" name="2"
                ><find-friend></find-friend
              ></el-tab-pane>
            </el-tabs>
          </div>
        </template>
        <template slot="paneR">
          <div id="right_all">
            <v-maplayer id="map_show" />
          </div>
        </template>
      </split-pane>
    </div>
  </div>
</template>

<script>
import FindFriend from "../components/son_components/findFriends.vue";
import maplayer from "./son_components/maplayer";
import axios from "axios";
import Vue from "vue";
Vue.prototype.$axios = axios;
import TimeLine from "../components/son_components/timeline.vue";
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
      dialogImageUrl: "",
      dialogVisible: false,
      visible: false,
      yb_content: "发布游博",
      textarea1: "",
      disabled: false,
      jingdian: 1,
      jingdianName: "莲花山",
      youbo_time: null,
      have_files: false
    };
  },
  mounted() {},
  methods: {
    before_upload: function(file) {
      if (file) {
        this.have_files = true;
        console.log(file);
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
            attraction_id: this.jingdian,
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
    },
    handleClick: function(tab, event) {},
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
      if (this.jingdian !== "" && this.textarea1 !== "") {
        this.$refs.upload.submit();
        if (this.have_files) {
          console.log(this.have_files);
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
              attraction_id: this.jingdian,
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
      } else {
        this.$message({
          message: "位置和文本不可为空",
          type: "warning"
        });
      }
    },
    shows() {
      this.visible = !this.visible;
      if (this.visible === false) {
        this.yb_content = "发布游博";
      } else {
        this.yb_content = "取消发布";
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
</style>
