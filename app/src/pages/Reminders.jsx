import React, { useEffect, useState } from 'react';
import { reminderAPI } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, X, Bell, Calendar, CheckCircle2, Circle, Clock,
  Trash2, Edit2, AlertTriangle, Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const REMINDER_TYPES = [
  { value: 'bill', label: 'Bill', color: '#ef4444', icon: AlertTriangle },
  { value: 'savings', label: 'Savings', color: '#10b981', icon: CheckCircle2 },
  { value: 'budget', label: 'Budget', color: '#3b82f6', icon: Bell },
  { value: 'general', label: 'General', color: '#f59e0b', icon: Calendar },
];

const PRIORITIES = [
  { value: 'low', label: 'Low', color: '#10b981' },
  { value: 'medium', label: 'Medium', color: '#f59e0b' },
  { value: 'high', label: 'High', color: '#ef4444' },
];

const Reminders = () => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [formData, setFormData] = useState({
    title: '', description: '', type: 'general', dueDate: '',
    isRecurring: false, recurringFrequency: 'monthly',
    amount: '', category: 'General', priority: 'medium'
  });

  useEffect(() => {
    fetchReminders();
  }, [filter]);

  const fetchReminders = async () => {
    try {
      const params = {};
      if (filter === 'pending') params.status = 'pending';
      if (filter === 'completed') params.status = 'completed';
      const res = await reminderAPI.getAll(params);
      setReminders(res.data.reminders || []);
    } catch (error) {
      toast.error('Failed to load reminders');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...formData, amount: parseFloat(formData.amount) || 0 };
      if (editingId) {
        await reminderAPI.update(editingId, data);
        toast.success('Reminder updated');
      } else {
        await reminderAPI.create(data);
        toast.success('Reminder created');
      }
      setShowForm(false);
      setEditingId(null);
      resetForm();
      fetchReminders();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleToggle = async (id) => {
    try {
      await reminderAPI.toggle(id);
      fetchReminders();
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this reminder?')) return;
    try {
      await reminderAPI.delete(id);
      toast.success('Reminder deleted');
      fetchReminders();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const handleEdit = (reminder) => {
    setFormData({
      title: reminder.title, description: reminder.description || '',
      type: reminder.type, dueDate: new Date(reminder.dueDate).toISOString().slice(0, 16),
      isRecurring: reminder.isRecurring, recurringFrequency: reminder.recurringFrequency || 'monthly',
      amount: reminder.amount?.toString() || '', category: reminder.category || 'General',
      priority: reminder.priority || 'medium'
    });
    setEditingId(reminder._id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', type: 'general', dueDate: '', isRecurring: false, recurringFrequency: 'monthly', amount: '', category: 'General', priority: 'medium' });
  };

  const getTypeInfo = (type) => REMINDER_TYPES.find(t => t.value === type) || REMINDER_TYPES[3];
  const getPriorityInfo = (priority) => PRIORITIES.find(p => p.value === priority) || PRIORITIES[1];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount || 0);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Reminders</h1>
          <p className="text-slate-400 text-sm mt-1">Never miss a payment or deadline</p>
        </div>
        <Button onClick={() => { setShowForm(true); setEditingId(null); resetForm(); }} className="bg-emerald-500 hover:bg-emerald-600 text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Reminder
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {['all', 'pending', 'completed'].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === f ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">{editingId ? 'Edit Reminder' : 'New Reminder'}</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Title</Label>
                <Input value={formData.title} onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))} placeholder="e.g., Pay Electricity Bill" className="bg-slate-800 border-slate-700 text-white" required />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Due Date</Label>
                <Input type="datetime-local" value={formData.dueDate} onChange={(e) => setFormData(p => ({ ...p, dueDate: e.target.value }))} className="bg-slate-800 border-slate-700 text-white" required />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Type</Label>
                <select value={formData.type} onChange={(e) => setFormData(p => ({ ...p, type: e.target.value }))} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm">
                  {REMINDER_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Priority</Label>
                <select value={formData.priority} onChange={(e) => setFormData(p => ({ ...p, priority: e.target.value }))} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm">
                  {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Amount (Optional)</Label>
                <Input type="number" value={formData.amount} onChange={(e) => setFormData(p => ({ ...p, amount: e.target.value }))} placeholder="0" className="bg-slate-800 border-slate-700 text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Recurring</Label>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setFormData(p => ({ ...p, isRecurring: !p.isRecurring }))}
                    className={`w-12 h-6 rounded-full transition-all ${formData.isRecurring ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${formData.isRecurring ? 'translate-x-6' : 'translate-x-0.5'}`} />
                  </button>
                  {formData.isRecurring && (
                    <select value={formData.recurringFrequency} onChange={(e) => setFormData(p => ({ ...p, recurringFrequency: e.target.value }))}
                      className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm">
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  )}
                </div>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label className="text-slate-300">Description</Label>
                <Input value={formData.description} onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} placeholder="Add details..." className="bg-slate-800 border-slate-700 text-white" />
              </div>
              <div className="sm:col-span-2 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="border-slate-700 text-slate-300">Cancel</Button>
                <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white">{editingId ? 'Update' : 'Create'} Reminder</Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div></div>
      ) : reminders.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-2xl">
          <Bell className="w-14 h-14 mx-auto text-slate-600 mb-3" />
          <h3 className="text-lg font-medium text-slate-300">No reminders</h3>
          <p className="text-sm text-slate-500 mt-1">Add reminders to stay on top of your finances</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reminders.map((reminder) => {
            const typeInfo = getTypeInfo(reminder.type);
            const priorityInfo = getPriorityInfo(reminder.priority);
            const TypeIcon = typeInfo.icon;
            const isOverdue = new Date(reminder.dueDate) < new Date() && !reminder.isCompleted;
            return (
              <motion.div key={reminder._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                  reminder.isCompleted ? 'bg-slate-900/30 border-slate-800/50 opacity-60' : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}>
                <button onClick={() => handleToggle(reminder._id)} className="flex-shrink-0">
                  {reminder.isCompleted ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  ) : (
                    <Circle className={`w-6 h-6 ${isOverdue ? 'text-red-400' : 'text-slate-500 hover:text-emerald-400'} transition-colors`} />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-medium truncate ${reminder.isCompleted ? 'text-slate-500 line-through' : 'text-white'}`}>
                      {reminder.title}
                    </p>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0" style={{ backgroundColor: `${priorityInfo.color}20`, color: priorityInfo.color }}>
                      {priorityInfo.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(reminder.dueDate).toLocaleDateString()}
                    </span>
                    {reminder.amount > 0 && (
                      <span className="text-xs text-slate-400">{formatCurrency(reminder.amount)}</span>
                    )}
                    {isOverdue && <span className="text-xs text-red-400 font-medium">Overdue</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => handleEdit(reminder)} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(reminder._id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default Reminders;
