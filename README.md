# AI Study Assistant - Full Stack Application

A complete AI-powered learning platform built with FastAPI backend and React frontend. The application enables users to create learning pathways, upload study materials (PDFs), generate AI-powered summaries and quizzes.

## Features

### MVP Features
✅ User Authentication (Register/Login with JWT)
✅ Create Learning Pathways with custom topics
✅ Upload PDF study materials (up to 4 files)
✅ AI-generated topic summaries using RAG
✅ Automatic quiz generation for topics
✅ Progress tracking for each learning pathway
✅ Topic status management (Pending/In Progress/Completed)

## Project Structure

```
AIStudyAssistant/
├── backend/                      # FastAPI backend
│   ├── main.py                  # Main FastAPI app
│   ├── core/                    # Core utilities
│   │   ├── auth.py              # JWT authentication setup
│   │   ├── db.py                # Database configuration
│   │   ├── user_manager.py      # User management
│   │   ├── user_db.py           # User database setup
│   │   └── email.py             # Email configuration
│   ├── models/                  # SQLAlchemy models
│   │   ├── user.py              # User model
│   │   ├── pathway.py           # Learning pathway model
│   │   ├── topic.py             # Topic model
│   │   ├── enums.py             # Status enums
│   │   └── base.py              # Base model
│   ├── schemas/                 # Pydantic schemas
│   │   ├── user.py
│   │   ├── pathway_create.py
│   │   ├── topic_create.py
│   │   ├── pathway_status.py
│   │   └── quiz_request.py
│   ├── routes/                  # API routes
│   │   ├── learning_paths.py
│   │   └── topics.py
│   ├── services/                # Business logic
│   │   ├── llm_service.py       # LLM integration
│   │   ├── pathway_service.py   # Pathway operations
│   │   ├── rag_service.py       # RAG for summaries
│   │   └── quiz_service.py      # Quiz generation
│   └── alembic/                 # Database migrations
│
└── frontend/                     # React + Vite frontend
    ├── src/
    │   ├── pages/               # Page components
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── CreatePathway.jsx
    │   │   ├── PathwayDetail.jsx
    │   │   ├── TopicDetail.jsx
    │   │   └── Quiz.jsx
    │   ├── components/          # Reusable components
    │   │   └── ProtectedRoute.jsx
    │   ├── services/            # API client
    │   │   └── apiClient.js
    │   ├── store/               # Zustand state management
    │   │   ├── authStore.js
    │   │   └── pathwayStore.js
    │   ├── hooks/               # Custom React hooks
    │   ├── App.jsx              # Main app component
    │   ├── main.jsx             # Entry point
    │   └── index.css            # Tailwind CSS
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

## Backend Setup

### Prerequisites
- Python 3.10+
- PostgreSQL (configured in `core/db.py`)
- pip

### Installation

1. **Install dependencies:**
```bash
cd AIStudyAssistant
pip install -r requirements.txt
```

2. **Set up environment variables** (create a `.env` file in the root):
```env
DATABASE_URL=postgresql+asyncpg://postgres:security@localhost:5432/ai_study_assistant_db
GOOGLE_API_KEY=your_google_genai_api_key_here
SECRET_KEY=your_secret_key_here
```

3. **Initialize database:**
```bash
alembic upgrade head
```

4. **Run the backend:**
```bash
uvicorn main:app --reload
```

The backend will be available at `http://localhost:8000`
API documentation: `http://localhost:8000/docs`

## Frontend Setup

### Prerequisites
- Node.js 16+ and npm

### Installation

1. **Install dependencies:**
```bash
cd frontend
npm install
```

2. **Start development server:**
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

3. **Build for production:**
```bash
npm run build
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/jwt/login` - Login user
- `POST /auth/jwt/logout` - Logout user
- `GET /users/me` - Get current user info

### Learning Pathways
- `GET /pathways/` - Get all user pathways
- `POST /pathways/` - Create a new pathway
- `POST /pathways/generate` - Generate pathway using LLM
- `GET /pathways/{pathway_id}/status` - Get pathway progress
- `POST /pathways/{pathway_id}/upload-pdfs` - Upload PDF files

### Topics
- `GET /topics/{topic_id}/summary` - Generate topic summary (RAG)
- `POST /topics/{topic_id}/complete` - Mark topic as completed
- `GET /topics/{pathway_id}/current-topic` - Get next pending topic

### Quizzes
- `POST /pathways/generate-quiz` - Generate quiz for a topic

## Authentication Flow

### Frontend Authentication
1. User registers/logs in via the React UI
2. Backend returns JWT token
3. Token is stored in `localStorage`
4. Axios interceptor automatically adds `Authorization: Bearer {token}` to requests
5. On 401 response, user is redirected to login

### Backend Authentication
- Uses `fastapi-users` for user management
- JWT stored in HttpOnly cookies
- All protected endpoints require `User = Depends(fastapi_users.current_user())`

## Key Differences from Backend to Frontend

### Login/Register Credentials
- **Email field**: Sent as `username` in login request (fastapi-users requirement)
- **Username**: Required for registration
- **Password**: Standard password field

### Data Types
- Backend uses UUIDs for pathway IDs
- Backend uses integers for topic IDs
- Frontend properly handles both types

## Features Breakdown

### 1. Registration & Login
- Email validation
- Secure password handling
- JWT token management
- Auto-login after registration

### 2. Dashboard
- View all learning pathways
- Create new pathway button
- Card-based pathway display
- Quick access to pathway details

### 3. Create Pathway
- Two-step process:
  - Step 1: Enter pathway name and topics
  - Step 2: Upload PDF files (optional)
- LLM-powered topic ordering
- File upload with progress indication

### 4. Pathway Detail
- Progress overview (percentage, counts)
- Topics list with status badges
- Visual progress bar
- PDF upload interface

### 5. Topic Details
- Topic name and keywords
- AI-generated summary (via RAG)
- Mark as completed
- Quiz generation button

### 6. Quiz
- Configurable difficulty and question count
- Multiple question types:
  - Multiple choice
  - True/False
  - Short answer
- Immediate feedback with explanations
- Progress tracking

## Technologies Used

### Backend
- **Framework**: FastAPI
- **Auth**: fastapi-users with JWT
- **Database**: PostgreSQL + SQLAlchemy ORM
- **AI/ML**: Google Generative AI, LangChain
- **Vector Store**: Chroma DB
- **File Processing**: PyPDF

### Frontend
- **UI Framework**: React 18
- **Routing**: React Router v6
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS
- **Build Tool**: Vite

## Running Both Services

### Terminal 1 - Backend
```bash
cd AIStudyAssistant
uvicorn main:app --reload
```

### Terminal 2 - Frontend
```bash
cd AIStudyAssistant/frontend
npm run dev
```

## Testing the Application

1. **Register**: Navigate to `http://localhost:3000/register`
2. **Login**: Create account and login
3. **Create Pathway**: Click "Create New Pathway"
4. **Add Topics**: Enter topics separated by newlines
5. **Upload PDFs**: Upload study materials
6. **View Topics**: Click on topics to see details
7. **Generate Summary**: Use RAG to get AI summaries
8. **Take Quiz**: Test your knowledge with AI quizzes

## Important Notes

### Backend Auth Changes
All hardcoded user IDs have been replaced with authenticated user extraction:

**Before:**
```python
user_id: UUID = UUID("123e4567-e89b-12d3-a456-426614174000")
```

**After:**
```python
user: User = Depends(fastapi_users.current_user())
# Use user.id in operations
```

### Frontend Cookie Handling
- JWT is stored in localStorage for simplicity
- For production, use HttpOnly cookies for better security
- Update `apiClient.js` to use cookie-based auth if needed

## Common Issues

### Backend Connection
If frontend can't connect to backend:
1. Ensure backend is running on `http://localhost:8000`
2. Check CORS settings in `main.py`
3. Verify `API_URL` in `frontend/src/services/apiClient.js`

### Database Connection
If database connection fails:
1. Ensure PostgreSQL is running
2. Check `DATABASE_URL` in `core/db.py`
3. Verify database exists and credentials are correct

### PDF Upload Issues
1. Ensure PDFs are less than reasonable file size
2. Check that Chroma DB directory exists
3. Verify Google API key is set

## Future Enhancements

- [ ] User profile customization
- [ ] Social features (share pathways)
- [ ] Advanced analytics
- [ ] Mobile app
- [ ] Offline mode
- [ ] Custom AI model selection
- [ ] Quiz retry logic
- [ ] Study material recommendations

## License

This project is open source and available under the MIT License.

## Support

For issues or questions, please refer to the code comments and docstrings throughout the project.
