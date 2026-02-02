// src/server.js
require('dotenv').config()
const express = require('express')
const webhookRoutes = require('./routes/webhooks')
const authRoutes = require('./routes/auth')
const mlService = require('./services/mercadolivre.service')

const app = express()
app.use(express.json())

app.use('/webhooks', webhookRoutes)
app.use('/auth', authRoutes)

// Aceita callback público registrado como /callback e encaminha para o handler interno
app.get('/callback', (req, res) => {
  const qs = require('querystring')
  const q = qs.stringify(req.query || {})
  res.redirect(`/auth/ml/callback${q ? '?' + q : ''}`)
})

// Nota: refresh automático desabilitado temporariamente para evitar erros na inicialização
/*
// tenta refresh automático de token ML ao iniciar (se houver tokens salvos)
(async () => {
  try {
    const tokens = mlService.loadTokens()
    if (tokens) {
      const expiresAt = tokens.obtained_at + (tokens.expires_in || 0) * 1000
      // se expira em menos de 1 minuto, atualiza
      if (Date.now() > expiresAt - 60 * 1000) {
        await mlService.refreshToken()
        console.log('ML tokens refreshed')
      }
    }
  } catch (err) {
    console.warn('ML token refresh failed:', err.message)
  }
})()
*/

app.listen(3001, () => {
  console.log('🤖 Bot rodando na porta 3001')
})
