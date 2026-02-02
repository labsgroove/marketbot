// src/server.js
require('dotenv').config()
const express = require('express')
const webhookRoutes = require('./routes/webhooks')

const app = express()
app.use(express.json())

app.use('/webhooks', webhookRoutes)

app.listen(3000, () => {
  console.log('🤖 Bot rodando na porta 3000')
})
