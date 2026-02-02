const express = require('express')
const router = express.Router()
const mlService = require('../services/mercadolivre.service')

// Inicia fluxo de autorização do Mercado Livre
router.get('/ml', (req, res) => {
  const url = mlService.getAuthUrl(req.query.state)
  res.redirect(url)
})

// Callback: troca código por token e salva
router.get('/ml/callback', async (req, res) => {
  const { code, state, error } = req.query
  if (error) return res.status(400).json({ error })
  if (!code) return res.status(400).json({ error: 'missing_code' })

  try {
    const tokens = await mlService.exchangeCode(code)
    res.json({ ok: true, tokens })
  } catch (err) {
    res.status(500).json({ error: err.response?.data || err.message })
  }
})

module.exports = router
