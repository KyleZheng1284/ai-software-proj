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
    height: user?.height || '',
    weight: user?.weight || '',
    fitness_level: user?.fitness_level || 'intermediate',
    primary_goal: user?.primary_goal || 'general fitness',
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
                  <label className="label">Height (cm)</label>
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="label">Weight (kg)</label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    className="input-field"
                  />
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
                  <label className="label">Primary Goal</label>
                  <select
                    name="primary_goal"
                    value={formData.primary_goal}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="weight loss">Weight Loss</option>
                    <option value="muscle gain">Muscle Gain</option>
                    <option value="general fitness">General Fitness</option>
                    <option value="endurance">Endurance</option>
                    <option value="flexibility">Flexibility</option>
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

                {user?.height && (
                  <div>
                    <label className="text-sm text-gray-600">Height</label>
                    <p className="font-medium">{user.height} cm</p>
                  </div>
                )}

                {user?.weight && (
                  <div>
                    <label className="text-sm text-gray-600">Weight</label>
                    <p className="font-medium">{user.weight} kg</p>
                  </div>
                )}

                {user?.fitness_level && (
                  <div>
                    <label className="text-sm text-gray-600">Fitness Level</label>
                    <p className="font-medium capitalize">{user.fitness_level}</p>
                  </div>
                )}

                {user?.primary_goal && (
                  <div>
                    <label className="text-sm text-gray-600">Primary Goal</label>
                    <p className="font-medium capitalize">{user.primary_goal}</p>
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



