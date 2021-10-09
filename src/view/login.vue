<template>
  <div id="body-all">
    <div id="login-box">
      <el-form label-width="80px">
        <div style="text-align: center">
          <span
            style="font-family: 华光行楷_CNKI,serif;font-size: 30px;margin-top: 0"
            >周游</span
          >
        </div>

        <el-input
          v-model="input01"
          placeholder="请输入用户名"
          clearable
          minlength="3"
          maxlength="16"
        ></el-input>
        <el-input
          placeholder="请输入密码"
          v-model="input02"
          show-password
          minlength="5"
          maxlength="16"
        ></el-input>
      </el-form>
      <div class="login">
      <el-button type="primary" plain id="login" @click="login_button">
        登 录</el-button
      ></div>
      <el-button type="text" id="youkefangwen" @click="youkefangwen"
        >游客访问</el-button
      >
      <el-button type="text" id="register" @click="routes01"
        >免费注册</el-button
      >
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import axios from "axios";
import register from "./register";
import home from "./home";

Vue.prototype.$axios = axios;
export default {
  name: "login",
  data() {
    return {
      input01: "whtower",
      input02: "wht9264424826",
      resp_info: "",
      if_login_ok: true
    };
  },
  components: {
    register
  },
  methods: {
    routes01: function() {
      this.$router.push("/register");
    },
    login_button: function() {
      if (this.input01 !== "" && this.input02 !== "") {
        if (
          this.input01.match(/^[a-z0-9_-]{3,16}$/) &&
          this.input02.match(
            /(?!^([0-9]+|[a-zA-Z]+|[!#*_]+)$)^[a-zA-Z0-9!#*_]{5,16}$/
          )
        ) {
          let url = "http://121.5.235.15/api/v2/zhouyou/_table/users?filter=";
          let uname = "(user_name=" + this.input01 + ")";
          let upwd = "(user_pwd=" + this.md5(this.input02) + ")";
          let g_url = url + uname + "%20AND%20" + upwd;
          let that = this;
          axios
            .get(g_url, {
              params: {
                api_key:
                  "956eed8e98667eca2722be6afc37e123212466565cab5df2f7e653d206f3e3c0"
              }
            })
            .then(function(resp) {
              let r_data = resp.data.resource;
              if (r_data.length >= 1) {
                that.$store.commit("read_user_info", r_data[0]);
                if (that.$store.state.username) {
                  that.$router.push("./home");
                }
              } else {
                that.$message.error("账号或密码错误,请重新输入");
              }
            })
            .catch(resp => (this.resp_info = resp.data));
        } else {
          this.$message({
            message: "账号密码格式或长度错误",
            type: "warning"
          });
        }
      } else {
        this.$message({
          message: "账号密码不能为空",
          type: "warning"
        });
      }
    },
    youkefangwen() {
      this.$router.push("./home");
    }
  }
};
</script>

<style scoped>
#login-box {
  border-radius: 35px;
  position: absolute;
  top: 40%;
  left: 47%;
  margin: -150px 0 0 -200px;
  width: 400px;
  height: 250px;
  /* border: 2px solid #409eff; */
  background-color: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(4px);
box-shadow: rgba(17, 12, 46, 0.15) 0px 48px 100px 0px;
  padding: 20px 40px 40px;
}

.el-input {
  margin-top: 15px;
  margin-bottom: 10px;
  /*opacity:0.5;*/
}

#login {
  width: 80px;
  margin-top: 25px;
  margin-left: 40%;
  border-radius: 35px;
  /* margin-right: 0; */
}
/deep/ .el-input__inner{
  -webkit-appearance: none;
    background-color: rgba(255,255,255,0.3);
    background-image: none;
    border-radius: 30px;
    border: 0px solid transparent;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    color: black;
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
/deep/ .el-button--text {
    color: #006aff;
    background: 0 0;
    padding-left: 0;
    padding-right: 0;
}
/deep/.el-button--primary.is-plain:focus, .el-button--primary.is-plain:hover {
    background: #40a0ff2a;
    backdrop-filter: blur(2px);
    border-color: #40a0ff2a;
    color: #FFF;
}
/deep/.el-button--primary.is-plain {
    color: #fafafa;
    background: rgba(245,255,255,0.3);
    border-color: transparent;
}
#register {
  margin-top: 15px;
  margin-bottom: 5px;
  float: right;
  margin-right: 20px;
}

#body-all {
  background: url("../assets/bg.jpg");
  width: 100%;
  height: 100vh;
  position: fixed;
  background-size: 100% 100%;
  margin-top: -8px;
  margin-left: -8px;
}
#youkefangwen {
  margin-top: 15px;
  margin-bottom: 5px;
  float: left;
}

</style>
