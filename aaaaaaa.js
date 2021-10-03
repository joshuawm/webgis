const axios = require("axios");
const coord = require("coordtransform")

async function abb(){
  let res = await axios.get("http://121.5.235.15/api/v2/zhouyou/_table/attractions?fields=*&filter=attraction_id%3E=2000",{
    params:{
      api_key:'956eed8e98667eca2722be6afc37e123212466565cab5df2f7e653d206f3e3c0'
    }
  })
  let data = res.data.resource
  for(let index=0;index<data.length;index++){
    let temp = coord.bd09togcj02(data[index].attraction_lat, data[index].attraction_lon)
    let result = coord.gcj02towgs84(temp[0],temp[1])
    console.log(data[index].attraction_id)
    console.log(result)
    await axios.put(`http://121.5.235.15/api/v2/zhouyou/_table/attractions/${data[index].attraction_id}`,{
      attraction_lat:result[0],
      attraction_lon:result[1]
    },{
      params:{
        api_key:'956eed8e98667eca2722be6afc37e123212466565cab5df2f7e653d206f3e3c0'
      }
    })
    
  }
}
abb()