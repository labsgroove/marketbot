// src/config/mercadolivre.js
module.exports = {
  apiBaseUrl: 'https://api.mercadolibre.com',

  auth: {
    clientId: process.env.ML_CLIENT_ID,
    clientSecret: process.env.ML_CLIENT_SECRET,
    accessToken: process.env.ML_ACCESS_TOKEN,
    refreshToken: process.env.ML_REFRESH_TOKEN
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
