// Entry point for marketplace adapters
// Exports available marketplaces by key used in routes/webhooks.js

module.exports = {
  mercadolivre: require('./mercadolivre.adapter')
}
