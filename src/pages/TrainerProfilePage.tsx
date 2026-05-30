import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { useRouter } from '../lib/router';
import type { TrainerProfile, TrainingMode } from '../lib/types';
import { User, Mail, Phone, MapPin, Calendar, Code, Monitor, Camera, Save, Plus, X, CreditCard as Edit3 } from 'lucide-react';

export function TrainerProfilePage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [, setTrainer] = useState<TrainerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    mobile: '',
    address: '',
    profile_image_url: '',
    date_of_birth: '',
    skills: [] as string[],
    mode_of_training: 'both' as TrainingMode,
    bio: '',
  });
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || (profile?.role !== 'trainer' && profile?.role !== 'admin'))) {
      router.navigate('/trainer/login');
      return;
    }
    if (user) loadTrainerProfile();
  }, [user, authLoading, profile]);

  async function loadTrainerProfile() {
    if (!user) return;
    const { data } = await supabase
      .from('trainers')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (data) {
      setTrainer(data);
      setForm({
        full_name: data.full_name || profile?.full_name || '',
        email: data.email || user.email || '',
        mobile: data.mobile || '',
        address: data.address || profile?.address || '',
        profile_image_url: data.profile_image_url || profile?.avatar_url || '',
        date_of_birth: data.date_of_birth || profile?.date_of_birth || '',
        skills: data.skills || [],
        mode_of_training: data.mode_of_training || 'both',
        bio: data.bio || '',
      });
    }
    setLoading(false);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const filePath = `trainer-avatars/${user.id}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      setForm(prev => ({ ...prev, profile_image_url: publicUrl }));
    }
    setUploading(false);
  }

  function addSkill() {
    if (newSkill.trim() && !form.skills.includes(newSkill.trim())) {
      setForm(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
      setNewSkill('');
    }
  }

  function removeSkill(skill: string) {
    setForm(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);

    const trainerData = {
      id: user.id,
      full_name: form.full_name,
      email: form.email,
      mobile: form.mobile,
      address: form.address,
      profile_image_url: form.profile_image_url,
      date_of_birth: form.date_of_birth || null,
      skills: form.skills,
      mode_of_training: form.mode_of_training,
      bio: form.bio,
    };

    const { error } = await supabase
      .from('trainers')
      .upsert(trainerData);

    if (!error) {
      await supabase
        .from('profiles')
        .update({
          full_name: form.full_name,
          email: form.email,
          avatar_url: form.profile_image_url,
          address: form.address,
          date_of_birth: form.date_of_birth || null,
        })
        .eq('id', user.id);
      setEditing(false);
      loadTrainerProfile();
    }
    setSaving(false);
  }

  if (authLoading || loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="animate-pulse space-y-6">
          <div className="h-40 bg-gray-200 rounded-2xl" />
          <div className="h-64 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  const modeOptions: { value: TrainingMode; label: string; desc: string }[] = [
    { value: 'online', label: 'Online', desc: 'Virtual sessions only' },
    { value: 'offline', label: 'Offline', desc: 'In-person sessions only' },
    { value: 'both', label: 'Both', desc: 'Online and in-person' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trainer Profile</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your professional information</p>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl hover:from-teal-600 hover:to-emerald-700 shadow-sm transition-all"
          >
            <Edit3 className="w-4 h-4" /> Edit Profile
          </button>
        )}
      </div>

      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6">
        <div className="h-32 bg-gradient-to-r from-teal-500 to-emerald-600 relative">
          <div className="absolute -bottom-12 left-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl border-4 border-white bg-gray-100 overflow-hidden shadow-lg">
                {form.profile_image_url ? (
                  <img src={form.profile_image_url} alt={form.full_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-teal-50">
                    <User className="w-10 h-10 text-teal-400" />
                  </div>
                )}
              </div>
              {editing && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200"
                >
                  {uploading ? (
                    <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4 text-gray-500" />
                  )}
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>
        </div>
        <div className="pt-16 pb-6 px-6">
          <h2 className="text-xl font-bold text-gray-900">{form.full_name || 'Trainer'}</h2>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
            <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {form.email}</span>
            <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {form.mobile || 'Not set'}</span>
            <span className="flex items-center gap-1"><Monitor className="w-3.5 h-3.5" /> {form.mode_of_training}</span>
          </div>
          {form.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {form.skills.map(skill => (
                <span key={skill} className="px-2.5 py-1 text-xs font-medium bg-teal-50 text-teal-700 rounded-lg border border-teal-200">
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Profile Details */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        {editing ? (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    value={form.full_name}
                    onChange={e => setForm({ ...form, full_name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    placeholder="Your full name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    placeholder="trainer@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    value={form.mobile}
                    onChange={e => setForm({ ...form, mobile: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Date of Birth</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={form.date_of_birth}
                    onChange={e => setForm({ ...form, date_of_birth: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <textarea
                  value={form.address}
                  onChange={e => setForm({ ...form, address: e.target.value })}
                  rows={2}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  placeholder="Your address"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Skills</label>
              <div className="flex gap-2 mb-2">
                <div className="relative flex-1">
                  <Code className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    value={newSkill}
                    onChange={e => setNewSkill(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    placeholder="Add a skill (e.g. React, Python)"
                  />
                </div>
                <button
                  onClick={addSkill}
                  className="px-4 py-2.5 text-sm font-medium bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.skills.map(skill => (
                  <span key={skill} className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium bg-teal-50 text-teal-700 rounded-lg border border-teal-200">
                    {skill}
                    <button onClick={() => removeSkill(skill)} className="text-teal-400 hover:text-red-500 transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Training Mode</label>
              <div className="grid grid-cols-3 gap-3">
                {modeOptions.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm({ ...form, mode_of_training: opt.value })}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      form.mode_of_training === opt.value
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`text-sm font-semibold ${form.mode_of_training === opt.value ? 'text-teal-700' : 'text-gray-700'}`}>
                      {opt.label}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
              <textarea
                value={form.bio}
                onChange={e => setForm({ ...form, bio: e.target.value })}
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                placeholder="Tell students about yourself, your experience, and teaching style..."
              />
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => { setEditing(false); loadTrainerProfile(); }}
                className="px-5 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl hover:from-teal-600 hover:to-emerald-700 shadow-sm transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <InfoField icon={User} label="Full Name" value={form.full_name} />
              <InfoField icon={Mail} label="Email" value={form.email} />
              <InfoField icon={Phone} label="Mobile" value={form.mobile} />
              <InfoField icon={Calendar} label="Date of Birth" value={form.date_of_birth ? new Date(form.date_of_birth).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Not set'} />
              <InfoField icon={MapPin} label="Address" value={form.address || 'Not set'} />
              <InfoField icon={Monitor} label="Training Mode" value={form.mode_of_training.charAt(0).toUpperCase() + form.mode_of_training.slice(1)} />
            </div>
            {form.bio && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Bio</h3>
                <p className="text-sm text-gray-700 leading-relaxed">{form.bio}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoField({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-gray-400" />
      </div>
      <div>
        <div className="text-xs text-gray-400">{label}</div>
        <div className="text-sm font-medium text-gray-900">{value}</div>
      </div>
    </div>
  );
}
