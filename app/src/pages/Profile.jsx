import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { motion } from 'framer-motion';
import {
  UserCircle, Mail, Save, Shield, Bell, Moon, Wallet,
  Target, Zap, Award, TrendingUp, Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    currency: user?.currency || 'NGN',
    monthlyIncome: user?.monthlyIncome || ''
  });
  const [preferences, setPreferences] = useState({
    notifications: user?.preferences?.notifications !== false,
    emailAlerts: user?.preferences?.emailAlerts !== false,
    budgetWarnings: user?.preferences?.budgetWarnings !== false
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await authAPI.updateProfile({
        ...formData,
        monthlyIncome: parseFloat(formData.monthlyIncome) || 0,
        preferences
      });
      updateUser(res.data.user);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const achievements = [
    { icon: Target, label: 'Budget Master', desc: 'Created 5+ budgets', color: '#3b82f6', earned: true },
    { icon: Zap, label: 'Saver', desc: 'Saved ₦100k+', color: '#f59e0b', earned: true },
    { icon: Award, label: 'Consistent', desc: '7-day streak', color: '#10b981', earned: true },
    { icon: Star, label: 'Insightful', desc: 'Generated 10 insights', color: '#8b5cf6', earned: false },
    { icon: TrendingUp, label: 'Analyzer', desc: 'Viewed analytics 20x', color: '#ec4899', earned: false },
    { icon: Shield, label: 'Secure', desc: 'Enabled all alerts', color: '#06b6d4', earned: true },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile Header */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-emerald-500/15 border-2 border-emerald-500/30 flex items-center justify-center">
            <UserCircle className="w-10 h-10 text-emerald-400" />
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-xl font-bold text-white">{user?.fullName || 'User'}</h2>
            <p className="text-slate-400 text-sm">{user?.email}</p>
            <div className="flex items-center gap-3 mt-2 justify-center sm:justify-start">
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded-full font-medium">
                Score: {user?.softLifeScore || 0}
              </span>
              <span className="px-3 py-1 bg-amber-500/10 text-amber-400 text-xs rounded-full font-medium">
                Streak: {user?.streakDays || 0} days
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Info */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-slate-300">First Name</Label>
            <Input value={formData.firstName} onChange={(e) => setFormData(p => ({ ...p, firstName: e.target.value }))} className="bg-slate-800 border-slate-700 text-white" />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-300">Last Name</Label>
            <Input value={formData.lastName} onChange={(e) => setFormData(p => ({ ...p, lastName: e.target.value }))} className="bg-slate-800 border-slate-700 text-white" />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-300">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input value={formData.email} disabled className="pl-10 bg-slate-800/50 border-slate-700 text-slate-400 cursor-not-allowed" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-slate-300">Currency</Label>
            <select value={formData.currency} onChange={(e) => setFormData(p => ({ ...p, currency: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500">
              <option value="NGN">Nigerian Naira (₦)</option>
              <option value="USD">US Dollar ($)</option>
              <option value="EUR">Euro (€)</option>
              <option value="GBP">British Pound (£)</option>
            </select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label className="text-slate-300">Monthly Income (Optional)</Label>
            <div className="relative">
              <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input type="number" value={formData.monthlyIncome} onChange={(e) => setFormData(p => ({ ...p, monthlyIncome: e.target.value }))}
                placeholder="0" className="pl-10 bg-slate-800 border-slate-700 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-sm font-medium text-white">Push Notifications</p>
                <p className="text-xs text-slate-400">Get notified about reminders and alerts</p>
              </div>
            </div>
            <Switch checked={preferences.notifications} onCheckedChange={(v) => setPreferences(p => ({ ...p, notifications: v }))} />
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-sm font-medium text-white">Email Alerts</p>
                <p className="text-xs text-slate-400">Receive summary emails</p>
              </div>
            </div>
            <Switch checked={preferences.emailAlerts} onCheckedChange={(v) => setPreferences(p => ({ ...p, emailAlerts: v }))} />
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-sm font-medium text-white">Budget Warnings</p>
                <p className="text-xs text-slate-400">Alert when nearing budget limits</p>
              </div>
            </div>
            <Switch checked={preferences.budgetWarnings} onCheckedChange={(v) => setPreferences(p => ({ ...p, budgetWarnings: v }))} />
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Achievements</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {achievements.map((ach, i) => {
            const Icon = ach.icon;
            return (
              <div key={i} className={`p-4 rounded-xl border text-center transition-all ${
                ach.earned ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-800/20 border-slate-800/50 opacity-50'
              }`}>
                <div className={`w-10 h-10 mx-auto rounded-lg flex items-center justify-center mb-2`}
                  style={{ backgroundColor: ach.earned ? `${ach.color}20` : '#1e293b' }}>
                  <Icon className="w-5 h-5" style={{ color: ach.earned ? ach.color : '#475569' }} />
                </div>
                <p className={`text-xs font-medium ${ach.earned ? 'text-white' : 'text-slate-500'}`}>{ach.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{ach.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="bg-emerald-500 hover:bg-emerald-600 text-white px-8">
          {saving ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Save className="w-4 h-4" /> Save Changes
            </div>
          )}
        </Button>
      </div>
    </motion.div>
  );
};

export default Profile;
