import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { nutritionService, aiService, dashboardService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Nutrition: React.FC = () => {
  const { user } = useAuth();
  const [nutritionLogs, setNutritionLogs] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    meal_type: 'lunch',
    food_name: '',
    description: '',
    calories: '',
    protein: '',
    carbohydrates: '',
    fats: '',
    fiber: '',
    serving_size: '',
    quantity: '1',
    date: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(true);
  const [foodSearch, setFoodSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [analyzingNutrition, setAnalyzingNutrition] = useState(false);
  const [calorieBalance, setCalorieBalance] = useState<any>(null);

  const mealTypeColors: Record<string, string> = {
    breakfast: 'from-yellow-400 to-orange-500',
    lunch: 'from-green-400 to-teal-500',
    dinner: 'from-blue-400 to-purple-500',
    snack: 'from-pink-400 to-red-500',
  };

  const mealTypeEmojis: Record<string, string> = {
    breakfast: '🌅',
    lunch: '☀️',
    dinner: '🌙',
    snack: '🍪',
  };

  useEffect(() => {
    loadNutrition();
    loadCalorieBalance();
  }, []);

  const loadNutrition = async () => {
    try {
      const response = await nutritionService.getNutritionLogs(7);
      setNutritionLogs(response.nutrition_logs);
    } catch (error) {
      console.error('Failed to load nutrition logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCalorieBalance = async () => {
    try {
      const response = await dashboardService.getCalorieBalance();
      setCalorieBalance(response);
    } catch (error) {
      console.error('Failed to load calorie balance:', error);
    }
  };

  const getTodaysLogs = () => {
    const today = new Date().toISOString().split('T')[0];
    return nutritionLogs.filter(log => log.date.startsWith(today));
  };

  const calculateTodaysTotals = () => {
    const todaysLogs = getTodaysLogs();
    return todaysLogs.reduce((totals, log) => ({
      calories: totals.calories + (parseFloat(log.calories) || 0),
      protein: totals.protein + (parseFloat(log.protein) || 0),
      carbs: totals.carbs + (parseFloat(log.carbohydrates) || 0),
      fats: totals.fats + (parseFloat(log.fats) || 0),
    }), { calories: 0, protein: 0, carbs: 0, fats: 0 });
  };

  const analyzeNutrition = async () => {
    setAnalyzingNutrition(true);
    try {
      const todaysLogs = getTodaysLogs();
      const totals = calculateTodaysTotals();
      
      if (todaysLogs.length === 0) {
        setAiAnalysis("🍽️ You haven't logged any meals today! Start tracking your nutrition to get personalized insights.");
        return;
      }

      const foodList = todaysLogs.map(log => 
        `${log.meal_type}: ${log.food_name} (${log.calories} cal, P:${log.protein}g, C:${log.carbohydrates}g, F:${log.fats}g)`
      ).join(', ');

      const targetCalories = user?.daily_calorie_goal || calorieBalance?.calorie_profile?.target_calories || 2000;
      const caloriesRemaining = targetCalories - totals.calories;

      const prompt = `You are a nutritionist AI. Analyze this user's nutrition for today and provide helpful insights.

User Profile:
- Daily calorie target: ${targetCalories} cal
- Weight goal: ${user?.target_weight_lbs ? `${user.target_weight_lbs} lbs` : 'Not set'}

Today's Food Intake:
${foodList}

Today's Totals:
- Calories: ${totals.calories} / ${targetCalories} (${caloriesRemaining} remaining)
- Protein: ${totals.protein}g
- Carbs: ${totals.carbs}g
- Fats: ${totals.fats}g

Provide a brief analysis (3-4 sentences):
1. Are they meeting their calorie goals?
2. Is protein intake adequate? (aim for 0.8-1g per lb of body weight)
3. Are macros balanced?
4. Suggest 2-3 specific foods for remaining meals to reach their goals.

Keep it encouraging and practical!`;

      const response = await aiService.chat(prompt, []);
      setAiAnalysis(response.response);
    } catch (error) {
      console.error('Failed to analyze nutrition:', error);
      setAiAnalysis("❌ Failed to analyze nutrition. Please try again.");
    } finally {
      setAnalyzingNutrition(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await nutritionService.createNutritionLog(formData);
      setShowModal(false);
      setFormData({
        meal_type: 'lunch',
        food_name: '',
        description: '',
        calories: '',
        protein: '',
        carbohydrates: '',
        fats: '',
        fiber: '',
        serving_size: '',
        quantity: '1',
        date: new Date().toISOString().split('T')[0],
      });
      loadNutrition();
      loadCalorieBalance();
      setAiAnalysis(''); // Clear AI analysis so it can be regenerated
    } catch (error) {
      console.error('Failed to create nutrition log:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this nutrition log?')) {
      try {
        await nutritionService.deleteNutritionLog(id);
        loadNutrition();
      } catch (error) {
        console.error('Failed to delete nutrition log:', error);
      }
    }
  };

  const handleFoodSearch = async (query: string) => {
    setFoodSearch(query);
    
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    setSearching(true);
    try {
      const response = await nutritionService.searchFoods(query);
      setSearchResults(response);
    } catch (error) {
      console.error('Failed to search foods:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const selectFood = (food: any) => {
    setFormData({
      ...formData,
      food_name: food.name,
      calories: food.calories.toString(),
      protein: food.protein.toString(),
      carbohydrates: food.carbs.toString(),
      fats: food.fats.toString(),
      fiber: food.fiber.toString(),
      serving_size: food.serving,
    });
    setFoodSearch('');
    setSearchResults([]);
  };

  const todaysTotals = calculateTodaysTotals();

  return (
    <Layout>
      <div className="relative min-h-[calc(100vh-80px)] overflow-hidden rounded-xl bg-gradient-to-br from-green-50 via-teal-50 to-blue-50 p-6">
        {/* Floating Food Emojis */}
        <div className="absolute top-1/4 left-1/4 text-5xl animate-float-1">🍎</div>
        <div className="absolute top-1/2 right-1/4 text-6xl animate-float-2">🥗</div>
        <div className="absolute bottom-1/4 left-1/3 text-4xl animate-float-3">🍳</div>
        <div className="absolute top-1/3 right-1/3 text-7xl animate-float-4">🥑</div>
        <div className="absolute bottom-1/3 right-1/4 text-5xl animate-float-1">🍊</div>

        <div className="relative z-10 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Nutrition Tracker</h1>
              <p className="text-gray-600">Fuel your body, track your nutrition!</p>
            </div>
            <button 
              onClick={() => setShowModal(true)} 
              className="btn-primary flex items-center space-x-2 px-6 py-3 text-lg font-semibold bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <span className="text-2xl">+</span>
              <span>Log Meal</span>
            </button>
          </div>

          {/* Today's Summary Card */}
          {getTodaysLogs().length > 0 && (
            <div className="card bg-white/90 backdrop-blur-sm shadow-xl p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <span className="mr-2 text-3xl">📊</span>
                Today's Nutrition Summary
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-red-100 to-orange-100 p-4 rounded-xl text-center">
                  <div className="text-3xl mb-1">🔥</div>
                  <div className="text-2xl font-bold text-red-600">{todaysTotals.calories}</div>
                  <div className="text-sm text-gray-600">Calories</div>
                </div>
                <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-4 rounded-xl text-center">
                  <div className="text-3xl mb-1">💪</div>
                  <div className="text-2xl font-bold text-blue-600">{todaysTotals.protein.toFixed(1)}g</div>
                  <div className="text-sm text-gray-600">Protein</div>
                </div>
                <div className="bg-gradient-to-br from-yellow-100 to-amber-100 p-4 rounded-xl text-center">
                  <div className="text-3xl mb-1">🍞</div>
                  <div className="text-2xl font-bold text-amber-600">{todaysTotals.carbs.toFixed(1)}g</div>
                  <div className="text-sm text-gray-600">Carbs</div>
                </div>
                <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-4 rounded-xl text-center">
                  <div className="text-3xl mb-1">🥑</div>
                  <div className="text-2xl font-bold text-purple-600">{todaysTotals.fats.toFixed(1)}g</div>
                  <div className="text-sm text-gray-600">Fats</div>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8 text-lg font-medium">
              <span className="inline-block animate-bounce text-4xl mb-2">🍽️</span>
              <p>Loading your nutrition logs...</p>
            </div>
          ) : nutritionLogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {nutritionLogs.map((log) => (
                <div 
                  key={log.id} 
                  className="card bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-4xl">{mealTypeEmojis[log.meal_type] || '🍽️'}</span>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${mealTypeColors[log.meal_type] || 'from-gray-400 to-gray-500'} text-white shadow-md`}>
                        {log.meal_type}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDelete(log.id)}
                      className="text-red-500 hover:text-red-700 text-xl font-bold hover:scale-125 transition-transform"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2 text-gray-900">{log.food_name}</h3>
                  {log.description && (
                    <p className="text-gray-600 text-sm mb-3 italic">{log.description}</p>
                  )}
                  
                  <div className="space-y-2 bg-gradient-to-br from-gray-50 to-gray-100 p-3 rounded-lg">
                    <div className="flex justify-between items-center bg-gradient-to-r from-orange-100 to-red-100 p-2 rounded-lg">
                      <span className="text-gray-700 flex items-center font-semibold">
                        <span className="mr-1">🔥</span> Calories:
                      </span>
                      <span className="font-extrabold text-red-600 text-lg">{log.calories} kcal</span>
                    </div>
                    {log.protein && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 flex items-center">
                          <span className="mr-1">💪</span> Protein:
                        </span>
                        <span className="font-bold text-blue-600">{log.protein}g</span>
                      </div>
                    )}
                    {log.carbohydrates && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 flex items-center">
                          <span className="mr-1">🍞</span> Carbs:
                        </span>
                        <span className="font-bold text-amber-600">{log.carbohydrates}g</span>
                      </div>
                    )}
                    {log.fats && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 flex items-center">
                          <span className="mr-1">🥑</span> Fats:
                        </span>
                        <span className="font-bold text-purple-600">{log.fats}g</span>
                      </div>
                    )}
                    {log.serving_size && (
                      <div className="flex justify-between items-center border-t border-gray-200 pt-2 mt-2">
                        <span className="text-gray-600 flex items-center">
                          <span className="mr-1">🍴</span> Serving:
                        </span>
                        <span className="font-medium text-gray-700">{log.quantity} x {log.serving_size}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-3 flex items-center justify-between bg-gray-100 px-3 py-2 rounded-lg">
                    <span className="text-xs text-gray-500 font-medium">📅 {new Date(log.date).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card bg-white/90 backdrop-blur-sm text-center py-16 border-4 border-dashed border-gray-300">
              <div className="text-7xl mb-4 animate-bounce">🍽️</div>
              <p className="text-gray-600 text-xl mb-6 font-medium">No meals logged yet - Start tracking your nutrition!</p>
              <button 
                onClick={() => setShowModal(true)} 
                className="btn-primary bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all duration-300 text-lg px-8 py-3"
              >
                <span className="text-2xl mr-2">🚀</span>
                Log Your First Meal
              </button>
            </div>
          )}

          {/* AI Nutritional Analysis Section */}
          {getTodaysLogs().length > 0 && (
            <div className="card bg-gradient-to-br from-purple-50 to-pink-50 shadow-xl p-6 border-2 border-purple-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold flex items-center">
                  <span className="mr-2 text-3xl">🤖</span>
                  AI Nutritional Analysis
                </h2>
                <button
                  onClick={analyzeNutrition}
                  disabled={analyzingNutrition}
                  className="btn-primary bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 font-bold"
                >
                  {analyzingNutrition ? (
                    <span className="flex items-center">
                      <span className="animate-spin mr-2">⚡</span>
                      Analyzing...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <span className="mr-2">✨</span>
                      Get AI Insights
                    </span>
                  )}
                </button>
              </div>
              
              {aiAnalysis ? (
                <div className="bg-white rounded-xl p-6 shadow-inner border-2 border-purple-100">
                  <div className="prose max-w-none">
                    <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{aiAnalysis}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-white/50 rounded-xl p-6 text-center border-2 border-dashed border-purple-200">
                  <p className="text-gray-600">
                    Click "Get AI Insights" to receive personalized nutritional analysis and recommendations for your remaining meals!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Log Meal</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 Search the USDA food database (400,000+ foods) to auto-fill nutrition info!
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Meal Type</label>
                <select
                  value={formData.meal_type}
                  onChange={(e) => setFormData({ ...formData, meal_type: e.target.value })}
                  className="input-field"
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                </select>
              </div>
              
              <div>
                <label className="label">Search Food Database (USDA)</label>
                <input
                  type="text"
                  value={foodSearch}
                  onChange={(e) => handleFoodSearch(e.target.value)}
                  className="input-field"
                  placeholder="Search for chicken, banana, rice..."
                />
                {searching && (
                  <p className="text-sm text-gray-500 mt-1">Searching...</p>
                )}
                {searchResults.length > 0 && (
                  <div className="mt-2 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                    {searchResults.map((food, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => selectFood(food)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium">{food.name}</div>
                        <div className="text-sm text-gray-600">
                          {food.calories} cal | P: {food.protein}g | C: {food.carbs}g | F: {food.fats}g
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <div>
                <label className="label">Food Name *</label>
                <input
                  type="text"
                  value={formData.food_name}
                  onChange={(e) => setFormData({ ...formData, food_name: e.target.value })}
                  className="input-field"
                  placeholder="Or type manually"
                  required
                />
              </div>
              <div>
                <label className="label">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">Calories *</label>
                <input
                  type="number"
                  value={formData.calories}
                  onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                  className="input-field"
                  placeholder="Auto-filled from search"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Protein (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.protein}
                    onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
                    className="input-field"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="label">Carbs (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.carbohydrates}
                    onChange={(e) => setFormData({ ...formData, carbohydrates: e.target.value })}
                    className="input-field"
                    placeholder="Optional"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Fats (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.fats}
                    onChange={(e) => setFormData({ ...formData, fats: e.target.value })}
                    className="input-field"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="label">Fiber (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.fiber}
                    onChange={(e) => setFormData({ ...formData, fiber: e.target.value })}
                    className="input-field"
                    placeholder="Optional"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Serving Size</label>
                  <input
                    type="text"
                    value={formData.serving_size}
                    onChange={(e) => setFormData({ ...formData, serving_size: e.target.value })}
                    className="input-field"
                    placeholder="e.g., 1 cup"
                  />
                </div>
                <div>
                  <label className="label">Quantity</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>
              <div>
                <label className="label">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="input-field"
                />
              </div>
              <div className="flex space-x-3">
                <button type="submit" className="flex-1 btn-primary">
                  Log Meal
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Nutrition;



