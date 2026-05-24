import React, { useEffect, useState } from 'react';
import { budgetAPI } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, X, Wallet, Trash2, Edit2, AlertTriangle, CheckCircle,
  Car, UtensilsCrossed, Fuel, Smartphone, Wifi, Users, Church, Home,
  Zap, ShoppingCart, Heart, GraduationCap, CreditCard, MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import {
  convertCurrency,
  formatCurrency
} from '../utils/currency';

const CATEGORIES = [
  'Transport', 'Bolt/Uber', 'Food & Jollof', 'Generator Fuel', 'POS Charges',
  'Airtime', 'Data Subscription', 'Family Support', 'Church Offering', 'Rent',
  'NEPA Bills', 'Groceries', 'Entertainment', 'Healthcare', 'Education',
  'Shopping', 'Bills', 'Others', 'All Categories'
];

const PERIODS = ['weekly', 'monthly', 'yearly'];

const Budgets = () => {
  const { user } = useAuth();
  const displayCurrency = user?.currency || 'NGN';
  const [budgets, setBudgets] = useState([]);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category: 'Food & Jollof',
    period: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
    alertThreshold: 80
  });

  useEffect(() => {
    fetchBudgets();
    fetchOverview();
  }, []);

  const fetchBudgets = async () => {
    try {
      const res = await budgetAPI.getAll();
      setBudgets(res.data.budgets || []);
    } catch (error) {
      toast.error('Failed to load budgets');
    } finally {
      setLoading(false);
    }
  };

  const fetchOverview = async () => {
    try {
      const res = await budgetAPI.getOverview();
      setOverview(res.data.overview);
    } catch (error) {
      console.error('Overview error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...formData, amount: parseFloat(formData.amount), alertThreshold: parseInt(formData.alertThreshold) };
      if (editingId) {
        await budgetAPI.update(editingId, data);
        toast.success('Budget updated');
      } else {
        await budgetAPI.create(data);
        toast.success('Budget created');
      }
      setShowForm(false);
      setEditingId(null);
      resetForm();
      fetchBudgets();
      fetchOverview();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this budget?')) return;
    try {
      await budgetAPI.delete(id);
      toast.success('Budget deleted');
      fetchBudgets();
      fetchOverview();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const handleEdit = (budget) => {
    setFormData({
      name: budget.name,
      amount: budget.amount.toString(),
      category: budget.category,
      period: budget.period,
      startDate: new Date(budget.startDate).toISOString().split('T')[0],
      endDate: new Date(budget.endDate).toISOString().split('T')[0],
      alertThreshold: budget.alertThreshold
    });
    setEditingId(budget._id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '', amount: '', category: 'Food & Jollof', period: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
      alertThreshold: 80
    });
  };

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

  const getProgressColor = (percentage, threshold) => {
    if (percentage >= 95) return 'bg-red-500';
    if (percentage >= threshold) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Budgets</h1>
          <p className="text-slate-400 text-sm mt-1">Set and track your spending limits</p>
        </div>
        <Button onClick={() => { setShowForm(true); setEditingId(null); resetForm(); }} className="bg-emerald-500 hover:bg-emerald-600 text-white">
          <Plus className="w-4 h-4 mr-2" /> Create Budget
        </Button>
      </div>

      {/* Overview */}
      {overview && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <p className="text-slate-400 text-sm">Total Budget</p>
            <p className="text-2xl font-bold text-white mt-1">{displayAmount(overview.totalBudget)}</p>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <p className="text-slate-400 text-sm">Total Spent</p>
            <p className="text-2xl font-bold text-red-400 mt-1">{displayAmount(overview.totalSpent)}</p>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <p className="text-slate-400 text-sm">Remaining</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{displayAmount(overview.totalRemaining)}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">{editingId ? 'Edit Budget' : 'New Budget'}</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Budget Name</Label>
                <Input value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="e.g., Monthly Food" className="bg-slate-800 border-slate-700 text-white" required />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Amount (₦)</Label>
                <Input type="number" value={formData.amount} onChange={(e) => setFormData(p => ({ ...p, amount: e.target.value }))} placeholder="50000" className="bg-slate-800 border-slate-700 text-white" required min="0" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Category</Label>
                <select value={formData.category} onChange={(e) => setFormData(p => ({ ...p, category: e.target.value }))} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Period</Label>
                <select value={formData.period} onChange={(e) => setFormData(p => ({ ...p, period: e.target.value }))} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500">
                  {PERIODS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Start Date</Label>
                <Input type="date" value={formData.startDate} onChange={(e) => setFormData(p => ({ ...p, startDate: e.target.value }))} className="bg-slate-800 border-slate-700 text-white" required />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">End Date</Label>
                <Input type="date" value={formData.endDate} onChange={(e) => setFormData(p => ({ ...p, endDate: e.target.value }))} className="bg-slate-800 border-slate-700 text-white" required />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Alert Threshold (%)</Label>
                <Input type="number" value={formData.alertThreshold} onChange={(e) => setFormData(p => ({ ...p, alertThreshold: e.target.value }))} className="bg-slate-800 border-slate-700 text-white" min="1" max="100" />
              </div>
              <div className="sm:col-span-2 flex justify-end gap-3 mt-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="border-slate-700 text-slate-300">Cancel</Button>
                <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white">{editingId ? 'Update' : 'Create'} Budget</Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Budgets Grid */}
      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div></div>
      ) : budgets.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-2xl">
          <Wallet className="w-14 h-14 mx-auto text-slate-600 mb-3" />
          <h3 className="text-lg font-medium text-slate-300">No budgets yet</h3>
          <p className="text-sm text-slate-500 mt-1">Create a budget to start tracking your spending</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {budgets.map((budget) => {
            const pct = budget.percentageUsed || 0;
            const progressColor = getProgressColor(pct, budget.alertThreshold);
            return (
              <motion.div
                key={budget._id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-white">{budget.name}</h3>
                      {budget.alertSent && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{budget.category} • {budget.period}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleEdit(budget)} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(budget._id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-slate-400">{pct}% used</span>
                    <span className="text-sm text-slate-300">{displayAmount(budget.spent)} / {displayAmount(budget.amount)}</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    {new Date(budget.startDate).toLocaleDateString()} - {new Date(budget.endDate).toLocaleDateString()}
                  </span>
                  <span className={`text-xs font-medium ${pct >= budget.alertThreshold ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {displayAmount(budget.remaining || 0)} left
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default Budgets;
