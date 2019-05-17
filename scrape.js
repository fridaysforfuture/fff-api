const axios = require('axios')
const cheerio = require('cheerio')
let result

const url = 'https://fridaysforfuture.de/streiktermine/'
const regioUrl = 'https://fridaysforfuture.de/regionalgruppen/'

module.exports = {
  async crunchDate () {
    await axios.get(url)
      .then((response) => {
        if (response.status === 200) {
          const html = response.data
          const $ = cheerio.load(html)
          result = $('.wp-block-table').prevAll('h2').html()
        }
      }, (err) => console.log(err))
    return result
  },

  async crunchListAll () {
    await axios.get(url)
      .then((response) => {
        if (response.status === 200) {
          const html = response.data
          const $ = cheerio.load(html)
          result = $('.wp-block-table > tbody > tr > td').map(function (i, el) {return $(this).text()}).get()
        }
      }, (err) => console.log(err))
    let results = []
    result.forEach((value) => {
      let splitted = value.split(', ')
      if (splitted[1] !== undefined) results.push({ city: splitted[0], time: splitted[1], place: splitted[2].trim() })
    })
    return results
  },
  async crunchList () {
    await axios.get(url)
      .then((response) => {
        if (response.status === 200) {
          const html = response.data
          const $ = cheerio.load(html)
          result = $('.wp-block-table').eq(0).children().children().map(function (i, el) {return $(this).text()}).get()
        }
      }, (err) => console.log(err))
    let results = []
    result.forEach(value => {
      let splitted = value.split(', ')
      if (splitted[1] !== undefined) results.push({ city: splitted[0], time: splitted[1], place: splitted[2].trim() })
    })
    return results
  },
  async crunchListSecond () {
    await axios.get(url)
      .then(response => {
        if (response.status === 200) {
          const html = response.data
          const $ = cheerio.load(html)
          result = $('.wp-block-table').eq(1).children().children().map(function (i, el) {return $(this).text()}).get()
        }
      }, err => console.log(err))
    let results = []
    result.forEach(value => {
      let splitted = value.split(', ')
      if (splitted[2] !== undefined && splitted[1] !== undefined && splitted[0] !== undefined && splitted && value) results.push({ city: splitted[0], time: splitted[1], place: splitted[2].trim() })
    })
    return results
  },
  async crunchRegioList () {
    await axios.get(regioUrl)
      .then(response => {
        if (response.status === 200) {
          const html = response.data
          const $ = cheerio.load(html)
          result = $('div .su-accordion').eq(0).children('div .su-spoiler').children('div .su-spoiler-content').children('ul').children('li').map(function (i, el) {return $(this).text()}).get()
        }
      }, err => console.log(err))
    let results = []
    result.forEach(value => {
      let splitted = value.split(': ')
      if (splitted[0] !== undefined && splitted[0] !== 'Deutschland' && splitted[0] !== 'Diskussionen') results.push(`{ group: ${splitted[0]} }`)
    })
    return results
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// async function crunchList () {
//   await axios.get(regioUrl)
//     .then(response => {
//       if (response.status === 200) {
//         const html = response.data
//         const $ = cheerio.load(html)
//         result = $('.su-accordion').eq(0).children().children().children().children().map(function (i, el) {return $(this).text()}).get()
//       }
//     }, err => console.log(err))
//   let results = []
//   result.forEach(value => {
//     let splitted = value.split(': ')
//     if (splitted[0] !== undefined) results.push(`{ group: ${splitted[0]} }`)
//   })
//   return results
// }
//
// crunchList().then(data => console.log(data))
