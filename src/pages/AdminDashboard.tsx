import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { useRouter } from '../lib/router';
import type { Course, Profile, Payment, Certificate, Coupon, TrainerProfile, CourseAssignment } from '../lib/types';
import { formatCurrency, TIER_CONFIG } from '../lib/types';
import {
  LayoutDashboard, BookOpen, Users, CreditCard, Award, Tag, Plus,
  Trash2, Shield, LogOut, Search, DollarSign, Menu, X,
  GraduationCap, BarChart3, UserCheck, Monitor,
  Calendar, MapPin, AlertCircle, Camera, Eye, EyeOff, Mail, Code
} from 'lucide-react';

type AdminTab = 'overview' | 'courses' | 'students' | 'payments' | 'certificates' | 'coupons' | 'trainers' | 'assignments' | 'analytics';

export function AdminDashboard() {
  const { user, profile, signOut, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.navigate('/admin/login');
    }
  }, [user, isAdmin, authLoading]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  const tabs: { id: AdminTab; label: string; icon: typeof LayoutDashboard }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'trainers', label: 'Trainers', icon: GraduationCap },
    { id: 'assignments', label: 'Assignments', icon: UserCheck },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'certificates', label: 'Certificates', icon: Award },
    { id: 'coupons', label: 'Coupons', icon: Tag },
  ];

  function handleTabChange(tab: AdminTab) {
    setActiveTab(tab);
    setSidebarOpen(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 transform transition-transform lg:translate-x-0 lg:static ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-800">
            <div className="w-9 h-9 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md shadow-teal-500/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-white tracking-tight">SkillForge</span>
              <span className="block text-[10px] text-teal-400 font-medium uppercase tracking-widest">Admin</span>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-teal-500/10 text-teal-400'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                }`}
              >
                <tab.icon className="w-4.5 h-4.5" />
                {tab.label}
              </button>
            ))}
          </nav>

          {/* User */}
          <div className="px-4 py-4 border-t border-gray-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center text-xs font-bold text-gray-300">
                {(profile?.full_name || 'A').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-200 truncate">{profile?.full_name || 'Admin'}</div>
                <div className="text-xs text-gray-500 truncate">{user.email}</div>
              </div>
            </div>
            <button
              onClick={() => { signOut(); router.navigate('/admin/login'); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h1 className="text-lg font-bold text-gray-900 capitalize">{activeTab}</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-teal-50 text-teal-700 rounded-lg border border-teal-200">
              <Shield className="w-3 h-3" /> Admin
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'analytics' && <AnalyticsTab />}
          {activeTab === 'courses' && <CoursesTab />}
          {activeTab === 'students' && <StudentsTab />}
          {activeTab === 'trainers' && <TrainersTab />}
          {activeTab === 'assignments' && <AssignmentsTab />}
          {activeTab === 'payments' && <PaymentsTab />}
          {activeTab === 'certificates' && <CertificatesTab />}
          {activeTab === 'coupons' && <CouponsTab />}
        </main>
      </div>
    </div>
  );
}

/* ── Overview ── */
function OverviewTab() {
  const [stats, setStats] = useState({ courses: 0, students: 0, payments: 0, revenue: 0, certificates: 0, coupons: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [courses, students, payments, certs, coupons] = await Promise.all([
        supabase.from('courses').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'student'),
        supabase.from('payments').select('amount').eq('status', 'completed'),
        supabase.from('certificates').select('id', { count: 'exact', head: true }),
        supabase.from('coupons').select('id', { count: 'exact', head: true }),
      ]);
      const revenue = (payments.data || []).reduce((sum, p) => sum + p.amount, 0);
      setStats({
        courses: courses.count || 0,
        students: students.count || 0,
        payments: payments.data?.length || 0,
        revenue,
        certificates: certs.count || 0,
        coupons: coupons.count || 0,
      });
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="animate-pulse h-64 bg-gray-100 rounded-xl" />;

  const cards = [
    { label: 'Total Courses', value: stats.courses, icon: BookOpen, bg: 'bg-teal-50', color: 'text-teal-600' },
    { label: 'Students', value: stats.students, icon: Users, bg: 'bg-blue-50', color: 'text-blue-600' },
    { label: 'Revenue', value: formatCurrency(stats.revenue), icon: DollarSign, bg: 'bg-emerald-50', color: 'text-emerald-600' },
    { label: 'Certificates', value: stats.certificates, icon: Award, bg: 'bg-amber-50', color: 'text-amber-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.bg} ${card.color}`}>
                <card.icon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm text-gray-500">{card.label}</div>
                <div className="text-xl font-bold text-gray-900">{card.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button onClick={() => {}} className="flex items-center gap-3 p-4 bg-teal-50 hover:bg-teal-100 rounded-xl transition-colors text-left">
            <BookOpen className="w-5 h-5 text-teal-600" />
            <div>
              <div className="text-sm font-medium text-teal-900">Manage Courses</div>
              <div className="text-xs text-teal-600">Add, edit or publish</div>
            </div>
          </button>
          <button className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors text-left">
            <Users className="w-5 h-5 text-blue-600" />
            <div>
              <div className="text-sm font-medium text-blue-900">View Students</div>
              <div className="text-xs text-blue-600">Enrollments & progress</div>
            </div>
          </button>
          <button className="flex items-center gap-3 p-4 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors text-left">
            <Tag className="w-5 h-5 text-amber-600" />
            <div>
              <div className="text-sm font-medium text-amber-900">Create Coupon</div>
              <div className="text-xs text-amber-600">Discount codes</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Courses ── */
function CoursesTab() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Course | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => { loadCourses(); }, []);

  const loadCourses = useCallback(async () => {
    const { data } = await supabase.from('courses').select('*').order('created_at', { ascending: false });
    setCourses(data || []);
    setLoading(false);
  }, []);

  async function togglePublish(course: Course) {
    await supabase.from('courses').update({ is_published: !course.is_published }).eq('id', course.id);
    setCourses(prev => prev.map(c => c.id === course.id ? { ...c, is_published: !c.is_published } : c));
  }

  async function deleteCourse(id: string) {
    if (!confirm('Delete this course? This cannot be undone.')) return;
    await supabase.from('courses').delete().eq('id', id);
    setCourses(prev => prev.filter(c => c.id !== id));
  }

  const filtered = courses.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="animate-pulse h-64 bg-gray-100 rounded-xl" />;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl hover:from-teal-600 hover:to-emerald-700 shadow-sm shadow-teal-500/20 transition-all"
        >
          <Plus className="w-4 h-4" /> Add Course
        </button>
      </div>

      {showForm && (
        <CourseForm
          course={editing}
          onSave={() => { setShowForm(false); loadCourses(); }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((course) => {
          const config = TIER_CONFIG[course.tier];
          const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
          return (
            <div key={course.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-36 bg-gray-100">
                <img src={course.image_url} alt={course.title} className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2 flex gap-1.5">
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-lg ${config.bg} ${config.color} border ${config.border}`}>
                    {config.label}
                  </span>
                  <button
                    onClick={() => togglePublish(course)}
                    className={`px-2 py-0.5 text-xs font-semibold rounded-lg ${
                      course.is_published ? 'bg-emerald-500 text-white' : 'bg-gray-500 text-white'
                    }`}
                  >
                    {course.is_published ? 'Published' : 'Draft'}
                  </button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1">{course.title}</h3>
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">{course.description}</p>
                <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                  <span>{course.category}</span>
                  <span>{course.duration_hours}h</span>
                  <span>{course.modules.length} modules</span>
                  <span>{totalLessons} lessons</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-lg font-bold text-teal-600">{formatCurrency(course.registration_fee)}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => { setEditing(course); setShowForm(true); }}
                      className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteCourse(course.id)}
                      className="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-2">No courses found.</p>
          <button
            onClick={() => { setEditing(null); setShowForm(true); }}
            className="text-teal-600 font-medium hover:underline text-sm"
          >
            Add your first course
          </button>
        </div>
      )}
    </div>
  );
}

function CourseForm({ course, onSave, onCancel }: { course: Course | null; onSave: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    title: course?.title || '',
    slug: course?.slug || '',
    description: course?.description || '',
    category: course?.category || '',
    tier: course?.tier || 'beginner' as const,
    registration_fee: course?.registration_fee || 19900,
    duration_hours: course?.duration_hours || 10,
    image_url: course?.image_url || '',
    is_published: course?.is_published || false,
    modules: course?.modules || [{ title: 'Module 1', lessons: ['Lesson 1'] }],
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const data = { ...form };
    if (course) {
      await supabase.from('courses').update(data).eq('id', course.id);
    } else {
      await supabase.from('courses').insert(data);
    }
    setSaving(false);
    onSave();
  }

  function addModule() {
    setForm({ ...form, modules: [...form.modules, { title: `Module ${form.modules.length + 1}`, lessons: [] }] });
  }

  function removeModule(idx: number) {
    setForm({ ...form, modules: form.modules.filter((_, i) => i !== idx) });
  }

  function updateModule(idx: number, title: string) {
    const modules = [...form.modules];
    modules[idx] = { ...modules[idx], title };
    setForm({ ...form, modules });
  }

  function addLesson(modIdx: number) {
    const modules = [...form.modules];
    modules[modIdx] = { ...modules[modIdx], lessons: [...modules[modIdx].lessons, ''] };
    setForm({ ...form, modules });
  }

  function updateLesson(modIdx: number, lessonIdx: number, value: string) {
    const modules = [...form.modules];
    const lessons = [...modules[modIdx].lessons];
    lessons[lessonIdx] = value;
    modules[modIdx] = { ...modules[modIdx], lessons };
    setForm({ ...form, modules });
  }

  function removeLesson(modIdx: number, lessonIdx: number) {
    const modules = [...form.modules];
    modules[modIdx] = { ...modules[modIdx], lessons: modules[modIdx].lessons.filter((_, i) => i !== lessonIdx) };
    setForm({ ...form, modules });
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 mb-4">
      <h3 className="font-semibold text-gray-900 mb-4">{course ? 'Edit Course' : 'New Course'}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
            <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tier</label>
            <select value={form.tier} onChange={e => setForm({ ...form, tier: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500">
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fee (paise)</label>
            <input type="number" value={form.registration_fee} onChange={e => setForm({ ...form, registration_fee: parseInt(e.target.value) })} required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (hours)</label>
            <input type="number" value={form.duration_hours} onChange={e => setForm({ ...form, duration_hours: parseInt(e.target.value) })} required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" checked={form.is_published} onChange={e => setForm({ ...form, is_published: e.target.checked })} id="published" />
          <label htmlFor="published" className="text-sm text-gray-700">Published</label>
        </div>

        {/* Modules */}
        <div className="border-t border-gray-100 pt-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-700">Modules & Lessons</label>
            <button type="button" onClick={addModule} className="text-xs text-teal-600 font-medium hover:underline">+ Add Module</button>
          </div>
          <div className="space-y-3">
            {form.modules.map((mod, modIdx) => (
              <div key={modIdx} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <input value={mod.title} onChange={e => updateModule(modIdx, e.target.value)}
                    className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    placeholder="Module title" />
                  <button type="button" onClick={() => removeModule(modIdx)} className="p-1 text-gray-400 hover:text-red-500">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-1.5 ml-4">
                  {mod.lessons.map((lesson, lessonIdx) => (
                    <div key={lessonIdx} className="flex items-center gap-2">
                      <input value={lesson} onChange={e => updateLesson(modIdx, lessonIdx, e.target.value)}
                        className="flex-1 px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                        placeholder="Lesson title" />
                      <button type="button" onClick={() => removeLesson(modIdx, lessonIdx)} className="p-0.5 text-gray-400 hover:text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={() => addLesson(modIdx)} className="text-xs text-teal-600 hover:underline">+ Add lesson</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Course'}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ── Students ── */
function StudentsTab() {
  const [students, setStudents] = useState<(Profile & { enrolled_courses?: { id: string; title: string; status: string }[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  useEffect(() => {
    async function loadStudents() {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student')
        .order('created_at', { ascending: false });

      if (!profiles) { setLoading(false); return; }

      // Fetch auth emails for all students via edge function
      const userIds = profiles.map((s: any) => s.id);
      let authEmails: Record<string, string> = {};
      try {
        const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-user-auth-details`;
        const headers = {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        };
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({ user_ids: userIds }),
        });
        const result = await response.json();
        if (result.users) {
          for (const [uid, data] of Object.entries(result.users)) {
            authEmails[uid] = (data as any).email || '';
          }
        }
      } catch {
        // fallback: use profile email
      }

      const studentsWithCourses = await Promise.all(
        profiles.map(async (s) => {
          const { data: enrollments } = await supabase
            .from('enrollments')
            .select('id, status, courses(id, title)')
            .eq('user_id', s.id);

          const enrolled_courses = (enrollments || []).map((e: any) => ({
            id: e.courses?.id || e.id,
            title: e.courses?.title || 'Unknown Course',
            status: e.status,
          }));

          return { ...s, email: authEmails[s.id] || s.email || '', enrolled_courses };
        })
      );

      setStudents(studentsWithCourses);
      setLoading(false);
    }
    loadStudents();
  }, []);

  async function openCourseDetail(courseId: string) {
    const { data } = await supabase.from('courses').select('*').eq('id', courseId).maybeSingle();
    if (data) setSelectedCourse(data);
  }

  const filtered = students.filter(s =>
    s.full_name.toLowerCase().includes(search.toLowerCase()) || s.id.includes(search)
  );

  if (loading) return <div className="animate-pulse h-64 bg-gray-100 rounded-xl" />;

  return (
    <div className="space-y-4">
      <div className="relative w-full sm:w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or ID..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" />
      </div>
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No students found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Email</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Phone</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Enrolled Courses</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{s.full_name || 'Unnamed'}</td>
                  <td className="px-4 py-3 text-gray-500">{s.email || '-'}</td>
                  <td className="px-4 py-3 text-gray-500">{s.phone || '-'}</td>
                  <td className="px-4 py-3">
                    {s.enrolled_courses && s.enrolled_courses.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {s.enrolled_courses.map((c, i) => (
                          <button
                            key={i}
                            onClick={() => openCourseDetail(c.id)}
                            className={`px-2 py-0.5 text-xs font-medium rounded cursor-pointer transition-colors hover:opacity-80 ${
                              c.status === 'completed' ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-teal-50 text-teal-700 hover:bg-teal-100'
                            }`}
                          >
                            {c.title}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">No enrollments</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{new Date(s.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedCourse && (
        <CourseDetailModal course={selectedCourse} onClose={() => setSelectedCourse(null)} />
      )}
    </div>
  );
}

function CourseDetailModal({ course, onClose }: { course: Course; onClose: () => void }) {
  const tierConfig = TIER_CONFIG[course.tier];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative h-44 bg-gradient-to-br from-teal-500 to-emerald-600 overflow-hidden">
          {course.image_url ? (
            <img src={course.image_url} alt={course.title} className="w-full h-full object-cover opacity-40" />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.15),transparent_70%)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-6 right-6">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider ${tierConfig.bg} ${tierConfig.color} border ${tierConfig.border}`}>
                {tierConfig.label}
              </span>
              <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider ${course.is_published ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30' : 'bg-gray-500/20 text-gray-200 border border-gray-400/30'}`}>
                {course.is_published ? 'Published' : 'Draft'}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white">{course.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors backdrop-blur-sm"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Key details */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-[10px] font-medium text-blue-600 uppercase tracking-wide">Category</p>
              <p className="text-sm text-blue-900 font-semibold">{course.category || '-'}</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <p className="text-[10px] font-medium text-emerald-600 uppercase tracking-wide">Duration</p>
              <p className="text-sm text-emerald-900 font-semibold">{course.duration_hours} hours</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-[10px] font-medium text-amber-600 uppercase tracking-wide">Fee</p>
              <p className="text-sm text-amber-900 font-semibold">{formatCurrency(course.registration_fee)}</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wide">Description</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{course.description || 'No description available.'}</p>
          </div>

          {/* Modules */}
          {course.modules && course.modules.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> Modules ({course.modules.length})
              </h3>
              <div className="space-y-2">
                {course.modules.map((mod, i) => (
                  <div key={i} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm font-medium text-gray-900">{i + 1}. {mod.title}</p>
                    {mod.lessons && mod.lessons.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">{mod.lessons.length} lesson{mod.lessons.length !== 1 ? 's' : ''}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Meta */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-xs text-gray-400">
            <span>Created: {new Date(course.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <span>Slug: {course.slug}</span>
          </div>

          {/* Close */}
          <div className="flex justify-end pt-2">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Payments ── */
function PaymentsTab() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('payments').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      setPayments(data || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="animate-pulse h-64 bg-gray-100 rounded-xl" />;

  const totalRevenue = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">Total Revenue: <span className="font-bold text-emerald-600">{formatCurrency(totalRevenue)}</span></div>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Amount</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Currency</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {payments.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{formatCurrency(p.amount)}</td>
                <td className="px-4 py-3 text-gray-500">{p.currency}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                    p.status === 'completed' ? 'bg-emerald-50 text-emerald-700' :
                    p.status === 'failed' ? 'bg-red-50 text-red-700' :
                    p.status === 'refunded' ? 'bg-amber-50 text-amber-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>{p.status}</span>
                </td>
                <td className="px-4 py-3 text-gray-500">{new Date(p.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Certificates ── */
function CertificatesTab() {
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('certificates').select('*').order('issued_at', { ascending: false }).then(({ data }) => {
      setCerts(data || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="animate-pulse h-64 bg-gray-100 rounded-xl" />;

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            <th className="text-left px-4 py-3 font-medium text-gray-500">Certificate ID</th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">Student</th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">Course</th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">Issued</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {certs.map(c => (
            <tr key={c.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-mono text-xs text-gray-700">{c.certificate_number}</td>
              <td className="px-4 py-3 text-gray-900">{c.user_name}</td>
              <td className="px-4 py-3 text-gray-700">{c.course_name}</td>
              <td className="px-4 py-3 text-gray-500">{new Date(c.issued_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Coupons ── */
function CouponsTab() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { loadCoupons(); }, []);

  async function loadCoupons() {
    const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
    setCoupons(data || []);
    setLoading(false);
  }

  async function toggleCoupon(coupon: Coupon) {
    await supabase.from('coupons').update({ is_active: !coupon.is_active }).eq('id', coupon.id);
    setCoupons(prev => prev.map(c => c.id === coupon.id ? { ...c, is_active: !c.is_active } : c));
  }

  if (loading) return <div className="animate-pulse h-64 bg-gray-100 rounded-xl" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Coupons</h2>
        <button onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl hover:from-teal-600 hover:to-emerald-700 shadow-sm shadow-teal-500/20 transition-all">
          <Plus className="w-4 h-4" /> Add Coupon
        </button>
      </div>

      {showForm && (
        <CouponForm onSave={() => { setShowForm(false); loadCoupons(); }} onCancel={() => setShowForm(false)} />
      )}

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Code</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Discount</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Uses</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {coupons.map(c => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono font-medium text-gray-900">{c.code}</td>
                <td className="px-4 py-3 text-gray-700">{c.discount_percent}%</td>
                <td className="px-4 py-3 text-gray-500">{c.used_count}/{c.max_uses}</td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleCoupon(c)}
                    className={`px-2 py-0.5 text-xs font-medium rounded ${c.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                    {c.is_active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={async () => { if (confirm('Delete?')) { await supabase.from('coupons').delete().eq('id', c.id); loadCoupons(); } }}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CouponForm({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({ code: '', discount_percent: 10, max_uses: 100, valid_until: '' });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await supabase.from('coupons').insert({
      code: form.code.toUpperCase(),
      discount_percent: form.discount_percent,
      max_uses: form.max_uses,
      valid_until: form.valid_until || null,
    });
    setSaving(false);
    onSave();
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 mb-4">
      <h3 className="font-semibold text-gray-900 mb-4">New Coupon</h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
          <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} required
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Discount %</label>
          <input type="number" value={form.discount_percent} onChange={e => setForm({ ...form, discount_percent: parseInt(e.target.value) })} min={1} max={100} required
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Max Uses</label>
          <input type="number" value={form.max_uses} onChange={e => setForm({ ...form, max_uses: parseInt(e.target.value) })} required
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until</label>
          <input type="date" value={form.valid_until} onChange={e => setForm({ ...form, valid_until: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" />
        </div>
        <div className="flex gap-2 sm:col-span-2 justify-end">
          <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50">
            {saving ? 'Saving...' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ── Analytics ── */
function AnalyticsTab() {
  const [stats, setStats] = useState({
    totalStudents: 0, activeStudents: 0, totalEnrollments: 0,
    completedEnrollments: 0, avgProgress: 0, totalRevenue: 0,
    courseEnrollments: [] as { course_id: string; course_title: string; count: number }[],
    tierDistribution: { beginner: 0, intermediate: 0, advanced: 0 },
    monthlyEnrollments: [] as { month: string; count: number }[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [students, enrollments, payments] = await Promise.all([
        supabase.from('profiles').select('id, role').eq('role', 'student'),
        supabase.from('enrollments').select('*, course:courses(title, tier, id)'),
        supabase.from('payments').select('amount, status').eq('status', 'completed'),
      ]);

      const studentList = students.data || [];
      const enrollmentList = enrollments.data || [];
      const paymentList = payments.data || [];

      const totalRevenue = paymentList.reduce((sum, p) => sum + p.amount, 0);
      const activeStudents = new Set(enrollmentList.filter(e => e.status === 'active').map(e => e.user_id)).size;
      const completedEnrollments = enrollmentList.filter(e => e.status === 'completed').length;
      const avgProgress = enrollmentList.length > 0
        ? Math.round(enrollmentList.reduce((sum, e) => sum + e.progress, 0) / enrollmentList.length)
        : 0;

      const courseEnrollMap: Record<string, { title: string; count: number }> = {};
      const tierDist = { beginner: 0, intermediate: 0, advanced: 0 };
      enrollmentList.forEach(e => {
        const c = e.course;
        if (c) {
          const key = c.id || c.title;
          if (!courseEnrollMap[key]) courseEnrollMap[key] = { title: c.title, count: 0 };
          courseEnrollMap[key].count++;
          if (c.tier === 'beginner') tierDist.beginner++;
          else if (c.tier === 'intermediate') tierDist.intermediate++;
          else if (c.tier === 'advanced') tierDist.advanced++;
        }
      });

      const courseEnrollments = Object.entries(courseEnrollMap)
        .map(([_, v]) => ({ course_id: '', course_title: v.title, count: v.count }))
        .sort((a, b) => b.count - a.count);

      const monthMap: Record<string, number> = {};
      enrollmentList.forEach(e => {
        const month = new Date(e.enrolled_at).toISOString().slice(0, 7);
        monthMap[month] = (monthMap[month] || 0) + 1;
      });
      const monthlyEnrollments = Object.entries(monthMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-6)
        .map(([month, count]) => ({ month, count }));

      setStats({
        totalStudents: studentList.length,
        activeStudents,
        totalEnrollments: enrollmentList.length,
        completedEnrollments,
        avgProgress,
        totalRevenue,
        courseEnrollments,
        tierDistribution: tierDist,
        monthlyEnrollments,
      });
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="animate-pulse h-64 bg-gray-100 rounded-xl" />;

  const maxEnrollment = Math.max(...stats.courseEnrollments.map(c => c.count), 1);
  const maxMonthly = Math.max(...stats.monthlyEnrollments.map(m => m.count), 1);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Students', value: stats.totalStudents, icon: Users, bg: 'bg-blue-50', color: 'text-blue-600' },
          { label: 'Active Students', value: stats.activeStudents, icon: UserCheck, bg: 'bg-teal-50', color: 'text-teal-600' },
          { label: 'Avg Progress', value: `${stats.avgProgress}%`, icon: BarChart3, bg: 'bg-emerald-50', color: 'text-emerald-600' },
          { label: 'Revenue', value: formatCurrency(stats.totalRevenue), icon: DollarSign, bg: 'bg-amber-50', color: 'text-amber-600' },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.bg} ${card.color}`}>
                <card.icon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm text-gray-500">{card.label}</div>
                <div className="text-xl font-bold text-gray-900">{card.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrollment by Course */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Enrollments by Course</h3>
          {stats.courseEnrollments.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No enrollment data yet.</p>
          ) : (
            <div className="space-y-3">
              {stats.courseEnrollments.slice(0, 8).map(c => (
                <div key={c.course_title}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-700 truncate max-w-[200px]">{c.course_title}</span>
                    <span className="font-medium text-gray-900">{c.count}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full" style={{ width: `${(c.count / maxEnrollment) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tier Distribution */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Enrollment by Tier</h3>
          <div className="space-y-4">
            {[
              { label: 'Beginner', count: stats.tierDistribution.beginner, color: 'bg-emerald-500', bg: 'bg-emerald-50' },
              { label: 'Intermediate', count: stats.tierDistribution.intermediate, color: 'bg-blue-500', bg: 'bg-blue-50' },
              { label: 'Advanced', count: stats.tierDistribution.advanced, color: 'bg-amber-500', bg: 'bg-amber-50' },
            ].map(t => {
              const total = stats.tierDistribution.beginner + stats.tierDistribution.intermediate + stats.tierDistribution.advanced;
              const pct = total > 0 ? Math.round((t.count / total) * 100) : 0;
              return (
                <div key={t.label}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-700">{t.label}</span>
                    <span className="font-medium text-gray-900">{t.count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${t.color} rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Monthly Trend</h4>
            {stats.monthlyEnrollments.length === 0 ? (
              <p className="text-sm text-gray-400">No data yet.</p>
            ) : (
              <div className="flex items-end gap-2 h-24">
                {stats.monthlyEnrollments.map(m => (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full bg-gradient-to-t from-teal-500 to-emerald-400 rounded-t" style={{ height: `${(m.count / maxMonthly) * 100}%`, minHeight: 4 }} />
                    <span className="text-[10px] text-gray-400">{m.month.slice(5)}</span>
                    <span className="text-[10px] font-medium text-gray-600">{m.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Completion Stats */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Enrollment Summary</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <div className="text-2xl font-bold text-gray-900">{stats.totalEnrollments}</div>
            <div className="text-sm text-gray-500">Total Enrollments</div>
          </div>
          <div className="text-center p-4 bg-emerald-50 rounded-xl">
            <div className="text-2xl font-bold text-emerald-700">{stats.completedEnrollments}</div>
            <div className="text-sm text-emerald-600">Completed</div>
          </div>
          <div className="text-center p-4 bg-teal-50 rounded-xl">
            <div className="text-2xl font-bold text-teal-700">{stats.totalEnrollments - stats.completedEnrollments}</div>
            <div className="text-sm text-teal-600">In Progress</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Trainers ── */
function TrainersTab() {
  const [trainers, setTrainers] = useState<TrainerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState<TrainerProfile | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  function loadTrainers() {
    supabase.from('trainers').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      setTrainers(data || []);
      setLoading(false);
    });
  }

  useEffect(() => { loadTrainers(); }, []);

  const filtered = trainers.filter(t =>
    t.full_name.toLowerCase().includes(search.toLowerCase()) ||
    t.email.toLowerCase().includes(search.toLowerCase()) ||
    t.skills.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return <div className="animate-pulse h-64 bg-gray-100 rounded-xl" />;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search trainers..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" />
        </div>
        <button onClick={() => setShowAddForm(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl hover:from-teal-600 hover:to-emerald-700 shadow-sm shadow-teal-500/20 transition-all">
          <Plus className="w-4 h-4" /> Add Trainer
        </button>
      </div>

      {showAddForm && (
        <AddTrainerForm
          onSave={() => { setShowAddForm(false); loadTrainers(); }}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No trainers found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(t => {
            const modeColors = {
              online: { gradient: 'from-blue-500 to-cyan-500', badge: 'bg-blue-500/20 text-blue-200 border-blue-400/30', label: 'Online' },
              offline: { gradient: 'from-amber-500 to-orange-500', badge: 'bg-amber-500/20 text-amber-200 border-amber-400/30', label: 'Offline' },
              both: { gradient: 'from-teal-500 to-emerald-500', badge: 'bg-teal-500/20 text-teal-200 border-teal-400/30', label: 'Both' },
            };
            const mode = modeColors[t.mode_of_training] || modeColors.both;

            return (
              <div key={t.id} className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-gray-200/60 hover:-translate-y-1 transition-all duration-300 cursor-pointer" onClick={() => { setSelectedTrainer(t); setShowViewModal(true); }}>
                {/* Gradient header with image */}
                <div className={`relative h-36 bg-gradient-to-br ${mode.gradient} overflow-hidden flex items-center justify-center`}>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.15),transparent_70%)]" />
                  <div className="relative z-10 flex items-center justify-center h-full">
                    <div className="w-28 h-28 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-white flex items-center justify-center flex-shrink-0">
                      {t.profile_image_url ? (
                        <img src={t.profile_image_url} alt={t.full_name} className="w-full h-full object-contain p-1" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-50 to-emerald-50">
                          <GraduationCap className="w-10 h-10 text-teal-500" />
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Mode badge */}
                  <div className="absolute top-3 right-3">
                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider border ${mode.badge} backdrop-blur-sm`}>
                      {mode.label}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="pt-6 pb-5 px-5">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-bold text-gray-900 truncate">{t.full_name || 'Unnamed Trainer'}</h3>
                    <p className="text-sm text-gray-500 truncate flex items-center justify-center gap-1.5 mt-1">
                      <Mail className="w-3.5 h-3.5" /> {t.email || 'No email'}
                    </p>
                  </div>

                  {/* Skills - primary display */}
                  {t.skills.length > 0 ? (
                    <div className="flex flex-wrap justify-center gap-1.5 mb-4">
                      {t.skills.slice(0, 5).map(s => (
                        <span key={s} className="px-2.5 py-1 text-xs font-semibold bg-gradient-to-r from-teal-50 to-emerald-50 text-teal-700 rounded-lg border border-teal-200">
                          {s}
                        </span>
                      ))}
                      {t.skills.length > 5 && (
                        <span className="px-2.5 py-1 text-xs font-medium bg-gray-50 text-gray-500 rounded-lg border border-gray-200">
                          +{t.skills.length - 5}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-wrap justify-center gap-1.5 mb-4">
                      <span className="px-2.5 py-1 text-xs font-medium bg-gray-50 text-gray-400 rounded-lg border border-gray-200">No skills listed</span>
                    </div>
                  )}

                  {/* Details grid */}
                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <Users className="w-3.5 h-3.5 text-blue-500" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Mobile</div>
                        <div className="text-xs text-gray-700 truncate">{t.mobile || '-'}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Address</div>
                        <div className="text-xs text-gray-700 truncate">{t.address || '-'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 pt-3 border-t border-gray-100" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => { setSelectedTrainer(t); setShowEditModal(true); }}
                      className="flex-1 px-3 py-2 text-xs font-medium bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm('Delete this trainer?')) {
                          await supabase.from('trainers').delete().eq('id', t.id);
                          loadTrainers();
                        }
                      }}
                      className="flex-1 px-3 py-2 text-xs font-medium bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showViewModal && selectedTrainer && (
        <TrainerDetailModal
          trainer={selectedTrainer}
          onEdit={() => { setShowViewModal(false); setShowEditModal(true); }}
          onClose={() => { setShowViewModal(false); setSelectedTrainer(null); }}
          onTrainerUpdated={loadTrainers}
        />
      )}

      {showEditModal && selectedTrainer && (
        <EditTrainerModal
          trainer={selectedTrainer}
          onSave={() => { setShowEditModal(false); setSelectedTrainer(null); loadTrainers(); }}
          onCancel={() => { setShowEditModal(false); setSelectedTrainer(null); setShowViewModal(true); }}
        />
      )}
    </div>
  );
}

function TrainerDetailModal({ trainer, onEdit, onClose, onTrainerUpdated }: { trainer: TrainerProfile; onEdit: () => void; onClose: () => void; onTrainerUpdated: () => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const [revealedPassword, setRevealedPassword] = useState<string>('');
  const [resettingPassword, setResettingPassword] = useState(false);

  async function handleResetPassword() {
    setResettingPassword(true);
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/reset-trainer-password`;
      const headers = {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      };
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ user_id: trainer.id }),
      });
      const result = await response.json();
      if (result.success) {
        setRevealedPassword(result.password);
        setShowPassword(true);
      }
    } catch {
      // silently fail
    }
    setResettingPassword(false);
  }

  const modeColors = {
    online: { gradient: 'from-blue-500 to-cyan-500', badge: 'bg-blue-500/20 text-blue-200 border-blue-400/30', label: 'Online' },
    offline: { gradient: 'from-amber-500 to-orange-500', badge: 'bg-amber-500/20 text-amber-200 border-amber-400/30', label: 'Offline' },
    both: { gradient: 'from-teal-500 to-emerald-500', badge: 'bg-teal-500/20 text-teal-200 border-teal-400/30', label: 'Both' },
  };
  const mode = modeColors[trainer.mode_of_training] || modeColors.both;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header with gradient and image */}
        <div className={`relative h-40 bg-gradient-to-br ${mode.gradient} overflow-hidden flex items-center justify-center`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.15),transparent_70%)]" />
          <div className="relative z-10">
            <div className="w-32 h-32 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-white flex items-center justify-center flex-shrink-0">
              {trainer.profile_image_url ? (
                <img src={trainer.profile_image_url} alt={trainer.full_name} className="w-full h-full object-contain p-2" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-50 to-emerald-50">
                  <GraduationCap className="w-12 h-12 text-teal-500" />
                </div>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors backdrop-blur-sm"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <div className="absolute top-4 left-4">
            <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider border ${mode.badge} backdrop-blur-sm`}>
              {mode.label}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Header info */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{trainer.full_name}</h2>
          </div>

          {/* Login Credentials */}
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
            <h3 className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-3">Login Credentials</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-amber-500 uppercase tracking-wide font-medium">Email / Username</p>
                  <p className="text-sm text-amber-900 font-semibold">{trainer.email || 'No email'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {showPassword ? (
                  <EyeOff className="w-4 h-4 text-amber-600 flex-shrink-0" />
                ) : (
                  <Eye className="w-4 h-4 text-amber-600 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="text-[10px] text-amber-500 uppercase tracking-wide font-medium">Password</p>
                  <p className="text-sm text-amber-900 font-semibold font-mono">
                    {showPassword && revealedPassword ? revealedPassword : '••••••••'}
                  </p>
                </div>
                {showPassword && revealedPassword ? (
                  <button
                    onClick={() => { setShowPassword(false); setRevealedPassword(''); }}
                    className="text-xs text-amber-600 hover:text-amber-800 font-medium px-2 py-1 rounded hover:bg-amber-100 transition-colors"
                  >
                    Hide
                  </button>
                ) : (
                  <button
                    onClick={handleResetPassword}
                    disabled={resettingPassword}
                    className="text-xs text-amber-600 hover:text-amber-800 font-medium px-2 py-1 rounded hover:bg-amber-100 transition-colors disabled:opacity-50"
                  >
                    {resettingPassword ? 'Resetting...' : 'Reset & Show'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trainer.mobile && (
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <Users className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Mobile</p>
                  <p className="text-sm text-blue-900 font-medium">{trainer.mobile}</p>
                </div>
              </div>
            )}

            {trainer.date_of_birth && (
              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <Calendar className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-purple-600 uppercase tracking-wide">Date of Birth</p>
                  <p className="text-sm text-purple-900 font-medium">
                    {new Date(trainer.date_of_birth).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>
            )}

            {trainer.address && (
              <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200 md:col-span-2">
                <MapPin className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide">Address</p>
                  <p className="text-sm text-emerald-900 font-medium">{trainer.address}</p>
                </div>
              </div>
            )}
          </div>

          {/* Skills */}
          {trainer.skills.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide flex items-center gap-2">
                <Code className="w-4 h-4" /> Skills & Expertise
              </h3>
              <div className="flex flex-wrap gap-2">
                {trainer.skills.map(skill => (
                  <span key={skill} className="px-3 py-1.5 text-sm font-semibold bg-gradient-to-r from-teal-50 to-emerald-50 text-teal-700 rounded-lg border border-teal-200">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Mode of Training */}
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Training Mode</p>
            <p className="text-sm font-medium text-gray-900 capitalize">{trainer.mode_of_training === 'both' ? 'Online & Offline' : trainer.mode_of_training}</p>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => { onClose(); onEdit(); }}
              className="flex-1 px-4 py-2.5 text-sm font-semibold bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-lg hover:from-teal-600 hover:to-emerald-700 shadow-sm transition-all"
            >
              Edit Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditTrainerModal({ trainer, onSave, onCancel }: { trainer: TrainerProfile; onSave: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    full_name: trainer.full_name,
    email: trainer.email || '',
    new_password: '',
    mobile: trainer.mobile || '',
    address: trainer.address || '',
    date_of_birth: trainer.date_of_birth || '',
    mode_of_training: trainer.mode_of_training as 'online' | 'offline' | 'both',
    skills: trainer.skills || [],
    profile_image_url: trainer.profile_image_url || '',
  });
  const [newSkill, setNewSkill] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function addSkill() {
    const skill = newSkill.trim();
    if (skill && !form.skills.includes(skill)) {
      setForm(prev => ({ ...prev, skills: [...prev.skills, skill] }));
      setNewSkill('');
    }
  }

  function removeSkill(skill: string) {
    setForm(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const filePath = `trainer-avatars/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!form.full_name.trim()) {
      setError('Trainer name is required');
      return;
    }

    setSaving(true);

    const { error: updateError } = await supabase.from('trainers').update({
      full_name: form.full_name,
      email: form.email,
      mobile: form.mobile,
      address: form.address,
      date_of_birth: form.date_of_birth || null,
      mode_of_training: form.mode_of_training,
      skills: form.skills,
      profile_image_url: form.profile_image_url,
    }).eq('id', trainer.id);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    if (form.new_password) {
      const { error: authError } = await supabase.auth.updateUser({ password: form.new_password });
      if (authError) {
        setError('Profile updated but password change failed: ' + authError.message);
        setSaving(false);
        onSave();
        return;
      }
    }

    setSaving(false);
    onSave();
  }

  const modeColors = {
    online: { gradient: 'from-blue-500 to-cyan-500', label: 'Online' },
    offline: { gradient: 'from-amber-500 to-orange-500', label: 'Offline' },
    both: { gradient: 'from-teal-500 to-emerald-500', label: 'Both' },
  };
  const modeColor = modeColors[form.mode_of_training] || modeColors.both;

  const modeOptions: { value: 'online' | 'offline' | 'both'; label: string; desc: string }[] = [
    { value: 'online', label: 'Online', desc: 'Virtual sessions only' },
    { value: 'offline', label: 'Offline', desc: 'In-person sessions only' },
    { value: 'both', label: 'Both', desc: 'Online and in-person' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header with image */}
        <div className={`relative h-40 bg-gradient-to-br ${modeColor.gradient} overflow-hidden flex items-center justify-center`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.15),transparent_70%)]" />
          <div className="relative z-10">
            <div className="w-32 h-32 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-white flex items-center justify-center flex-shrink-0">
              {form.profile_image_url ? (
                <img src={form.profile_image_url} alt={form.full_name} className="w-full h-full object-contain p-2" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-50 to-emerald-50">
                  <GraduationCap className="w-12 h-12 text-teal-500" />
                </div>
              )}
            </div>
          </div>
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors backdrop-blur-sm"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="mt-2">
            <h3 className="text-2xl font-bold text-gray-900">{form.full_name}</h3>
            <p className="text-sm text-gray-500 mt-1">{form.email}</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Profile Image</label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="text-sm text-teal-600 font-medium hover:underline disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Change image'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Form fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <input
                value={form.full_name}
                onChange={e => setForm({ ...form, full_name: e.target.value })}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email / Username</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.new_password}
                  onChange={e => setForm({ ...form, new_password: e.target.value })}
                  placeholder="Leave blank to keep current"
                  className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Mobile Number</label>
              <input
                type="tel"
                value={form.mobile}
                onChange={e => setForm({ ...form, mobile: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Date of Birth</label>
              <input
                type="date"
                value={form.date_of_birth}
                onChange={e => setForm({ ...form, date_of_birth: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Mode of Training</label>
              <select
                value={form.mode_of_training}
                onChange={e => setForm({ ...form, mode_of_training: e.target.value as any })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              >
                {modeOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
            <textarea
              value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
              rows={2}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Skills</label>
            <div className="flex gap-2 mb-2">
              <input
                value={newSkill}
                onChange={e => setNewSkill(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                placeholder="Add a skill"
              />
              <button
                type="button"
                onClick={addSkill}
                className="px-4 py-2.5 text-sm font-medium bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
            {form.skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.skills.map(skill => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium bg-teal-50 text-teal-700 rounded-lg border border-teal-200"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="text-teal-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl hover:from-teal-600 hover:to-emerald-700 shadow-sm transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddTrainerForm({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    mobile: '',
    address: '',
    date_of_birth: '',
    mode_of_training: 'both' as 'online' | 'offline' | 'both',
    skills: [] as string[],
    profile_image_url: '',
  });
  const [newSkill, setNewSkill] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function addSkill() {
    const skill = newSkill.trim();
    if (skill && !form.skills.includes(skill)) {
      setForm(prev => ({ ...prev, skills: [...prev.skills, skill] }));
      setNewSkill('');
    }
  }

  function removeSkill(skill: string) {
    setForm(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const filePath = `trainer-avatars/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!form.full_name.trim()) {
      setError('Trainer name is required');
      return;
    }
    if (!form.email.trim()) {
      setError('Email is required for trainer login');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setSaving(true);

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    try {
      const res = await fetch(`${supabaseUrl}/functions/v1/admin-add-trainer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${anonKey}`,
        },
        body: JSON.stringify({
          full_name: form.full_name,
          email: form.email,
          password: form.password,
          mobile: form.mobile,
          address: form.address,
          date_of_birth: form.date_of_birth || null,
          mode_of_training: form.mode_of_training,
          skills: form.skills,
          profile_image_url: form.profile_image_url,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to add trainer');
        setSaving(false);
        return;
      }
    } catch {
      const { error: insertError } = await supabase.from('trainers').insert({
        id: crypto.randomUUID(),
        full_name: form.full_name,
        email: form.email,
        mobile: form.mobile,
        address: form.address,
        date_of_birth: form.date_of_birth || null,
        mode_of_training: form.mode_of_training,
        skills: form.skills,
        profile_image_url: form.profile_image_url,
      });
      if (insertError) {
        setError(insertError.message);
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    onSave();
  }

  const modeOptions: { value: 'online' | 'offline' | 'both'; label: string; desc: string }[] = [
    { value: 'online', label: 'Online', desc: 'Virtual sessions only' },
    { value: 'offline', label: 'Offline', desc: 'In-person sessions only' },
    { value: 'both', label: 'Both', desc: 'Online and in-person' },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 mb-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-5">Add New Trainer</h3>
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Profile Image</label>
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 overflow-hidden bg-gray-50 hover:border-teal-400 transition-colors">
                {form.profile_image_url ? (
                  <img src={form.profile_image_url} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <Camera className="w-6 h-6 text-gray-400" />
                    <span className="text-[10px] text-gray-400 mt-1">Upload</span>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200"
              >
                {uploading ? (
                  <div className="w-3.5 h-3.5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera className="w-3.5 h-3.5 text-gray-500" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            <div className="flex-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="text-sm text-teal-600 font-medium hover:underline disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Click to upload image'}
              </button>
              <p className="text-xs text-gray-400 mt-0.5">JPG, PNG or WebP. Max 2MB.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Trainer Name *</label>
            <input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              placeholder="Full name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email ID *</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              placeholder="trainer@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password *</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
                minLength={6}
                autoComplete="new-password"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 pr-10"
                placeholder="Min. 6 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password *</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                required
                minLength={6}
                autoComplete="new-password"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 pr-10"
                placeholder="Re-enter password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Mobile Number</label>
            <input type="tel" value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              placeholder="+91 98765 43210" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Date of Birth</label>
            <input type="date" value={form.date_of_birth} onChange={e => setForm({ ...form, date_of_birth: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
          <textarea value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} rows={2}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            placeholder="Full address" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Trainer Skills</label>
          <div className="flex gap-2 mb-2">
            <input value={newSkill} onChange={e => setNewSkill(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              placeholder="Add a skill (e.g. React, Python)" />
            <button type="button" onClick={addSkill}
              className="px-4 py-2.5 text-sm font-medium bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-1">
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
          {form.skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.skills.map(skill => (
                <span key={skill} className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium bg-teal-50 text-teal-700 rounded-lg border border-teal-200">
                  {skill}
                  <button type="button" onClick={() => removeSkill(skill)} className="text-teal-400 hover:text-red-500 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Mode of Training</label>
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

        <div className="flex gap-3 justify-end pt-2">
          <button type="button" onClick={onCancel} className="px-5 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={saving}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl hover:from-teal-600 hover:to-emerald-700 shadow-sm transition-all disabled:opacity-50">
            {saving ? 'Adding...' : 'Add Trainer'}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ── Assignments ── */
function AssignmentsTab() {
  const [assignments, setAssignments] = useState<(CourseAssignment & { course?: Course; trainer?: TrainerProfile })[]>([]);
  const [trainers, setTrainers] = useState<TrainerProfile[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const [assignRes, trainerRes, courseRes] = await Promise.all([
      supabase.from('course_assignments').select('*, course:courses(*), trainer:trainers(*)').order('assigned_at', { ascending: false }),
      supabase.from('trainers').select('*').order('full_name'),
      supabase.from('courses').select('*').eq('is_published', true).order('title'),
    ]);
    setAssignments(assignRes.data || []);
    setTrainers(trainerRes.data || []);
    setCourses(courseRes.data || []);
    setLoading(false);
  }

  if (loading) return <div className="animate-pulse h-64 bg-gray-100 rounded-xl" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Course Assignments</h2>
        <button onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl hover:from-teal-600 hover:to-emerald-700 shadow-sm shadow-teal-500/20 transition-all">
          <Plus className="w-4 h-4" /> Assign Course
        </button>
      </div>

      {showForm && (
        <AssignmentForm
          trainers={trainers}
          courses={courses}
          onSave={() => { setShowForm(false); loadData(); }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {assignments.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <UserCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No course assignments yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Course</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Trainer</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Schedule</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {assignments.map(a => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{a.course?.title || a.course_id}</td>
                  <td className="px-4 py-3 text-gray-700">{a.trainer?.full_name || a.trainer_id}</td>
                  <td className="px-4 py-3 text-gray-500">
                    <div className="flex flex-col gap-0.5">
                      {a.schedule_days?.length > 0 && <span className="text-xs">{a.schedule_days.join(', ')}</span>}
                      {a.schedule_time && <span className="text-xs">{a.schedule_time}</span>}
                      {a.schedule_start && <span className="text-xs text-gray-400">From {new Date(a.schedule_start).toLocaleDateString()}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                      a.status === 'active' ? 'bg-emerald-50 text-emerald-700' :
                      a.status === 'upcoming' ? 'bg-blue-50 text-blue-700' :
                      a.status === 'completed' ? 'bg-gray-100 text-gray-600' :
                      'bg-red-50 text-red-700'
                    }`}>{a.status}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={async () => {
                        if (confirm('Delete this assignment?')) {
                          await supabase.from('course_assignments').delete().eq('id', a.id);
                          loadData();
                        }
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AssignmentForm({ trainers, courses, onSave, onCancel }: {
  trainers: TrainerProfile[];
  courses: Course[];
  onSave: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    trainer_id: '',
    course_id: '',
    schedule_start: '',
    schedule_end: '',
    schedule_days: [] as string[],
    schedule_time: '',
  });
  const [saving, setSaving] = useState(false);

  const dayOptions = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  function toggleDay(day: string) {
    setForm(prev => ({
      ...prev,
      schedule_days: prev.schedule_days.includes(day)
        ? prev.schedule_days.filter(d => d !== day)
        : [...prev.schedule_days, day],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await supabase.from('course_assignments').insert({
      trainer_id: form.trainer_id,
      course_id: form.course_id,
      schedule_start: form.schedule_start ? new Date(form.schedule_start).toISOString() : null,
      schedule_end: form.schedule_end ? new Date(form.schedule_end).toISOString() : null,
      schedule_days: form.schedule_days,
      schedule_time: form.schedule_time,
    });
    setSaving(false);
    onSave();
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 mb-4">
      <h3 className="font-semibold text-gray-900 mb-4">Assign Course to Trainer</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trainer</label>
            <select value={form.trainer_id} onChange={e => setForm({ ...form, trainer_id: e.target.value })} required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500">
              <option value="">Select a trainer</option>
              {trainers.map(t => (
                <option key={t.id} value={t.id}>
                  {t.full_name} ({t.mode_of_training === 'both' ? 'Online & Offline' : t.mode_of_training.charAt(0).toUpperCase() + t.mode_of_training.slice(1)}{t.skills.length > 0 ? ' - ' + t.skills.slice(0, 3).join(', ') : ''})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
            <select value={form.course_id} onChange={e => setForm({ ...form, course_id: e.target.value })} required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500">
              <option value="">Select a course</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input type="date" value={form.schedule_start} onChange={e => setForm({ ...form, schedule_start: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input type="date" value={form.schedule_end} onChange={e => setForm({ ...form, schedule_end: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Schedule Days</label>
          <div className="flex flex-wrap gap-2">
            {dayOptions.map(day => (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  form.schedule_days.includes(day)
                    ? 'bg-teal-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Schedule Time</label>
          <input value={form.schedule_time} onChange={e => setForm({ ...form, schedule_time: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            placeholder="e.g. 10:00 AM - 12:00 PM" />
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50">
            {saving ? 'Saving...' : 'Assign Course'}
          </button>
        </div>
      </form>
    </div>
  );
}
