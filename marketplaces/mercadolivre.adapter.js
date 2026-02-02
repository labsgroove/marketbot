// src/marketplaces/mercadolivre.adapter.js
const axios = require('axios')
const MessageService = require('../services/message.service')

const API = 'https://api.mercadolibre.com'

module.exports = {
  async handleEvent(event) {
    if (event.topic !== 'orders_v2') return

    const orderId = event.resource.split('/').pop()

    const order = await axios.get(`${API}/orders/${orderId}`, {
      headers: {
        Authorization: `Bearer ${process.env.ML_ACCESS_TOKEN}`
      }
    })

    const buyer = order.data.buyer
    const item = order.data.order_items[0]

    await MessageService.send({
      channel: 'mercadolivre',
      to: buyer.id,
      data: {
        buyerName: buyer.nickname,
        product: item.item.title
      }
    })
  }
}
