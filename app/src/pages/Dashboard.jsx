import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI } from '../services/api';
import { motion } from 'framer-motion';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Target,
  Bell,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  Calendar
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { Link } from 'react-router';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316'];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await dashboardAPI.getDashboard();
      setDashboard(res.data.dashboard);
    } catch (error) {
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const summary = dashboard?.summary || {};
  const categoryData = dashboard?.categoryBreakdown?.map(c => ({
    name: c._id,
    value: c.amount
  })) || [];

  const dailyData = dashboard?.dailyTrend?.map(d => ({
    date: d._id.slice(5),
    amount: d.amount
  })) || [];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">
            Welcome back, {user?.firstName || 'Friend'}! Here's your financial overview.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-white">Score: {dashboard?.softLifeScore || 0}</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl">
            <Target className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-white">Streak: {dashboard?.streakDays || 0}d</span>
          </div>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Monthly Spending"
          value={formatCurrency(summary.totalMonthlySpent)}
          icon={<Receipt className="w-5 h-5" />}
          trend={summary.monthOverMonthChange}
          trendLabel="vs last month"
          color="emerald"
        />
        <SummaryCard
          title="Budget Used"
          value={`${summary.totalBudget > 0 ? Math.round((summary.totalBudgetSpent / summary.totalBudget) * 100) : 0}%`}
          subtitle={`${formatCurrency(summary.totalBudgetSpent)} / ${formatCurrency(summary.totalBudget)}`}
          icon={<Wallet className="w-5 h-5" />}
          color="blue"
        />
        <SummaryCard
          title="Savings Progress"
          value={`${summary.savingsProgress || 0}%`}
          subtitle={`${formatCurrency(summary.totalSavingsCurrent)} saved`}
          icon={<PiggyBank className="w-5 h-5" />}
          color="amber"
        />
        <SummaryCard
          title="Weekly Spending"
          value={formatCurrency(summary.totalWeeklySpent)}
          icon={<TrendingUp className="w-5 h-5" />}
          color="purple"
        />
      </motion.div>

      {/* Charts Row */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spending Trend Chart */}
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Daily Spending Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#475569" fontSize={12} />
                <YAxis stroke="#475569" fontSize={12} tickFormatter={(v) => `₦${v/1000}k`} />
                <Tooltip
  contentStyle={{
    backgroundColor: '#0f172a',
    border: '1px solid #1e293b',
    borderRadius: '12px',
    color: '#fff'
  }}
  itemStyle={{
    color: '#e2e8f0'
  }}
  labelStyle={{
    color: '#94a3b8'
  }}
  cursor={{ stroke: '#334155', strokeWidth: 1 }}
  formatter={(value, name) => [
    `₦${value.toLocaleString()}`,
    name
  ]}
/>
                <Area type="monotone" dataKey="amount" stroke="#10b981" fillOpacity={1} fill="url(#colorAmount)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Spending by Category</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #1e293b',
                    borderRadius: '12px',
                    color: '#fff'
                  }}
                  itemStyle={{
                    color: '#e2e8f0'
                  }}
                  labelStyle={{
                    color: '#94a3b8'
                  }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  formatter={(value, name) => [
                    `₦${value.toLocaleString()}`,
                    name
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2 max-h-32 overflow-y-auto">
            {categoryData.slice(0, 4).map((cat, i) => (
              <div key={cat.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-sm text-slate-300">{cat.name}</span>
                </div>
                <span className="text-sm text-slate-400">₦{(cat.value / 1000).toFixed(0)}k</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Bottom Row */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Recent Transactions</h3>
            <Link
              to="/expenses"
              className="text-sm text-emerald-400 hover:text-emerald-300"
            >
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {dashboard?.recentTransactions?.length > 0 ? (
              dashboard.recentTransactions.slice(0, 5).map((tx) => (
                <div key={tx._id} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800/60 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                      <Receipt className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{tx.title}</p>
                      <p className="text-xs text-slate-400">{tx.category}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-red-400">-{formatCurrency(tx.amount)}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-slate-500">
                <Receipt className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No transactions yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Reminders */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Upcoming Reminders</h3>
            <Link
              to="/reminders"
              className="text-sm text-emerald-400 hover:text-emerald-300"
            >
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {dashboard?.upcomingReminders?.length > 0 ? (
              dashboard.upcomingReminders.slice(0, 5).map((reminder) => (
                <div key={reminder._id} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800/60 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/15 flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{reminder.title}</p>
                      <p className="text-xs text-slate-400">{reminder.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {reminder.amount > 0 && (
                      <p className="text-sm font-medium text-white">{formatCurrency(reminder.amount)}</p>
                    )}
                    <p className="text-xs text-slate-500">{new Date(reminder.dueDate).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-slate-500">
                <Bell className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No upcoming reminders</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const SummaryCard = ({ title, value, subtitle, icon, trend, trendLabel, color }) => {
  const colorClasses = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`p-5 rounded-2xl border ${colorClasses[color]} backdrop-blur-sm`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-slate-400 text-sm">{title}</span>
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      {trend !== undefined && (
        <div className="flex items-center gap-1 mt-2">
          {parseFloat(trend) >= 0 ? (
            <ArrowUpRight className="w-3 h-3 text-red-400" />
          ) : (
            <ArrowDownRight className="w-3 h-3 text-emerald-400" />
          )}
          <span className={`text-xs ${parseFloat(trend) >= 0 ? 'text-red-400' : 'text-emerald-400'}`}>
            {Math.abs(parseFloat(trend)).toFixed(1)}%
          </span>
          <span className="text-xs text-slate-500">{trendLabel}</span>
        </div>
      )}
    </motion.div>
  );
};

export default Dashboard;
