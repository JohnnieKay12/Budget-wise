import React, { useEffect, useState } from 'react';
import { insightAPI, dashboardAPI } from '../services/api';
import { motion } from 'framer-motion';
import {
  Lightbulb, TrendingUp, AlertTriangle, Target, Sparkles, Shield,
  Zap, BarChart3, CheckCircle, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import {
  convertCurrency,
  formatCurrency
} from '../utils/currency';

const TYPE_CONFIG = {
  spending_pattern: { icon: BarChart3, color: '#3b82f6', label: 'Spending Pattern' },
  saving_tip: { icon: Lightbulb, color: '#f59e0b', label: 'Saving Tip' },
  budget_alert: { icon: AlertTriangle, color: '#ef4444', label: 'Budget Alert' },
  goal_progress: { icon: Target, color: '#10b981', label: 'Goal Progress' },
  overspend_warning: { icon: Shield, color: '#ef4444', label: 'Overspend Warning' },
  trend: { icon: TrendingUp, color: '#8b5cf6', label: 'Trend' },
};

const Insights = () => {
  const { user } = useAuth();

  const displayCurrency = user?.currency || 'NGN';

  const displayAmount = (amount) => {
    const converted = convertCurrency(
      amount,
      'NGN',
      displayCurrency
    );

    return formatCurrency(
      converted,
      displayCurrency
    );
  };
  const [insights, setInsights] = useState([]);
  const [softLifeScore, setSoftLifeScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchInsights();
    fetchSoftLifeScore();
  }, []);

  const fetchInsights = async () => {
    try {
      const res = await insightAPI.getAll();
      setInsights(res.data.insights || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSoftLifeScore = async () => {
    try {
      const res = await dashboardAPI.getSoftLifeScore();
      setSoftLifeScore(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await insightAPI.generate();
      toast.success('New insights generated!');
      fetchInsights();
      fetchSoftLifeScore();
    } catch (error) {
      toast.error('Failed to generate insights');
    } finally {
      setGenerating(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await insightAPI.markAsRead(id);
      setInsights(prev => prev.map(i => i._id === id ? { ...i, isRead: true } : i));
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Insights</h1>
          <p className="text-slate-400 text-sm mt-1">Smart analysis of your financial habits</p>
        </div>
        <Button onClick={handleGenerate} disabled={generating} className="bg-emerald-500 hover:bg-emerald-600 text-white">
          {generating ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analyzing...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> Generate Insights
            </div>
          )}
        </Button>
      </div>

      {/* Soft Life Score Card */}
      {softLifeScore && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative w-28 h-28 flex-shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" stroke="#1e293b" strokeWidth="8" fill="none" />
                <circle cx="50" cy="50" r="42" stroke="#10b981" strokeWidth="8" fill="none"
                  strokeDasharray={`${(softLifeScore.score / 100) * 264} 264`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-white">{softLifeScore.score}</span>
                <span className="text-xs text-slate-400">/ 100</span>
              </div>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-semibold text-white">Soft Life Score: {softLifeScore.level}</h3>
              </div>
              <p className="text-sm text-slate-400 mb-3">
                Your financial wellness score based on budgeting, savings, consistency, and tracking habits.
              </p>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                {Object.entries(softLifeScore.breakdown || {}).map(([key, value]) => (
                  <span key={key} className="px-3 py-1 bg-slate-800 rounded-full text-xs text-slate-300 capitalize">
                    {key}: <span className="text-emerald-400 font-medium">+{value}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Insights List */}
      {insights.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-2xl">
          <Lightbulb className="w-14 h-14 mx-auto text-slate-600 mb-3" />
          <h3 className="text-lg font-medium text-slate-300">No insights yet</h3>
          <p className="text-sm text-slate-500 mt-1 mb-4">Generate AI-powered insights based on your spending data</p>
          <Button onClick={handleGenerate} disabled={generating} className="bg-emerald-500 hover:bg-emerald-600 text-white">
            <Sparkles className="w-4 h-4 mr-2" /> Generate Now
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {insights.map((insight) => {
            const config = TYPE_CONFIG[insight.type] || TYPE_CONFIG.trend;
            const Icon = config.icon;
            return (
              <motion.div
                key={insight._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-5 rounded-2xl border transition-all ${
                  insight.isRead
                    ? 'bg-slate-900/30 border-slate-800/50 opacity-60'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${config.color}20` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: config.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: `${config.color}20`, color: config.color }}>
                        {config.label}
                      </span>
                      <span className="text-xs text-slate-500">
                        {new Date(insight.createdAt).toLocaleDateString()}
                      </span>
                      {insight.severity === 'high' && (
                        <span className="text-xs text-red-400 font-medium">High Priority</span>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-white mb-1">{insight.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{insight.description}</p>
                    {!insight.isRead && (
                      <button
                        onClick={() => handleMarkRead(insight._id)}
                        className="mt-2 text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
                      >
                        <CheckCircle className="w-3 h-3" /> Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default Insights;
