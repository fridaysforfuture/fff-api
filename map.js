// more or less obsolete because of the strict usage policy of Nominatim
const axios = require('axios')
const fs = require('fs')
axios.defaults.headers.common['charset'] = 'iso-8859-1'
axios.defaults.headers.common["User-Agent"] = 'fff-api'

const { crunchDate, crunchListAll, crunchList, crunchListSecond } = require('./scrape')

const file = 'public/mapdata.js'
const file2 = 'public/mapdata2.js'
const file_textgen = 'public/mapdata_textgen.js'

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
  return new Promise(resolve => {
    setTimeout(resolve,ms)
  })
}
async function getCityCoords(city, time, place) {
  let coords = {}
  const friendlyName = city.slice().trim()
  city = deUmlaut(city)
  await axios.get(`https://nominatim.openstreetmap.org/search/?q=${city}&format=json`)
    .then(data => {
      coords = { city: friendlyName, time, place, lat :data.data[0].lat, lon: data.data[0].lon }
    }).catch(err => {
      console.error(err)
    })
  await sleep(900)
  return coords
}

async function getLocations () { // generates the Leaflet data from the first list on the pages
  let locations = []
  const list = await crunchList().then(data => {
    return data
  })
  for (const item of list) {
    const coords = await getCityCoords(item.city, item.time, item.place).then(res => {
      if (res.city !== undefined) return res
    })
    locations.push(coords)
  }
  let markers = ''
  locations.forEach(val => {
    markers += `L.marker([${val.lat},${val.lon}]).addTo(map).bindPopup('<b>${val.city}</b></br>${val.time}<br>${val.place}');
`
  })
  console.log('Total entries (1): ' + locations.length)
  fs.unlink(file, (err) => {
    if (err) {
      console.log("failed to delete first mapdata: " + err)
    } else {
      console.log('successfully deleted first mapdata')
    }
  })
  fs.writeFile(file,markers, err => {
    if (err) return console.error(err)
    console.log('First file successful saved!')
  })
  return locations
}

async function getLocationsSecond () { // generates the Leaflet data from the second list on the pages
  let locations = []
  const list = await crunchListSecond().then(data => {
    return data
  })
  for (const item of list) {
    const coords = await getCityCoords(item.city, item.time, item.place).then(res => {
      if (res.city !== undefined) return res
    })
    locations.push(coords)
  }
  console.log('Total entries (2): ' + locations.length)
  let markers = ''
  locations.forEach(val => {
    markers += `L.marker([${val.lat},${val.lon}]).addTo(map).bindPopup('<b>${val.city}</b></br>${val.time}<br>${val.place}');
`
  })
  fs.unlink(file2, (err) => {
    if (err) {
      console.log("failed to delete second mapdata: " + err)
    } else {
      console.log('successfully deleted second mapdata')
    }
  })
  fs.writeFile(file2, markers, err => {
    if (err) return console.error(err)
    console.log('Second file successful saved!')
  })
  return locations
}

async function getLocationsTextgen () { // generates the Leaflet data from the first list on the pages, for textgen use
  let locations = []
  const list = await crunchList().then(data => {
    return data
  })
  for (const item of list) {
    const coords = await getCityCoords(item.city, item.time, item.place).then(res => {
      if (res.city !== undefined) return res
    })
    locations.push(coords)
  }
  console.log('Total entries (textgen): ' + locations.length)
  let markers = ''
  locations.forEach(val => {
    markers += `L.marker([${val.lat},${val.lon}]).addTo(map).bindPopup('<b>${val.city}</b></br>${val.time}<br>${val.place}<br><button class="btn btn-outline-primary">Ort w&auml;hlen</button>');
`
  })
  fs.unlink(file_textgen, (err) => {
    if (err) {
      console.log("failed to delete textgen mapdata: " + err)
    } else {
      console.log('successfully deleted textgen mapdata')
    }
  })
  fs.writeFile(file_textgen, markers, err => {
    if (err) return console.error(err)
    console.log('Textgen file successful saved!')
  })
  return locations
}

// console.time()
// getCityCoords('Berlin').then(data => {
//   console.log(data)
//   console.timeEnd()
// })

module.exports = {

  async getLocations () { // generates the Leaflet data from the first list on the pages
    let locations = []
    const list = await crunchList().then(data => {
      return data
    })
    for (const item of list) {
      const coords = await getCityCoords(item.city, item.time, item.place).then(res => {
        if (res.city !== undefined) return res
      })
      locations.push(coords)
    }
    console.log('Total entries (1): ' + locations.length)
    let markers = ''
    locations.forEach(val => {
      markers += `L.marker([${val.lat},${val.lon}]).addTo(map).bindPopup('<b>${val.city}</b></br>${val.time}<br>${val.place}');
`
    })
    fs.unlink(file, (err) => {
      if (err) {
        console.log("failed to delete first mapdata: " + err)
      } else {
        console.log('successfully deleted first mapdata')
      }
    })
    fs.writeFile(file, markers, err => {
      if (err) return console.error(err)
      console.log('First file successful saved!')
    })
    return locations
  },
  async getLocationsSecond () { // generates the Leaflet data from the second list on the pages
    let locations = []
    const list = await crunchListSecond().then(data => {
      return data
    })
    for (const item of list) {
      const coords = await getCityCoords(item.city, item.time, item.place).then(res => {
        if (res.city !== undefined) return res
      })
      locations.push(coords)
    }
    console.log('Total entries (2): ' + locations.length)
    let markers = ''
    locations.forEach(val => {
      markers += `L.marker([${val.lat},${val.lon}]).addTo(map).bindPopup('<b>${val.city}</b></br>${val.time}<br>${val.place}');
`
    })
    fs.unlink(file2, (err) => {
      if (err) {
        console.log("failed to delete second mapdata: " + err)
      } else {
        console.log('successfully deleted second mapdata')
      }
    })
    fs.writeFile(file2, markers, err => {
      if (err) return console.error(err)
      console.log('Second file successful saved!')
    })
    return locations
  }
}

// execute the functions on "npm run map"

console.time('loc1')
getLocations().then((data) => {
  console.timeEnd('loc1')
})

setTimeout(() => { // prevent f4f server from blocking the request
  console.time('loc2')
  getLocationsSecond().then((data) => {
    console.timeEnd('loc2')
  })
}, 250)

setTimeout(() => { // prevent f4f server from blocking the request
  console.time('loc_textgen')
  getLocationsTextgen().then((data) => {
    console.timeEnd('loc_textgen')
  })
}, 500)

