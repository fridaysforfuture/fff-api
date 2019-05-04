const express = require('express')
const router = express.Router()
const { crunchDate, crunchListAll, crunchList, crunchListSecond } = require('../scrape')
const { getLocations, getLocationsSecond } = require('../map')


router.get('/scrape/date', function(req, res, next) {
  crunchDate().then((date) => res.json({ date }))
})

router.get('/scrape/list/all', function(req, res, next) {
  crunchListAll().then((list) => res.json({ generated: Date.now(), list }))
})

router.get('/scrape/list', function(req, res, next) {
  crunchList().then((list) => res.json({ generated: Date.now(), count: list.length, list }))
})

router.get('/scrape/list/map', function(req, res, next) {
  getLocations()
  res.status(202)
  res.json({ queued: true, file: 'mapdata.js' })
})

router.get('/scrape/list2', function(req, res, next) {
  crunchListSecond().then((list) => res.json({ generated: Date.now(), count: list.length, list }))
})

router.get('/scrape/list2/map', function(req, res, next) {
  getLocationsSecond()
  res.status(202)
  res.json({ queued: true, file: 'mapdata2.js' })
})

module.exports = router;
