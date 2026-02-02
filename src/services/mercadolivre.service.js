const axios = require('axios')
const qs = require('querystring')
const path = require('path')
const fs = require('fs')

const TOKENS_PATH = path.join(__dirname, '..', '..', 'data', 'ml_tokens.json')

function ensureDataDir() {
  const dir = path.dirname(TOKENS_PATH)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function saveTokens(obj) {
  ensureDataDir()
  fs.writeFileSync(TOKENS_PATH, JSON.stringify(obj, null, 2))
}

function loadTokens() {
  try {
    return JSON.parse(fs.readFileSync(TOKENS_PATH, 'utf8'))
  } catch (e) {
    return null
  }
}

module.exports = {
  getAuthUrl(state) {
    const clientId = process.env.ML_CLIENT_ID
    const redirect = encodeURIComponent(process.env.ML_REDIRECT_URI)
    const s = state ? `&state=${encodeURIComponent(state)}` : ''
    return `https://auth.mercadolivre.com.br/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirect}${s}`
  },

  async exchangeCode(code) {
    const body = qs.stringify({
      grant_type: 'authorization_code',
      client_id: process.env.ML_CLIENT_ID,
      client_secret: process.env.ML_CLIENT_SECRET,
      code,
      redirect_uri: process.env.ML_REDIRECT_URI
    })

    const r = await axios.post('https://api.mercadolibre.com/oauth/token', body, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })

    const data = r.data
    const saved = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
      obtained_at: Date.now()
    }
    saveTokens(saved)
    return saved
  },

  async refreshToken() {
    const tokens = loadTokens()
    if (!tokens || !tokens.refresh_token) throw new Error('no_refresh_token')

    const body = qs.stringify({
      grant_type: 'refresh_token',
      client_id: process.env.ML_CLIENT_ID,
      client_secret: process.env.ML_CLIENT_SECRET,
      refresh_token: tokens.refresh_token
    })

    const r = await axios.post('https://api.mercadolibre.com/oauth/token', body, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })

    const data = r.data
    const saved = {
      access_token: data.access_token,
      refresh_token: data.refresh_token || tokens.refresh_token,
      expires_in: data.expires_in,
      obtained_at: Date.now()
    }
    saveTokens(saved)
    return saved
  },

  loadTokens
}
