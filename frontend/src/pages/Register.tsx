import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    age: '',
    gender: '',
    height_feet: '5',
    height_inches: '8',
    weight_lbs: '150',
    fitness_level: 'intermediate',
    activity_level: 'moderately_active',
    target_weight_lbs: '140',
    weight_goal_rate: '-1',  // Default: lose 1 lb per week
    daily_calorie_goal: '2000',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const data = { ...formData };
      delete (data as any).confirmPassword;
      
      await register(data);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  // Generate options for dropdowns
  const feetOptions = Array.from({ length: 5 }, (_, i) => i + 3); // 3-7 feet
  const inchesOptions = Array.from({ length: 12 }, (_, i) => i); // 0-11 inches
  const weightOptions = Array.from({ length: 251 }, (_, i) => i + 50); // 50-300 lbs

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Join AI Fitness</h1>
          <p className="text-gray-600 mt-2">Create your account and start your fitness journey</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="label">Username *</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="label">Password *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="label">Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

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

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
