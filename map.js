// more or less obsolete because of the strict usage policy of Nominatim
const axios = require('axios')
axios.defaults.headers.common['charset'] = 'iso-8859-1'
axios.defaults.headers.common["User-Agent"] = 'fff-api'

const { crunchDate, crunchListAll, crunchList } = require('./scrape')

let locations = []

function deUmlaut (value) {
  value = value.toLowerCase()
  value = value.replace(/ä/g, 'ae')
  value = value.replace(/ö/g, 'oe')
  value = value.replace(/ü/g, 'ue')
  value = value.replace(/ß/g, 'ss')
  value = value.replace(/ /g, '-')
  value = value.replace(/\./g, '')
  value = value.replace(/,/g, '')
  value = value.replace(/\(/g, '')
  value = value.replace(/\)/g, '')
  return value
}

function sleep(ms){
  return new Promise(resolve=>{
    setTimeout(resolve,ms)
  })
}
async function getCityCoords(city) {
  let coords = {}
  const cityDe = city.slice()
  city = deUmlaut(city)
  await axios.get(`https://nominatim.openstreetmap.org/search/?q=${city}&format=json`)
    .then(data => {
      coords = { city: cityDe, lat :data.data[0].lat, lon: data.data[0].lon }
    }).catch(err => {
      console.error(err)
    })
  await sleep(900)
  return coords
}

// console.time()
// getCityCoords('Berlin').then(data => {
//   console.log(data)
//   console.timeEnd()
// })

module.exports = {
  async getLocations () {
    const list = await crunchList().then(data => {
      return data
    })
    for (const item of list) {
      const coords = await getCityCoords(item.city).then(res => {
        if (res.city !== undefined) return res
      })
      locations.push(coords)
    }
    return locations
  }
}

// console.time()
// getLocations().then((data) => {
//   console.log(data)
//   console.timeEnd()
// })
