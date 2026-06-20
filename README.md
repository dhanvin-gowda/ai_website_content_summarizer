# AI Assisted Website

AI Assisted Website is a MERN stack application that helps students learn from any website using AI-powered tools. Users can summarize web pages, generate flashcards, create study notes, and chat with an AI tutor based on the content.

## Features

* 🌐 Website URL Summarization
* 📝 AI Generated Study Notes
* 🃏 Flashcard Generation
* 🤖 AI Study Tutor Chat
* 📚 Topic Management Dashboard
* 💾 MongoDB Data Storage
* ⚡ Fast React + Vite Frontend
* 🔗 Anakin Universal Scraper Integration

---

## Tech Stack

### Frontend

* React
* Vite
* CSS

### Backend

* Node.js
* Express.js

### Database

* MongoDB
* Mongoose

### External APIs

* Anakin Universal Scraper API

---

## Project Structure

```text
AI_ASSISTED_WEBSITE/
├── backend/
│   ├── models/
│   │   └── StudyTopic.js
│   ├── services/
│   ├── collector.js
│   ├── database.js
│   ├── main.js
│   └── router.js
│
├── public/
│
├── src/
│   ├── assets/
│   │   └── .gitkeep
│   │
│   ├── components/
│   │   ├── FlashcardsGenerator.jsx
│   │   ├── FlashcardsWidget.jsx
│   │   ├── NotesMaker.jsx
│   │   ├── NotesWidget.jsx
│   │   ├── StudyTutorChat.jsx
│   │   ├── SummaryWidget.jsx
│   │   ├── UrlSummarizer.jsx
│   │   └── WelcomeScreen.jsx
│   │
│   ├── App.css
│   ├── App.jsx
│   ├── Dashboard.css
│   ├── Dashboard.jsx
│   ├── index.css
│   ├── main.jsx
│   └── New.jsx
│
├── .env.example
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## Installation

### Clone the Repository

```bash
git clone https://github.com/dhanvin-gowda/ai_website_summarizer.git
cd ai_website_summarizer
```

### Install Dependencies

```bash
npm install
```

---

## Environment Variables

Create a `.env` file in the root directory.

```env
PORT=5000

MONGODB_URI=your_mongodb_connection_string

ANAKIN_API_KEY=your_anakin_api_key
```

### MongoDB Atlas Example

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
```

---

## Running the Project

### Run Frontend and Backend Together

```bash
npm run dev
```

### Frontend

```bash
npm run dev:client
```

Runs on:

```text
http://localhost:5173
```

### Backend

```bash
npm run dev:server
```

Runs on:

```text
http://localhost:5000
```

---

## API Endpoints

### Health Check

```http
GET /api/health
```

### Summarize Website

```http
POST /api/summarize
```

Request:

```json
{
  "url": "https://example.com"
}
```

### Generate Flashcards

```http
POST /api/flashcards
```

Request:

```json
{
  "url": "https://example.com"
}
```

### Generate Notes

```http
POST /api/notes
```

Request:

```json
{
  "url": "https://example.com"
}
```

### Study Tutor Chat

```http
POST /api/chat
```

Request:

```json
{
  "message": "Explain this topic"
}
```

---

## Available Scripts

| Command            | Description              |
| ------------------ | ------------------------ |
| npm run dev        | Run frontend and backend |
| npm run dev:client | Run frontend only        |
| npm run dev:server | Run backend only         |
| npm run build      | Production build         |
| npm run preview    | Preview production build |
| npm run lint       | Run ESLint               |

---

## Deployment

### Frontend

* Vercel
* Netlify

Set `VITE_API_BASE_URL` in the frontend environment when the backend is hosted separately. For example, point it to your Render or Railway backend URL so client requests do not fall back to Vercel's own `/api` paths.

### Backend

* Render
* Railway

### Database

* MongoDB Atlas

---

## Future Improvements

* User Authentication
* Study History
* PDF Export
* AI Quiz Generator
* Topic Categorization
* File Upload Support
* Personalized Learning Dashboard

---

## Screenshots

Add screenshots of your application here.

```md
![Dashboard](screenshots/dashboard.png)
```

---

## Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature-name
```

3. Commit changes

```bash
git commit -m "Add feature"
```

4. Push branch

```bash
git push origin feature-name
```

5. Open a Pull Request

---

## Author

Dhanvin Gowda

GitHub: https://github.com/dhanvin-gowda

---


