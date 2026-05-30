import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { useRouter } from '../lib/router';
import type { Course, Profile, Payment, Certificate, Coupon } from '../lib/types';
import { formatCurrency, TIER_CONFIG } from '../lib/types';
import { LayoutDashboard, BookOpen, Users, CreditCard, Award, Tag, Plus, CreditCard as Edit3, Trash2 } from 'lucide-react';

type AdminTab = 'overview' | 'courses' | 'students' | 'payments' | 'certificates' | 'coupons';

export function AdminPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  if (authLoading) return null;
  if (!isAdmin) {
    router.navigate('/');
    return null;
  }

  const tabs: { id: AdminTab; label: string; icon: typeof LayoutDashboard }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'certificates', label: 'Certificates', icon: Award },
    { id: 'coupons', label: 'Coupons', icon: Tag },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-gray-500 text-sm">Manage courses, students, payments, and certificates</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <nav className="lg:w-56 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-100 p-2 flex lg:flex-col gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'courses' && <CoursesTab />}
          {activeTab === 'students' && <StudentsTab />}
          {activeTab === 'payments' && <PaymentsTab />}
          {activeTab === 'certificates' && <CertificatesTab />}
          {activeTab === 'coupons' && <CouponsTab />}
        </div>
      </div>
    </div>
  );
}

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
    { label: 'Total Courses', value: stats.courses, icon: BookOpen, color: 'teal' },
    { label: 'Students', value: stats.students, icon: Users, color: 'blue' },
    { label: 'Revenue', value: formatCurrency(stats.revenue), icon: CreditCard, color: 'emerald' },
    { label: 'Certificates', value: stats.certificates, icon: Award, color: 'amber' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              card.color === 'teal' ? 'bg-teal-50 text-teal-600' :
              card.color === 'blue' ? 'bg-blue-50 text-blue-600' :
              card.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
              'bg-amber-50 text-amber-600'
            }`}>
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
  );
}

function CoursesTab() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Course | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { loadCourses(); }, []);

  async function loadCourses() {
    const { data } = await supabase.from('courses').select('*').order('created_at', { ascending: false });
    setCourses(data || []);
    setLoading(false);
  }

  async function togglePublish(course: Course) {
    await supabase.from('courses').update({ is_published: !course.is_published }).eq('id', course.id);
    setCourses(prev => prev.map(c => c.id === course.id ? { ...c, is_published: !c.is_published } : c));
  }

  async function deleteCourse(id: string) {
    if (!confirm('Delete this course?')) return;
    await supabase.from('courses').delete().eq('id', id);
    setCourses(prev => prev.filter(c => c.id !== id));
  }

  if (loading) return <div className="animate-pulse h-64 bg-gray-100 rounded-xl" />;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Courses</h2>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-lg hover:from-teal-600 hover:to-emerald-700 flex items-center gap-1.5"
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

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Course</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Tier</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Fee</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {courses.map((course) => {
              const config = TIER_CONFIG[course.tier];
              return (
                <tr key={course.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{course.title}</div>
                    <div className="text-xs text-gray-400">{course.slug}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${config.bg} ${config.color}`}>
                      {config.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{formatCurrency(course.registration_fee)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => togglePublish(course)}
                      className={`px-2 py-0.5 text-xs font-medium rounded ${
                        course.is_published ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {course.is_published ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => { setEditing(course); setShowForm(true); }}
                        className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteCourse(course.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
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
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    if (course) {
      await supabase.from('courses').update(form).eq('id', course.id);
    } else {
      await supabase.from('courses').insert(form);
    }
    setSaving(false);
    onSave();
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 mb-4">
      <h3 className="font-semibold text-gray-900 mb-4">{course ? 'Edit Course' : 'New Course'}</h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" />
        </div>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Registration Fee (paise)</label>
          <input type="number" value={form.registration_fee} onChange={e => setForm({ ...form, registration_fee: parseInt(e.target.value) })} required
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Duration (hours)</label>
          <input type="number" value={form.duration_hours} onChange={e => setForm({ ...form, duration_hours: parseInt(e.target.value) })} required
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
          <input value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" checked={form.is_published} onChange={e => setForm({ ...form, is_published: e.target.checked })} id="published" />
          <label htmlFor="published" className="text-sm text-gray-700">Published</label>
        </div>
        <div className="flex gap-2 sm:col-span-2 justify-end">
          <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50">
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}

function StudentsTab() {
  const [students, setStudents] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    supabase.from('profiles').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      setStudents(data || []);
      setLoading(false);
    });
  }, []);

  const filtered = students.filter(s =>
    s.full_name.toLowerCase().includes(search.toLowerCase()) || s.id.includes(search)
  );

  if (loading) return <div className="animate-pulse h-64 bg-gray-100 rounded-xl" />;

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Students</h2>
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or ID..."
          className="w-full sm:w-80 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
        />
      </div>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Name</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Role</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Phone</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(s => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{s.full_name || 'Unnamed'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded ${s.role === 'admin' ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                    {s.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{s.phone || '-'}</td>
                <td className="px-4 py-3 text-gray-500">{new Date(s.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

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
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Payments</h2>
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
                  }`}>
                    {p.status}
                  </span>
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
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Certificates</h2>
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
    </div>
  );
}

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
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Coupons</h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-lg hover:from-teal-600 hover:to-emerald-700 flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add Coupon
        </button>
      </div>

      {showForm && (
        <CouponForm
          onSave={() => { setShowForm(false); loadCoupons(); }}
          onCancel={() => setShowForm(false)}
        />
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
                  <button
                    onClick={() => toggleCoupon(c)}
                    className={`px-2 py-0.5 text-xs font-medium rounded ${
                      c.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {c.is_active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={async () => { if (confirm('Delete?')) { await supabase.from('coupons').delete().eq('id', c.id); loadCoupons(); } }}
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
