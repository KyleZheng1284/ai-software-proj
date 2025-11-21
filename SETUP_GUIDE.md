# Setup Guide - AI Fitness & Wellness Platform

This guide will help you get the AI Fitness & Wellness Platform up and running on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.10+**: [Download Python](https://www.python.org/downloads/)
- **Node.js 16+**: [Download Node.js](https://nodejs.org/)
- **npm** (comes with Node.js)
- **OpenAI API Key** (optional but recommended for AI features): [Get API Key](https://platform.openai.com/api-keys)

## Quick Start

### Step 1: Clone the Repository

```bash
cd cpsc-ai
```

### Step 2: Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a Python virtual environment:
```bash
python -m venv venv
```

3. Activate the virtual environment:
```bash
# On macOS/Linux:
source venv/bin/activate

# On Windows:
venv\Scripts\activate
```

4. Install Python dependencies:
```bash
pip install -r requirements.txt
```

5. Create a `.env` file in the backend directory:
```bash
touch .env
```

6. Add the following to your `.env` file:
```env
SECRET_KEY=your-secret-key-here-change-this
JWT_SECRET_KEY=your-jwt-secret-key-change-this
DATABASE_URL=sqlite:///fitness.db
OPENAI_API_KEY=your-openai-api-key-here
FLASK_APP=run.py
FLASK_ENV=development
```

**Note:** Replace the secret keys with your own random strings. You can generate them using:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

7. Initialize the database:
```bash
python run.py init-db
```

8. Start the backend server:
```bash
python run.py
```

The backend will be running at `http://localhost:5000`

### Step 3: Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
```

2. Install Node.js dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory:
```bash
touch .env
```

4. Add the following to your `.env` file:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

5. Start the frontend development server:
```bash
npm start
```

The frontend will automatically open at `http://localhost:3000`

## Testing the Application

### Create an Account

1. Navigate to `http://localhost:3000`
2. Click "Register here" on the login page
3. Fill in your information:
   - **Required fields**: Email, Username, Password
   - **Optional fields**: Personal information, fitness level, primary goal
4. Click "Create Account"

### Explore Features

Once logged in, you can:

1. **Dashboard**: View your fitness overview with charts and statistics
2. **Activities**: Log and track your workouts
3. **Nutrition**: Record meals and monitor calorie intake
4. **Goals**: Create and track fitness goals
5. **AI Coach**: Chat with the AI fitness coach for personalized advice
6. **Community**: Share tips, participate in challenges
7. **Profile**: Update your personal information

## AI Features Setup

### OpenAI API (Recommended)

For the best AI experience:

1. Sign up for an OpenAI account at [platform.openai.com](https://platform.openai.com)
2. Generate an API key
3. Add it to your backend `.env` file as `OPENAI_API_KEY`
4. Restart the backend server

**Features with OpenAI API:**
- Intelligent chatbot responses
- Personalized fitness advice
- Context-aware recommendations

**Without OpenAI API:**
- The application will still work
- AI responses will use fallback logic
- Recommendations will be based on rule-based algorithms

## Troubleshooting

### Backend Issues

**Problem**: `ModuleNotFoundError` when running backend
- **Solution**: Make sure your virtual environment is activated and dependencies are installed:
  ```bash
  source venv/bin/activate  # or venv\Scripts\activate on Windows
  pip install -r requirements.txt
  ```

**Problem**: Database errors
- **Solution**: Delete the database file and reinitialize:
  ```bash
  rm fitness.db
  python run.py init-db
  ```

**Problem**: Port 5000 already in use
- **Solution**: Change the port in `backend/run.py` and update `REACT_APP_API_URL` in frontend `.env`

### Frontend Issues

**Problem**: `npm install` fails
- **Solution**: Try clearing npm cache:
  ```bash
  npm cache clean --force
  npm install
  ```

**Problem**: Port 3000 already in use
- **Solution**: You can specify a different port:
  ```bash
  PORT=3001 npm start
  ```

**Problem**: Cannot connect to backend
- **Solution**: Check that:
  - Backend server is running at `http://localhost:5000`
  - `.env` file in frontend has correct `REACT_APP_API_URL`
  - Restart frontend after changing `.env`

### Common Issues

**Problem**: Login/Register doesn't work
- **Solution**: Check browser console for errors. Verify backend is running and accessible

**Problem**: AI features not working
- **Solution**: Check if `OPENAI_API_KEY` is set correctly in backend `.env`. The app works without it but with limited AI features.

## Development Tips

### Backend Development

- The backend uses Flask with hot-reload enabled in development mode
- Database models are in `backend/app/models/`
- API routes are in `backend/app/routes/`
- AI logic is in `backend/app/services/ai_service.py`

To reset the database:
```bash
python run.py drop-db
python run.py init-db
```

### Frontend Development

- React components use TypeScript for type safety
- Tailwind CSS for styling
- Recharts for data visualization
- All API calls go through `src/services/api.ts`

Hot-reload is enabled, so changes will automatically refresh the browser.

## Project Structure

```
cpsc-ai/
├── backend/               # Flask backend
│   ├── app/
│   │   ├── models/       # Database models
│   │   ├── routes/       # API endpoints
│   │   ├── services/     # Business logic & AI
│   │   └── __init__.py
│   ├── config.py         # Configuration
│   ├── requirements.txt  # Python dependencies
│   └── run.py           # Application entry point
│
├── frontend/             # React frontend
│   ├── public/          # Static files
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── context/     # React context (auth)
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   ├── App.tsx      # Main app component
│   │   └── index.tsx    # Entry point
│   ├── package.json     # Node dependencies
│   └── tailwind.config.js
│
├── README.md            # Project overview
├── SETUP_GUIDE.md       # This file
└── .gitignore          # Git ignore rules
```

## Next Steps

After getting the application running:

1. **Explore the Features**: Try logging activities, meals, and setting goals
2. **Chat with AI Coach**: Ask questions about fitness and nutrition
3. **Customize**: Modify the code to add your own features
4. **Deploy**: Consider deploying to a cloud platform for your presentation

## Deployment (Optional)

### Backend Deployment Options
- **Heroku**: Easy Python app deployment
- **Railway**: Modern platform with free tier
- **PythonAnywhere**: Python-specific hosting

### Frontend Deployment Options
- **Vercel**: Optimized for React apps
- **Netlify**: Easy static site deployment
- **GitHub Pages**: Free hosting for static sites

### Database for Production
- Replace SQLite with PostgreSQL for production
- Update `DATABASE_URL` in backend `.env`

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the README.md for feature documentation
3. Check browser console and backend logs for errors

## Academic Use

This project is designed as a semester project demonstrating:
- Full-stack web development
- RESTful API design
- React with TypeScript
- AI/ML integration
- Database design
- User authentication
- Data visualization

Feel free to modify and extend it for your presentation!



