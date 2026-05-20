import os
import json
from pathlib import Path
from flask import Flask, request, jsonify
from flask_cors import CORS
from sqlalchemy.exc import SQLAlchemyError
from db import SessionLocal, init_db
from models import ChatHistory, NoteDocument
from utils import extract_pdf_text, call_ai_model

app = Flask(__name__)
CORS(app)

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

init_db()

SYSTEM_PROMPT = (
    "You are a helpful study assistant. Answer the user clearly and concisely. "
    "Use markdown formatting for examples, lists, tables, and code blocks when appropriate."
)


def save_chat(role: str, question: str, answer: str):
    session = SessionLocal()
    try:
        chat = ChatHistory(role=role, question=question, answer=answer)
        session.add(chat)
        session.commit()
        return chat.id
    except SQLAlchemyError:
        session.rollback()
        return None
    finally:
        session.close()


def get_document_text():
    session = SessionLocal()
    try:
        documents = session.query(NoteDocument).order_by(NoteDocument.id.desc()).all()
        return "\n\n".join(doc.content for doc in documents)
    finally:
        session.close()


@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({"status": "ok"})


@app.route("/api/history", methods=["GET"])
def api_history():
    session = SessionLocal()
    try:
        chats = session.query(ChatHistory).order_by(ChatHistory.created_at.desc()).limit(50).all()
        return jsonify([
            {
                "id": chat.id,
                "role": chat.role,
                "question": chat.question,
                "answer": chat.answer,
                "created_at": chat.created_at.isoformat(),
            }
            for chat in chats
        ])
    finally:
        session.close()


@app.route("/api/upload-pdf", methods=["POST"])
def upload_pdf():
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    content = extract_pdf_text(file)
    if not content:
        return jsonify({"error": "Could not extract text from PDF"}), 500

    session = SessionLocal()
    try:
        document = NoteDocument(filename=file.filename, content=content)
        session.add(document)
        session.commit()
        return jsonify({"message": "Notes uploaded successfully."})
    except SQLAlchemyError as error:
        session.rollback()
        return jsonify({"error": str(error)}), 500
    finally:
        session.close()


@app.route("/api/ask-notes", methods=["POST"])
def ask_notes():
    data = request.get_json() or {}
    question = data.get("question", "").strip()
    if not question:
        return jsonify({"error": "Question is required"}), 400

    document_text = get_document_text()
    prompt = (
        f"You are a study assistant. Use the uploaded notes to answer the question below. "
        f"If the notes do not contain the answer, say you could not find it in the notes.\n\n"
        f"Uploaded notes:\n{document_text}\n\nQuestion: {question}"
    )

    response = call_ai_model(prompt)
    answer = response or "Sorry, I could not generate an answer."
    save_chat("notes", question, answer)
    return jsonify({"answer": answer})


@app.route("/api/summarize", methods=["POST"])
def summarize_notes():
    data = request.get_json() or {}
    target = data.get("target", "notes")

    document_text = get_document_text()
    if not document_text:
        return jsonify({"error": "No notes uploaded yet."}), 400

    prompt = (
        "You are a study assistant. Summarize the uploaded notes into a concise study guide. "
        "Use bullet points, short sections, and markdown formatting.\n\n"
        f"Notes:\n{document_text}"
    )

    if target == "concepts":
        prompt += "\n\nFocus on the key concepts and definitions."
    elif target == "action":
        prompt += "\n\nFocus on the practical actions, study steps, and example questions."

    response = call_ai_model(prompt)
    answer = response or "Unable to summarize notes."
    save_chat("summarize", "Summarize notes", answer)
    return jsonify({"summary": answer})


@app.route("/api/generate-quiz", methods=["POST"])
def generate_quiz():
    data = request.get_json() or {}
    topic = data.get("topic", "study notes").strip() or "study notes"
    document_text = get_document_text()

    prompt = (
        "Create 4 multiple-choice questions with 4 options each, based on the uploaded notes or topic. "
        "Mark the correct answer with an asterisk. Use markdown formatting.\n\n"
        f"Topic: {topic}\n\nNotes:\n{document_text}"
    )

    response = call_ai_model(prompt)
    answer = response or "Unable to generate quiz."
    save_chat("quiz", topic, answer)
    return jsonify({"quiz": answer})


@app.route("/api/generate-flashcards", methods=["POST"])
def generate_flashcards():
    data = request.get_json() or {}
    topic = data.get("topic", "study notes").strip() or "study notes"
    document_text = get_document_text()

    prompt = (
        "Generate 6 flashcards in markdown. Format each flashcard with a question and answer. "
        "Keep answers brief and clear.\n\n"
        f"Topic: {topic}\n\nNotes:\n{document_text}"
    )

    response = call_ai_model(prompt)
    answer = response or "Unable to generate flashcards."
    save_chat("flashcards", topic, answer)
    return jsonify({"flashcards": answer})


@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json() or {}
    question = data.get("question", "").strip()
    if not question:
        return jsonify({"error": "Question is required"}), 400

    prompt = f"{SYSTEM_PROMPT}\n\nUser: {question}\nAssistant:"
    response = call_ai_model(prompt)
    answer = response or "Sorry, I could not generate an answer."
    save_chat("chat", question, answer)
    return jsonify({"answer": answer})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
