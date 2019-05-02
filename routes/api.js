const express = require('express')
const router = express.Router()
const { crunchDate, crunchListAll, crunchList } = require('../scrape')

router.get('/scrape/date', function(req, res, next) {
  crunchDate().then((date) => res.json({ date }))
})

router.get('/scrape/listall', function(req, res, next) {
  crunchListAll().then((list) => res.json({ list }))
})

router.get('/scrape/list', function(req, res, next) {
  crunchList().then((list) => res.json({ generated: Date.now(), list }))
})

module.exports = router;
