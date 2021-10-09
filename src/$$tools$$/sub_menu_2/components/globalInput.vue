<template>
  <div>
    <el-autocomplete v-model="queryValue" :fetch-suggestions="globalSearch" placeholder="尝试在这边搜索" @select="changeValue">
    </el-autocomplete>
<!--<el-input v-model="queryValue" multiple size="medium"-->
<!--              filterable remote :remote-method="globalSearch"-->
<!--              clearable :loading="loading"-->
<!--              placeholder="随意搜索" @change="changeValue">-->
<!--  <el-option v-for="item in option"  :key="item.value" :label="item.label" :value="item.value" ></el-option>-->
<!--&gt;</el-input>-->
  </div>
</template>

<script>
let searchList={
  attractions:[
    "attraction_name","attraction_city","attraction_en_name","attraction_tags","attraction_feature"
  ]
}
import axios from "axios"

export default {
  name:"globalSearch",
  data(){
    return{
      loading:false,
      option:[],
      queryValue:""
    }
  },
  methods:{
    async globalSearch(queryValue,cb){
      if(queryValue !== "") {
        this.loading=true
        let filterbox = []
        for (let index=0 ;index < searchList.attractions.length;index++){
          let temp = `(${searchList.attractions[index]} like %${queryValue}%)`
          filterbox.push(temp)
        }
        let filterString=filterbox.join(" OR ")
        let filterURl = encodeURIComponent(filterString)

        let requestsURL= `http://121.5.235.15/api/v2/zhouyou/_table/Attractions?fields=attraction_name,attraction_id,attraction_lat,attraction_lon&filter=${filterURl}&limit=10`

        let response = await axios.get(requestsURL,
          {
            params: {
              api_key: '956eed8e98667eca2722be6afc37e123212466565cab5df2f7e653d206f3e3c0'
            }
          })
        let data = response.data.resource
        console.log('data is')
        console.log(data)
        //process to options
        if(data !== undefined){
          let result = data.map((x)=>{
            return {value:`${x.attraction_name}`,label:`${x.attraction_id}`,coord:JSON.stringify([x.attraction_lat,x.attraction_lon])}
          })
          console.log("result is")
          console.log(result)
          this.option=JSON.parse(JSON.stringify(result))
          this.loading=false
          cb(this.option)
        }
      }

    },
    changeValue(data){
      console.log(data)
      this.$EventBus.$emit("flyto",JSON.parse(data.coord))
      this.$EventBus.$emit("selectChange",Number(data.label))
    }
  }
}
</script>
<style scoped>

</style>
