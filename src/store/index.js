import Vue from "vue";
import Vuex from "vuex";


Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    user_id:
      sessionStorage.getItem("user_id") == null
        ? 0
        : sessionStorage.getItem("user_id"),
    username:
      sessionStorage.getItem("username") == null
        ? ""
        : sessionStorage.getItem("username"),
    password:
      sessionStorage.getItem("password") == null
        ? ""
        : sessionStorage.getItem("password"),
    phone_number:
      sessionStorage.getItem("phone_number") == null
        ? ""
        : sessionStorage.getItem("phone_number"),
    email:
      sessionStorage.getItem("email") == null
        ? ""
        : sessionStorage.getItem("email"),
    main_show:
      sessionStorage.getItem("main_show") == null
        ? "1"
        : sessionStorage.getItem("main_show"),
    mapZoom: 12,
    mapCenter: [114.405906, 30.534768],
    ybstates: false,
    jingdianID: null,
    jingdianName: "",
    xystates: false,
    xyjingdianID: [],
    xyjingdian: [],
    listToAnalysis:[],
    previewURL:null
  },
  mutations: {
    read_user_info(state, r_data) {
      state.user_id = r_data.user_id;
      state.username = r_data.user_name;
      state.password = r_data.user_pwd;
      state.phone_number = r_data.user_phone;
      state.email = r_data.user_email;
      sessionStorage.setItem("user_id", r_data.user_id);
      sessionStorage.setItem("username", r_data.user_name);
      sessionStorage.setItem("password", r_data.user_pwd);
      sessionStorage.setItem("phone_number", r_data.user_phone);
      sessionStorage.setItem("email", r_data.user_email);
    },
    logout(state) {
      state.user_id = 0;
      state.username = "";
      state.password = "";
      state.phone_number = "";
      state.email = "";
      sessionStorage.removeItem("user_id");
      sessionStorage.removeItem("username");
      sessionStorage.removeItem("password");
      sessionStorage.removeItem("phone_number");
      sessionStorage.removeItem("email");
      sessionStorage.removeItem("main_show");
    },
    change_main_show(state, num) {
      state.main_show = num;
      sessionStorage.setItem("main_show", num);
    },
    set_map_zoom(state, zoom) {
      state.mapZoom = zoom;
    },
    set_map_center(state, center) {
      state.mapCenter = [center.lng, center.lat];
    },
    set_yb_fb(state, ybstate) {
      state.ybstates = ybstate;
    },
    set_xy_fb(state, xystate) {
      state.xystates = xystate;
    },
    set_yb_jingdian(state, jd) {
      state.jingdianID = parseInt(jd.id, 10);
      state.jingdianName = jd.name;
    },
    set_xy_jingdian(state, jd) {
      state.xyjingdianID.push(parseInt(jd.id, 10));
      state.xyjingdian.push({ name: jd.name });
    },
    remove_xy_jingdian(state, index) {
      state.xyjingdianID.splice(index, 1);
      state.xyjingdian.splice(index, 1);
    },
    remove_xy_data(state) {
      state.xyjingdianID = [];
      state.xyjingdian = [];
    },
    curd_list2analysis(state,data){
      let type = data.type
      let value = data.value

      if(type==="add") {
        if (value.length !== undefined) {
          state.listToAnalysis = state.listToAnalysis.concat(value)
        } else if (typeof value === "number") {
          state.listToAnalysis.push(value)
        } else if (typeof value === "string") {
          state.listToAnalysis.push(value)
        }
        state.listToAnalysis = Array.from(new Set(state.listToAnalysis))
      }else if(type==="delete"){
        if (value.length !== undefined) {
          for (let index =0;index<value.length;index++){
            state.listToAnalysis= state.listToAnalysis.filter(x=>x!==value[index])
          }
        } else if (typeof value === "number") {
          state.listToAnalysis= state.listToAnalysis.filter(x=>x!==value)
        } else if (typeof value === "string") {
          state.listToAnalysis= state.listToAnalysis.filter(x=>x!==Number(value))
        }
        state.listToAnalysis = Array.from(new Set(state.listToAnalysis))
      }
      console.log(state.listToAnalysis)
    },
    previewImgM(state,value){
      state.previewURL=value
    }
  }
});
