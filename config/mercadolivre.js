// src/config/mercadolivre.js
const path = require('path')
const fs = require('fs')

const TOKENS_PATH = path.join(__dirname, '..', 'data', 'ml_tokens.json')

function loadTokens() {
  try {
    return JSON.parse(fs.readFileSync(TOKENS_PATH, 'utf8'))
  } catch (e) {
    return null
  }
}

const tokens = loadTokens()

module.exports = {
  apiBaseUrl: 'https://api.mercadolibre.com',

  auth: {
    clientId: process.env.ML_CLIENT_ID,
    clientSecret: process.env.ML_CLIENT_SECRET,
    accessToken: tokens?.access_token || process.env.ML_ACCESS_TOKEN,
    refreshToken: tokens?.refresh_token || process.env.ML_REFRESH_TOKEN
  },

  seller: {
    id: process.env.ML_SELLER_ID
  },

  webhooks: {
    topics: ['orders_v2']
  },

  headers() {
    return {
      Authorization: `Bearer ${this.auth.accessToken}`,
      'Content-Type': 'application/json'
    }
  }
}
