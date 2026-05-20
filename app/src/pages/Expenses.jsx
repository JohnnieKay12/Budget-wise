import React, { useEffect, useState } from 'react';
import { expenseAPI } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Filter, Trash2, Edit2, X, Receipt,
  Car, UtensilsCrossed, Fuel, Smartphone, Wifi, Users, Church, Home,
  Zap, ShoppingCart, Heart, GraduationCap, CreditCard, MoreHorizontal, Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const CATEGORIES = [
  { value: 'Transport', icon: Car, color: '#3b82f6' },
  { value: 'Bolt/Uber', icon: Car, color: '#6366f1' },
  { value: 'Food & Jollof', icon: UtensilsCrossed, color: '#f59e0b' },
  { value: 'Generator Fuel', icon: Fuel, color: '#ef4444' },
  { value: 'POS Charges', icon: CreditCard, color: '#8b5cf6' },
  { value: 'Airtime', icon: Smartphone, color: '#10b981' },
  { value: 'Data Subscription', icon: Wifi, color: '#06b6d4' },
  { value: 'Family Support', icon: Users, color: '#ec4899' },
  { value: 'Church Offering', icon: Church, color: '#f97316' },
  { value: 'Rent', icon: Home, color: '#1d4ed8' },
  { value: 'NEPA Bills', icon: Zap, color: '#eab308' },
  { value: 'Groceries', icon: ShoppingCart, color: '#22c55e' },
  { value: 'Entertainment', icon: Zap, color: '#a855f7' },
  { value: 'Healthcare', icon: Heart, color: '#dc2626' },
  { value: 'Education', icon: GraduationCap, color: '#0ea5e9' },
  { value: 'Shopping', icon: ShoppingCart, color: '#d946ef' },
  { value: 'Bills', icon: CreditCard, color: '#64748b' },
  { value: 'Others', icon: MoreHorizontal, color: '#94a3b8' },
];

const PAYMENT_METHODS = ['Cash', 'Card', 'Transfer', 'USSD', 'POS'];

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'Food & Jollof',
    paymentMethod: 'Cash',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchExpenses();
    fetchStats();
  }, [filterCategory, searchTerm]);

  const fetchExpenses = async () => {
    try {
      const params = {};
      if (filterCategory) params.category = filterCategory;
      if (searchTerm) params.search = searchTerm;
      const res = await expenseAPI.getAll(params);
      setExpenses(res.data.expenses || []);
    } catch (error) {
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await expenseAPI.getStats();
      setStats(res.data.stats);
    } catch (error) {
      console.error('Stats error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await expenseAPI.update(editingId, { ...formData, amount: parseFloat(formData.amount) });
        toast.success('Expense updated successfully');
      } else {
        await expenseAPI.create({ ...formData, amount: parseFloat(formData.amount) });
        toast.success('Expense added successfully');
      }
      setShowForm(false);
      setEditingId(null);
      resetForm();
      fetchExpenses();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    try {
      await expenseAPI.delete(id);
      toast.success('Expense deleted');
      fetchExpenses();
      fetchStats();
    } catch (error) {
      toast.error('Failed to delete expense');
    }
  };

  const handleEdit = (expense) => {
    setFormData({
      title: expense.title,
      amount: expense.amount.toString(),
      category: expense.category,
      paymentMethod: expense.paymentMethod,
      description: expense.description || '',
      date: new Date(expense.date).toISOString().split('T')[0]
    });
    setEditingId(expense._id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      amount: '',
      category: 'Food & Jollof',
      paymentMethod: 'Cash',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const getCategoryIcon = (categoryName) => {
    const cat = CATEGORIES.find(c => c.value === categoryName);
    return cat || { icon: Receipt, color: '#94a3b8' };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount || 0);
  };

  const exportToWhatsApp = () => {
    let message = '*BudgetWise - Expense Report*\n\n';
    message += `*Total This Month:* ${formatCurrency(stats?.currentMonthTotal || 0)}\n`;
    message += `*Transactions:* ${stats?.transactionCount || 0}\n\n`;
    message += '*Recent Expenses:*\n';
    expenses.slice(0, 10).forEach((exp, i) => {
      message += `${i + 1}. ${exp.title} - ${formatCurrency(exp.amount)} (${exp.category})\n`;
    });
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Expenses</h1>
          <p className="text-slate-400 text-sm mt-1">Track and manage your spending</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={exportToWhatsApp}
            variant="outline"
            className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
          <Button
            onClick={() => { setShowForm(true); setEditingId(null); resetForm(); }}
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Expense
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <p className="text-slate-400 text-sm">Total This Month</p>
            <p className="text-2xl font-bold text-white mt-1">{formatCurrency(stats.currentMonthTotal)}</p>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <p className="text-slate-400 text-sm">Transactions</p>
            <p className="text-2xl font-bold text-white mt-1">{stats.transactionCount}</p>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <p className="text-slate-400 text-sm">Avg. Transaction</p>
            <p className="text-2xl font-bold text-white mt-1">{formatCurrency(parseFloat(stats.averageTransaction))}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search expenses..."
            className="pl-10 bg-slate-900 border-slate-800 text-white placeholder:text-slate-500"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 text-sm focus:outline-none focus:border-emerald-500"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.value}</option>
          ))}
        </select>
      </div>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                {editingId ? 'Edit Expense' : 'Add New Expense'}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g., Lunch at Chicken Republic"
                  className="bg-slate-800 border-slate-700 text-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Amount (₦)</Label>
                <Input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData(p => ({ ...p, amount: e.target.value }))}
                  placeholder="0.00"
                  className="bg-slate-800 border-slate-700 text-white"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Category</Label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(p => ({ ...p, category: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.value}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Payment Method</Label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData(p => ({ ...p, paymentMethod: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                >
                  {PAYMENT_METHODS.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Date</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(p => ({ ...p, date: e.target.value }))}
                  className="bg-slate-800 border-slate-700 text-white"
                  required
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label className="text-slate-300">Description (Optional)</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                  placeholder="Add a note..."
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div className="sm:col-span-2 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="border-slate-700 text-slate-300">
                  Cancel
                </Button>
                <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white">
                  {editingId ? 'Update' : 'Add'} Expense
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expenses List */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          </div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-2xl">
            <Receipt className="w-14 h-14 mx-auto text-slate-600 mb-3" />
            <h3 className="text-lg font-medium text-slate-300">No expenses yet</h3>
            <p className="text-sm text-slate-500 mt-1">Add your first expense to get started</p>
          </div>
        ) : (
          expenses.map((expense) => {
            const catInfo = getCategoryIcon(expense.category);
            const IconComponent = catInfo.icon;
            return (
              <motion.div
                key={expense._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 bg-slate-900/60 border border-slate-800 rounded-2xl hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${catInfo.color}20` }}
                  >
                    <IconComponent className="w-5 h-5" style={{ color: catInfo.color }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{expense.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-slate-400">{expense.category}</span>
                      <span className="text-xs text-slate-600">•</span>
                      <span className="text-xs text-slate-400">{expense.paymentMethod}</span>
                      <span className="text-xs text-slate-600">•</span>
                      <span className="text-xs text-slate-400">{new Date(expense.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-red-400">-{formatCurrency(expense.amount)}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(expense)}
                      className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(expense._id)}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
};

export default Expenses;
