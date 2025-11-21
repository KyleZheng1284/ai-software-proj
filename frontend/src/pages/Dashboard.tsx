import React, { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Layout from '../components/Layout';
import { activityService, nutritionService, goalService, aiService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [activityStats, setActivityStats] = useState<any>(null);
  const [nutritionStats, setNutritionStats] = useState<any>(null);
  const [goals, setGoals] = useState<any[]>([]);
  const [motivationalMessage, setMotivationalMessage] = useState('');
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [activityRes, nutritionRes, goalsRes, messageRes, insightsRes] = await Promise.all([
        activityService.getStats(30),
        nutritionService.getStats(7),
        goalService.getGoals('active'),
        aiService.getMotivationalMessage(),
        aiService.getInsights(),
      ]);

      setActivityStats(activityRes);
      setNutritionStats(nutritionRes);
      setGoals(goalsRes.goals);
      setMotivationalMessage(messageRes.message);
      setInsights(insightsRes.insights);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-xl text-gray-600">Loading dashboard...</div>
        </div>
      </Layout>
    );
  }

  const activityChartData = activityStats?.activity_types
    ? Object.entries(activityStats.activity_types).map(([name, value]) => ({ name, value }))
    : [];

  const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.first_name || user?.username}!
            </h1>
            <p className="text-gray-600 mt-1">Here's your fitness overview</p>
          </div>
        </div>

        {motivationalMessage && (
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg p-6 shadow-lg">
            <p className="text-lg font-medium">{motivationalMessage}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Workouts</p>
                <p className="text-3xl font-bold text-primary-600">{activityStats?.total_activities || 0}</p>
              </div>
              <div className="text-4xl">🏃</div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Calories Burned</p>
                <p className="text-3xl font-bold text-green-600">{activityStats?.total_calories_burned || 0}</p>
              </div>
              <div className="text-4xl">🔥</div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Goals</p>
                <p className="text-3xl font-bold text-yellow-600">{goals.length}</p>
              </div>
              <div className="text-4xl">🎯</div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Calories/Day</p>
                <p className="text-3xl font-bold text-purple-600">{Math.round(nutritionStats?.average_daily_calories || 0)}</p>
              </div>
              <div className="text-4xl">🍎</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Activity Distribution</h2>
            {activityChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={activityChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {activityChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No activity data yet. Start logging your workouts!
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Nutrition Overview (7 days)</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Calories</span>
                <span className="font-semibold">{Math.round(nutritionStats?.total_calories || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Protein (g)</span>
                <span className="font-semibold">{nutritionStats?.total_protein || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Carbs (g)</span>
                <span className="font-semibold">{nutritionStats?.total_carbohydrates || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Fats (g)</span>
                <span className="font-semibold">{nutritionStats?.total_fats || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Meals Logged</span>
                <span className="font-semibold">{nutritionStats?.total_meals || 0}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Active Goals</h2>
          {goals.length > 0 ? (
            <div className="space-y-4">
              {goals.slice(0, 3).map((goal) => (
                <div key={goal.id} className="border-b pb-4 last:border-b-0">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">{goal.title}</h3>
                    <span className="text-sm text-gray-600">{goal.progress_percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${goal.progress_percentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center mt-1 text-sm text-gray-600">
                    <span>{goal.current_value} / {goal.target_value} {goal.unit}</span>
                    <span>{goal.goal_type}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              No active goals. Set some goals to track your progress!
            </div>
          )}
        </div>

        {insights && insights.insights && insights.insights.length > 0 && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">AI Insights</h2>
            <div className="space-y-3">
              {insights.insights.map((insight: string, index: number) => (
                <div key={index} className="flex items-start space-x-3">
                  <span className="text-primary-600 mt-1">💡</span>
                  <p className="text-gray-700">{insight}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;



