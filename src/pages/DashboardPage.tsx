import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { useRouter, Link } from '../lib/router';
import type { Enrollment, Certificate, Course, Coupon } from '../lib/types';
import { formatCurrency, TIER_CONFIG } from '../lib/types';
import {
  BookOpen, Award, Clock, Play, CheckCircle, ArrowRight, BarChart3,
  CreditCard, Tag, ShieldCheck, X, Zap, Search, SlidersHorizontal, Star
} from 'lucide-react';

interface EnrollmentWithCourse extends Enrollment {
  course: Course;
  topicProgress?: any[];
  totalTopics?: number;
  completedTopics?: number;
}

export function DashboardPage() {
  const [enrollments, setEnrollments] = useState<EnrollmentWithCourse[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'courses' | 'enrolled' | 'certs'>('courses');
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();

  const loadData = useCallback(async () => {
  if (!user) return;

  setDataLoading(true);
  setDataError(null);

  try {

   const [enrollRes, certRes, coursesRes] = await Promise.all([
  supabase
    .from('enrollments')
    .select(`
      *,
      course:courses(*)
    `)
    .eq('user_id', user.id)
    .order('enrolled_at', { ascending: false }),

  supabase
    .from('certificates')
    .select('*')
    .eq('user_id', user.id)
    .order('issued_at', { ascending: false }),

  supabase
    .from('courses')
    .select('*')
    .eq('is_published', true)
    .order('registration_fee', { ascending: true }),
]);
    if (enrollRes.error) {
      console.error('Enrollments error:', enrollRes.error);
    }

    if (coursesRes.error) {
      console.error('Courses error:', coursesRes.error);
      setDataError(coursesRes.error.message);
    }

    const enrollmentsWithProgress = await Promise.all(
  (enrollRes.data || []).map(async (enrollment: any) => {

    const { data: assignmentsData } = await supabase
      .from('course_assignments')
      .select('id')
      .eq('course_id', enrollment.course_id);

    let topicProgress: any[] = [];

    if (assignmentsData && assignmentsData.length > 0) {

      const assignmentIds = assignmentsData.map(a => a.id);

      const { data } = await supabase
        .from('topic_progress')
        .select('*')
        .in('assignment_id', assignmentIds);

      topicProgress = data || [];
    }

    const totalTopics = topicProgress.length;

    const completedTopics =
      topicProgress.filter((t: any) => t.completed).length;

    const progress =
      totalTopics > 0
        ? Math.round((completedTopics / totalTopics) * 100)
        : 0;

    return {
      ...enrollment,
      topicProgress,
      totalTopics,
      completedTopics,
      progress,
      status: progress === 100 ? 'completed' : 'active',
    };
  })
);

setEnrollments(enrollmentsWithProgress);
    setEnrollments(enrollmentsWithProgress);
    setCertificates(certRes.data || []);
    setAllCourses(coursesRes.data || []);

  } catch (err) {

    console.error('Dashboard data load error:', err);
    setDataError('Failed to load data. Please refresh the page.');

  } finally {

    setDataLoading(false);

  }

}, [user]);

  useEffect(() => {
    if (user && !authLoading) {
      loadData();
    }
  }, [user, authLoading, loadData]);

  async function updateProgress(enrollmentId: string, progress: number) {
    const newProgress = Math.min(100, progress);
    const status = newProgress === 100 ? 'completed' : 'active';
    await supabase
      .from('enrollments')
      .update({
        progress: newProgress,
        status,
        completed_at: status === 'completed' ? new Date().toISOString() : null,
      })
      .eq('id', enrollmentId);

    setEnrollments(prev =>
      prev.map(e => e.id === enrollmentId ? { ...e, progress: newProgress, status } : e)
    );

    if (status === 'completed') {
      const enrollment = enrollments.find(e => e.id === enrollmentId);
      if (enrollment) {
        const certNumber = `SF-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        await supabase.from('certificates').insert({
          certificate_number: certNumber,
          user_id: user!.id,
          course_id: enrollment.course_id,
          enrollment_id: enrollmentId,
          user_name: profile?.full_name || 'Student',
          course_name: enrollment.course.title,
        });
        loadData();
      }
    }
  }

 const availableCourses = allCourses || [];

  const filteredAvailable = availableCourses.filter(c => {
    if (tierFilter !== 'all' && c.tier !== tierFilter) return false;
    if (search && !c.title.toLowerCase().includes(search.toLowerCase()) && !c.category.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (authLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-200 rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    router.setRedirectAfterLogin('/dashboard');
    router.navigate('/login');
    return null;
  }

  if (dataLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-200 rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  const activeCount = enrollments.filter(e => e.status === 'active').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
        <p className="mt-1 text-gray-500">Welcome back, {profile?.full_name || 'Student'}</p>
      </div>

      {/* Error banner */}
      {dataError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center justify-between">
          <span>{dataError}</span>
          <button onClick={() => loadData()} className="text-red-500 hover:text-red-700 font-medium text-xs underline">
            Retry
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{enrollments.length}</div>
            <div className="text-sm text-gray-500">Enrolled</div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{activeCount}</div>
            <div className="text-sm text-gray-500">In Progress</div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
            <Award className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{certificates.length}</div>
            <div className="text-sm text-gray-500">Certificates</div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
            <Zap className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{availableCourses.length}</div>
            <div className="text-sm text-gray-500">Available</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { id: 'courses' as const, label: 'Browse Courses', icon: BookOpen, count: availableCourses.length },
          { id: 'enrolled' as const, label: 'My Courses', icon: Play, count: enrollments.length },
          { id: 'certs' as const, label: 'Certificates', icon: Award, count: certificates.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-teal-300 hover:text-teal-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              activeTab === tab.id ? 'bg-white/20' : 'bg-gray-100'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Browse Courses Tab */}
      {activeTab === 'courses' && (
        <div>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-gray-400" />
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          {filteredAvailable.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              {allCourses.length === 0 ? (
                <>
                  <p className="text-gray-500 mb-2">Could not load courses.</p>
                  <button
                    onClick={() => loadData()}
                    className="text-teal-600 font-medium hover:underline text-sm"
                  >
                    Try again
                  </button>
                </>
              ) : (
                <>
                  <p className="text-gray-500 mb-2">No courses match your filters.</p>
                  <button
                    onClick={() => { setSearch(''); setTierFilter('all'); }}
                    className="text-teal-600 font-medium hover:underline text-sm"
                  >
                    Clear filters
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredAvailable.map((course) => (
                <AvailableCourseCard key={course.id} course={course} userId={user.id} userEmail={user.email || ''} profile={profile} onEnrolled={loadData} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* My Courses Tab */}
      {activeTab === 'enrolled' && (
        <div>
          {enrollments.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">You haven't enrolled in any courses yet.</p>
              <button
                onClick={() => setActiveTab('courses')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-medium rounded-xl hover:from-teal-600 hover:to-emerald-700 transition-all"
              >
                Browse Courses <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {enrollments.map((enrollment) => (
                <EnrollmentCard
                  key={enrollment.id}
                  enrollment={enrollment}
                  onUpdateProgress={updateProgress}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Certificates Tab */}
      {activeTab === 'certs' && (
        <div>
          {certificates.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
              <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-2">No certificates yet.</p>
              <p className="text-sm text-gray-400">Complete a course to earn your first certificate!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="bg-white rounded-xl border border-gray-100 p-5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                      <Award className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{cert.course_name}</div>
                      <div className="text-xs text-gray-400">ID: {cert.certificate_number}</div>
                    </div>
                  </div>
                  <Link
                    to={`/verify/${cert.certificate_number}`}
                    className="text-sm text-teal-600 font-medium hover:underline"
                  >
                    View
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Available Course Card with Payment Gateway ── */
function AvailableCourseCard({ course, userId, userEmail, profile, onEnrolled }: {
  course: Course;
  userId: string;
  userEmail: string;
  profile: { full_name: string } | null;
  onEnrolled: () => void;
}) {
  const [showPayment, setShowPayment] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'idle' | 'creating_order' | 'paying' | 'verifying' | 'success'>('idle');
  const config = TIER_CONFIG[course.tier];
  const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);

  async function applyCoupon() {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    const { data: assignments } = await supabase
  .from('course_assignments')
  .select('id')
  .eq('course_id', enrollment.course_id);

    if (data && data.used_count < data.max_uses && (!data.valid_until || new Date(data.valid_until) > new Date())) {
      setCoupon(data);
    } else {
      setCouponError('Invalid or expired coupon code');
      setCoupon(null);
    }
    setCouponLoading(false);
  }

  function getFinalFee(): number {
    if (!coupon) return course.registration_fee;
    return Math.round(course.registration_fee * (1 - coupon.discount_percent / 100));
  }

 async function handlePayment() {
  setProcessing(true);
  setPaymentStep('creating_order');

  try {

    // Check existing enrollment
    const { data: existingEnrollment } = await supabase
      .from('enrollments')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', course.id)
      .maybeSingle();

    if (existingEnrollment) {
      alert('You are already enrolled in this course.');
      setShowPayment(false);
      onEnrolled();
      return;
    }

    // Create enrollment
    const { data: enrollment, error: enrollErr } = await supabase
      .from('enrollments')
      .insert({
        user_id: userId,
        course_id: course.id,
        status: 'active',
        progress: 0,
      })
      .select()
      .single();

    if (enrollErr) {
      throw enrollErr;
    }

    if (!enrollment) {
      throw new Error('Enrollment creation failed');
    }

    console.log('Enrollment created:', enrollment);

    // TEMPORARY SUCCESS
    alert('Enrollment successful!');

    setPaymentStep('success');

    setTimeout(() => {
      setShowPayment(false);
      setPaymentStep('idle');
      onEnrolled();
    }, 1000);

  } catch (err) {

    console.error('Payment error:', err);

    alert(
      typeof err === 'object'
        ? JSON.stringify(err, null, 2)
        : String(err)
    );

    setPaymentStep('idle');

  } finally {

    setProcessing(false);

  }
}
   
      
    
  

  const finalFee = getFinalFee();
  const hasDiscount = coupon && coupon.discount_percent > 0;

  return (
    <>
      <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 hover:border-teal-200 transition-all hover:-translate-y-1">
        <div className="relative h-40 overflow-hidden bg-gray-100">
          <img
            src={course.image_url}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute top-3 left-3">
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${config.bg} ${config.color} border ${config.border}`}>
              {config.label}
            </span>
          </div>
          <div className="absolute top-3 right-3">
            <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white/90 text-gray-800 backdrop-blur-sm shadow-sm">
              {course.category}
            </span>
          </div>
        </div>
        <div className="p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h3>
          <p className="text-sm text-gray-500 line-clamp-2 mb-3">{course.description}</p>
          <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {course.duration_hours}h</span>
            <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> {course.modules.length} modules</span>
            <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5" /> {totalLessons} lessons</span>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div>
              <span className="text-xs text-gray-400">Registration Fee</span>
              <div className="text-lg font-bold text-teal-600">{formatCurrency(course.registration_fee)}</div>
            </div>
            <button
              onClick={() => setShowPayment(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl hover:from-teal-600 hover:to-emerald-700 shadow-sm shadow-teal-500/20 transition-all"
            >
              <CreditCard className="w-4 h-4" /> Enroll Now
            </button>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => !processing && setShowPayment(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Complete Enrollment</h2>
              {!processing && (
                <button onClick={() => setShowPayment(false)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="p-5 bg-gray-50 border-b border-gray-100">
              <div className="flex items-start gap-3">
                <img src={course.image_url} alt={course.title} className="w-14 h-14 rounded-xl object-cover" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm">{course.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${config.bg} ${config.color}`}>{config.label}</span>
                    <span className="text-xs text-gray-400">{course.duration_hours}h</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {paymentStep === 'success' ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Payment Successful!</h3>
                  <p className="text-gray-500 text-sm">You are now enrolled in this course.</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Registration Fee</span>
                    <span className="font-medium text-gray-900">{formatCurrency(course.registration_fee)}</span>
                  </div>
                  {hasDiscount && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Coupon Discount ({coupon.discount_percent}%)</span>
                      <span className="font-medium text-emerald-600">-{formatCurrency(course.registration_fee - finalFee)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-3 border-t border-gray-100">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="text-xl font-bold text-teal-600">{formatCurrency(finalFee)}</span>
                  </div>
                  {hasDiscount && (
                    <div className="flex items-center gap-2 p-2.5 bg-emerald-50 text-emerald-700 text-sm rounded-lg">
                      <Tag className="w-4 h-4" />
                      Coupon "{coupon.code}" applied - You save {formatCurrency(course.registration_fee - finalFee)}!
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Have a coupon code?</label>
                    <div className="flex gap-2">
                      <input type="text" value={couponCode}
                        onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); }}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                        placeholder="Enter code" disabled={processing} />
                      <button onClick={applyCoupon} disabled={couponLoading || !couponCode.trim() || processing}
                        className="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50">
                        Apply
                      </button>
                    </div>
                    {couponError && <p className="mt-1.5 text-xs text-red-500">{couponError}</p>}
                  </div>
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600"><CheckCircle className="w-4 h-4 text-teal-500 flex-shrink-0" /> Full course access</div>
                    <div className="flex items-center gap-2 text-sm text-gray-600"><CheckCircle className="w-4 h-4 text-teal-500 flex-shrink-0" /> Verified certificate with QR code</div>
                    <div className="flex items-center gap-2 text-sm text-gray-600"><CheckCircle className="w-4 h-4 text-teal-500 flex-shrink-0" /> Self-paced, lifetime access</div>
                  </div>
                  <button onClick={handlePayment} disabled={processing}
                    className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-teal-600 hover:to-emerald-700 shadow-lg shadow-teal-500/25 transition-all disabled:opacity-70 flex items-center justify-center gap-2">
                    {paymentStep === 'creating_order' && <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating order...</>}
                    {paymentStep === 'paying' && <><CreditCard className="w-4 h-4" /> Opening payment gateway...</>}
                    {paymentStep === 'verifying' && <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Verifying payment...</>}
                    {paymentStep === 'idle' && <><ShieldCheck className="w-4 h-4" /> Pay {formatCurrency(finalFee)} & Enroll</>}
                  </button>
                  <p className="text-xs text-gray-400 text-center flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Secure payment via Razorpay. Refund available per our policy.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ── Enrollment Card ── */
function EnrollmentCard({ enrollment, onUpdateProgress }: {
  enrollment: EnrollmentWithCourse;
  onUpdateProgress: (id: string, progress: number) => void;
}) {
  const config = TIER_CONFIG[enrollment.course.tier];
  const isCompleted = enrollment.status === 'completed';

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex gap-4 p-4">
        <img
          src={enrollment.course.image_url}
          alt={enrollment.course.title}
          className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 text-xs font-medium rounded ${config.bg} ${config.color}`}>
              {config.label}
            </span>
            {isCompleted && (
              <span className="px-2 py-0.5 text-xs font-medium rounded bg-emerald-50 text-emerald-700 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Completed
              </span>
            )}
          </div>
          <h3 className="font-semibold text-gray-900 text-sm truncate">{enrollment.course.title}</h3>
          <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Enrolled {new Date(enrollment.enrolled_at).toLocaleDateString()}
          </div>
        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
          <span>Progress</span>
          <span className="font-medium">{enrollment.progress}%</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${enrollment.progress}%` }}
          />
        </div>
        <div className="mt-2 text-xs text-gray-500">
  {enrollment.completedTopics || 0} /
  {enrollment.totalTopics || 0} topics completed by trainer
</div>     </div>
    </div>
  );
}
