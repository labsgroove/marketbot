// src/services/message.service.js
const axios = require('axios')
const template = require('../templates/order-confirmation')
const mlService = require('./mercadolivre.service')

module.exports = {
  async send({ channel, to, data }) {
    if (channel !== 'mercadolivre') return

    const message = (data && data.text) ? data.text : template(data)

    const tokens = mlService.loadTokens()
    const accessToken = tokens?.access_token || process.env.ML_ACCESS_TOKEN

    await axios.post(
      `https://api.mercadolibre.com/messages/packs/${to}/sellers/${process.env.ML_SELLER_ID}`,
      {
        text: message
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    )
  }
,
  async list({ limit = 50 } = {}) {
    const tokens = mlService.loadTokens()
    const accessToken = tokens?.access_token || process.env.ML_ACCESS_TOKEN
    const seller = process.env.ML_SELLER_ID
    const url = `https://api.mercadolibre.com/messages/packs?seller_id=${seller}&limit=${limit}`
    const res = await axios.get(url, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
    return res.data
  },
  async getPack(packId) {
    const tokens = mlService.loadTokens()
    const accessToken = tokens?.access_token || process.env.ML_ACCESS_TOKEN
    const seller = process.env.ML_SELLER_ID
    const url = `https://api.mercadolibre.com/messages/packs/${packId}?seller_id=${seller}`
    const res = await axios.get(url, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
    return res.data
  }
}
