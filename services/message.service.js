// src/services/message.service.js
const axios = require('axios')
const template = require('../templates/order-confirmation')

module.exports = {
  async send({ channel, to, data }) {
    if (channel !== 'mercadolivre') return

    const message = template(data)

    await axios.post(
      `https://api.mercadolibre.com/messages/packs/${to}/sellers/${process.env.ML_SELLER_ID}`,
      {
        text: message
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.ML_ACCESS_TOKEN}`
        }
      }
    )
  }
}
