const axios = require('axios')
const cheerio = require('cheerio')
let result

const url = 'https://fridaysforfuture.de/streiktermine/'

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
          result = $('.wp-block-table').first().children().children().map(function (i, el) {return $(this).text()}).get()
        }
      }, (err) => console.log(err))
    let results = []
    result.forEach(value => {
      let splitted = value.split(', ')
      results.push({ city: splitted[0], time: splitted[1], place: splitted[2].trim() })
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
      if (splitted[1] !== undefined) results.push({ city: splitted[0], time: splitted[1], place: splitted[2].trim() })
    })
    return results
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// async function crunchList () {
//   await axios.get(url)
//     .then(response => {
//       if (response.status === 200) {
//         const html = response.data
//         const $ = cheerio.load(html)
//         result = $('.wp-block-table').eq(1).children().children().map(function (i, el) {return $(this).text()}).get()
//       }
//     }, err => console.log(err))
//   let results = []
//   result.forEach(value => {
//     let splitted = value.split(', ')
//     if (splitted[1] !== undefined) results.push(`{ city: ${splitted[0]}, time: ${splitted[1]}, place: ${splitted[2]} }`)
//   })
//   return results
// }

// crunchList().then(data => console.log(data))
