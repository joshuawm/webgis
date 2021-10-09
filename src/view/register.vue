<template>
  <div id="body-all">
    <div id="login-box">
      <el-form>
        <el-input
          v-model="input01"
          placeholder="请输入用户名"
          clearable
          minlength="3"
          maxlength="16"
        ></el-input>
        <el-input
          v-model="input02"
          placeholder="请输入密码"
          show-password
          minlength="5"
          maxlength="16"
        ></el-input>
        <el-input
          v-model="input03"
          placeholder="请输入手机号"
          clearable
          minlength="11"
          maxlength="11"
        ></el-input>
        <el-input
          v-model="input04"
          placeholder="请输入邮箱"
          clearable
          minlength="5"
          maxlength="30"
        ></el-input>
      </el-form>
      <div>
      <el-button type="primary" plain id="register" @click="register_button">
        注 册
      </el-button></div>
      <el-button type="text" @click="routes01" id="login" icon="el-icon-back"
        >返回登录</el-button
      >
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "register",
  data() {
    return {
      page_name: "—注册",
      input01: "",
      input02: "",
      input03: "",
      input04: ""
    };
  },
  components: {},
  methods: {
    routes01: function() {
      this.$router.push("./login");
    },
    register_button: function() {
      let name_ok = this.input01.match(/^[a-z0-9_-]{3,16}$/);
      let pwd_ok = this.input02.match(
        /(?!^([0-9]+|[a-zA-Z]+|[!#*_]+)$)^[a-zA-Z0-9!#*_]{5,16}$/
      );
      let phone_ok = this.input03.match(/1\d{10}/);
      let email_ok = this.input04.match(
        /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/
      );
      let error_message = "";
      if (!name_ok) {
        error_message += " 用户名 ";
      }
      if (!pwd_ok) {
        error_message += " 密码 ";
      }
      if (!phone_ok) {
        error_message += " 手机号 ";
      }
      if (!email_ok) {
        error_message += " 邮箱 ";
      }
      error_message += "格式错误";

      if (name_ok && pwd_ok && phone_ok && email_ok) {
        let that = this;
        let params = {
          params: {
            api_key:
              "956eed8e98667eca2722be6afc37e123212466565cab5df2f7e653d206f3e3c0"
          }
        };
        let new_user = {
          resource: {
            user_name: this.input01,
            user_pwd: this.md5(this.input02),
            user_phone: this.input03,
            user_email: this.input04
          }
        };
        let url = "http://121.5.235.15/api/v2/zhouyou/_table/users?filter=";
        let uname = "(user_name=" + this.input01 + ")";
        let g_url = url + uname;
        axios.get(g_url, params).then(function(resp) {
          if (resp.data.resource.length === 0) {
            axios
              .post(
                "http://121.5.235.15/api/v2/zhouyou/_table/users",
                new_user,
                params
              )
              .then(function(resp) {
                if (resp.data.resource.length >= 0) {
                  that.$message({
                    message: "注册成功",
                    type: "success"
                  });
                  that.routes01();
                }
              })
              .catch(resp => ({}));
          } else {
            that.$message({
              message: "该用户名已被注册",
              type: "warning"
            });
          }
        });
      } else {
        this.$message({
          message: error_message,
          type: "warning"
        });
      }
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
  height: 320px;
  /* border: 2px solid #409eff; */
  padding: 40px;
  background-color: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(4px);
  box-shadow: rgba(17, 12, 46, 0.15) 0px 48px 100px 0px;
}
.el-input {
  margin-top: 15px;
  margin-bottom: 10px;
  /*opacity:0.5;*/
}
#login {
  margin-bottom: 5px;
  float: right;
  margin-right: 20px;
}
#register {
  width: 80px;
  margin-top: 25px;
  margin-left: 40%;
  border-radius: 35px;
}
#body-all {
  width: 100%;
  height: 100vh;
  position: fixed;
  background-size: 100% 100%;
  margin-top: -8px;
  margin-left: -8px;
  background: url("../assets/bg.jpg");
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
    color: #006affa2;
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
    color: #00a7f5;
    background: rgba(245,255,255,0.3);
    border-color: transparent;
}
</style>
