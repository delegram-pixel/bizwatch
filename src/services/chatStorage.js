const STORAGE_KEY = 'bizwatch_chats'

export function loadChats() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

export function saveChat({ id, title, messages, createdAt }) {
  const chats = loadChats()
  const now = new Date().toISOString()
  const lastUserOrAssistant = [...messages].reverse().find((m) => m.role === 'assistant' || m.role === 'user')
  const lastMessage = lastUserOrAssistant?.content ?? ''

  const updated = {
    id,
    title,
    messages,
    lastMessage: typeof lastMessage === 'string' ? lastMessage.slice(0, 120) : '',
    createdAt: createdAt ?? now,
    updatedAt: now,
  }

  const index = chats.findIndex((c) => c.id === id)
  if (index >= 0) {
    chats[index] = updated
  } else {
    chats.unshift(updated)
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(chats))
}

export function loadChat(id) {
  return loadChats().find((c) => c.id === id) ?? null
}

export function deleteChat(id) {
  const chats = loadChats().filter((c) => c.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(chats))
}
