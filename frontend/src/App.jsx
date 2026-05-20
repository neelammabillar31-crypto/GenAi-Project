import { useEffect, useMemo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { chatRequest, fetchHistory, uploadPdf, askNotes, summarizeNotes, generateQuiz, generateFlashcards } from './services/api'

const cards = [
  { key: 'chat', title: 'Study Chat', description: 'Ask any study question and get helpful explanations.' },
  { key: 'notes', title: 'Notes Q&A', description: 'Upload PDFs and ask questions from your textbooks.' },
  { key: 'summarize', title: 'Summarizer', description: 'Create quick summaries from your uploaded notes.' },
  { key: 'quiz', title: 'Generate MCQ', description: 'Build a short quiz to test your knowledge.' },
  { key: 'flashcards', title: 'Flashcards', description: 'Create concise flashcards for review.' },
]

function App() {
  const [active, setActive] = useState('chat')
  const [darkMode, setDarkMode] = useState(true)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [status, setStatus] = useState('Ready to help you study.')
  const [history, setHistory] = useState([])
  const [uploadedName, setUploadedName] = useState('No notes uploaded yet.')

  useEffect(() => {
    fetchHistory().then((data) => setHistory(data || []))
  }, [])

  const themeClass = darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'

  const activeCard = useMemo(() => cards.find((item) => item.key === active), [active])

  const addMessage = (role, content) => {
    setMessages((prev) => [...prev, { role, content }])
  }

  const handleChatSubmit = async () => {
    if (!input.trim()) return
    addMessage('user', input)
    setStatus('Generating response...')
    const response = await chatRequest(input)
    if (response?.answer) {
      addMessage('assistant', response.answer)
      setStatus('Answer generated.')
    } else {
      setStatus('Error generating answer.')
    }
    setInput('')
    fetchHistory().then((data) => setHistory(data || []))
  }

  const handleUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setStatus('Uploading notes...')
    const response = await uploadPdf(file)
    if (response?.message) {
      setStatus(response.message)
      setUploadedName(file.name)
    } else {
      setStatus(response?.error || 'Upload failed.')
    }
    event.target.value = ''
  }

  const handleNotesQuestion = async () => {
    if (!input.trim()) return
    addMessage('user', input)
    setStatus('Searching uploaded notes...')
    const response = await askNotes(input)
    if (response?.answer) {
      addMessage('assistant', response.answer)
      setStatus('Notes answered.')
    } else {
      setStatus('Unable to answer notes question.')
    }
    setInput('')
    fetchHistory().then((data) => setHistory(data || []))
  }

  const handleSummary = async () => {
    setStatus('Summarizing notes...')
    const response = await summarizeNotes()
    if (response?.summary) {
      addMessage('assistant', response.summary)
      setStatus('Summary ready.')
    } else {
      setStatus('Unable to summarize notes.')
    }
  }

  const handleQuiz = async () => {
    setStatus('Generating quiz...')
    const response = await generateQuiz('study notes')
    if (response?.quiz) {
      addMessage('assistant', response.quiz)
      setStatus('Quiz generated.')
    } else {
      setStatus('Unable to generate quiz.')
    }
  }

  const handleFlashcards = async () => {
    setStatus('Generating flashcards...')
    const response = await generateFlashcards('study notes')
    if (response?.flashcards) {
      addMessage('assistant', response.flashcards)
      setStatus('Flashcards ready.')
    } else {
      setStatus('Unable to generate flashcards.')
    }
  }

  return (
    <div className={`${themeClass} min-h-screen`}> 
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-6 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-soft backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-sky-300/80">Generative AI Study Assistant</p>
            <h1 className="mt-4 text-4xl font-semibold text-white">Study smarter with AI</h1>
            <p className="mt-2 max-w-2xl text-slate-300">Upload PDFs, ask questions from notes, generate quizzes, and summarize topics in one clean dashboard.</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setDarkMode((prev) => !prev)}
              className="rounded-full border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-white transition hover:border-sky-400"
            >
              {darkMode ? 'Light mode' : 'Dark mode'}
            </button>
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
          <aside className="space-y-6">
            <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-soft">
              <h2 className="text-lg font-semibold text-white">Actions</h2>
              <div className="mt-4 space-y-3">
                {cards.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setActive(item.key)}
                    className={`w-full rounded-2xl border px-4 py-4 text-left transition ${active === item.key ? 'border-sky-400 bg-sky-500/10 text-sky-200' : 'border-slate-700 bg-slate-950 text-slate-200 hover:border-slate-500'}`}
                  >
                    <p className="font-semibold">{item.title}</p>
                    <p className="mt-2 text-sm text-slate-400">{item.description}</p>
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-soft">
              <h2 className="text-lg font-semibold text-white">Chat history</h2>
              <div className="mt-4 space-y-3 max-h-72 overflow-y-auto pr-1">
                {history.length === 0 ? (
                  <p className="text-sm text-slate-400">No history yet. Start a conversation.</p>
                ) : (
                  history.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-slate-800 bg-slate-950 p-3">
                      <p className="text-sm text-slate-300">{item.question}</p>
                      <p className="mt-2 text-xs text-slate-500">{new Date(item.created_at).toLocaleString()}</p>
                    </div>
                  ))
                )}
              </div>
            </section>
          </aside>

          <main className="space-y-6">
            <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-soft">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-white">{activeCard?.title}</h2>
                  <p className="mt-2 text-slate-400">{activeCard?.description}</p>
                </div>
                <div className="rounded-3xl bg-slate-950 px-4 py-3 text-sm text-slate-300">
                  {status}
                </div>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_280px]">
                <div className="space-y-4">
                  <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
                    <label className="block text-sm font-medium text-slate-300">Upload notes (PDF)</label>
                    <input type="file" accept="application/pdf" onChange={handleUpload} className="mt-3 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-400" />
                    <p className="mt-3 text-sm text-slate-500">{uploadedName}</p>
                  </div>

                  <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
                    <label className="block text-sm font-medium text-slate-300">Study prompt</label>
                    <textarea
                      rows="4"
                      value={input}
                      onChange={(event) => setInput(event.target.value)}
                      className="mt-3 w-full rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-400"
                      placeholder="Type a question or request..."
                    />
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button onClick={handleChatSubmit} className="rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400">Ask AI</button>
                      <button onClick={handleNotesQuestion} className="rounded-2xl border border-slate-700 px-5 py-3 text-sm text-slate-100 transition hover:border-sky-400">Ask notes</button>
                      <button onClick={handleSummary} className="rounded-2xl border border-slate-700 px-5 py-3 text-sm text-slate-100 transition hover:border-sky-400">Summarize</button>
                      <button onClick={handleQuiz} className="rounded-2xl border border-slate-700 px-5 py-3 text-sm text-slate-100 transition hover:border-sky-400">Quiz</button>
                      <button onClick={handleFlashcards} className="rounded-2xl border border-slate-700 px-5 py-3 text-sm text-slate-100 transition hover:border-sky-400">Flashcards</button>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
                  <h3 className="text-lg font-semibold text-white">Quick help</h3>
                  <ul className="mt-4 space-y-3 text-sm text-slate-400">
                    <li className="rounded-2xl bg-slate-900 p-4">Upload a PDF and ask questions about your notes.</li>
                    <li className="rounded-2xl bg-slate-900 p-4">Use the chat area to ask general study questions.</li>
                    <li className="rounded-2xl bg-slate-900 p-4">Generate quizzes and flashcards instantly.</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-soft">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl font-semibold text-white">Assistant output</h2>
                <span className="rounded-full bg-slate-950 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-400">Markdown ready</span>
              </div>

              <div className="mt-6 min-h-[300px] rounded-3xl border border-slate-800 bg-slate-950 p-6 text-slate-200">
                {messages.length === 0 ? (
                  <p className="text-slate-400">Start a chat or request a summary, quiz, or flashcards.</p>
                ) : (
                  messages.map((item, index) => (
                    <div key={index} className={`mb-6 rounded-3xl p-5 ${item.role === 'user' ? 'bg-slate-900' : 'bg-slate-800/80'}`}>
                      <p className={`text-sm font-semibold ${item.role === 'user' ? 'text-sky-300' : 'text-emerald-300'}`}>{item.role === 'user' ? 'You' : 'Assistant'}</p>
                      <div className="prose prose-invert mt-3 max-w-none text-slate-100">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.content}</ReactMarkdown>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  )
}

export default App
