// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from "vue";
import App from "./App";
import router from "./router"; //index会自动扫描
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import MD5 from "js-md5";
import store from "./store/index";
import html2canvas from "html2canvas";
import splitPane from "vue-splitpane";

Vue.prototype.html2canvas = html2canvas;
Vue.prototype.md5 = MD5;
Vue.use(ElementUI);
Vue.config.productionTip = false;
Vue.component("split-pane", splitPane);
Vue.prototype.$EventBus = new Vue();

// router.beforeEach((to, from, next) => {
//   if (to.meta.requireAuth) {
//     if (store.state.user_id) {
//       next(); // 已登录
//     } else {
//       next({
//         path: "/",
//         query: { redirect: to.fullPath }
//       });
//     }
//   } else {
//     next();
//   }
// });

/* eslint-disable no-new */
new Vue({
  el: "#app",
  router,
  render: h => h(App),
  store
});
