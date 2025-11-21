import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { goalService } from '../services/api';

const Goals: React.FC = () => {
  const [goals, setGoals] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<any>(null);
  const [progressValue, setProgressValue] = useState('');
  const [celebratingGoal, setCelebratingGoal] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    goal_type: 'weight',
    title: '',
    description: '',
    target_value: '',
    current_value: '0',
    unit: 'kg',
    target_date: '',
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active');

  const goalTypeEmojis: Record<string, string> = {
    weight: '⚖️',
    distance: '🏃',
    repetitions: '💪',
    duration: '⏱️',
    other: '🎯',
  };

  useEffect(() => {
    loadGoals();
  }, [filter]);

  const loadGoals = async () => {
    try {
      const response = await goalService.getGoals(filter === 'all' ? undefined : filter);
      setGoals(response.goals);
    } catch (error) {
      console.error('Failed to load goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await goalService.createGoal(formData);
      setShowModal(false);
      setFormData({
        goal_type: 'weight',
        title: '',
        description: '',
        target_value: '',
        current_value: '0',
        unit: 'kg',
        target_date: '',
      });
      loadGoals();
    } catch (error) {
      console.error('Failed to create goal:', error);
    }
  };

  const handleUpdateProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoal) return;

    try {
      const newValue = parseFloat(progressValue);
      const newProgress = (newValue / selectedGoal.target_value) * 100;
      
      await goalService.updateProgress(selectedGoal.id, {
        current_value: newValue,
      });
      
      if (newProgress >= 100) {
        setCelebratingGoal(selectedGoal.id);
        setTimeout(() => setCelebratingGoal(null), 3000);
      }
      
      setShowProgressModal(false);
      setSelectedGoal(null);
      setProgressValue('');
      loadGoals();
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      try {
        await goalService.deleteGoal(id);
        loadGoals();
      } catch (error) {
        console.error('Failed to delete goal:', error);
      }
    }
  };

  const openProgressModal = (goal: any) => {
    setSelectedGoal(goal);
    setProgressValue(goal.current_value.toString());
    setShowProgressModal(true);
  };

  return (
    <Layout>
      <div className="relative min-h-[calc(100vh-80px)] overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
        {/* Floating Goal Emojis */}
        <div className="absolute top-1/4 left-1/4 text-5xl animate-float-1">🎯</div>
        <div className="absolute top-1/2 right-1/4 text-6xl animate-float-2">🏆</div>
        <div className="absolute bottom-1/4 left-1/3 text-4xl animate-float-3">⭐</div>
        <div className="absolute top-1/3 right-1/3 text-7xl animate-float-4">🚀</div>

        <div className="relative z-10 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Your Goals</h1>
              <p className="text-gray-600">Track your progress and crush your targets!</p>
            </div>
            <button 
              onClick={() => setShowModal(true)} 
              className="btn-primary flex items-center space-x-2 px-6 py-3 text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <span className="text-2xl">+</span>
              <span>Create Goal</span>
            </button>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => setFilter('active')}
              className={`px-5 py-2.5 rounded-full font-medium transition-all duration-300 ${
                filter === 'active' 
                  ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg scale-105' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 shadow'
              }`}
            >
              🔥 Active
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-5 py-2.5 rounded-full font-medium transition-all duration-300 ${
                filter === 'completed' 
                  ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg scale-105' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 shadow'
              }`}
            >
              ✅ Completed
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-5 py-2.5 rounded-full font-medium transition-all duration-300 ${
                filter === 'all' 
                  ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg scale-105' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 shadow'
              }`}
            >
              📊 All
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8 text-lg font-medium">
              <span className="inline-block animate-bounce text-4xl mb-2">⏳</span>
              <p>Loading your amazing goals...</p>
            </div>
          ) : goals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {goals.map((goal) => (
                <div 
                  key={goal.id} 
                  className={`relative card bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 ${
                    celebratingGoal === goal.id ? 'animate-bounce' : ''
                  }`}
                >
                  {celebratingGoal === goal.id && (
                    <div className="absolute inset-0 flex items-center justify-center bg-yellow-400/20 rounded-xl animate-pulse">
                      <span className="text-6xl">🎉</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-3xl">{goalTypeEmojis[goal.goal_type] || '🎯'}</span>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                        goal.status === 'completed' 
                          ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-md' 
                          : 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-md'
                      }`}>
                        {goal.goal_type}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="text-red-500 hover:text-red-700 text-xl font-bold hover:scale-110 transition-transform"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-2 text-gray-900">{goal.title}</h3>
                  {goal.description && (
                    <p className="text-gray-600 text-sm mb-4 italic">{goal.description}</p>
                  )}
                  
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-gray-700">Progress</span>
                      <span className={`text-lg font-bold ${
                        goal.progress_percentage >= 100 ? 'text-green-600' : 'text-primary-600'
                      }`}>
                        {goal.progress_percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                      <div
                        className={`h-4 rounded-full transition-all duration-500 relative ${
                          goal.progress_percentage >= 100 
                            ? 'bg-gradient-to-r from-green-400 to-emerald-600' 
                            : 'bg-gradient-to-r from-blue-400 to-purple-600'
                        }`}
                        style={{ width: `${Math.min(goal.progress_percentage, 100)}%` }}
                      >
                        {goal.progress_percentage >= 100 && (
                          <span className="absolute right-2 top-0 text-white font-bold">🎉</span>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-2 text-sm">
                      <span className="text-gray-700 font-medium">
                        <span className="text-primary-600 font-bold text-base">{goal.current_value}</span> / {goal.target_value} {goal.unit}
                      </span>
                      {goal.target_date && (
                        <span className="text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">
                          📅 {new Date(goal.target_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {goal.status === 'active' && (
                    <button
                      onClick={() => openProgressModal(goal)}
                      className="w-full btn-primary bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-md hover:shadow-lg transition-all duration-300 font-bold py-3"
                    >
                      📈 Update Progress
                    </button>
                  )}

                  {goal.status === 'completed' && (
                    <div className="flex items-center justify-center bg-gradient-to-r from-green-400 to-emerald-500 text-white font-bold py-3 rounded-lg shadow-md">
                      <span className="mr-2 text-xl">🏆</span>
                      <span className="text-lg">Goal Completed!</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="card bg-white/90 backdrop-blur-sm text-center py-16 border-4 border-dashed border-gray-300">
              <div className="text-7xl mb-4 animate-bounce">🎯</div>
              <p className="text-gray-600 text-xl mb-6 font-medium">No goals yet - Let's create your first one!</p>
              <button 
                onClick={() => setShowModal(true)} 
                className="btn-primary bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 text-lg px-8 py-3"
              >
                <span className="text-2xl mr-2">🚀</span>
                Create Your First Goal
              </button>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Create Goal</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Goal Type</label>
                <select
                  value={formData.goal_type}
                  onChange={(e) => setFormData({ ...formData, goal_type: e.target.value })}
                  className="input-field"
                >
                  <option value="weight">Weight</option>
                  <option value="distance">Distance</option>
                  <option value="repetitions">Repetitions</option>
                  <option value="duration">Duration</option>
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
                  placeholder="e.g., Lose 5kg"
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
                  placeholder="Optional description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Target Value</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.target_value}
                    onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="label">Unit</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="input-field"
                    placeholder="kg, km, reps"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="label">Current Value</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.current_value}
                  onChange={(e) => setFormData({ ...formData, current_value: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">Target Date</label>
                <input
                  type="date"
                  value={formData.target_date}
                  onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                  className="input-field"
                />
              </div>
              <div className="flex space-x-3">
                <button type="submit" className="flex-1 btn-primary">
                  Create Goal
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showProgressModal && selectedGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Update Progress</h2>
              <button onClick={() => setShowProgressModal(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <div className="mb-4">
              <h3 className="font-semibold">{selectedGoal.title}</h3>
              <p className="text-sm text-gray-600">Target: {selectedGoal.target_value} {selectedGoal.unit}</p>
            </div>
            <form onSubmit={handleUpdateProgress} className="space-y-4">
              <div>
                <label className="label">Current Value ({selectedGoal.unit})</label>
                <input
                  type="number"
                  step="0.1"
                  value={progressValue}
                  onChange={(e) => setProgressValue(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              <div className="flex space-x-3">
                <button type="submit" className="flex-1 btn-primary">
                  Update
                </button>
                <button type="button" onClick={() => setShowProgressModal(false)} className="flex-1 btn-secondary">
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

export default Goals;



