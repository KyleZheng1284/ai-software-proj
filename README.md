# AI-Assisted Fitness & Wellness Platform

A comprehensive fitness tracking web application with AI-powered insights, personalized recommendations, and community features.

## ✨ Key Features

### 📊 **Tracking & Analytics**
- **Activity Tracking**: Log workouts with calories burned, duration, distance, and intensity
- **Nutrition Tracking**: Track meals with USDA food database (400,000+ foods), macronutrients, and calorie goals
- **Goal Management**: Create and monitor fitness goals with visual progress tracking
- **Dashboard**: Real-time progress visualization with interactive charts and calorie balance calculator

### 🤖 **AI-Powered Insights**
- **AI Fitness Coach**: Chat with an intelligent virtual coach powered by NVIDIA API
- **Nutritional Analysis**: AI analyzes your daily intake and provides personalized food recommendations
- **Smart Recommendations**: Get customized meal plans and workout routines based on your profile
- **Motivational Messages**: Daily AI-generated encouragement and fitness tips

### 👥 **Community Features**
- **Posts & Tips**: Share fitness tips and experiences
- **Challenges**: Join community fitness challenges
- **Comments**: Engage with other users' posts
- **Progress Sharing**: Celebrate milestones together

### 🎨 **Modern UI/UX**
- Cartoonish, lively interface with smooth animations
- Responsive design that works on all devices
- Interactive floating emojis and gradient backgrounds
- Real-time updates and progress indicators

## 🚀 Quick Setup

### Prerequisites
- Python 3.10+
- Node.js 16+
- NVIDIA API Key (for AI features)
- USDA API Key (for food database)

### Installation

```bash
# 1. Backend Setup
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env file (see backend/.env.example for template)
cp .env.example .env
# Add your NVIDIA_API_KEY and USDA_API_KEY

python run.py init-db
python run.py

# 2. Frontend Setup (new terminal)
cd frontend
npm install
npm start
```

Visit **http://localhost:3000** 🎉

📖 **For detailed setup instructions, see [`SETUP_GUIDE.md`](SETUP_GUIDE.md)**

## 🛠️ Tech Stack

**Frontend**: React 18 + TypeScript + Tailwind CSS + Recharts  
**Backend**: Flask + SQLAlchemy + JWT + scikit-learn  
**AI**: NVIDIA API (LLaMA 3.1)  
**Database**: SQLite (dev) / PostgreSQL (prod)

## 📁 Project Structure

```
cpsc-ai/
├── backend/          # Flask API
│   ├── app/
│   │   ├── models/   # Database models
│   │   ├── routes/   # API endpoints
│   │   └── services/ # Business logic & AI
│   └── run.py
├── frontend/         # React app
│   └── src/
│       ├── components/
│       ├── pages/
│       └── services/
└── SETUP_GUIDE.md   # Detailed setup instructions
```

## 🎯 Features Breakdown

### Dashboard
- Calorie balance calculator (BMR, TDEE, target calories)
- Macronutrient breakdown pie chart
- Activity and nutrition statistics
- AI-generated motivational messages

### Activities Page
- Log activities with detailed metrics
- Color-coded intensity levels
- Floating animations and emoji indicators
- Activity history with stats

### Nutrition Page
- USDA food database search integration
- Daily nutrition summary cards
- **AI Nutritional Analysis** - Get personalized recommendations
- Macro tracking (protein, carbs, fats)

### Goals Page
- Visual progress bars with celebration animations
- Goal type categories with emojis
- Completion tracking and status filters
- Target date monitoring

### AI Coach
- Interactive chat interface with mood-based avatars
- Context-aware fitness advice
- Meal and workout plan generation
- Quick question buttons

### Community
- Create and share posts
- Like and comment functionality
- Participate in challenges
- User engagement tracking

## 🔐 Environment Variables

Create `.env` files based on the examples:
- `backend/.env.example` - Backend configuration
- `frontend/.env` - Frontend API URL

**Never commit `.env` files with real API keys!**

## 📝 License

MIT License - Academic Project



