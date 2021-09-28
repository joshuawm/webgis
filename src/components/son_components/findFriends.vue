<template>
  <div id="omiGod">
    <div class="finder" v-for="finder in Finders" :key="finder.content">
      <span>&nbsp;</span>
      <span>&nbsp;</span>
      <el-row
        ><span class="mention">{{ finder.userName }}</span
        >&nbsp;&nbsp;<span class="hello">{{ finder.date }}</span></el-row
      >
      <p>{{ finder.content }}</p>
      <div class="card">
        <el-row
          ><span class="mention">{{ finder.attr.attrName }}</span
          >&nbsp;&nbsp;<span class="hello">{{
            finder.attr.attrCity
          }}</span></el-row
        >
        <br />
        <!-- <span>{{finder.attr.attrDesc}}</span> -->
      </div>
      <span>&nbsp;</span>
    </div>
  </div>
</template>

<script>
Date.prototype.Format = function(fmt) {
  var o = {
    "M+": this.getMonth() + 1, // 月份
    "d+": this.getDate(), // 日
    "h+": this.getHours(), // 小时
    "m+": this.getMinutes(), // 分
    "s+": this.getSeconds(), // 秒
    "q+": Math.floor((this.getMonth() + 3) / 3), // 季度
    S: this.getMilliseconds() // 毫秒
  };
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, this.getFullYear() + "");
  for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt))
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length)
      );
  return fmt;
};
let finder = [
  {
    userName: "Taylor Swift",
    userId: 13,
    content: "folklore evermore What's next..",
    stamp: 1632060589000,
    attrId: 13
  },
  {
    userName: "fading",
    userId: 14,
    content: "有无可爱的友友要打算去这个地方",
    stamp: 632129758000,
    attrId: 98
  },
  {
    userName: "Evan",
    userId: 16,
    content: "blood ... tastes good",
    stamp: 132129758000,
    attrId: 19
  }
];
import axios from "axios";
export default {
  name: "findFriends",
  data() {
    return {
      Finders: []
    };
  },
  mounted() {
    this.initial();
  },
  computed: {},
  methods: {
    async initial() {
      //假设用户id都存在
      //获取景点信息

      for (let index = 0; index < finder.length; index++) {
        let i = await finder[index].attrId.toString();
        let res = await axios.get(
          `http://121.5.235.15/api/v2/zhouyou/_table/attractions?fields=attraction_name,attraction_city,attraction_feature&filter=attraction_id=${i}`,
          {
            params: {
              api_key:
                "956eed8e98667eca2722be6afc37e123212466565cab5df2f7e653d206f3e3c0"
            }
          }
        );
        let data = res.data.resource[0];
        finder[index].attr = await {
          attrName: data.attraction_name,
          attrCity: data.attraction_city,
          attrDesc: data.attraction_feature
        };
        finder[index].date = new Date(finder[index].stamp).Format("yy-MM-dd");
      }

      this.Finders = finder;
    }
  }
};
</script>

<style scoped>
#omiGod {
  height: 100%;
  overflow-y: scroll;
}
.finder {
  background-color: beige;
  border-radius: 12px;
  margin: 25px 8px;
}
::-webkit-scrollbar {
  width: 0 !important;
}
span {
  margin: 2px 4px;
}
.mention {
  font-weight: bold;
  font-size: 15px;
  font-family: Arial;
}
.hello {
  font-weight: lighter;
  font-size: 6px;
  color: #545c64;
}
p {
  font-family: "Microsoft YaHei";
  font-size: 19px;
  margin: 10px 19px;
}
.card {
  margin: 4px 8px;
  /*border-radius: 4px;*/
  /*border-radius: 50% 20% / 10% 40%;*/
  border: 4px white;
  background-color: white;
  border-radius: 10px;
  box-shadow: 5px 5px rgba(0, 0, 0, 0.15);
  transition: all 0.4s ease;
}
.card:hover {
  box-shadow: 0px 0px rgba(0, 0, 0, 0.15);
}
</style>
