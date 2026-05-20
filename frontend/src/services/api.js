const API_BASE = 'http://localhost:5000/api'

async function parseJSON(response) {
  const text = await response.text()
  try {
    return JSON.parse(text)
  } catch {
    return { error: 'Invalid JSON response' }
  }
}

export async function chatRequest(question) {
  const response = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  })
  return response.ok ? await response.json() : await parseJSON(response)
}

export async function fetchHistory() {
  const response = await fetch(`${API_BASE}/history`)
  return response.ok ? await response.json() : []
}

export async function uploadPdf(file) {
  const formData = new FormData()
  formData.append('file', file)
  const response = await fetch(`${API_BASE}/upload-pdf`, {
    method: 'POST',
    body: formData,
  })
  return response.ok ? await response.json() : await parseJSON(response)
}

export async function askNotes(question) {
  const response = await fetch(`${API_BASE}/ask-notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  })
  return response.ok ? await response.json() : await parseJSON(response)
}

export async function summarizeNotes() {
  const response = await fetch(`${API_BASE}/summarize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ target: 'notes' }),
  })
  return response.ok ? await response.json() : await parseJSON(response)
}

export async function generateQuiz(topic) {
  const response = await fetch(`${API_BASE}/generate-quiz`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic }),
  })
  return response.ok ? await response.json() : await parseJSON(response)
}

export async function generateFlashcards(topic) {
  const response = await fetch(`${API_BASE}/generate-flashcards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic }),
  })
  return response.ok ? await response.json() : await parseJSON(response)
}
