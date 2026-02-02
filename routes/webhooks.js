// src/routes/webhooks.js
const express = require('express')
const router = express.Router()
const marketplaces = require('../marketplaces')

router.post('/mercadolivre', async (req, res) => {
  try {
    await marketplaces.mercadolivre.handleEvent(req.body)
    res.sendStatus(200)
  } catch (err) {
    console.error(err)
    res.sendStatus(500)
  }
})

module.exports = router
