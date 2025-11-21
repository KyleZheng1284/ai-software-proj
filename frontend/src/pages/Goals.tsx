import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { goalService } from '../services/api';

const Goals: React.FC = () => {
  const [goals, setGoals] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<any>(null);
  const [progressValue, setProgressValue] = useState('');
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
      await goalService.updateProgress(selectedGoal.id, {
        current_value: parseFloat(progressValue),
      });
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
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Goals</h1>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            + Create Goal
          </button>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'active' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'completed' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'all' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            All
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading goals...</div>
        ) : goals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {goals.map((goal) => (
              <div key={goal.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    goal.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {goal.goal_type}
                  </span>
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
                <h3 className="text-xl font-semibold mb-2">{goal.title}</h3>
                {goal.description && (
                  <p className="text-gray-600 text-sm mb-4">{goal.description}</p>
                )}
                
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Progress</span>
                    <span className="text-sm font-semibold">{goal.progress_percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-300 ${
                        goal.progress_percentage >= 100 ? 'bg-green-600' : 'bg-primary-600'
                      }`}
                      style={{ width: `${Math.min(goal.progress_percentage, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center mt-2 text-sm">
                    <span className="text-gray-600">
                      {goal.current_value} / {goal.target_value} {goal.unit}
                    </span>
                    {goal.target_date && (
                      <span className="text-gray-600">
                        Due: {new Date(goal.target_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                {goal.status === 'active' && (
                  <button
                    onClick={() => openProgressModal(goal)}
                    className="w-full btn-primary"
                  >
                    Update Progress
                  </button>
                )}

                {goal.status === 'completed' && (
                  <div className="flex items-center justify-center text-green-600 font-medium">
                    <span className="mr-2">✓</span>
                    Completed
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <p className="text-gray-500 mb-4">No goals found</p>
            <button onClick={() => setShowModal(true)} className="btn-primary">
              Create Your First Goal
            </button>
          </div>
        )}
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



