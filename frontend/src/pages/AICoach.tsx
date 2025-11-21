import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import { aiService } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const AICoach: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [showMealPlan, setShowMealPlan] = useState(false);
  const [mealPlan, setMealPlan] = useState<any[]>([]);
  const [showWorkoutPlan, setShowWorkoutPlan] = useState(false);
  const [workoutPlan, setWorkoutPlan] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const welcomeMessage: Message = {
      role: 'assistant',
      content: `Hi ${user?.first_name || user?.username}! I'm your AI fitness coach. I'm here to help you with workout advice, nutrition tips, motivation, and answer any fitness-related questions. How can I assist you today?`,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await aiService.chat(input, history);

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Failed to get AI response:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const loadRecommendations = async () => {
    try {
      const response = await aiService.getRecommendations();
      setRecommendations(response.recommendations);
      setShowRecommendations(true);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    }
  };

  const loadMealPlan = async () => {
    try {
      const response = await aiService.getMealPlan(7);
      setMealPlan(response.meal_plan);
      setShowMealPlan(true);
    } catch (error) {
      console.error('Failed to load meal plan:', error);
    }
  };

  const loadWorkoutPlan = async () => {
    try {
      const response = await aiService.getWorkoutPlan(7);
      setWorkoutPlan(response.workout_plan);
      setShowWorkoutPlan(true);
    } catch (error) {
      console.error('Failed to load workout plan:', error);
    }
  };

  const quickQuestions = [
    'What should I eat after a workout?',
    'How do I stay motivated?',
    'What exercises are good for beginners?',
    'How much water should I drink?',
  ];

  const handleQuickQuestion = (question: string) => {
    setInput(question);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">AI Fitness Coach</h1>
          <div className="flex space-x-2">
            <button onClick={loadRecommendations} className="btn-secondary text-sm">
              Get Recommendations
            </button>
            <button onClick={loadMealPlan} className="btn-secondary text-sm">
              Meal Plan
            </button>
            <button onClick={loadWorkoutPlan} className="btn-secondary text-sm">
              Workout Plan
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="card h-[600px] flex flex-col">
              <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-3 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 px-4 py-3 rounded-lg">
                      <p className="text-gray-600">Thinking...</p>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSend} className="flex space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything about fitness..."
                  className="input-field flex-1"
                  disabled={loading}
                />
                <button type="submit" className="btn-primary" disabled={loading || !input.trim()}>
                  Send
                </button>
              </form>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card">
              <h3 className="font-semibold mb-3">Quick Questions</h3>
              <div className="space-y-2">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(question)}
                    className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 className="font-semibold mb-3">Tips</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Ask me about workouts, nutrition, or motivation</li>
                <li>• Get personalized recommendations</li>
                <li>• Request meal or workout plans</li>
                <li>• I adapt my advice to your goals</li>
              </ul>
            </div>
          </div>
        </div>

        {showRecommendations && recommendations && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Personalized Recommendations</h2>
                <button onClick={() => setShowRecommendations(false)} className="text-gray-500 hover:text-gray-700">
                  ✕
                </button>
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Workouts</h3>
                  <ul className="space-y-1">
                    {recommendations.workouts?.map((item: string, index: number) => (
                      <li key={index} className="text-gray-700">• {item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Nutrition</h3>
                  <ul className="space-y-1">
                    {recommendations.nutrition?.map((item: string, index: number) => (
                      <li key={index} className="text-gray-700">• {item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Recovery</h3>
                  <ul className="space-y-1">
                    {recommendations.recovery?.map((item: string, index: number) => (
                      <li key={index} className="text-gray-700">• {item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Goal Tips</h3>
                  <ul className="space-y-1">
                    {recommendations.goal_tips?.map((item: string, index: number) => (
                      <li key={index} className="text-gray-700">• {item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {showMealPlan && mealPlan.length > 0 && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full p-6 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">7-Day Meal Plan</h2>
                <button onClick={() => setShowMealPlan(false)} className="text-gray-500 hover:text-gray-700">
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                {mealPlan.map((day) => (
                  <div key={day.day} className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-3">Day {day.day} - {day.date}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <span className="font-medium text-sm">🌅 Breakfast:</span>
                        <p className="text-gray-700">{day.meals.breakfast}</p>
                      </div>
                      <div>
                        <span className="font-medium text-sm">☀️ Lunch:</span>
                        <p className="text-gray-700">{day.meals.lunch}</p>
                      </div>
                      <div>
                        <span className="font-medium text-sm">🌙 Dinner:</span>
                        <p className="text-gray-700">{day.meals.dinner}</p>
                      </div>
                      <div>
                        <span className="font-medium text-sm">🍪 Snack:</span>
                        <p className="text-gray-700">{day.meals.snack}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {showWorkoutPlan && workoutPlan.length > 0 && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-3xl w-full p-6 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">7-Day Workout Plan</h2>
                <button onClick={() => setShowWorkoutPlan(false)} className="text-gray-500 hover:text-gray-700">
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                {workoutPlan.map((day) => (
                  <div key={day.day} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">Day {day.day} - {day.date}</h3>
                        <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium capitalize mt-1">
                          {day.type}
                        </span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        day.intensity === 'high' ? 'bg-red-100 text-red-700' :
                        day.intensity === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {day.intensity}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-2">{day.activity}</p>
                    <p className="text-sm text-gray-600"><span className="font-medium">Duration:</span> {day.duration}</p>
                    {day.notes && <p className="text-sm text-gray-600 mt-1"><span className="font-medium">Note:</span> {day.notes}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AICoach;



