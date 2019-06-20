const axios = require('axios')
const cheerio = require('cheerio')
const jsdom = require('jsdom')
const { JSDOM } = jsdom
const util = require('util')
let result

const url = 'https://fridaysforfuture.de/streiktermine/'
const regioUrl = 'https://fridaysforfuture.de/regionalgruppen/'

function validateEmail(email) {
  const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

function removeHyphen(str) {
  return str.replace(/[\u00AD\u002D\u2011]+/g,'')
}

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
      if (splitted[2] !== undefined && splitted[1] !== undefined && splitted[0] !== undefined && splitted && value) results.push({
        city: removeHyphen(splitted[0]),
        time: splitted[1],
        place: removeHyphen(splitted[2].trim())
      })
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
      if (splitted[2] !== undefined && splitted[1] !== undefined && splitted[0] !== undefined && splitted && value) results.push({
        city: removeHyphen(splitted[0]),
        time: splitted[1],
        place: removeHyphen(splitted[2].trim())
      })
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
      if (splitted[2] !== undefined && splitted[1] !== undefined && splitted[0] !== undefined && splitted && value) results.push({
        city: removeHyphen(splitted[0]),
        time: splitted[1],
        place: removeHyphen(splitted[2].trim())
      })
    })
    return results
  },
  crunchRegioList: async function () {
    await axios.get(regioUrl)
      .then(response => {
        if (response.status === 200) {
          const html = response.data
          const $ = cheerio.load(html)
          result = $('div .su-accordion').eq(0).children('div .su-spoiler').children('div .su-spoiler-content').children('ul').children('li').map(function (i, el) {return $(this).html()}).get()
        }
      }, err => console.log(err))
    let results = []
    result.forEach(value => {
      let splitted = value.split(': ')
      let linksArray = []
      const dom = new JSDOM('<!doctype html><body>' + splitted[0],
        'text/html')
      const groupName = dom.window.document.body.textContent
      if (splitted[1]) {
        let links = splitted[1].split(' | ')
        links.forEach(value => {
          const domLinks = new JSDOM(
            '<!doctype html><body>' + value,
            'text/html')
          let chatLink = domLinks.window.document.body.querySelector('a').getAttribute('href')
          const text = removeHyphen(domLinks.window.document.body.querySelector('a').textContent)
          const chatType = text === 'WhatsApp' ? 'whatsapp' : text === 'Telegram' ? 'telegram' : validateEmail(text) ? 'email' : text
          chatLink = chatLink.replace(/\r?\n|\r/, '')
          if (chatType !== undefined) {
            linksArray.push(JSON.parse(`{ "type": "${chatType}", "link": "${chatLink}" }`))
          }
        })
        const jsonString = `{ "groupName": "${removeHyphen(groupName)}", "groupLinks": ${JSON.stringify(linksArray)} }`
        const json = JSON.parse(jsonString)
        if (splitted[0] !== undefined && splitted[0] !== 'Deutschland' && splitted[0] !== 'Diskussionen') results.push(json)
      }
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
