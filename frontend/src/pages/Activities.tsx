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
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Activities</h1>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            + Log Activity
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading activities...</div>
        ) : activities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activities.map((activity) => (
              <div key={activity.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                      {activity.activity_type}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(activity.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
                <h3 className="text-xl font-semibold mb-2">{activity.title}</h3>
                {activity.description && (
                  <p className="text-gray-600 text-sm mb-3">{activity.description}</p>
                )}
                <div className="space-y-2 text-sm">
                  {activity.duration_minutes && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{activity.duration_minutes} min</span>
                    </div>
                  )}
                  {activity.distance && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Distance:</span>
                      <span className="font-medium">{activity.distance} km</span>
                    </div>
                  )}
                  {activity.calories_burned && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Calories:</span>
                      <span className="font-medium">{activity.calories_burned} kcal</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Intensity:</span>
                    <span className="font-medium capitalize">{activity.intensity}</span>
                  </div>
                  <div className="text-gray-500 text-xs mt-3">
                    {new Date(activity.date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <p className="text-gray-500 mb-4">No activities logged yet</p>
            <button onClick={() => setShowModal(true)} className="btn-primary">
              Log Your First Activity
            </button>
          </div>
        )}
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
                <label className="label">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Duration (min)</label>
                  <input
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                    className="input-field"
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
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Calories Burned</label>
                  <input
                    type="number"
                    value={formData.calories_burned}
                    onChange={(e) => setFormData({ ...formData, calories_burned: e.target.value })}
                    className="input-field"
                  />
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



