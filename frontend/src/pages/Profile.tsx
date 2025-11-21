import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';

const Profile: React.FC = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    age: user?.age || '',
    gender: user?.gender || '',
    height_feet: user?.height_feet || '5',
    height_inches: user?.height_inches || '8',
    weight_lbs: user?.weight_lbs || '150',
    fitness_level: user?.fitness_level || 'intermediate',
    activity_level: user?.activity_level || 'moderately_active',
    target_weight_lbs: user?.target_weight_lbs || '140',
    weight_goal_rate: user?.weight_goal_rate || '-1',
    daily_calorie_goal: user?.daily_calorie_goal || '2000',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await authService.updateProfile(formData);
      updateUser(response.user);
      setSuccess('Profile updated successfully!');
      setEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Generate options
  const feetOptions = Array.from({ length: 5 }, (_, i) => i + 3);
  const inchesOptions = Array.from({ length: 12 }, (_, i) => i);
  const weightOptions = Array.from({ length: 251 }, (_, i) => i + 50);

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          {!editing && (
            <button onClick={() => setEditing(true)} className="btn-primary">
              Edit Profile
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        <div className="card">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {user?.first_name && user?.last_name
                  ? `${user.first_name} ${user.last_name}`
                  : user?.username}
              </h2>
              <p className="text-gray-600">{user?.email}</p>
            </div>
          </div>

          {editing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="label">First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="label">Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="label">Age</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="label">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="label">Height</label>
                  <div className="flex gap-2">
                    <select
                      name="height_feet"
                      value={formData.height_feet}
                      onChange={handleChange}
                      className="input-field flex-1"
                    >
                      {feetOptions.map(ft => (
                        <option key={ft} value={ft}>{ft} ft</option>
                      ))}
                    </select>
                    <select
                      name="height_inches"
                      value={formData.height_inches}
                      onChange={handleChange}
                      className="input-field flex-1"
                    >
                      {inchesOptions.map(inch => (
                        <option key={inch} value={inch}>{inch} in</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="label">Current Weight (lbs)</label>
                  <select
                    name="weight_lbs"
                    value={formData.weight_lbs}
                    onChange={handleChange}
                    className="input-field"
                  >
                    {weightOptions.map(wt => (
                      <option key={wt} value={wt}>{wt} lbs</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Target Weight (lbs)</label>
                  <select
                    name="target_weight_lbs"
                    value={formData.target_weight_lbs}
                    onChange={handleChange}
                    className="input-field"
                  >
                    {weightOptions.map(wt => (
                      <option key={wt} value={wt}>{wt} lbs</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Daily Calorie Goal</label>
                  <select
                    name="daily_calorie_goal"
                    value={formData.daily_calorie_goal}
                    onChange={handleChange}
                    className="input-field"
                  >
                    {Array.from({ length: 31 }, (_, i) => (i + 12) * 100).map(cal => (
                      <option key={cal} value={cal}>{cal} cal</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Fitness Level</label>
                  <select
                    name="fitness_level"
                    value={formData.fitness_level}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="label">Activity Level</label>
                  <select
                    name="activity_level"
                    value={formData.activity_level}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="sedentary">Sedentary (little/no exercise)</option>
                    <option value="lightly_active">Lightly Active (1-3 days/week)</option>
                    <option value="moderately_active">Moderately Active (3-5 days/week)</option>
                    <option value="very_active">Very Active (6-7 days/week)</option>
                    <option value="extra_active">Extra Active (very active + physical job)</option>
                  </select>
                </div>

                <div>
                  <label className="label">Weight Goal Rate (lbs/week)</label>
                  <select
                    name="weight_goal_rate"
                    value={formData.weight_goal_rate}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="-2">Lose 2 lbs/week (aggressive)</option>
                    <option value="-1.5">Lose 1.5 lbs/week</option>
                    <option value="-1">Lose 1 lb/week (recommended)</option>
                    <option value="-0.5">Lose 0.5 lbs/week (gradual)</option>
                    <option value="0">Maintain weight</option>
                    <option value="0.5">Gain 0.5 lbs/week (gradual)</option>
                    <option value="1">Gain 1 lb/week</option>
                    <option value="1.5">Gain 1.5 lbs/week</option>
                    <option value="2">Gain 2 lbs/week</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-3">
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setError('');
                    setSuccess('');
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-gray-600">Username</label>
                  <p className="font-medium">{user?.username}</p>
                </div>

                <div>
                  <label className="text-sm text-gray-600">Email</label>
                  <p className="font-medium">{user?.email}</p>
                </div>

                {user?.first_name && (
                  <div>
                    <label className="text-sm text-gray-600">First Name</label>
                    <p className="font-medium">{user.first_name}</p>
                  </div>
                )}

                {user?.last_name && (
                  <div>
                    <label className="text-sm text-gray-600">Last Name</label>
                    <p className="font-medium">{user.last_name}</p>
                  </div>
                )}

                {user?.age && (
                  <div>
                    <label className="text-sm text-gray-600">Age</label>
                    <p className="font-medium">{user.age} years</p>
                  </div>
                )}

                {user?.gender && (
                  <div>
                    <label className="text-sm text-gray-600">Gender</label>
                    <p className="font-medium capitalize">{user.gender}</p>
                  </div>
                )}

                {user?.height_feet && (
                  <div>
                    <label className="text-sm text-gray-600">Height</label>
                    <p className="font-medium">{user.height_feet}' {user.height_inches || 0}"</p>
                  </div>
                )}

                {user?.weight_lbs && (
                  <div>
                    <label className="text-sm text-gray-600">Current Weight</label>
                    <p className="font-medium">{user.weight_lbs} lbs</p>
                  </div>
                )}

                {user?.target_weight_lbs && (
                  <div>
                    <label className="text-sm text-gray-600">Target Weight</label>
                    <p className="font-medium">{user.target_weight_lbs} lbs</p>
                  </div>
                )}

                {user?.daily_calorie_goal && (
                  <div>
                    <label className="text-sm text-gray-600">Daily Calorie Goal</label>
                    <p className="font-medium">{user.daily_calorie_goal} cal</p>
                  </div>
                )}

                {user?.fitness_level && (
                  <div>
                    <label className="text-sm text-gray-600">Fitness Level</label>
                    <p className="font-medium capitalize">{user.fitness_level}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="text-xl font-semibold mb-4">Account Actions</h3>
          <button onClick={handleLogout} className="btn-secondary text-red-600 border-red-600 hover:bg-red-50">
            Logout
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
