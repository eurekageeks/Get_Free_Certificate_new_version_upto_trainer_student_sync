import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter, Link } from '../lib/router';
import { useAuth } from '../lib/auth';
import type { Course, CourseModule, Coupon } from '../lib/types';
import { formatCurrency, TIER_CONFIG } from '../lib/types';
import {
  Clock, BookOpen, Star, ChevronDown, ChevronUp, CheckCircle,
  ArrowRight, Lock, Play, CreditCard, Tag, ShieldCheck, X
} from 'lucide-react';

export function CourseDetailPage({ slug }: { slug: string }) {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedModule, setExpandedModule] = useState<number | null>(0);
  const [enrolled, setEnrolled] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    loadCourse();
  }, [slug]);

  async function loadCourse() {
    const { data } = await supabase
      .from('courses')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .maybeSingle();
    setCourse(data);
    setLoading(false);

    if (data && user) {
      const { data: enrollment } = await supabase
        .from('enrollments')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_id', data.id)
        .maybeSingle();
      setEnrolled(!!enrollment);
    }
  }

  if (loading || authLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Course Not Found</h2>
        <p className="text-gray-500 mb-6">The course you're looking for doesn't exist.</p>
        <Link to="/courses" className="text-teal-600 font-medium hover:underline">
          Browse all courses
        </Link>
      </div>
    );
  }

  const config = TIER_CONFIG[course.tier];
  const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);

  function handleEnrollClick() {
    if (!user) {
      router.setRedirectAfterLogin(`/course/${course!.slug}`);
      router.navigate('/login');
    } else if (enrolled) {
      router.navigate('/dashboard');
    } else {
      setShowPayment(true);
    }
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 text-xs font-semibold rounded-lg ${config.bg} ${config.color} border ${config.border}`}>
                  {config.label}
                </span>
                <span className="px-3 py-1 text-xs font-semibold rounded-lg bg-white/10 text-gray-300 border border-white/10">
                  {course.category}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">{course.title}</h1>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">{course.description}</p>
              <div className="flex flex-wrap gap-6 text-sm text-gray-400">
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-teal-400" /> {course.duration_hours} hours
                </span>
                <span className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-teal-400" /> {course.modules.length} modules
                </span>
                <span className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-teal-400" /> {totalLessons} lessons
                </span>
              </div>
            </div>

            {/* Enrollment Card */}
            <div className="bg-white rounded-2xl p-6 shadow-xl h-fit">
              <div className="text-center mb-4">
                <div className="text-sm text-gray-500 mb-1">Registration Fee</div>
                <div className="text-3xl font-bold text-gray-900">{formatCurrency(course.registration_fee)}</div>
                <div className="text-xs text-gray-400 mt-1">Training + Certificate Included</div>
              </div>
              <div className="space-y-2 mb-6 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <CheckCircle className="w-4 h-4 text-teal-500 flex-shrink-0" /> Full course access
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <CheckCircle className="w-4 h-4 text-teal-500 flex-shrink-0" /> Verified certificate
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <CheckCircle className="w-4 h-4 text-teal-500 flex-shrink-0" /> Self-paced learning
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <CheckCircle className="w-4 h-4 text-teal-500 flex-shrink-0" /> QR code verification
                </div>
              </div>
              {enrolled ? (
                <button
                  onClick={() => router.navigate('/dashboard')}
                  className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" /> Continue Learning
                </button>
              ) : (
                <button
                  onClick={handleEnrollClick}
                  className="w-full py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-teal-600 hover:to-emerald-700 shadow-lg shadow-teal-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" /> Enroll Now <ArrowRight className="w-4 h-4" />
                </button>
              )}
              {!user && (
                <p className="text-xs text-gray-400 text-center mt-3">
                  You'll need to sign in to complete enrollment
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Curriculum</h2>
        <div className="space-y-3">
          {course.modules.map((mod, idx) => (
            <ModuleItem
              key={idx}
              module={mod}
              index={idx}
              expanded={expandedModule === idx}
              onToggle={() => setExpandedModule(expandedModule === idx ? null : idx)}
            />
          ))}
        </div>
      </section>

      {/* Payment Modal */}
      {showPayment && user && (
        <PaymentModal
          course={course}
          user={user}
          profile={profile}
          onClose={() => setShowPayment(false)}
          onSuccess={() => { setShowPayment(false); loadCourse(); }}
        />
      )}
    </div>
  );
}

/* ── Payment Modal ── */
function PaymentModal({ course, user, profile, onClose, onSuccess }: {
  course: Course;
  user: { id: string; email?: string };
  profile: { full_name: string } | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'idle' | 'creating_order' | 'paying' | 'verifying' | 'success'>('idle');
  const config = TIER_CONFIG[course.tier];

  async function applyCoupon() {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    const { data } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', couponCode.trim().toUpperCase())
      .eq('is_active', true)
      .maybeSingle();

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
    const finalFee = getFinalFee();

    try {
      const { data: enrollment, error: enrollErr } = await supabase
        .from('enrollments')
        .insert({ user_id: user.id, course_id: course.id, status: 'active', progress: 0 })
        .select()
        .single();

      if (enrollErr) {
        if (enrollErr.code === '23505') { onSuccess(); return; }
        throw enrollErr;
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const orderRes = await fetch(`${supabaseUrl}/functions/v1/create-razorpay-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${anonKey}` },
        body: JSON.stringify({
          amount: finalFee, currency: 'INR', course_id: course.id,
          user_id: user.id, enrollment_id: enrollment.id, coupon_code: coupon?.code || null,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || 'Order creation failed');

      setPaymentStep('paying');

      if (orderData.demo_mode || orderData.key_id === 'demo_key') {
        await new Promise(r => setTimeout(r, 1500));
        setPaymentStep('verifying');

        const verifyRes = await fetch(`${supabaseUrl}/functions/v1/verify-payment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${anonKey}` },
          body: JSON.stringify({
            razorpay_order_id: orderData.order_id, razorpay_payment_id: `pay_demo_${Date.now()}`,
            user_id: user.id, course_id: course.id, enrollment_id: enrollment.id,
          }),
        });

        if (!verifyRes.ok) throw new Error('Payment verification failed');
        setPaymentStep('success');
        setTimeout(() => onSuccess(), 2000);
      } else {
        const options = {
          key: orderData.key_id, amount: orderData.amount, currency: orderData.currency,
          order_id: orderData.order_id, name: 'SkillForge',
          description: `${course.title} - Registration Fee`,
          handler: async function (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) {
            setPaymentStep('verifying');
            const verifyRes = await fetch(`${supabaseUrl}/functions/v1/verify-payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${anonKey}` },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                user_id: user.id, course_id: course.id, enrollment_id: enrollment.id,
              }),
            });
            if (verifyRes.ok) {
              setPaymentStep('success');
              setTimeout(() => onSuccess(), 2000);
            } else {
              setPaymentStep('idle'); setProcessing(false);
              alert('Payment verification failed. Please contact support.');
            }
          },
          prefill: { name: profile?.full_name || '', email: user.email || '' },
          theme: { color: '#0d9488' },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', () => { setPaymentStep('idle'); setProcessing(false); });
        rzp.open();
      }
    } catch (err) {
      console.error('Payment error:', err);
      setPaymentStep('idle'); setProcessing(false);
      alert('Something went wrong. Please try again.');
    }
  }

  const finalFee = getFinalFee();
  const hasDiscount = coupon && coupon.discount_percent > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => !processing && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Complete Enrollment</h2>
          {!processing && (
            <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
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
  );
}

/* ── Module Item ── */
function ModuleItem({ module, index, expanded, onToggle }: {
  module: CourseModule;
  index: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-teal-50 text-teal-600 rounded-lg flex items-center justify-center text-sm font-semibold">
            {index + 1}
          </div>
          <span className="font-medium text-gray-900">{module.title}</span>
          <span className="text-xs text-gray-400">({module.lessons.length} lessons)</span>
        </div>
        {expanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
      </button>
      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-50">
          <ul className="space-y-2 pt-3">
            {module.lessons.map((lesson, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-gray-600 py-1.5">
                <Lock className="w-3.5 h-3.5 text-gray-300" />
                {lesson}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
