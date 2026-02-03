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

async function loadMessages() {
  try {
    const list = await api('/messages')
    console.log('Mensagens recebidas:', list)
    const container = el('#messages-list')
    container.innerHTML = ''
    if (!list || !list.results || !list.results.length) {
      container.innerHTML = '<p class="muted">Nenhuma mensagem encontrada.</p>'
      return
    }
    list.results.forEach(p => {
      const div = document.createElement('div')
      div.className = 'message-pack'
      const title = p.subject || p.last_message?.text?.slice(0,60) || p.id
      div.innerHTML = `<strong>${title}</strong> — <small>${p.id}</small>
        <div class="controls"><button data-id="${p.id}" class="open-chat">Abrir chat</button></div>`
      container.appendChild(div)
    })
  } catch (err) {
    console.error('Erro ao buscar mensagens:', err)
    el('#messages-list').textContent = 'Erro ao carregar mensagens.'
  }
}

function openChat(packId, title) {
  el('#chat-panel').classList.remove('hidden')
  el('#chat-title').textContent = 'Chat: ' + (title || packId)
  el('#chat-reply-to').value = packId
  el('#chat-messages').textContent = 'Carregando...'
  api('/messages/' + packId).then(pack => {
    console.log('Pack:', pack)
    const area = el('#chat-messages')
    area.innerHTML = ''
    const messages = pack.messages || pack.messages_preview || []
    messages.forEach(m => {
      const p = document.createElement('div')
      p.style.padding = '6px'
      p.style.borderBottom = '1px solid #eee'
      p.innerHTML = `<strong>${m.from}</strong>: ${m.text || m.body || JSON.stringify(m)}`
      area.appendChild(p)
    })
  }).catch(err => {
    console.error('Erro ao carregar pack:', err)
    el('#chat-messages').textContent = 'Erro ao carregar chat.'
  })
}

function closeChat() { el('#chat-panel').classList.add('hidden'); el('#chat-messages').innerHTML = '' }

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

  // messages list actions
  el('#messages-list').addEventListener('click', (e) => {
    if (e.target.matches('button.open-chat')) {
      const id = e.target.dataset.id
      openChat(id, '')
    }
  })

  el('#chat-close').addEventListener('click', () => closeChat())

  el('#chat-reply-form').addEventListener('submit', async (e) => {
    e.preventDefault()
    const to = el('#chat-reply-to').value
    const text = el('#chat-reply-text').value
    if (!to || !text) return alert('Preencha a mensagem')
    const payload = { channel: 'mercadolivre', to, data: { text } }
    try {
      const res = await api('/send', { method: 'POST', body: JSON.stringify(payload) })
      console.log('Resposta envio:', res)
      el('#chat-reply-text').value = ''
      // atualiza lista de mensagens
      openChat(to)
    } catch (err) {
      console.error('Erro ao enviar resposta:', err)
      alert('Erro ao enviar')
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
  // carregar mensagens ao abrir admin
  loadMessages()
})
