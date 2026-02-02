// src/services/message.service.js
const axios = require('axios')
const template = require('../templates/order-confirmation')
const mlService = require('./mercadolivre.service')

module.exports = {
  async send({ channel, to, data }) {
    if (channel !== 'mercadolivre') return

    const message = template(data)

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
}
