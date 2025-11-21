import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { activityService } from '../services/api';

const Activities: React.FC = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    activity_type: 'cardio',
    title: '',
    description: '',
    duration_minutes: '',
    distance: '',
    calories_burned: '',
    intensity: 'moderate',
    date: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(true);

  const activityTypeEmojis: Record<string, string> = {
    cardio: '🏃‍♂️',
    strength: '💪',
    flexibility: '🧘',
    sports: '⚽',
    other: '🎯',
  };

  const intensityColors: Record<string, string> = {
    low: 'from-green-400 to-emerald-500',
    moderate: 'from-yellow-400 to-orange-500',
    high: 'from-red-400 to-pink-500',
  };

  const intensityEmojis: Record<string, string> = {
    low: '😌',
    moderate: '😅',
    high: '🔥',
  };

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      const response = await activityService.getActivities(30);
      setActivities(response.activities);
    } catch (error) {
      console.error('Failed to load activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await activityService.createActivity(formData);
      setShowModal(false);
      setFormData({
        activity_type: 'cardio',
        title: '',
        description: '',
        duration_minutes: '',
        distance: '',
        calories_burned: '',
        intensity: 'moderate',
        date: new Date().toISOString().split('T')[0],
      });
      loadActivities();
    } catch (error) {
      console.error('Failed to create activity:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      try {
        await activityService.deleteActivity(id);
        loadActivities();
      } catch (error) {
        console.error('Failed to delete activity:', error);
      }
    }
  };

  return (
    <Layout>
      <div className="relative min-h-[calc(100vh-80px)] overflow-hidden rounded-xl bg-gradient-to-br from-orange-50 via-yellow-50 to-green-50 p-6">
        {/* Floating Activity Emojis */}
        <div className="absolute top-1/4 left-1/4 text-5xl animate-float-1">🏃‍♂️</div>
        <div className="absolute top-1/2 right-1/4 text-6xl animate-float-2">💪</div>
        <div className="absolute bottom-1/4 left-1/3 text-4xl animate-float-3">⚡</div>
        <div className="absolute top-1/3 right-1/3 text-7xl animate-float-4">🔥</div>
        <div className="absolute bottom-1/3 right-1/4 text-5xl animate-float-1">🎯</div>

        <div className="relative z-10 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Your Activities</h1>
              <p className="text-gray-600">Track every move, celebrate every milestone!</p>
            </div>
            <button 
              onClick={() => setShowModal(true)} 
              className="btn-primary flex items-center space-x-2 px-6 py-3 text-lg font-semibold bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <span className="text-2xl">+</span>
              <span>Log Activity</span>
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8 text-lg font-medium">
              <span className="inline-block animate-spin text-4xl mb-2">⚡</span>
              <p>Loading your activities...</p>
            </div>
          ) : activities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activities.map((activity) => (
                <div 
                  key={activity.id} 
                  className="card bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:rotate-1"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-4xl">{activityTypeEmojis[activity.activity_type] || '🎯'}</span>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${intensityColors[activity.intensity] || intensityColors.moderate} text-white shadow-md`}>
                        {intensityEmojis[activity.intensity]} {activity.activity_type}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDelete(activity.id)}
                      className="text-red-500 hover:text-red-700 text-xl font-bold hover:scale-125 transition-transform"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2 text-gray-900">{activity.title}</h3>
                  {activity.description && (
                    <p className="text-gray-600 text-sm mb-3 italic">{activity.description}</p>
                  )}
                  
                  <div className="space-y-2 bg-gradient-to-br from-gray-50 to-gray-100 p-3 rounded-lg">
                    {activity.duration_minutes && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 flex items-center">
                          <span className="mr-1">⏱️</span> Duration:
                        </span>
                        <span className="font-bold text-primary-600">{activity.duration_minutes} min</span>
                      </div>
                    )}
                    {activity.distance && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 flex items-center">
                          <span className="mr-1">📏</span> Distance:
                        </span>
                        <span className="font-bold text-blue-600">{activity.distance} km</span>
                      </div>
                    )}
                    {activity.calories_burned && (
                      <div className="flex justify-between items-center bg-gradient-to-r from-orange-100 to-red-100 p-2 rounded-lg">
                        <span className="text-gray-700 flex items-center font-semibold">
                          <span className="mr-1">🔥</span> Calories:
                        </span>
                        <span className="font-extrabold text-red-600 text-lg">{activity.calories_burned} kcal</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 flex items-center">
                        <span className="mr-1">{intensityEmojis[activity.intensity]}</span> Intensity:
                      </span>
                      <span className="font-bold capitalize text-purple-600">{activity.intensity}</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex items-center justify-between bg-gray-100 px-3 py-2 rounded-lg">
                    <span className="text-xs text-gray-500 font-medium">📅 {new Date(activity.date).toLocaleDateString()}</span>
                    <span className="text-xs text-gray-500 font-medium">🕐 {new Date(activity.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card bg-white/90 backdrop-blur-sm text-center py-16 border-4 border-dashed border-gray-300">
              <div className="text-7xl mb-4 animate-bounce">🏃‍♂️</div>
              <p className="text-gray-600 text-xl mb-6 font-medium">No activities yet - Time to get moving!</p>
              <button 
                onClick={() => setShowModal(true)} 
                className="btn-primary bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-lg hover:shadow-xl transition-all duration-300 text-lg px-8 py-3"
              >
                <span className="text-2xl mr-2">🚀</span>
                Log Your First Activity
              </button>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Log Activity</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Morning Run"
                  required
                />
              </div>
              <div>
                <label className="label">Calories Burned *</label>
                <input
                  type="number"
                  value={formData.calories_burned}
                  onChange={(e) => setFormData({ ...formData, calories_burned: e.target.value })}
                  className="input-field"
                  placeholder="e.g., 250"
                  required
                />
              </div>
              <div>
                <label className="label">Description (optional)</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                  placeholder="Additional details..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Duration (min)</label>
                  <input
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                    className="input-field"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="label">Distance (km)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.distance}
                    onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                    className="input-field"
                    placeholder="Optional"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Activity Type</label>
                  <select
                    value={formData.activity_type}
                    onChange={(e) => setFormData({ ...formData, activity_type: e.target.value })}
                    className="input-field"
                  >
                    <option value="cardio">Cardio</option>
                    <option value="strength">Strength Training</option>
                    <option value="flexibility">Flexibility</option>
                    <option value="sports">Sports</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="label">Intensity</label>
                  <select
                    value={formData.intensity}
                    onChange={(e) => setFormData({ ...formData, intensity: e.target.value })}
                    className="input-field"
                  >
                    <option value="low">Low</option>
                    <option value="moderate">Moderate</option>
                    <option value="high">High</option>
                  </select>
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
                  Log Activity
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

export default Activities;



