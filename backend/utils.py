import os
import requests
from dotenv import load_dotenv
from groq import Groq
from PyPDF2 import PdfReader
from db import SessionLocal

load_dotenv()

OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_BASE_URL = os.getenv("GROQ_BASE_URL", "https://api.groq.com")


def extract_pdf_text(file_storage):
    try:
        reader = PdfReader(file_storage)
        text = []
        for page in reader.pages:
            page_text = page.extract_text() or ""
            text.append(page_text)
        return "\n\n".join(text).strip()
    except Exception:
        return ""


def call_ollama(prompt: str) -> str:
    try:
        payload = {
            "model": OLLAMA_MODEL,
            "prompt": prompt,
            "max_tokens": 800,
            "temperature": 0.3,
        }
        response = requests.post(OLLAMA_URL, json=payload, timeout=60)
        response.raise_for_status()
        data = response.json()
        if isinstance(data, dict) and "results" in data and data["results"]:
            return data["results"][0].get("output", "").strip()
        return ""
    except Exception:
        return ""


def call_groq(prompt: str) -> str:
    if not GROQ_API_KEY:
        return ""

    try:
        client = Groq(api_key=GROQ_API_KEY, base_url=GROQ_BASE_URL)
        response = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model=GROQ_MODEL,
            temperature=0.3,
            max_completion_tokens=800,
        )
        if response and getattr(response, "choices", None):
            first_choice = response.choices[0]
            message = getattr(first_choice, "message", None)
            if message and getattr(message, "content", None):
                return message.content.strip()
        return ""
    except Exception:
        return ""


def call_ai_model(prompt: str) -> str:
    groq_response = call_groq(prompt)
    if groq_response:
        return groq_response
    return call_ollama(prompt)
