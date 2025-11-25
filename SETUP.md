# Setup Guide - AI Study Assistant

Complete guide to set up and run the entire AI Study Assistant application.

## Prerequisites

### System Requirements
- Windows 10+, macOS, or Linux
- Python 3.10+
- Node.js 16+
- PostgreSQL 12+
- pip and npm package managers

### API Keys Required
1. **Google Generative AI Key** - For LLM and embedding services
   - Get from: https://makersuite.google.com/app/apikeys
   - Free tier available

2. **PostgreSQL Database** - Local or remote instance

## Backend Setup

### Step 1: Install Python Dependencies

```bash
cd AIStudyAssistant
pip install fastapi uvicorn sqlalchemy asyncpg pydantic python-multipart fastapi-users fastapi-users-db-sqlalchemy sqlalchemy-utils python-jose bcrypt cryptography fastapi-mail httpx httpx-oauth langchain langchain-community langchain-text-splitters google-generativeai chroma-db sentence-transformers PyPDF2 python-dotenv
```

Or create a `requirements.txt` and install from it:

```bash
pip install -r requirements.txt
```

### Step 2: Create Environment File

Create `.env` file in the root `AIStudyAssistant` directory:

```env
# Database
DATABASE_URL=postgresql+asyncpg://postgres:security@localhost:5432/ai_study_assistant_db

# API Keys
GOOGLE_API_KEY=your_google_genai_api_key_here

# JWT
SECRET_KEY=your_super_secret_key_change_this_in_production

# Email (optional for now)
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_FROM=your_email@gmail.com
MAIL_PORT=587
MAIL_SERVER=smtp.gmail.com
```

### Step 3: Set Up PostgreSQL Database

#### Windows
```bash
# If PostgreSQL is installed and running
psql -U postgres
```

Then in psql:
```sql
CREATE DATABASE ai_study_assistant_db;
```

#### macOS (using Homebrew)
```bash
# Install PostgreSQL if not already installed
brew install postgresql

# Start PostgreSQL
brew services start postgresql

# Create database
createdb ai_study_assistant_db
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt-get install postgresql postgresql-contrib

sudo service postgresql start

sudo -u postgres psql
```

Then in psql:
```sql
CREATE DATABASE ai_study_assistant_db;
```

### Step 4: Initialize Database Schema

```bash
# Run Alembic migrations
alembic upgrade head
```

### Step 5: Run Backend Server

```bash
uvicorn main:app --reload
```

Backend will be available at:
- **Main**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Frontend Setup

### Step 1: Install Node Dependencies

```bash
cd frontend
npm install
```

### Step 2: Configure API URL (if needed)

Edit `frontend/src/services/apiClient.js`:

```javascript
const API_URL = 'http://localhost:8000';  // Change if backend is on different URL
```

### Step 3: Run Development Server

```bash
npm run dev
```

Frontend will be available at: http://localhost:3000

## Running Both Services (Recommended Setup)

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

### Terminal 3 (Optional) - Database Monitoring
```bash
# If using PostgreSQL locally
psql -U postgres -d ai_study_assistant_db

# View tables
\dt

# View a specific table
SELECT * FROM "user" LIMIT 5;
```

## First Time Usage

### 1. Register a New Account

Navigate to http://localhost:3000/register

Fill in:
- **Username**: Any username (e.g., "testuser")
- **Email**: Any email (e.g., "test@example.com")
- **Password**: Strong password

Click "Register" - you'll be logged in automatically.

### 2. Create a Learning Pathway

1. Click "Create New Pathway"
2. Enter pathway name (e.g., "Python Basics")
3. Add topics (one per line):
   ```
   Python Fundamentals
   Variables and Data Types
   Control Flow
   Functions
   Object-Oriented Programming
   ```
4. Click "Create Pathway"
5. Upload PDF files (optional - max 4 files)
6. Click "Upload PDFs"

### 3. View Your Pathway

- Click on the pathway card
- See progress overview
- Click on topics to view details
- Generate summaries (requires PDFs)
- Take quizzes

### 4. Generate Summaries

For a topic:
1. Click on the topic
2. Click "Generate Summary"
3. Wait for RAG to process
4. View the AI-generated summary

### 5. Take a Quiz

For a topic:
1. Click on the topic
2. Click "Take Quiz"
3. Select difficulty and number of questions
4. Answer questions
5. View answers and explanations
6. See your score

## Troubleshooting

### Backend Issues

#### Port Already in Use
```bash
# Change port
uvicorn main:app --reload --port 8001

# Then update frontend API_URL
```

#### Database Connection Error
```
Error: could not translate host name "localhost" to address

Solutions:
1. Check PostgreSQL is running
2. Verify DATABASE_URL is correct
3. Try: postgresql://localhost:5432/ai_study_assistant_db
```

#### Module Not Found
```bash
# Reinstall all packages
pip install --force-reinstall -r requirements.txt
```

### Frontend Issues

#### Port 3000 Already in Use
```bash
# Change port in vite.config.js
# Or kill process:
# Windows: netstat -ano | findstr :3000
# macOS/Linux: lsof -i :3000
```

#### CORS Error
1. Ensure backend is running
2. Check that frontend API_URL matches backend URL
3. Add CORS middleware if needed

#### Module Not Found
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## Common Backend Fixes

### Fix Python Path Issues (Windows)
```bash
# If python command not found, try:
python -m pip install <package_name>

# Or use full path:
C:\Users\YourUser\AppData\Local\Programs\Python\Python310\Scripts\pip.exe install <package_name>
```

### Reset Database
```bash
# Drop and recreate
psql -U postgres -c "DROP DATABASE ai_study_assistant_db;"
psql -U postgres -c "CREATE DATABASE ai_study_assistant_db;"

# Reinit schema
alembic upgrade head
```

## Production Deployment

### Backend
```bash
# Install production ASGI server
pip install gunicorn

# Run with gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
```

### Frontend
```bash
# Build optimized bundle
npm run build

# Output in 'dist' folder - deploy this folder
```

## Environment Checklist

- [ ] Python 3.10+ installed
- [ ] PostgreSQL installed and running
- [ ] Node.js 16+ installed
- [ ] Google API key obtained
- [ ] `.env` file created with all keys
- [ ] Database created
- [ ] Alembic migrations run
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] Both servers can start without errors

## Testing the API

### Using Swagger UI (Recommended)
1. Navigate to http://localhost:8000/docs
2. Click on endpoints to test
3. Authentication required for protected endpoints

### Using cURL
```bash
# Register
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123","username":"testuser"}'

# Login
curl -X POST "http://localhost:8000/auth/jwt/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test@example.com&password=pass123"

# Get pathways (with token)
curl -X GET "http://localhost:8000/pathways/" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using Postman
1. Download Postman
2. Create collection
3. Add requests for each endpoint
4. Use {{token}} variable for authentication
5. Import environment variables

## Next Steps

1. **Complete MVP**: All features are implemented
2. **Test thoroughly**: Try creating pathways, uploading PDFs, generating quizzes
3. **Customize**: Modify styling in Tailwind config
4. **Deploy**: Follow production deployment steps
5. **Extend**: Add features like user profiles, sharing, analytics

## Support Resources

- **Backend Issues**: Check `main.py` and route files
- **Frontend Issues**: Check browser console (F12)
- **Database Issues**: Check PostgreSQL logs
- **API Issues**: Test with Swagger UI at `/docs`

## Performance Tips

- Enable query logging for database debugging:
  ```python
  # In core/db.py, set echo=False to disable logging in production
  engine = create_async_engine(DATABASE_URL, echo=True)
  ```

- Cache API responses in frontend:
  ```javascript
  // Add caching to axios interceptor
  ```

- Use CDN for static files in production

- Enable gzip compression on server

## Security Notes

- Change `SECRET_KEY` in production
- Use HTTPS for all communications
- Store credentials in environment variables only
- Use strong database passwords
- Enable rate limiting on API
- Regular security updates for dependencies
