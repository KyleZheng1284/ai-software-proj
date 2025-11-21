# AI-Assisted Fitness & Wellness Platform

A smart fitness website that uses AI to help users track physical activity, nutrition, and health goals with personalized recommendations and insights.

## Features

### Core Functionality
- **Activity Tracking**: Log workouts, exercises, and daily physical activities
- **Nutrition Tracking**: Monitor calorie intake, meals, and nutritional information
- **Health Goals**: Set and track personalized fitness and wellness goals
- **Progress Visualization**: Interactive graphs and charts showing your progress over time

### AI-Powered Features
- **Pattern Analysis**: AI analyzes your data to identify trends and patterns
- **Personalized Recommendations**: Get customized meal plans, workout routines, and recovery strategies
- **Smart Chatbot**: Virtual fitness coach that answers questions and provides encouragement
- **Adaptive Feedback**: AI adjusts recommendations based on your progress and preferences

### Community Features
- **User Sharing**: Share tips and experiences with other users
- **Group Challenges**: Participate in community fitness challenges
- **Milestone Celebrations**: Celebrate achievements together

## Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- Recharts for data visualization
- Axios for API communication
- React Router for navigation

### Backend
- Python 3.10+
- Flask with Flask-RESTful
- SQLAlchemy ORM
- JWT authentication
- OpenAI API for chatbot
- scikit-learn for ML pattern analysis

### Database
- SQLite (development)
- PostgreSQL (production ready)

## Setup Instructions

### Local Development Setup

**Quick Start**: See `SETUP_GUIDE.md` for detailed local setup instructions.

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python run.py init-db
python run.py

# Frontend (new terminal)
cd frontend
npm install
npm start
```

Visit `http://localhost:3000`

### Deploy to Production (Make it Live!)

**Want others to test your app via a real URL?**

See deployment guides:
- 📘 **`QUICK_DEPLOY.md`** - Get live in 15 minutes (recommended)
- 📗 **`DEPLOYMENT_GUIDE.md`** - Comprehensive deployment guide

**Recommended Platforms (All FREE)**:
- **Backend**: Render.com or Railway.app
- **Frontend**: Netlify.com or Vercel.com
- **Total Cost**: $0 for semester projects

Your app will be accessible at URLs like:
- Frontend: `https://your-fitness-app.netlify.app`
- Backend: `https://your-api.onrender.com`

## Project Documentation

- **`README.md`** (this file) - Project overview
- **`SETUP_GUIDE.md`** - Local development setup
- **`QUICK_DEPLOY.md`** - Fast deployment guide
- **`DEPLOYMENT_GUIDE.md`** - Detailed deployment instructions
- **`PROJECT_OVERVIEW.md`** - Technical documentation
- **`DEVELOPMENT.md`** - Development guidelines

## License

MIT License - Academic Project



