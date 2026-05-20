import React, { useEffect, useState } from 'react';
import { savingsAPI } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, X, PiggyBank, Trash2, Edit2, Target, TrendingUp,
  Plane, GraduationCap, Laptop, Heart, Briefcase, Car, Home,
  BarChart3, Gift, Trophy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

const GOAL_CATEGORIES = [
  { value: 'Emergency Fund', icon: Target, color: '#ef4444' },
  { value: 'Travel', icon: Plane, color: '#3b82f6' },
  { value: 'Education', icon: GraduationCap, color: '#8b5cf6' },
  { value: 'Gadgets', icon: Laptop, color: '#06b6d4' },
  { value: 'Wedding', icon: Heart, color: '#ec4899' },
  { value: 'Business', icon: Briefcase, color: '#f59e0b' },
  { value: 'Car', icon: Car, color: '#f97316' },
  { value: 'House', icon: Home, color: '#10b981' },
  { value: 'Investment', icon: BarChart3, color: '#6366f1' },
  { value: 'Others', icon: Gift, color: '#94a3b8' },
];

const Savings = () => {
  const [goals, setGoals] = useState([]);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [addAmountId, setAddAmountId] = useState(null);
  const [addAmount, setAddAmount] = useState('');
  const [formData, setFormData] = useState({
    name: '', targetAmount: '', category: 'Emergency Fund',
    description: '', targetDate: '', color: '#ef4444'
  });

  useEffect(() => {
    fetchGoals();
    fetchOverview();
  }, []);

  const fetchGoals = async () => {
    try {
      const res = await savingsAPI.getAll({ status: 'active' });
      setGoals(res.data.goals || []);
    } catch (error) {
      toast.error('Failed to load savings goals');
    } finally {
      setLoading(false);
    }
  };

  const fetchOverview = async () => {
    try {
      const res = await savingsAPI.getOverview();
      setOverview(res.data.overview);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...formData, targetAmount: parseFloat(formData.targetAmount) };
      if (editingId) {
        await savingsAPI.update(editingId, data);
        toast.success('Goal updated');
      } else {
        await savingsAPI.create(data);
        toast.success('Savings goal created');
      }
      setShowForm(false);
      setEditingId(null);
      resetForm();
      fetchGoals();
      fetchOverview();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleAddSavings = async (goalId) => {
    if (!addAmount || parseFloat(addAmount) <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    try {
      await savingsAPI.addSavings(goalId, { amount: parseFloat(addAmount) });
      toast.success('Savings added!');
      setAddAmountId(null);
      setAddAmount('');
      fetchGoals();
      fetchOverview();
    } catch (error) {
      toast.error('Failed to add savings');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this savings goal?')) return;
    try {
      await savingsAPI.delete(id);
      toast.success('Goal deleted');
      fetchGoals();
      fetchOverview();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', targetAmount: '', category: 'Emergency Fund', description: '', targetDate: '', color: '#ef4444' });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount || 0);
  };

  const getCategoryInfo = (catName) => GOAL_CATEGORIES.find(c => c.value === catName) || GOAL_CATEGORIES[9];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Savings Goals</h1>
          <p className="text-slate-400 text-sm mt-1">Save towards your dreams and goals</p>
        </div>
        <Button onClick={() => { setShowForm(true); setEditingId(null); resetForm(); }} className="bg-emerald-500 hover:bg-emerald-600 text-white">
          <Plus className="w-4 h-4 mr-2" /> New Goal
        </Button>
      </div>

      {overview && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <p className="text-slate-400 text-sm">Total Target</p>
            <p className="text-xl font-bold text-white mt-1">{formatCurrency(overview.totalTarget)}</p>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <p className="text-slate-400 text-sm">Total Saved</p>
            <p className="text-xl font-bold text-emerald-400 mt-1">{formatCurrency(overview.totalSaved)}</p>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <p className="text-slate-400 text-sm">Remaining</p>
            <p className="text-xl font-bold text-blue-400 mt-1">{formatCurrency(overview.totalRemaining)}</p>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <p className="text-slate-400 text-sm">Completed</p>
            <p className="text-xl font-bold text-amber-400 mt-1">{overview.completedGoals} / {overview.totalGoals}</p>
          </div>
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">{editingId ? 'Edit Goal' : 'Create Savings Goal'}</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Goal Name</Label>
                <Input value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="e.g., New iPhone" className="bg-slate-800 border-slate-700 text-white" required />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Target Amount (₦)</Label>
                <Input type="number" value={formData.targetAmount} onChange={(e) => setFormData(p => ({ ...p, targetAmount: e.target.value }))} placeholder="1000000" className="bg-slate-800 border-slate-700 text-white" required min="0" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Category</Label>
                <select value={formData.category} onChange={(e) => {
                  const cat = GOAL_CATEGORIES.find(c => c.value === e.target.value);
                  setFormData(p => ({ ...p, category: e.target.value, color: cat?.color || '#94a3b8' }));
                }} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500">
                  {GOAL_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.value}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Target Date</Label>
                <Input type="date" value={formData.targetDate} onChange={(e) => setFormData(p => ({ ...p, targetDate: e.target.value }))} className="bg-slate-800 border-slate-700 text-white" required />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label className="text-slate-300">Description (Optional)</Label>
                <Input value={formData.description} onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} placeholder="Why are you saving for this?" className="bg-slate-800 border-slate-700 text-white" />
              </div>
              <div className="sm:col-span-2 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="border-slate-700 text-slate-300">Cancel</Button>
                <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white">{editingId ? 'Update' : 'Create'} Goal</Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div></div>
      ) : goals.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-2xl">
          <Target className="w-14 h-14 mx-auto text-slate-600 mb-3" />
          <h3 className="text-lg font-medium text-slate-300">No savings goals yet</h3>
          <p className="text-sm text-slate-500 mt-1">Create a goal to start saving</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {goals.map((goal) => {
            const catInfo = getCategoryInfo(goal.category);
            const IconComponent = catInfo.icon;
            const pct = goal.percentage || 0;
            return (
              <motion.div key={goal._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${goal.color || catInfo.color}20` }}>
                      <IconComponent className="w-6 h-6" style={{ color: goal.color || catInfo.color }} />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white">{goal.name}</h3>
                      <p className="text-xs text-slate-400">{goal.category} • {goal.daysLeft > 0 ? `${goal.daysLeft} days left` : 'Overdue'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleDelete(goal._id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium" style={{ color: goal.color || catInfo.color }}>{pct}%</span>
                    <span className="text-sm text-slate-400">{formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}</span>
                  </div>
                  <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(100, pct)}%`, backgroundColor: goal.color || catInfo.color }} />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {addAmountId === goal._id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input type="number" value={addAmount} onChange={(e) => setAddAmount(e.target.value)} placeholder="Amount" className="bg-slate-800 border-slate-700 text-white h-9" autoFocus />
                      <Button size="sm" onClick={() => handleAddSavings(goal._id)} className="bg-emerald-500 hover:bg-emerald-600 text-white h-9">Add</Button>
                      <Button size="sm" variant="outline" onClick={() => { setAddAmountId(null); setAddAmount(''); }} className="border-slate-700 text-slate-300 h-9">Cancel</Button>
                    </div>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => setAddAmountId(goal._id)} className="border-slate-700 text-slate-300 hover:bg-slate-800 flex-1">
                      <TrendingUp className="w-3.5 h-3.5 mr-1.5" /> Add Savings
                    </Button>
                  )}
                </div>

                {goal.milestones && goal.milestones.some(m => m.achieved) && (
                  <div className="mt-3 flex items-center gap-1 flex-wrap">
                    {goal.milestones.filter(m => m.achieved).map(m => (
                      <span key={m.percentage} className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-xs rounded-full">
                        <Trophy className="w-3 h-3" /> {m.percentage}%
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default Savings;
