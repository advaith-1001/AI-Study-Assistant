# AI Study Assistant - Frontend

A modern React + Vite application for the AI Study Assistant learning platform.

## Quick Start

### Prerequisites
- Node.js 16+ 
- npm

### Installation & Running

1. **Install dependencies:**
```bash
npm install
```

2. **Start development server:**
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

3. **Build for production:**
```bash
npm run build
```

## Project Structure

```
src/
├── pages/                   # Page components
│   ├── Login.jsx           # Login page
│   ├── Register.jsx        # Registration page  
│   ├── Dashboard.jsx       # Main dashboard
│   ├── CreatePathway.jsx   # Pathway creation wizard
│   ├── PathwayDetail.jsx   # Pathway overview
│   ├── TopicDetail.jsx     # Topic details & summary
│   └── Quiz.jsx            # Quiz interface
│
├── components/             # Reusable components
│   └── ProtectedRoute.jsx  # Route protection wrapper
│
├── services/               # API integration
│   └── apiClient.js        # Axios instance & API calls
│
├── store/                  # Zustand state stores
│   ├── authStore.js        # Authentication state
│   └── pathwayStore.js     # Pathway state
│
├── App.jsx                 # Main app component with routing
├── main.jsx                # Entry point
└── index.css               # Tailwind CSS styles
```

## Features

### Authentication
- User registration with email, username, and password
- Secure login with JWT token
- Automatic token attachment to API requests
- Protected routes with redirect to login
- Logout functionality

### Dashboard
- View all learning pathways
- Quick access to create new pathway
- Pathway cards with metadata
- Responsive grid layout

### Create Pathway (Two-Step Process)
**Step 1: Basic Info**
- Enter pathway name
- Add topics (one per line)
- Real-time topic count display

**Step 2: Upload PDFs**
- Upload up to 4 PDF files
- File validation and feedback
- Optional PDF upload (can skip)
- Background processing status

### Pathway Management
- View pathway progress
- See completion percentage
- Track pending vs completed topics
- Topic status badges
- Visual progress bar

### Topic Details
- Topic name and keywords
- AI-generated summaries via RAG
- Mark topics as complete
- Generate quizzes

### Quiz System
- Configurable difficulty (Easy/Medium/Hard)
- Adjustable question count (1-20)
- Multiple question types:
  - Multiple choice (MCQ)
  - True/False
  - Short answer
- Immediate feedback with explanations
- Progress tracking through quiz
- Final score display

## API Integration

### Base URL
`http://localhost:8000`

### Authentication Endpoints
- `POST /auth/register` - Create account
- `POST /auth/jwt/login` - Login (uses username field for email)
- `POST /auth/jwt/logout` - Logout
- `GET /users/me` - Get current user

### Pathway Endpoints
- `GET /pathways/` - List all pathways
- `POST /pathways/` - Create pathway
- `POST /pathways/generate` - LLM-generated pathway
- `GET /pathways/{id}/status` - Get pathway progress
- `POST /pathways/{id}/upload-pdfs` - Upload PDFs

### Topic Endpoints
- `GET /topics/{id}/summary` - Generate summary
- `POST /topics/{id}/complete` - Mark complete
- `GET /topics/{pathway_id}/current-topic` - Next topic

### Quiz Endpoints
- `POST /pathways/generate-quiz` - Generate quiz

## State Management (Zustand)

### Auth Store (`authStore.js`)
```javascript
{
  user: User | null,
  isAuthenticated: boolean,
  loading: boolean,
  error: string | null,
  setUser(user),
  setLoading(loading),
  setError(error),
  clearError(),
  logout()
}
```

### Pathway Store (`pathwayStore.js`)
```javascript
{
  pathways: Pathway[],
  currentPathway: Pathway | null,
  loading: boolean,
  error: string | null,
  setPathways(pathways),
  setCurrentPathway(pathway),
  addPathway(pathway),
  updatePathway(id, updates),
  setLoading(loading),
  setError(error),
  clearError()
}
```

## Important Implementation Details

### JWT Token Handling
- Token is stored in `localStorage` under key `access_token`
- Axios interceptor automatically adds token to every request
- Token is sent as `Authorization: Bearer {token}` header
- 401 responses trigger redirect to login

### Login Credentials
**Important**: FastAPI-Users expects email to be sent as `username` field in login:
```javascript
// Login request
{
  username: "user@email.com",  // This is the email!
  password: "password123"
}
```

### Protected Routes
Routes are protected using `ProtectedRoute` component:
```jsx
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>
```

### API Client Structure
```javascript
export const authAPI = { ... }      // Auth endpoints
export const pathwayAPI = { ... }   // Pathway endpoints
export const topicAPI = { ... }     // Topic endpoints
export const quizAPI = { ... }      // Quiz endpoints
```

## Component Lifecycle Examples

### Creating a Pathway
1. User fills form on `CreatePathway` page
2. On submit, calls `pathwayAPI.createPathway()`
3. Response updates Zustand store via `addPathway()`
4. UI moves to PDF upload step
5. After upload, redirects to pathway detail

### Taking a Quiz
1. User clicks "Take Quiz" on topic
2. `Quiz` page fetches topic data
3. Renders quiz settings form
4. On generate, calls `quizAPI.generateQuiz()`
5. Displays questions with navigation
6. Shows answers and explanations on demand

## Styling

Uses Tailwind CSS for all styling:
- Utility-first CSS framework
- Responsive design (mobile, tablet, desktop)
- Pre-configured color scheme
- Custom configuration in `tailwind.config.js`

## Error Handling

- API errors display user-friendly messages
- Form validation before submission
- Network error handling with retry options
- Loading states on all async operations

## Building for Production

```bash
npm run build
```

Output goes to `dist/` directory. Deploy with:
```bash
npm run preview
```

## Development Tips

### Debugging
- React DevTools browser extension recommended
- Check Network tab for API calls
- localStorage contains auth token (for debugging)
- Console logs available for tracking flow

### Testing API Manually
Use the Swagger UI at `http://localhost:8000/docs` to test backend endpoints directly.

### Mock Data
The app works with real backend data. Ensure backend is running on port 8000.

## Common Issues & Solutions

### CORS Errors
- Ensure backend is running
- Check backend CORS configuration
- Verify API_URL in apiClient.js

### Authentication Failed
- Clear localStorage: `localStorage.clear()`
- Verify backend is returning valid JWT
- Check that email is sent as `username` in login

### PDF Upload Issues
- File size should be reasonable
- Ensure PDFs are valid
- Check browser console for detailed errors

### Pathway Not Loading
- Verify user is authenticated
- Check that pathway ID is correct
- Ensure backend database is populated

## Performance Considerations

- React Router lazy loading can be added for pages
- Zustand stores are optimized for re-renders
- Axios caching can be configured
- Image optimization for production build

## Accessibility

- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support
- Color contrast compliance

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

1. Follow the existing code structure
2. Use descriptive variable names
3. Add comments for complex logic
4. Test all changes with backend
5. Keep components focused and reusable

## License

MIT License - See main README for details

