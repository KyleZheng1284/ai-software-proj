import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { nutritionService } from '../services/api';

const Nutrition: React.FC = () => {
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

  useEffect(() => {
    loadNutrition();
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

  const getMealEmoji = (mealType: string) => {
    const emojis: any = {
      breakfast: '🌅',
      lunch: '☀️',
      dinner: '🌙',
      snack: '🍪',
    };
    return emojis[mealType] || '🍽️';
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Nutrition</h1>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            + Log Meal
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading nutrition logs...</div>
        ) : nutritionLogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nutritionLogs.map((log) => (
              <div key={log.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{getMealEmoji(log.meal_type)}</span>
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium capitalize">
                      {log.meal_type}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(log.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
                <h3 className="text-xl font-semibold mb-2">{log.food_name}</h3>
                {log.description && (
                  <p className="text-gray-600 text-sm mb-3">{log.description}</p>
                )}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Calories:</span>
                    <span className="font-medium">{log.calories} kcal</span>
                  </div>
                  {log.protein && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Protein:</span>
                      <span className="font-medium">{log.protein}g</span>
                    </div>
                  )}
                  {log.carbohydrates && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Carbs:</span>
                      <span className="font-medium">{log.carbohydrates}g</span>
                    </div>
                  )}
                  {log.fats && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fats:</span>
                      <span className="font-medium">{log.fats}g</span>
                    </div>
                  )}
                  {log.serving_size && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Serving:</span>
                      <span className="font-medium">{log.quantity} x {log.serving_size}</span>
                    </div>
                  )}
                  <div className="text-gray-500 text-xs mt-3">
                    {new Date(log.date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <p className="text-gray-500 mb-4">No nutrition logs yet</p>
            <button onClick={() => setShowModal(true)} className="btn-primary">
              Log Your First Meal
            </button>
          </div>
        )}
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
                <label className="label">Food Name</label>
                <input
                  type="text"
                  value={formData.food_name}
                  onChange={(e) => setFormData({ ...formData, food_name: e.target.value })}
                  className="input-field"
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
                <label className="label">Calories (required)</label>
                <input
                  type="number"
                  value={formData.calories}
                  onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                  className="input-field"
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



