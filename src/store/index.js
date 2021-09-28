import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex)

export default new Vuex.Store({
  state:{
    user_id:sessionStorage.getItem('user_id') == null ? 0 :sessionStorage.getItem('user_id'),
    username:sessionStorage.getItem('username') == null ? '' :sessionStorage.getItem('username'),
    password:sessionStorage.getItem('password') == null ? '' :sessionStorage.getItem('password'),
    phone_number:sessionStorage.getItem('phone_number') == null ? '' :sessionStorage.getItem('phone_number'),
    email:sessionStorage.getItem('email') == null ? '' :sessionStorage.getItem('email'),
    main_show:sessionStorage.getItem('main_show') == null ? '1' :sessionStorage.getItem('main_show'),
  },
  mutations:{
    read_user_info(state,r_data){
      state.user_id = r_data.user_id;
      state.username = r_data.user_name;
      state.password = r_data.user_pwd;
      state.phone_number = r_data.user_phone;
      state.email = r_data.user_email;
      sessionStorage.setItem('user_id',r_data.user_id);
      sessionStorage.setItem('username',r_data.user_name);
      sessionStorage.setItem('password',r_data.user_pwd);
      sessionStorage.setItem('phone_number',r_data.user_phone);
      sessionStorage.setItem('email',r_data.user_email)
    },
    logout(state){
      sessionStorage.removeItem('user_id');
      sessionStorage.removeItem('username');
      sessionStorage.removeItem('password');
      sessionStorage.removeItem('phone_number');
      sessionStorage.removeItem('email');
      sessionStorage.removeItem('main_show')
    },
    change_main_show(state,num){
      state.main_show = num;
      sessionStorage.setItem('main_show',num)
    }
  }
})
