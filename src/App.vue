<template>
  <router-view>
    <login/>
    <register/>
    <home/>
  </router-view>
</template>

<script>
import login  from './view/login'
import Register from "./view/register";
import home from "./view/home";


export default {
  name: 'App',
  components:{
    Register,
    login,
    home
  }
}
</script>

