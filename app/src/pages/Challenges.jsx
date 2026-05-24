import React, { useEffect, useState } from 'react';
import { challengeAPI } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, X, Trophy, Users, Target, Flame, Timer, Crown, Star,
  TrendingUp, Calendar, ChevronRight, Zap
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

const CHALLENGE_TYPES = [
  { value: 'daily_saving', label: 'Daily Saving', icon: Target },
  { value: 'no_spend', label: 'No Spend', icon: Flame },
  { value: 'category_cut', label: 'Category Cut', icon: TrendingUp },
  { value: 'streak', label: 'Streak', icon: Zap },
  { value: 'group', label: 'Group', icon: Users },
];

const Challenges = () => {
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
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', type: 'daily_saving', targetAmount: '',
    durationDays: 30, startDate: '', endDate: '', color: '#f59e0b'
  });

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      const res = await challengeAPI.getAll({ status: 'active' });
      setChallenges(res.data.challenges || []);
    } catch (error) {
      toast.error('Failed to load challenges');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await challengeAPI.create({
        ...formData,
        targetAmount: parseFloat(formData.targetAmount),
        durationDays: parseInt(formData.durationDays),
        startDate: formData.startDate || new Date().toISOString(),
        endDate: formData.endDate || new Date(Date.now() + parseInt(formData.durationDays) * 24 * 60 * 60 * 1000).toISOString()
      });
      toast.success('Challenge created!');
      setShowForm(false);
      setFormData({ title: '', description: '', type: 'daily_saving', targetAmount: '', durationDays: 30, startDate: '', endDate: '', color: '#f59e0b' });
      fetchChallenges();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create challenge');
    }
  };

  const handleJoin = async (id) => {
    try {
      await challengeAPI.join(id);
      toast.success('Joined challenge!');
      fetchChallenges();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to join');
    }
  };

  const getTypeInfo = (type) => CHALLENGE_TYPES.find(t => t.value === type) || CHALLENGE_TYPES[0];

  const COLORS = ['#f59e0b', '#ef4444', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Savings Challenges</h1>
          <p className="text-slate-400 text-sm mt-1">Challenge yourself and save more</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-amber-500 hover:bg-amber-600 text-white">
          <Plus className="w-4 h-4 mr-2" /> Create Challenge
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Create New Challenge</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Challenge Title</Label>
                <Input value={formData.title} onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))} placeholder="e.g., 30-Day No Junk Food" className="bg-slate-800 border-slate-700 text-white" required />
              </div>
              <div className="space-y-2">
              <Label className="text-slate-300">
                Target Amount ({displayCurrency})
              </Label>
                <Input type="number" value={formData.targetAmount} onChange={(e) => setFormData(p => ({ ...p, targetAmount: e.target.value }))} placeholder="50000" className="bg-slate-800 border-slate-700 text-white" required min="0" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Type</Label>
                <select value={formData.type} onChange={(e) => setFormData(p => ({ ...p, type: e.target.value }))} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm">
                  {CHALLENGE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Duration (Days)</Label>
                <Input type="number" value={formData.durationDays} onChange={(e) => setFormData(p => ({ ...p, durationDays: e.target.value }))} className="bg-slate-800 border-slate-700 text-white" min="1" max="365" required />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Start Date</Label>
                <Input type="date" value={formData.startDate} onChange={(e) => setFormData(p => ({ ...p, startDate: e.target.value }))} className="bg-slate-800 border-slate-700 text-white" required />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">End Date</Label>
                <Input type="date" value={formData.endDate} onChange={(e) => setFormData(p => ({ ...p, endDate: e.target.value }))} className="bg-slate-800 border-slate-700 text-white" required />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label className="text-slate-300">Description</Label>
                <Input value={formData.description} onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} placeholder="Describe the challenge..." className="bg-slate-800 border-slate-700 text-white" />
              </div>
              <div className="sm:col-span-2 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="border-slate-700 text-slate-300">Cancel</Button>
                <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white">Create Challenge</Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div></div>
      ) : challenges.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-2xl">
          <Trophy className="w-14 h-14 mx-auto text-slate-600 mb-3" />
          <h3 className="text-lg font-medium text-slate-300">No active challenges</h3>
          <p className="text-sm text-slate-500 mt-1">Create or join a challenge to start saving together</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {challenges.map((challenge) => {
            const typeInfo = getTypeInfo(challenge.type);
            const TypeIcon = typeInfo.icon;
            const participant = challenge.participants?.find(p => p.user?._id === JSON.parse(localStorage.getItem('user') || '{}').id);
            const progress = participant ? Math.round((participant.currentAmount / challenge.targetAmount) * 100) : 0;
            const isParticipant = challenge.isParticipant;

            return (
              <motion.div key={challenge._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${challenge.color || '#f59e0b'}20` }}>
                      <TypeIcon className="w-6 h-6" style={{ color: challenge.color || '#f59e0b' }} />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white">{challenge.title}</h3>
                      <p className="text-xs text-slate-400">{typeInfo.label} • {challenge.durationDays} days</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400">
                    <Users className="w-4 h-4" />
                    <span className="text-xs">{challenge.participantCount || 0}</span>
                  </div>
                </div>

                <p className="text-sm text-slate-400 mb-4 line-clamp-2">{challenge.description || 'No description'}</p>

                <div className="flex items-center justify-between mb-3 text-sm">
                  <span className="text-slate-400">Target: <span className="text-white font-medium">{displayAmount(challenge.targetAmount)}</span></span>
                  <span className="text-slate-400">Days left: <span className="text-white font-medium">{challenge.daysRemaining || 0}</span></span>
                </div>

                {isParticipant && participant && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-400">Your progress</span>
                      <span className="text-xs font-medium" style={{ color: challenge.color || '#f59e0b' }}>{progress}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, progress)}%`, backgroundColor: challenge.color || '#f59e0b' }} />
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-slate-400">Saved: {displayAmount(participant.currentAmount)}</span>
                      {participant.streak > 0 && (
                        <span className="text-xs text-amber-400 flex items-center gap-1"><Flame className="w-3 h-3" /> {participant.streak} day streak</span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  {isParticipant ? (
                    <Button size="sm" className="flex-1 bg-slate-800 hover:bg-slate-700 text-white text-xs">
                      <Star className="w-3.5 h-3.5 mr-1" /> Participating
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => handleJoin(challenge._id)} className="flex-1 text-xs" style={{ backgroundColor: challenge.color || '#f59e0b', color: '#fff' }}>
                      <ChevronRight className="w-3.5 h-3.5 mr-1" /> Join Challenge
                    </Button>
                  )}
                  <div className="px-3 py-1.5 bg-slate-800/60 rounded-lg text-xs text-slate-400">
                    <Calendar className="w-3 h-3 inline mr-1" />
                    {new Date(challenge.startDate).toLocaleDateString()}
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

export default Challenges;
