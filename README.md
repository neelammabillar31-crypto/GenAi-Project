# GenAI Study Assistant

A full-stack Generative AI study assistant using React, Tailwind CSS, Flask, SQLite, and Ollama local AI integration.

## Features

- ChatGPT-style AI chatbot for study questions
- PDF upload and text extraction
- Ask questions from uploaded notes
- AI notes summarizer
- Multiple-choice quiz generator
- Flashcard generator
- Dark mode modern UI
- Responsive dashboard layout
- Chat history
- Markdown response rendering

## Architecture

- `backend/` — Flask REST API, SQLite data storage, PDF parsing, Ollama integration
- `frontend/` — React + Vite + Tailwind UI and markdown rendering

## Requirements

- Python 3.11+
- Node.js 18+
- Ollama local API running at `http://localhost:11434`
- Ollama model installed: `llama3` or `mistral`
 - Optional Groq API key for Groq model usage

## Setup

### 1. Start Ollama

Install Ollama and run it locally. For example:

```bash
ollama run llama3
```

Adjust the model in `backend/utils.py` if you prefer `mistral`.

### 2. Install backend dependencies

```bash
cd "e:\GenAI Project\backend"
python -m venv venv
venv\Scripts\activate
python -m pip install -r requirements.txt
```

If you want to use Groq instead of Ollama, set the following environment variables before running the backend:

```powershell
$env:GROQ_API_KEY = "your_groq_api_key"
$env:GROQ_BASE_URL = "https://api.groq.com"
$env:GROQ_MODEL = "llama-3.1-8b-instant"
```

If `GROQ_API_KEY` is not set, the backend falls back to Ollama.

### 3. Start backend server

```bash
python app.py
```

The API will be available at `http://localhost:5000/api`.

### 4. Install frontend dependencies

```bash
cd "e:\GenAI Project\frontend"
npm install
```

### 5. Start frontend development server

```bash
npm run dev
```

Open the app in your browser at the URL shown by Vite, typically `http://localhost:5173`.

## Usage

- Upload a PDF file to add notes to the study assistant.
- Ask general study questions through the chat panel.
- Use the notes QA action to query your uploaded content.
- Generate summaries, quizzes, and flashcards with one click.

## Production Notes

- The backend stores chat history and uploaded note content in `backend/study_assistant.db`.
- The frontend is built with Vite and Tailwind CSS for fast performance.
- No authentication is included to keep the app beginner-friendly and simple.

## Troubleshooting

- If the API cannot connect to Ollama, verify `http://localhost:11434/api/generate` is reachable.
- If PDF upload fails, make sure the file is a valid PDF document.
- For frontend issues, rebuild with `npm run build` and check console logs.
