async function api(path, opts = {}) {
  const res = await fetch('/api/admin' + path, Object.assign({ headers: { 'Content-Type': 'application/json' } }, opts))
  if (res.headers.get('content-type')?.includes('application/json')) return res.json()
  return res.text()
}

function el(q) { return document.querySelector(q) }

async function loadEvents() {
  const list = await api('/events')
  const container = el('#events-list')
  container.innerHTML = ''
  if (!list.length) container.innerHTML = '<p class="muted">Nenhuma regra definida.</p>'
  list.forEach(ev => {
    const div = document.createElement('div')
    div.className = 'event'
    div.innerHTML = `<strong>${ev.name}</strong> — ${ev.event} — ${ev.delayMinutes}min ${ev.enabled ? '' : '(desligado)'}
      <div class="controls">
        <button data-id="${ev.id}" class="edit">Editar</button>
        <button data-id="${ev.id}" class="del">Apagar</button>
      </div>`
    container.appendChild(div)
  })
}

function openEditor(obj) {
  el('#editor').classList.remove('hidden')
  el('#editor-title').textContent = obj && obj.id ? 'Editar regra' : 'Nova regra'
  el('#event-id').value = obj?.id || ''
  el('#event-name').value = obj?.name || ''
  el('#event-type').value = obj?.event || 'order_placed'
  el('#event-delay').value = obj?.delayMinutes || 0
  el('#event-message').value = obj?.message || ''
  el('#event-enabled').checked = obj?.enabled !== false
}

function closeEditor() { el('#editor').classList.add('hidden') }

document.addEventListener('DOMContentLoaded', () => {
  loadEvents()

  el('#new-event').addEventListener('click', () => openEditor({}))

  el('#events-list').addEventListener('click', async (e) => {
    if (e.target.matches('button.edit')) {
      const id = e.target.dataset.id
      const list = await api('/events')
      const obj = list.find(i => i.id === id)
      openEditor(obj)
    } else if (e.target.matches('button.del')) {
      const id = e.target.dataset.id
      if (!confirm('Apagar essa regra?')) return
      await api('/events/' + id, { method: 'DELETE' })
      loadEvents()
    }
  })

  el('#cancel-edit').addEventListener('click', (e) => { e.preventDefault(); closeEditor() })

  el('#event-form').addEventListener('submit', async (e) => {
    e.preventDefault()
    const payload = {
      id: el('#event-id').value || undefined,
      name: el('#event-name').value,
      event: el('#event-type').value,
      delayMinutes: Number(el('#event-delay').value || 0),
      message: el('#event-message').value,
      enabled: el('#event-enabled').checked
    }
    await api('/events', { method: 'POST', body: JSON.stringify(payload) })
    closeEditor()
    loadEvents()
  })

  el('#send-form').addEventListener('submit', async (e) => {
    e.preventDefault()
    const payload = {
      channel: el('#send-channel').value,
      to: el('#send-to').value,
      data: { text: el('#send-text').value }
    }
    const res = await api('/send', { method: 'POST', body: JSON.stringify(payload) })
    el('#send-result').textContent = res.ok ? 'Enviado com sucesso' : 'Erro: ' + (res.error || 'unknown')
    setTimeout(() => el('#send-result').textContent = '', 4000)
  })
})
