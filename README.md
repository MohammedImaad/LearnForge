# LearnForge

**LearnForge** is an open-source AI-powered coding education platform designed for children aged 8–14. It uses generative AI to help teachers automatically create engaging beginner-friendly coding courses and lets students learn with interactive challenges and real-time AI tutoring.

## 🌟 Features

### 🧠 AI-Powered Curriculum Generation
- Teachers provide high-level prompts, learning outcomes, and week-wise objectives.
- The system uses GPT-4 (via LangChain) to generate full course structures:
  - Weekly objectives
  - Slides (with fun explanations, analogies, and media)
  - Quizzes
  - Challenges
- Teachers can also upload supporting resources like PDFs, YouTube links, or websites.

### ✍️ Editable AI Content with Agent Assistance
- Teachers can edit generated courses.
- An **AI Assistant Agent** helps refine content using per-session memory to retain context and suggestions.

### 👩‍🏫👧 Role-Based User Management
- **Teachers** can generate and edit courses.
- **Students** can view course content and interact with a future AI tutor.
- User roles are stored securely in MongoDB with hashed passwords.

### 🧩 Modular Backend
- Built with **FastAPI**, **LangChain**, **MongoDB**, and **OpenAI API**.
- Separate endpoints for course generation, editing, storage, and AI chat agent.

## 🗂 Project Structure

```
LearnForge/
├── ai-agent/                # Backend API
│   ├── main.py              # Main app and course generation
│   ├── auth.py              # Login/signup and role-based access
│   ├── ai_chat.py           # AI editing assistant with per-session memory
│   ├── db.py                # MongoDB connection
│   ├── .env                 # Environment variables (add your own)
│   └── requirements.txt
│
├── frontend/                # (Coming soon)
│   └── ...
│
└── README.md
```

## 🛠 Tech Stack

- **Backend**: FastAPI, LangChain, OpenAI API (GPT-4)
- **Database**: MongoDB Atlas
- **AI Features**: Curriculum generation, course editing assistant
- **Auth**: Custom user login with teacher/student roles
- **Frontend**: React (planned)

## 🚀 How to Run

1. **Clone the repo**
   ```bash
   git clone https://github.com/your-username/LearnForge.git
   cd LearnForge/ai-agent
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up `.env`**
   ```env
   OPENAI_API_KEY=your_openai_key
   MONGODB_URI=your_mongodb_uri
   DB_NAME=learnforge
   ```

4. **Run the server**
   ```bash
   uvicorn main:app --reload
   ```

5. **Access FastAPI docs**
   - Visit: `http://localhost:8000/docs`

## 🔐 API Endpoints

- `POST /generate` – Generate a new course using AI
- `POST /courses/save` – Save course to MongoDB
- `GET /courses` – Get list of all saved courses
- `POST /auth/signup` – Register user (teacher or student)
- `POST /auth/login` – Login user
- `POST /ai-agent/chat` – Chat with AI assistant while editing courses

## 📦 Future Features

- Frontend UI with embedded code challenges and progress tracking
- Student AI assistant for learning help
- Course editing interface with drag-drop
- Deployment on cloud (Render, Railway, or Vercel)

## 🤝 Contributing

Pull requests and issues are welcome! Let's build the future of creative education together.

## 🧠 License

MIT License

---

**Repo**: [https://github.com/MohammedImaad/ai-course-agent](https://github.com/MohammedImaad/ai-course-agent)


uvicorn main:app --reload 