const path = require('path')
const fs = require('fs')
const { v4: uuidv4 } = require('uuid')

const FILE = path.join(__dirname, '..', 'data', 'auto_events.json')

function ensureDir() {
  const dir = path.dirname(FILE)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function load() {
  try {
    return JSON.parse(fs.readFileSync(FILE, 'utf8')) || []
  } catch (e) {
    return []
  }
}

function save(list) {
  ensureDir()
  fs.writeFileSync(FILE, JSON.stringify(list, null, 2))
}

function createOrUpdate(obj) {
  const list = load()
  if (!obj.id) obj.id = uuidv4()
  const idx = list.findIndex((i) => i.id === obj.id)
  const now = Date.now()
  const item = Object.assign({
    id: obj.id,
    name: obj.name || 'auto-event',
    event: obj.event || 'order_placed',
    delayMinutes: obj.delayMinutes || 0,
    message: obj.message || '',
    enabled: obj.enabled !== false,
    created_at: now,
    updated_at: now
  }, obj)

  if (idx === -1) list.push(item)
  else list[idx] = item

  save(list)
  return item
}

function remove(id) {
  const list = load().filter((i) => i.id !== id)
  save(list)
}

module.exports = { load, save, createOrUpdate, remove }
