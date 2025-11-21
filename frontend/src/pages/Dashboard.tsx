import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import Layout from '../components/Layout';
import { activityService, nutritionService, goalService, aiService, dashboardService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [activityStats, setActivityStats] = useState<any>(null);
  const [nutritionStats, setNutritionStats] = useState<any>(null);
  const [goals, setGoals] = useState<any[]>([]);
  const [motivationalMessage, setMotivationalMessage] = useState('');
  const [insights, setInsights] = useState<any>(null);
  const [calorieBalance, setCalorieBalance] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [activityRes, nutritionRes, goalsRes, messageRes, insightsRes, calorieRes] = await Promise.all([
        activityService.getStats(30),
        nutritionService.getStats(7),
        goalService.getGoals('active'),
        aiService.getMotivationalMessage(),
        aiService.getInsights(),
        dashboardService.getCalorieBalance(),
      ]);

      setActivityStats(activityRes);
      setNutritionStats(nutritionRes);
      setGoals(goalsRes.goals);
      setMotivationalMessage(messageRes.message);
      setInsights(insightsRes.insights);
      setCalorieBalance(calorieRes);
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

        {calorieBalance && calorieBalance.calorie_profile.target_calories && (
          <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Today's Calorie Balance</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-600 mb-1">Target Calories</p>
                <p className="text-2xl font-bold text-blue-600">{calorieBalance.today.target_calories}</p>
                <p className="text-xs text-gray-500 mt-1">Your daily goal</p>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-600 mb-1">Net Calories</p>
                <p className="text-2xl font-bold text-purple-600">{calorieBalance.today.net_calories}</p>
                <p className="text-xs text-gray-500 mt-1">Consumed - Burned</p>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-600 mb-1">Remaining</p>
                <p className={`text-2xl font-bold ${calorieBalance.today.remaining_calories >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {calorieBalance.today.remaining_calories > 0 ? '+' : ''}{calorieBalance.today.remaining_calories}
                </p>
                <p className="text-xs text-gray-500 mt-1">{calorieBalance.today.percentage_consumed}% of target</p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Progress</span>
                <span className="text-sm font-medium text-gray-900">
                  {calorieBalance.today.net_calories} / {calorieBalance.today.target_calories} cal
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-3 rounded-full transition-all ${
                    calorieBalance.today.percentage_consumed > 100
                      ? 'bg-red-500'
                      : calorieBalance.today.percentage_consumed > 90
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(calorieBalance.today.percentage_consumed, 100)}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-xs text-gray-600">Consumed</p>
                <p className="text-lg font-bold text-green-700">{calorieBalance.today.calories_consumed} cal</p>
                <p className="text-xs text-gray-500">{calorieBalance.today.meal_count} meals logged</p>
              </div>
              
              <div className="bg-orange-50 rounded-lg p-3">
                <p className="text-xs text-gray-600">Burned (Exercise)</p>
                <p className="text-lg font-bold text-orange-700">{calorieBalance.today.calories_burned_exercise} cal</p>
                <p className="text-xs text-gray-500">{calorieBalance.today.workout_count} workouts logged</p>
              </div>
            </div>

            {calorieBalance.calorie_profile.explanation.target_description && (
              <div className="bg-blue-100 border-l-4 border-blue-500 p-3 mb-4">
                <p className="text-sm font-medium text-blue-900">
                  {calorieBalance.calorie_profile.explanation.target_description}
                </p>
              </div>
            )}

            {calorieBalance.tips && calorieBalance.tips.length > 0 && (
              <div className="space-y-2">
                {calorieBalance.tips.map((tip: string, index: number) => (
                  <div key={index} className="flex items-start space-x-2 text-sm">
                    <span className="text-blue-600">💡</span>
                    <p className="text-gray-700">{tip}</p>
                  </div>
                ))}
              </div>
            )}

            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-blue-700 hover:text-blue-800 font-medium">
                View Calculation Details
              </summary>
              <div className="mt-3 space-y-2 text-sm text-gray-700 bg-white rounded-lg p-4">
                {calorieBalance.calorie_profile.bmr && (
                  <p>• BMR (Basal Metabolic Rate): {calorieBalance.calorie_profile.bmr} cal/day</p>
                )}
                {calorieBalance.calorie_profile.tdee && (
                  <p>• TDEE (Total Daily Energy Expenditure): {calorieBalance.calorie_profile.tdee} cal/day</p>
                )}
                {calorieBalance.calorie_profile.daily_deficit_surplus !== 0 && (
                  <p>• Daily {calorieBalance.calorie_profile.daily_deficit_surplus < 0 ? 'Deficit' : 'Surplus'}: {Math.abs(calorieBalance.calorie_profile.daily_deficit_surplus)} cal/day</p>
                )}
                {calorieBalance.calorie_profile.weekly_goal && (
                  <p>• Weekly Goal: {Math.abs(calorieBalance.calorie_profile.weekly_goal)} lb/week ({calorieBalance.calorie_profile.weekly_goal < 0 ? 'loss' : 'gain'})</p>
                )}
                <p className="text-xs text-gray-500 mt-2 pt-2 border-t">
                  These calculations use the Mifflin-St Jeor equation and your activity level.
                  Update your profile to adjust your targets.
                </p>
              </div>
            </details>
          </div>
        )}

        {nutritionStats && nutritionStats.total_protein !== undefined && (
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Today's Macronutrient Breakdown</h2>
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="w-full md:w-1/2">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Protein', value: nutritionStats.total_protein || 0, color: '#ef4444' },
                        { name: 'Carbs', value: nutritionStats.total_carbohydrates || 0, color: '#f59e0b' },
                        { name: 'Fats', value: nutritionStats.total_fats || 0, color: '#10b981' }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[
                        { name: 'Protein', value: nutritionStats.total_protein || 0, color: '#ef4444' },
                        { name: 'Carbs', value: nutritionStats.total_carbohydrates || 0, color: '#f59e0b' },
                        { name: 'Fats', value: nutritionStats.total_fats || 0, color: '#10b981' }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="w-full md:w-1/2 space-y-4">
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-red-500 rounded"></div>
                      <span className="font-medium text-gray-700">Protein</span>
                    </div>
                    <span className="text-xl font-bold text-red-600">{nutritionStats.total_protein || 0}g</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">4 cal/gram = {(nutritionStats.total_protein || 0) * 4} calories</p>
                </div>
                
                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-orange-500 rounded"></div>
                      <span className="font-medium text-gray-700">Carbohydrates</span>
                    </div>
                    <span className="text-xl font-bold text-orange-600">{nutritionStats.total_carbohydrates || 0}g</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">4 cal/gram = {(nutritionStats.total_carbohydrates || 0) * 4} calories</p>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <span className="font-medium text-gray-700">Fats</span>
                    </div>
                    <span className="text-xl font-bold text-green-600">{nutritionStats.total_fats || 0}g</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">9 cal/gram = {(nutritionStats.total_fats || 0) * 9} calories</p>
                </div>

                {nutritionStats.total_fiber && nutritionStats.total_fiber > 0 && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-blue-500 rounded"></div>
                        <span className="font-medium text-gray-700">Fiber</span>
                      </div>
                      <span className="text-xl font-bold text-blue-600">{nutritionStats.total_fiber}g</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Goal: 25-30g per day</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                💡 <strong>Macro Tip:</strong> A balanced diet typically consists of 
                <span className="font-medium"> 30% protein, 40% carbs, 30% fats</span> for general health.
                Adjust based on your specific goals!
              </p>
            </div>
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



