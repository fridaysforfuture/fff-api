const express = require('express')
const router = express.Router()
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
  res.status(202)
  getLocations().then((list) => res.json({ generated: Date.now(), list }))
})

module.exports = router;
