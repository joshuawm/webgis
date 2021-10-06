import Vue from "vue";
import VueRouter from "vue-router";

import login from "../view/login";
import register from "../view/register";
import home from "../view/home";
import wode from "../components/son_components/wodetest"
import jingdianfenxi from "../components/jingdianfenxi";
Vue.use(VueRouter);

export default new VueRouter({
  routes: [
    {
      path: "",
      component: login
    },
    {
      //路由路径
      path: "/login",
      //调转组件
      component: login
    },
    {
      //路由路径
      path: "/register",
      //调转组件
      component: register
    },
    {
      path: "/home",
      component: home,
      meta: {
        requireAuth: true
      }
    },
    {
      path: "/wode",
      component: wode
    },
    {
      path:"/test",
      component:jingdianfenxi
    }

  ],
  mode: "history"
});
