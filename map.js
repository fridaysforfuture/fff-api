// more or less obsolete because of the strict usage policy of Nominatim
const axios = require('axios')
const fs = require('fs')
const removeDiacritics = require('diacritics').remove;
axios.defaults.headers.common['charset'] = 'iso-8859-1'
axios.defaults.headers.common['User-Agent'] = 'Fridays for Future API v0.0.2'

const { crunchDate, crunchListAll, crunchList, crunchListSecond, crunchRegioList } = require('./scrape')

exports = {
  getLocationsGroups, getLocations, getLocationsSecond, getLocationsTextgen
}

const file = 'public/mapdata.js'
const file2 = 'public/mapdata2.js'
const file_textgen = 'public/mapdata_textgen.js'
const file_groups = 'public/mapdata_groups.js'

function sleep (ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

async function getCityCoords (city, time, place) {
  let coords = {}
  const friendlyName = city.slice().trim()
  city = removeDiacritics(city).toLowerCase()
  await axios.get(`https://nominatim.openstreetmap.org/search/?q=${encodeURIComponent(city)}+germany&format=json&addressdetails=1&email=karl@karl-beecken.de`)
    .then(data => {
      if (data.data[0]) {
        let state
        if (city === 'berlin' && city === 'bremen' && city === 'hamburg') {
          state = friendlyName
        } else {
          state = data.data[0].address.state
        }
        coords = {
          city: friendlyName,
          time,
          place,
          lat: data.data[0].lat,
          lon: data.data[0].lon,
          state
        }
      }
    }).catch(async err => {
      console.error(err)
      await sleep(1000)
    })
  await sleep(1000)
  return coords
}

async function getGroupCoords (groupName, groupLinks) {
  let coords = {}
  const friendlyName = groupName.slice().trim()
  groupName = removeDiacritics(groupName).toLowerCase()
  await axios.get(`https://nominatim.openstreetmap.org/search/?q=${encodeURIComponent(groupName)}+germany&email=karl@karl-beecken.de&format=json&addressdetails=1`)
    .then(data => {
      if (data.data[0]) {
        let state
        if (groupName === 'berlin' && groupName === 'bremen' && groupName === 'hamburg') {
          state = friendlyName
        } else {
          state = data.data[0].address.state
        }
        coords = {
          groupName: friendlyName,
          lat: data.data[0].lat,
          lon: data.data[0].lon,
          state,
          groupLinks
        }
      }
    }).catch(async err => {
      console.error(err)
      await sleep(1000)
    })
  await sleep(1000)
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
    if (val !== undefined) {
      markers += `L.marker([${val.lat},${val.lon}], {icon: greenIcon}).addTo(map).bindPopup('<b>${val.city}</b></br>${val.time}<br>${val.place}<br>${val.state  !== undefined ? val.state : ""}');
`
    }
  })
  console.log('Total entries (1): ' + locations.length)
  fs.unlink(file, (err) => {
    if (err) {
      console.log('failed to delete first mapdata: ' + err)
    } else {
      console.log('successfully deleted first mapdata')
    }
  })
  fs.writeFile(file, markers, err => {
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
    if (val !== undefined) {
      markers += `L.marker([${val.lat},${val.lon}], {icon: greenIcon}).addTo(map).bindPopup('<b>${val.city}</b></br>${val.time}<br>${val.place}<br>${val.state  !== undefined ? val.state : ""}');
`
    }
  })
  fs.unlink(file2, (err) => {
    if (err) {
      console.log('failed to delete second mapdata: ' + err)
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
    if (val !== undefined) {
      markers += `L.marker([${val.lat},${val.lon}], {icon: greenIcon}).addTo(map).bindPopup('<b>${val.city}</b></br>${val.time}<br>${val.place}<br>${val.state  !== undefined ? val.state : ""}<br><button data-city="${val.city}" data-time="${val.time}" data-place="${val.place}" data-state="${val.state}" onclick="selectPlace(this);" class="btn btn-outline-primary">Ort w&auml;hlen</button>');
`
    }
  })
  fs.unlink(file_textgen, (err) => {
    if (err) {
      console.log('failed to delete textgen mapdata: ' + err)
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

async function getLocationsGroups () { // generates the Leaflet data from the second list on the pages
  let locations = []
  const list = await crunchRegioList().then(data => {
    return data
  })
  for (const item of list) {
    if (item.groupName !== undefined) {
      const coords = await getGroupCoords(item.groupName, item.groupLinks).then(res => {
        if (res.groupName !== undefined) return res
      })
      locations.push(coords)
    }
  }
  console.log('Total entries (groups): ' + locations.length)
  let markers = ''
  let groupString
  locations.forEach(val => {
    if (val !== undefined) {
      groupString = '<div style="text-align: center">'
      val.groupLinks.forEach(links => {
        switch (links.type) {
          case 'whatsapp':
            groupString += `<a href="${links.link}"><img src="https://fff-api.dmho.de/images/whatsapp.png" style="width: 30px; height: 30px; padding: 5px" /></a>`
            break
          case 'telegram':
            groupString += `<a href="${links.link}"><img src="https://fff-api.dmho.de/images/telegram.png" style="width: 30px; height: 30px; padding: 5px" /></a>`
            break
          case 'email':
            groupString += `<a href="${links.link}"><img src="https://fff-api.dmho.de/images/email.png" style="width: 30px; height: 30px; padding: 5px" /></a>`
            break
          case 'twitter':
            groupString += `<a href="${links.link}"><img src="https://fff-api.dmho.de/images/twitter.png" style="width: 30px; height: 30px; padding: 5px" /></a>`
            break
          case 'website':
            groupString += `<a href="${links.link}"><img src="https://fff-api.dmho.de/images/website.png" style="width: 30px; height: 30px; padding: 5px" /></a>`
            break
          case 'instagram':
            groupString += `<a href="${links.link}"><img src="https://fff-api.dmho.de/images/instagram.png" style="width: 30px; height: 30px; padding: 5px" /></a>`
            break
          case 'facebook':
            groupString += `<a href="${links.link}"><img src="https://fff-api.dmho.de/images/facebook.png" style="width: 30px; height: 30px; padding: 5px" /></a>`
            break
          default:
            groupString += `<br><a href="${links.link}">${links.type}</a>`
            break
        }
      })
      groupString += '</div>'
      markers += `L.marker([${val.lat},${val.lon}], {icon: greenIcon}).addTo(map).bindPopup('<b>${val.groupName}</b><br>${val.state}<br>${groupString}');
`
    }
  })
  fs.unlink(file_groups, (err) => {
    if (err) {
      console.log('failed to delete groups mapdata: ' + err)
    } else {
      console.log('successfully deleted groups mapdata')
    }
  })
  fs.writeFile(file_groups, markers, err => {
    if (err) return console.error(err)
    console.log('Groups file successful saved!')
  })
  return locations
}

// console.time()
// getCityCoords('Berlin').then(data => {
//   console.log(data)
//   console.timeEnd()
// })

// execute the functions on "npm run map"

console.time('loc_textgen')
getLocationsTextgen().then((data) => { // stack to prevent nominatim server from blocking
  console.timeEnd('loc_textgen')
  setTimeout(() => { // prevent f4f server from blocking the request
    console.time('loc2')
    getLocationsSecond().then((data) => {
      console.timeEnd('loc2')
      setTimeout(() => { // prevent f4f server from blocking the request
        console.time('loc1')
        getLocations().then((data) => {
          console.timeEnd('loc1')
          setTimeout(() => { // prevent f4f server from blocking the request
            console.time('loc_groups')
            getLocationsGroups().then((data) => {
              console.timeEnd('loc_groups')
            })
          }, 500)
        })
      }, 500)
    })
  }, 500)
})
