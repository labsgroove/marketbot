const express = require('express')
const router = express.Router()
const autoEventService = require('../services/autoevent.service')
const messageService = require('../services/message.service')

// List saved auto events
router.get('/events', (req, res) => {
  try {
    const list = autoEventService.load()
    res.json(list)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Create or update an event
router.post('/events', (req, res) => {
  try {
    const ev = autoEventService.createOrUpdate(req.body)
    res.json(ev)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Delete event by id
router.delete('/events/:id', (req, res) => {
  try {
    autoEventService.remove(req.params.id)
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Send a manual message (used to reply to chats)
router.post('/send', async (req, res) => {
  try {
    await messageService.send(req.body)
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// List recent message packs (incoming chats)
router.get('/messages', async (req, res) => {
  try {
    const list = await messageService.list()
    res.json(list)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Get a single message pack (chat) by id
router.get('/messages/:id', async (req, res) => {
  try {
    const pack = await messageService.getPack(req.params.id)
    res.json(pack)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
