const express = require('express')
const router = express.Router()
const DelayedResponse = require('http-delayed-response')
const { crunchDate, crunchListAll, crunchList } = require('../scrape')
const { getLocations } = require('../map')


router.get('/scrape/date', function(req, res, next) {
  crunchDate().then((date) => res.json({ date }))
})

router.get('/scrape/list', function(req, res, next) {
  crunchList().then((list) => res.json({ generated: Date.now(), list }))
})

router.get('/scrape/list/all', function(req, res, next) {
  crunchListAll().then((list) => res.json({ generated: Date.now(), list }))
})

router.get('/scrape/list/map', function(req, res, next) {
  let delayed = new DelayedResponse(req, res, next)
  delayed.json()
  delayed.wait(100000)
  let promise = getLocations()
  delayed.end(promise, promise)
})

module.exports = router;
