import React, { useEffect, useState } from 'react';
import { expenseAPI, budgetAPI, dashboardAPI } from '../services/api';
import { motion } from 'framer-motion';
import {
  BarChart3, TrendingUp, PieChart as PieChartIcon, DollarSign, Calendar, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend
} from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316', '#6366f1', '#14b8a6'];

const Analytics = () => {
  const [expenseStats, setExpenseStats] = useState(null);
  const [budgetOverview, setBudgetOverview] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, budgetRes, dashRes] = await Promise.all([
        expenseAPI.getStats(),
        budgetAPI.getOverview(),
        dashboardAPI.getDashboard()
      ]);
      setExpenseStats(statsRes.data.stats);
      setBudgetOverview(budgetRes.data.overview);
      setDashboard(dashRes.data.dashboard);
    } catch (error) {
      console.error('Analytics error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount || 0);
  };

  const categoryData = expenseStats?.categoryBreakdown?.map(c => ({
    name: c._id,
    value: c.total,
    count: c.count
  })) || [];

  const dailyData = expenseStats?.dailySpending?.map(d => ({
    date: d._id.slice(5),
    amount: d.total
  })) || [];

  const paymentData = expenseStats?.paymentMethodBreakdown?.map(p => ({
    name: p._id || 'Unknown',
    value: p.total
  })) || [];

  const budgetData = budgetOverview?.byCategory?.map(b => ({
    name: b.name,
    budget: b.amount,
    spent: b.spent,
    remaining: b.remaining
  })) || [];

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
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-slate-400 text-sm mt-1">Deep insights into your spending patterns</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-1">
          {['week', 'month', 'year'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                timeRange === range
                  ? 'bg-emerald-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Spent" value={formatCurrency(expenseStats?.currentMonthTotal)} icon={<DollarSign className="w-5 h-5" />} color="emerald" />
        <KPICard title="Transactions" value={expenseStats?.transactionCount || 0} icon={<BarChart3 className="w-5 h-5" />} color="blue" />
        <KPICard title="Avg. Transaction" value={formatCurrency(parseFloat(expenseStats?.averageTransaction || 0))} icon={<TrendingUp className="w-5 h-5" />} color="amber" />
        <KPICard
          title="vs Last Month"
          value={`${Math.abs(parseFloat(expenseStats?.monthOverMonthChange || 0)).toFixed(1)}%`}
          icon={parseFloat(expenseStats?.monthOverMonthChange || 0) >= 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
          color={parseFloat(expenseStats?.monthOverMonthChange || 0) >= 0 ? 'red' : 'emerald'}
          subtitle={parseFloat(expenseStats?.monthOverMonthChange || 0) >= 0 ? 'Increase' : 'Decrease'}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Spending by Category</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" stroke="#475569" fontSize={12} tickFormatter={(v) => `₦${v/1000}k`} />
                <YAxis dataKey="name" type="category" stroke="#475569" fontSize={11} width={100} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }} formatter={(value) => [`₦${value.toLocaleString()}`, 'Amount']} />
                <Bar dataKey="value" fill="#10b981" radius={[0, 6, 6, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Payment Methods</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={paymentData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value">
                  {paymentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }} formatter={(value) => [`₦${value.toLocaleString()}`, 'Amount']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Daily Trend */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Daily Spending Trend</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyData}>
              <defs>
                <linearGradient id="colorDaily" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#475569" fontSize={11} />
              <YAxis stroke="#475569" fontSize={12} tickFormatter={(v) => `₦${v/1000}k`} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }} formatter={(value) => [`₦${value.toLocaleString()}`, 'Spent']} />
              <Area type="monotone" dataKey="amount" stroke="#3b82f6" fill="url(#colorDaily)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Budget Utilization */}
      {budgetData.length > 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Budget Utilization</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budgetData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#475569" fontSize={11} />
                <YAxis stroke="#475569" fontSize={12} tickFormatter={(v) => `₦${v/1000}k`} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }} formatter={(value) => [`₦${value.toLocaleString()}`, '']} />
                <Legend />
                <Bar dataKey="budget" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Budget" />
                <Bar dataKey="spent" fill="#ef4444" radius={[4, 4, 0, 0]} name="Spent" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </motion.div>
  );
};

const KPICard = ({ title, value, subtitle, icon, color }) => {
  const colors = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
  };
  return (
    <div className={`p-5 rounded-2xl border ${colors[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-slate-400 text-sm">{title}</span>
        <div className={`p-2 rounded-lg ${colors[color]}`}>{icon}</div>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
    </div>
  );
};

export default Analytics;
