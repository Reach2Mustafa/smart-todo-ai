"use client"
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Calendar, CheckCircle, Clock, AlertCircle, User, BarChart3, TrendingUp, Target, Star, Flame, BookOpen, Plus, Filter, Search, ArrowRight, ChevronRight, MapPin, Bell, Settings, Zap, Award, Activity, Users, Home, Briefcase, Heart, Brain, Flag } from 'lucide-react';
import getDashboardData from '@/api/getDashboardData';
import { useUser } from '@/redux/userContext';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const {state}=useUser()
  const user=state.user

  // Mock data - replace with your actual API call
 
useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                

                const data = await getDashboardData();
                setDashboardData(data);
            } catch (err) {
                console.error("Failed to fetch dashboard data:", err);
              
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Health': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'Personal': 'bg-blue-100 text-blue-800 border-blue-200',
      'Work': 'bg-purple-100 text-purple-800 border-purple-200',
      'Personal Development': 'bg-amber-100 text-amber-800 border-amber-200'
    };
    return colors[category] || 'bg-slate-100 text-slate-800 border-slate-200';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Health': Heart,
      'Personal': Home,
      'Work': Briefcase,
      'Personal Development': Brain
    };
    return icons[category] || Activity;
  };

  const getPriorityColor = (priority) => {
    if (priority >= 9) return 'bg-red-100 text-red-800 border-red-200';
    if (priority >= 7) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (priority >= 5) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };
   const getPriorityLabel = (priority) => {
        const priorityNum = parseInt(priority);
        if (priorityNum >= 9) {
            return "Critical";
        } else if (priorityNum >= 7) {
            return "High";
        } else if (priorityNum >= 5) {
            return "Medium";
        } else if (priorityNum >= 3) {
            return "Low";
        } else if (priorityNum >= 1) {
            return "Very Low";
        } else {
            return "No Priority";
        }
    };

  const getTimeRemaining = (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h`;
    return 'Overdue';
  };

  const getUrgencyColor = (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days < 0) return 'bg-red-100 text-red-800 border-red-200'; // Overdue
    if (days === 0) return 'bg-orange-100 text-orange-800 border-orange-200'; // Due today
    if (days <= 3) return 'bg-yellow-100 text-yellow-800 border-yellow-200'; // Due soon
    return 'bg-green-100 text-green-800 border-green-200'; // Not urgent
  };

  const LoadingSkeleton = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-2 md:p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="h-8 bg-slate-200 rounded-lg w-64 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-xl animate-pulse"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-slate-200 rounded-xl animate-pulse"></div>
          <div className="h-96 bg-slate-200 rounded-xl animate-pulse"></div>
        </div>
      </div>
    </div>
  );

  if (isLoading) return <LoadingSkeleton />;

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl border border-slate-200">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Failed to load dashboard</h2>
          <p className="text-slate-600 mb-4">Unable to fetch your task data</p>
          <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const { summary, week_tasks, upcoming_deadlines, charts, streak, behavior, next_best_task } = dashboardData;

  // Combine all tasks and remove duplicates


  return (
    <div className="min-h-screen bg-gradient-to-br font-overusedGrotesk from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto p-2 md:p-4 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Target className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Hey {user.full_name.split(" ")[0]}</h1>
              <p className="text-slate-600">You have {summary.pending} pending tasks</p>
            </div>
          </div>
          
       
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Total
              </Badge>
            </div>
            <p className="text-2xl font-bold text-slate-900">{summary.total}</p>
            <p className="text-sm text-slate-600">All Tasks</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                Pending
              </Badge>
            </div>
            <p className="text-2xl font-bold text-orange-600">{summary.pending}</p>
            <p className="text-sm text-slate-600">Need Action</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                Done
              </Badge>
            </div>
            <p className="text-2xl font-bold text-emerald-600">{summary.done}</p>
            <p className="text-sm text-slate-600">Completed</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Flame className="h-5 w-5 text-purple-600" />
              </div>
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                Streak
              </Badge>
            </div>
            <p className="text-2xl font-bold text-purple-600">{streak}</p>
            <p className="text-sm text-slate-600">Days Active</p>
          </div>
        </div>

        {/* Next Best Task Highlight */}
        {next_best_task && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-2xl text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Next Best Task</h3>
                  <p className="text-blue-100">Recommended for you</p>
                </div>
              </div>
              <Button variant="secondary" size="sm">
                Start Now
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
            <div className="mt-4 bg-white/10 p-2 rounded-xl">
              <h4 className="font-medium mb-2">{next_best_task.title}</h4>
              <div className="flex items-center gap-3 text-sm text-blue-100">
                <span>Priority: {next_best_task.priority}</span>
                <span>•</span>
                <span>Due: {formatDate(next_best_task.deadline)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Tasks List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-slate-900">Weekly Tasks</h2>
              
              </div>
              
              <div className="space-y-3">
                {week_tasks && week_tasks.length > 0 ? week_tasks.map((task) => {
                  const CategoryIcon = getCategoryIcon(task.category);
                  return (
                    <div key={task.id} className="group p-2 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${getCategoryColor(task.category)}`}>
                          <CategoryIcon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
                            {task.title}
                          </h3>
                          <p className="text-sm text-slate-600 mt-1 line-clamp-2">{task.description}</p>
                          <div className="flex items-center gap-2 mt-3">
                            <Badge variant="outline" className={getCategoryColor(task.category)}>
                              {task.category}
                            </Badge>
                            <Badge variant="outline" className={getPriorityColor(task.priority)}>
                              {getPriorityLabel(task.priority)}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="text-xs text-slate-500">
                            {getTimeRemaining(task.deadline)}
                          </span>
                          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                }):<div className="text-center py-4">
                    <Clock className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">No upcoming Tasks</p>
                  </div>}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Upcoming Deadlines */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900">Upcoming Deadlines</h3>
                <AlertCircle className="h-5 w-5 text-orange-500" />
              </div>
              <div className="space-y-3">
                {upcoming_deadlines && upcoming_deadlines.length > 0 ? (
                  upcoming_deadlines.slice(0, 5).map((task) => {
                    const CategoryIcon = getCategoryIcon(task.category);
                    return (
                      <div key={task.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${getCategoryColor(task.category)}`}>
                          <CategoryIcon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-slate-900 text-sm truncate">{task.title}</h4>
                          <p className="text-xs text-slate-600">{formatDate(task.deadline)}</p>
                        </div>
                        <Badge variant="outline" className={`text-xs ${getUrgencyColor(task.deadline)}`}>
                          {getTimeRemaining(task.deadline)}
                        </Badge>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-4">
                    <Clock className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">No upcoming deadlines</p>
                  </div>
                )}
              </div>
            </div>

            {/* Category Distribution */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Category Overview</h3>
              <div className="space-y-4">
                {Object.entries(charts.category_distribution).map(([category, count]) => {
                  const CategoryIcon = getCategoryIcon(category);
                  const percentage = (count / summary.total) * 100;
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CategoryIcon className="h-4 w-4 text-slate-600" />
                          <span className="text-sm font-medium text-slate-700">{category}</span>
                        </div>
                        <span className="text-sm text-slate-600">{count}</span>
                      </div>
                      <div className="relative">
                        <Progress value={percentage} className="h-2" />
                        <span className="absolute right-0 top-3 text-xs text-slate-500">
                          {percentage.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Weekly Stats */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Weekly Summary</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Activity className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-slate-700">Active Days</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{behavior.days_active_this_week}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                    <span className="text-sm font-medium text-slate-700">Avg. Tasks/Day</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{behavior.avg_tasks_completed_per_day}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Award className="h-5 w-5 text-purple-600" />
                    <span className="text-sm font-medium text-slate-700">Completion Rate</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">
                    {charts.completion_rate_per_week.length > 0 ? 
                      (charts.completion_rate_per_week[0].rate * 100).toFixed(0) + '%' : 
                      '0%'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start" size="sm">
                  <Bell className="h-4 w-4 mr-3" />
                  Set Reminders
                </Button>
                <Button variant="ghost" className="w-full justify-start" size="sm">
                  <Calendar className="h-4 w-4 mr-3" />
                  View Calendar
                </Button>
                <Button variant="ghost" className="w-full justify-start" size="sm">
                  <BarChart3 className="h-4 w-4 mr-3" />
                  Analytics
                </Button>
                <Button variant="ghost" className="w-full justify-start" size="sm">
                  <Settings className="h-4 w-4 mr-3" />
                  Settings
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;