# Development Guide

This guide provides useful information for developing and extending the AI Fitness Platform.

## Quick Commands Reference

### Backend Commands

```bash
# Activate virtual environment
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate      # Windows

# Install dependencies
pip install -r requirements.txt

# Run development server
python run.py

# Initialize database
python run.py init-db

# Drop database
python run.py drop-db

# Install a new package
pip install package-name
pip freeze > requirements.txt  # Update requirements.txt
```

### Frontend Commands

```bash
# Install dependencies
npm install

# Run development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Install a new package
npm install package-name
```

## Project File Structure Explained

```
backend/
├── app/
│   ├── __init__.py          # Flask app initialization, blueprints
│   ├── models/              # Database models (ORM)
│   │   ├── __init__.py
│   │   ├── user.py          # User model with authentication
│   │   ├── activity.py      # Activity tracking model
│   │   ├── nutrition.py     # Nutrition logging model
│   │   ├── goal.py          # Goals model
│   │   └── community.py     # Posts and challenges models
│   ├── routes/              # API endpoints (controllers)
│   │   ├── __init__.py
│   │   ├── auth.py          # Authentication endpoints
│   │   ├── activities.py    # Activity CRUD endpoints
│   │   ├── nutrition.py     # Nutrition CRUD endpoints
│   │   ├── goals.py         # Goals CRUD endpoints
│   │   ├── ai.py            # AI features endpoints
│   │   └── community.py     # Community endpoints
│   └── services/            # Business logic layer
│       ├── __init__.py
│       └── ai_service.py    # AI/ML logic
├── config.py                # Configuration settings
├── requirements.txt         # Python dependencies
└── run.py                  # Application entry point

frontend/
├── public/
│   └── index.html          # HTML template
├── src/
│   ├── components/         # Reusable React components
│   │   ├── Layout.tsx      # Main layout with navigation
│   │   └── PrivateRoute.tsx # Protected route wrapper
│   ├── context/           # React Context providers
│   │   └── AuthContext.tsx # Authentication state management
│   ├── pages/             # Page components
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Activities.tsx
│   │   ├── Nutrition.tsx
│   │   ├── Goals.tsx
│   │   ├── AICoach.tsx
│   │   ├── Community.tsx
│   │   └── Profile.tsx
│   ├── services/          # API communication
│   │   └── api.ts         # Axios setup and service functions
│   ├── App.tsx            # Main app component with routing
│   ├── index.tsx          # React entry point
│   └── index.css          # Global styles (Tailwind)
├── package.json           # Node dependencies
├── tsconfig.json          # TypeScript configuration
├── tailwind.config.js     # Tailwind CSS configuration
└── postcss.config.js      # PostCSS configuration
```

## Adding New Features

### Backend: Adding a New API Endpoint

1. **Create/Update Model** (if needed):
```python
# backend/app/models/new_model.py
from app import db
from datetime import datetime

class NewModel(db.Model):
    __tablename__ = 'new_models'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    name = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'created_at': self.created_at.isoformat()
        }
```

2. **Create Route**:
```python
# backend/app/routes/new_route.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import NewModel

bp = Blueprint('new_route', __name__, url_prefix='/api/new')

@bp.route('', methods=['GET'])
@jwt_required()
def get_items():
    user_id = get_jwt_identity()
    items = NewModel.query.filter_by(user_id=user_id).all()
    return jsonify({
        'items': [item.to_dict() for item in items]
    }), 200

@bp.route('', methods=['POST'])
@jwt_required()
def create_item():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    item = NewModel(
        user_id=user_id,
        name=data['name']
    )
    
    db.session.add(item)
    db.session.commit()
    
    return jsonify({
        'message': 'Item created',
        'item': item.to_dict()
    }), 201
```

3. **Register Blueprint**:
```python
# backend/app/__init__.py
from app.routes import new_route

app.register_blueprint(new_route.bp)
```

4. **Update Database**:
```bash
python run.py drop-db  # WARNING: Deletes all data
python run.py init-db
```

### Frontend: Adding a New Page

1. **Create Page Component**:
```typescript
// frontend/src/pages/NewPage.tsx
import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { newService } from '../services/api';

const NewPage: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const response = await newService.getItems();
      setItems(response.items);
    } catch (error) {
      console.error('Failed to load items:', error);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">New Page</h1>
        {/* Your content here */}
      </div>
    </Layout>
  );
};

export default NewPage;
```

2. **Add Service**:
```typescript
// frontend/src/services/api.ts
export const newService = {
  getItems: async () => {
    const response = await api.get('/new');
    return response.data;
  },
  
  createItem: async (data: any) => {
    const response = await api.post('/new', data);
    return response.data;
  },
};
```

3. **Add Route**:
```typescript
// frontend/src/App.tsx
import NewPage from './pages/NewPage';

// Inside <Routes>:
<Route path="/new-page" element={<PrivateRoute><NewPage /></PrivateRoute>} />
```

4. **Add Navigation** (optional):
```typescript
// frontend/src/components/Layout.tsx
const navItems = [
  // ... existing items
  { path: '/new-page', label: 'New Page', icon: '🆕' },
];
```

## Common Development Tasks

### Adding a New Python Package

```bash
# Activate virtual environment
source venv/bin/activate

# Install package
pip install package-name

# Update requirements
pip freeze > requirements.txt

# Commit requirements.txt
```

### Adding a New NPM Package

```bash
# Install package
npm install package-name

# For TypeScript types
npm install --save-dev @types/package-name

# package.json is automatically updated
```

### Modifying Database Schema

1. Make changes to model files
2. Drop existing database: `python run.py drop-db`
3. Recreate database: `python run.py init-db`
4. **Note**: This deletes all data. In production, use migrations.

### Testing API Endpoints

Use curl or Postman:

```bash
# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","username":"testuser","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'

# Use token in subsequent requests
curl -X GET http://localhost:5000/api/activities \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Debugging Tips

### Backend Debugging

1. **Enable Debug Mode**: Already enabled in `run.py`
2. **Check Logs**: Terminal where backend is running
3. **Add Print Statements**:
```python
print(f"Debug: {variable}")  # Simple debugging
import pdb; pdb.set_trace()  # Interactive debugger
```

4. **Check Database**:
```bash
# Install SQLite browser
# Open fitness.db in the browser to inspect tables
```

### Frontend Debugging

1. **Browser Console**: F12 → Console tab
2. **React DevTools**: Install browser extension
3. **Network Tab**: Check API requests/responses
4. **Console Logs**:
```typescript
console.log('Debug:', variable);
```

### Common Errors

**Backend**: "No module named 'flask'"
- Solution: Activate virtual environment

**Backend**: "Table doesn't exist"
- Solution: Run `python run.py init-db`

**Frontend**: "Cannot connect to API"
- Solution: Check backend is running and `.env` has correct URL

**Frontend**: Component not re-rendering
- Solution: Check state updates, use proper React hooks

## Code Style Guidelines

### Python (Backend)
- Use snake_case for variables and functions
- Use PascalCase for classes
- Follow PEP 8
- Add docstrings for complex functions

```python
def calculate_calories(activities: List[Activity]) -> int:
    """Calculate total calories from list of activities.
    
    Args:
        activities: List of Activity objects
        
    Returns:
        Total calories burned
    """
    return sum(a.calories_burned for a in activities if a.calories_burned)
```

### TypeScript (Frontend)
- Use camelCase for variables and functions
- Use PascalCase for components and types
- Define interfaces for complex objects
- Use proper TypeScript types

```typescript
interface Activity {
  id: number;
  title: string;
  calories_burned?: number;
}

const calculateTotalCalories = (activities: Activity[]): number => {
  return activities.reduce((sum, a) => sum + (a.calories_burned || 0), 0);
};
```

## Performance Optimization

### Backend
- Use database indexes for frequent queries
- Limit query results with `.limit()`
- Use pagination for large datasets
- Cache expensive AI operations

### Frontend
- Use React.memo for expensive components
- Implement virtual scrolling for long lists
- Lazy load routes with React.lazy()
- Optimize images and assets

## Security Considerations

1. **Never commit** `.env` files with secrets
2. **Always validate** user input on backend
3. **Use HTTPS** in production
4. **Sanitize** database queries (SQLAlchemy does this)
5. **Rate limit** API endpoints in production
6. **Hash passwords** (already implemented with bcrypt)

## Deployment Checklist

### Backend
- [ ] Set strong SECRET_KEY
- [ ] Use production database (PostgreSQL)
- [ ] Set FLASK_ENV=production
- [ ] Configure CORS for frontend domain
- [ ] Set up error logging
- [ ] Use environment variables for secrets

### Frontend
- [ ] Build production bundle: `npm run build`
- [ ] Update API URL to production backend
- [ ] Test all features
- [ ] Optimize assets
- [ ] Configure deployment platform

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "Add: new feature description"

# Push to remote
git push origin feature/new-feature

# Merge to main
git checkout main
git merge feature/new-feature
```

## Useful Resources

### Documentation
- [Flask Documentation](https://flask.palletsprojects.com/)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [SQLAlchemy](https://docs.sqlalchemy.org/)

### Tools
- [Postman](https://www.postman.com/) - API testing
- [DB Browser for SQLite](https://sqlitebrowser.org/) - Database inspection
- [VS Code](https://code.visualstudio.com/) - Recommended IDE

### Learning
- [Real Python](https://realpython.com/) - Python tutorials
- [React Tutorial](https://react.dev/learn) - Official React guide
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

## Getting Help

1. Check error messages carefully
2. Search for errors online (Stack Overflow)
3. Review documentation
4. Check browser console and terminal logs
5. Try simple debugging steps first



