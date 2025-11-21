import os
from datetime import datetime, timedelta
from typing import List, Dict, Any
import openai
from app.models import Activity, Nutrition, Goal


class AIService:
    def __init__(self):
        self.api_key = os.environ.get('OPENAI_API_KEY')
        if self.api_key:
            openai.api_key = self.api_key
    
    def chat_with_coach(self, user, user_message: str, conversation_history: List[Dict] = None) -> str:
        if not self.api_key:
            return self._fallback_chat_response(user, user_message)
        
        try:
            user_context = self._build_user_context(user)
            
            messages = [
                {
                    "role": "system",
                    "content": f"""You are an encouraging and knowledgeable AI fitness coach. Your role is to:
                    - Provide personalized fitness and nutrition advice
                    - Offer motivation and encouragement
                    - Answer questions about health, exercise, and wellness
                    - Be supportive and adapt your tone based on user progress
                    - Give practical, actionable advice
                    
                    User Context:
                    {user_context}
                    
                    Always be positive, specific, and helpful. Tailor your responses to the user's goals and fitness level."""
                }
            ]
            
            if conversation_history:
                messages.extend(conversation_history)
            
            messages.append({"role": "user", "content": user_message})
            
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=messages,
                max_tokens=300,
                temperature=0.7
            )
            
            return response.choices[0].message.content
        
        except Exception as e:
            print(f"OpenAI API error: {e}")
            return self._fallback_chat_response(user, user_message)
    
    def generate_recommendations(self, user) -> Dict[str, Any]:
        recent_activities = Activity.query.filter_by(user_id=user.id).order_by(Activity.date.desc()).limit(10).all()
        recent_nutrition = Nutrition.query.filter_by(user_id=user.id).order_by(Nutrition.date.desc()).limit(10).all()
        active_goals = Goal.query.filter_by(user_id=user.id, status='active').all()
        
        recommendations = {
            'workouts': self._recommend_workouts(user, recent_activities),
            'nutrition': self._recommend_nutrition(user, recent_nutrition),
            'recovery': self._recommend_recovery(user, recent_activities),
            'goal_tips': self._recommend_goal_tips(user, active_goals)
        }
        
        return recommendations
    
    def analyze_patterns(self, user) -> Dict[str, Any]:
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        
        activities = Activity.query.filter_by(user_id=user.id).filter(Activity.date >= thirty_days_ago).all()
        nutrition_logs = Nutrition.query.filter_by(user_id=user.id).filter(Nutrition.date >= thirty_days_ago).all()
        
        patterns = {
            'activity_trends': self._analyze_activity_trends(activities),
            'nutrition_trends': self._analyze_nutrition_trends(nutrition_logs),
            'consistency': self._analyze_consistency(activities),
            'insights': self._generate_insights(user, activities, nutrition_logs)
        }
        
        return patterns
    
    def generate_meal_plan(self, user, days: int = 7) -> List[Dict[str, Any]]:
        goal = user.primary_goal or 'general fitness'
        fitness_level = user.fitness_level or 'intermediate'
        
        meal_plan = []
        
        meal_templates = {
            'weight_loss': {
                'breakfast': ['Greek yogurt with berries and almonds', 'Oatmeal with banana and peanut butter', 'Egg white omelet with vegetables'],
                'lunch': ['Grilled chicken salad', 'Quinoa bowl with vegetables', 'Tuna wrap with mixed greens'],
                'dinner': ['Baked salmon with broccoli', 'Lean turkey with sweet potato', 'Grilled chicken with roasted vegetables'],
                'snack': ['Apple with almond butter', 'Protein shake', 'Carrot sticks with hummus']
            },
            'muscle_gain': {
                'breakfast': ['Protein pancakes with eggs', 'Oatmeal with protein powder and banana', 'Scrambled eggs with avocado toast'],
                'lunch': ['Chicken breast with brown rice', 'Beef stir-fry with quinoa', 'Salmon with sweet potato'],
                'dinner': ['Steak with vegetables and rice', 'Chicken pasta with marinara', 'Turkey meatballs with whole grain pasta'],
                'snack': ['Protein shake with banana', 'Greek yogurt with granola', 'Nuts and dried fruit']
            },
            'general': {
                'breakfast': ['Smoothie bowl with fruits', 'Whole grain toast with avocado', 'Oatmeal with mixed berries'],
                'lunch': ['Mixed salad with grilled protein', 'Whole grain wrap with vegetables', 'Buddha bowl'],
                'dinner': ['Grilled fish with quinoa', 'Chicken stir-fry with rice', 'Vegetable curry with brown rice'],
                'snack': ['Fresh fruit', 'Nuts and seeds', 'Veggie sticks with dip']
            }
        }
        
        goal_key = 'weight_loss' if 'weight loss' in goal.lower() or 'lose' in goal.lower() else \
                   'muscle_gain' if 'muscle' in goal.lower() or 'gain' in goal.lower() else 'general'
        
        templates = meal_templates[goal_key]
        
        for day in range(days):
            day_plan = {
                'day': day + 1,
                'date': (datetime.utcnow() + timedelta(days=day)).strftime('%Y-%m-%d'),
                'meals': {
                    'breakfast': templates['breakfast'][day % len(templates['breakfast'])],
                    'lunch': templates['lunch'][day % len(templates['lunch'])],
                    'dinner': templates['dinner'][day % len(templates['dinner'])],
                    'snack': templates['snack'][day % len(templates['snack'])]
                }
            }
            meal_plan.append(day_plan)
        
        return meal_plan
    
    def generate_workout_plan(self, user, days: int = 7) -> List[Dict[str, Any]]:
        fitness_level = user.fitness_level or 'intermediate'
        goal = user.primary_goal or 'general fitness'
        
        workout_templates = {
            'beginner': [
                {'type': 'cardio', 'activity': '20 min brisk walk', 'intensity': 'low'},
                {'type': 'strength', 'activity': 'Bodyweight exercises (squats, push-ups, planks)', 'intensity': 'low'},
                {'type': 'rest', 'activity': 'Light stretching or yoga', 'intensity': 'low'},
                {'type': 'cardio', 'activity': '25 min cycling or swimming', 'intensity': 'low'},
                {'type': 'strength', 'activity': 'Full body workout with light weights', 'intensity': 'moderate'},
                {'type': 'cardio', 'activity': '30 min walk or jog', 'intensity': 'moderate'},
                {'type': 'rest', 'activity': 'Complete rest or gentle yoga', 'intensity': 'low'}
            ],
            'intermediate': [
                {'type': 'strength', 'activity': 'Upper body workout (chest, back, arms)', 'intensity': 'moderate'},
                {'type': 'cardio', 'activity': '30 min running or HIIT', 'intensity': 'moderate'},
                {'type': 'strength', 'activity': 'Lower body workout (legs, glutes)', 'intensity': 'moderate'},
                {'type': 'cardio', 'activity': '45 min cycling or swimming', 'intensity': 'moderate'},
                {'type': 'strength', 'activity': 'Full body circuit training', 'intensity': 'high'},
                {'type': 'cardio', 'activity': '40 min running intervals', 'intensity': 'high'},
                {'type': 'active_recovery', 'activity': 'Yoga or light swimming', 'intensity': 'low'}
            ],
            'advanced': [
                {'type': 'strength', 'activity': 'Heavy upper body (bench, rows, overhead press)', 'intensity': 'high'},
                {'type': 'hiit', 'activity': '45 min HIIT session', 'intensity': 'high'},
                {'type': 'strength', 'activity': 'Heavy lower body (squats, deadlifts, lunges)', 'intensity': 'high'},
                {'type': 'cardio', 'activity': '60 min endurance run or bike', 'intensity': 'moderate'},
                {'type': 'strength', 'activity': 'Olympic lifts and core', 'intensity': 'high'},
                {'type': 'hiit', 'activity': 'Sprint intervals or CrossFit style workout', 'intensity': 'high'},
                {'type': 'active_recovery', 'activity': 'Yoga, foam rolling, and mobility', 'intensity': 'low'}
            ]
        }
        
        level_key = fitness_level.lower() if fitness_level.lower() in workout_templates else 'intermediate'
        templates = workout_templates[level_key]
        
        workout_plan = []
        for day in range(days):
            template = templates[day % len(templates)]
            day_plan = {
                'day': day + 1,
                'date': (datetime.utcnow() + timedelta(days=day)).strftime('%Y-%m-%d'),
                'type': template['type'],
                'activity': template['activity'],
                'intensity': template['intensity'],
                'duration': '30-60 min',
                'notes': f'Adjust intensity based on how you feel. Stay hydrated!'
            }
            workout_plan.append(day_plan)
        
        return workout_plan
    
    def generate_motivational_message(self, user) -> str:
        recent_activities = Activity.query.filter_by(user_id=user.id).order_by(Activity.date.desc()).limit(5).all()
        active_goals = Goal.query.filter_by(user_id=user.id, status='active').all()
        
        if len(recent_activities) >= 3:
            messages = [
                f"Great consistency, {user.first_name or user.username}! You're building amazing habits!",
                f"Keep up the fantastic work! Your dedication is paying off!",
                f"You're on fire! {len(recent_activities)} workouts completed recently!",
                f"Amazing progress, {user.first_name or user.username}! Keep pushing forward!",
            ]
        else:
            messages = [
                f"Every journey begins with a single step. You've got this, {user.first_name or user.username}!",
                f"Today is a great day to work towards your goals!",
                f"Small steps lead to big changes. Let's get moving!",
                f"You're stronger than you think. Time to prove it!",
            ]
        
        import random
        return random.choice(messages)
    
    def _build_user_context(self, user) -> str:
        context = f"""
        Name: {user.first_name or user.username}
        Fitness Level: {user.fitness_level or 'Not specified'}
        Primary Goal: {user.primary_goal or 'Not specified'}
        Age: {user.age or 'Not specified'}
        """
        return context
    
    def _fallback_chat_response(self, user, user_message: str) -> str:
        responses = {
            'motivation': f"You're doing great, {user.first_name or user.username}! Keep pushing towards your goals. Every workout counts!",
            'workout': "For a balanced workout, focus on compound movements like squats, deadlifts, and bench press. Don't forget cardio!",
            'nutrition': "Remember to eat a balanced diet with plenty of protein, healthy fats, and complex carbohydrates. Stay hydrated!",
            'default': f"Thanks for reaching out! I'm here to help you with your fitness journey. What specific area would you like guidance on?"
        }
        
        message_lower = user_message.lower()
        if any(word in message_lower for word in ['motivate', 'encourage', 'give up']):
            return responses['motivation']
        elif any(word in message_lower for word in ['workout', 'exercise', 'train']):
            return responses['workout']
        elif any(word in message_lower for word in ['eat', 'food', 'diet', 'nutrition']):
            return responses['nutrition']
        else:
            return responses['default']
    
    def _recommend_workouts(self, user, recent_activities) -> List[str]:
        recommendations = []
        
        if len(recent_activities) < 3:
            recommendations.append("Start with 3 workouts per week to build consistency")
        
        activity_types = [a.activity_type for a in recent_activities]
        if 'strength' not in activity_types:
            recommendations.append("Add strength training to build muscle and boost metabolism")
        if 'cardio' not in activity_types:
            recommendations.append("Include cardio exercises for heart health and endurance")
        
        if not recommendations:
            recommendations.append("Great variety in your workouts! Keep challenging yourself")
        
        return recommendations
    
    def _recommend_nutrition(self, user, recent_nutrition) -> List[str]:
        recommendations = []
        
        if len(recent_nutrition) < 5:
            recommendations.append("Track your meals consistently to better understand your nutrition patterns")
        else:
            total_protein = sum(n.protein or 0 for n in recent_nutrition)
            avg_protein = total_protein / len(recent_nutrition)
            
            if avg_protein < 20:
                recommendations.append("Consider increasing protein intake for muscle recovery and satiety")
        
        if not recommendations:
            recommendations.append("Your nutrition tracking looks good! Keep maintaining balanced meals")
        
        return recommendations
    
    def _recommend_recovery(self, user, recent_activities) -> List[str]:
        recommendations = []
        
        high_intensity_count = sum(1 for a in recent_activities if a.intensity == 'high')
        
        if high_intensity_count > 3:
            recommendations.append("Make sure to include rest days for proper recovery")
        else:
            recommendations.append("Balance high-intensity workouts with active recovery days")
        
        recommendations.append("Get 7-9 hours of sleep for optimal recovery")
        
        return recommendations
    
    def _recommend_goal_tips(self, user, active_goals) -> List[str]:
        tips = []
        
        for goal in active_goals:
            progress = (goal.current_value / goal.target_value * 100) if goal.target_value > 0 else 0
            
            if progress < 25:
                tips.append(f"Focus on small daily actions for '{goal.title}' to build momentum")
            elif progress < 75:
                tips.append(f"You're halfway to '{goal.title}'! Keep up the great work")
            else:
                tips.append(f"Almost there with '{goal.title}'! Give it your final push")
        
        if not tips:
            tips.append("Set specific, measurable goals to track your progress effectively")
        
        return tips
    
    def _analyze_activity_trends(self, activities) -> Dict[str, Any]:
        if not activities:
            return {'message': 'Not enough data to analyze trends'}
        
        total_workouts = len(activities)
        total_duration = sum(a.duration_minutes or 0 for a in activities)
        avg_duration = total_duration / total_workouts if total_workouts > 0 else 0
        
        activity_types = {}
        for activity in activities:
            activity_types[activity.activity_type] = activity_types.get(activity.activity_type, 0) + 1
        
        most_common = max(activity_types.items(), key=lambda x: x[1])[0] if activity_types else 'none'
        
        return {
            'total_workouts': total_workouts,
            'average_duration': round(avg_duration, 1),
            'most_common_type': most_common,
            'workout_distribution': activity_types
        }
    
    def _analyze_nutrition_trends(self, nutrition_logs) -> Dict[str, Any]:
        if not nutrition_logs:
            return {'message': 'Not enough data to analyze trends'}
        
        total_calories = sum(n.calories for n in nutrition_logs)
        avg_calories = total_calories / len(nutrition_logs) if nutrition_logs else 0
        
        total_protein = sum(n.protein or 0 for n in nutrition_logs)
        avg_protein = total_protein / len(nutrition_logs) if nutrition_logs else 0
        
        return {
            'average_daily_calories': round(avg_calories, 1),
            'average_daily_protein': round(avg_protein, 1),
            'total_meals_logged': len(nutrition_logs)
        }
    
    def _analyze_consistency(self, activities) -> Dict[str, Any]:
        if not activities:
            return {'score': 0, 'message': 'Start logging activities to track consistency'}
        
        dates = [a.date.date() for a in activities]
        unique_dates = len(set(dates))
        
        thirty_days_ago = datetime.utcnow().date() - timedelta(days=30)
        days_in_period = min(30, (datetime.utcnow().date() - thirty_days_ago).days)
        
        consistency_score = (unique_dates / days_in_period * 100) if days_in_period > 0 else 0
        
        if consistency_score >= 70:
            message = 'Excellent consistency! You're building great habits'
        elif consistency_score >= 40:
            message = 'Good consistency. Try to increase frequency for better results'
        else:
            message = 'Focus on building a more consistent routine'
        
        return {
            'score': round(consistency_score, 1),
            'active_days': unique_dates,
            'total_days': days_in_period,
            'message': message
        }
    
    def _generate_insights(self, user, activities, nutrition_logs) -> List[str]:
        insights = []
        
        if len(activities) > 0:
            insights.append(f"You've completed {len(activities)} workouts in the past 30 days")
        
        if len(nutrition_logs) > 0:
            insights.append(f"You've logged {len(nutrition_logs)} meals, showing commitment to tracking")
        
        if len(activities) >= 12:
            insights.append("Your workout frequency is excellent! Aim to maintain this momentum")
        elif len(activities) >= 8:
            insights.append("You're working out consistently. Try to add one more session per week")
        elif len(activities) > 0:
            insights.append("Build towards 3-4 workouts per week for optimal results")
        
        if not insights:
            insights.append("Start tracking your activities and nutrition to get personalized insights")
        
        return insights



