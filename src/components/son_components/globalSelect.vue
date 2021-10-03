<template>
  <div>
    <el-select
      v-model="queryValue"
      multiple
      size="medium"
      filterable
      remote
      :remote-method="globalSearch"
      clearable
      :loading="loading"
      placeholder="随意搜索"
      @change="value => goto(value)"
    >
      <el-option
        v-for="item in option"
        :key="item.label"
        :label="item.label"
        :value="item.value"
      ></el-option>
      ></el-select
    >
  </div>
</template>

<script>
let searchList = {
  attractions: [
    "attraction_name",
    "attraction_city",
    "attraction_en_name",
    "attraction_tags",
    "attraction_feature"
  ]
};
import axios from "axios";

export default {
  name: "globalSearch",
  data() {
    return {
      loading: false,
      option: [],
      queryValue: ""
    };
  },
  methods: {
    async globalSearch(queryValue) {
      if (queryValue !== "") {
        this.loading = true;
        let filterbox = [];
        for (let index = 0; index < searchList.attractions.length; index++) {
          let temp = `(${searchList.attractions[index]} like %${queryValue}%)`;
          filterbox.push(temp);
        }
        let filterString = filterbox.join(" OR ");
        let filterURl = encodeURIComponent(filterString);

        let requestsURL = `http://121.5.235.15/api/v2/zhouyou/_table/Attractions?fields=attraction_name,attraction_id,attraction_lat,attraction_lon&filter=${filterURl}&limit=10`;

        let response = await axios.get(requestsURL, {
          params: {
            api_key:
              "956eed8e98667eca2722be6afc37e123212466565cab5df2f7e653d206f3e3c0"
          }
        });
        let data = response.data.resource;
        //process to options
        if (data !== undefined) {
          let result = data.map(x => {
            return {
              label: `${x.attraction_name}`,
              value: [x.attraction_id, x.attraction_lon, x.attraction_lat]
            };
          });
          this.option = JSON.parse(JSON.stringify(result));
          this.loading = false;
        }
      }
    },
    goto(value) {
      // let info={lat:value.value[2],lon:value.value[1]}
      this.$EventBusthis.$emit("panto", [value[1], value[2]]);
    }
  }
};
</script>
<style scoped></style>
