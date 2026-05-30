import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { useRouter } from '../lib/router';
import type { Course, Coupon } from '../lib/types';
import { formatCurrency, TIER_CONFIG } from '../lib/types';
import { AlertCircle, Tag, CheckCircle, ShieldCheck, CreditCard } from 'lucide-react';

export function EnrollPage({ slug }: { slug: string }) {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'idle' | 'creating_order' | 'paying' | 'verifying' | 'success'>('idle');
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
  }

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
    if (!course || !coupon) return course?.registration_fee || 0;
    return Math.round(course.registration_fee * (1 - coupon.discount_percent / 100));
  }

  async function handlePayment() {
    if (!user || !course) return;
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
        if (enrollErr.code === '23505') { router.navigate('/dashboard'); return; }
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
        setTimeout(() => router.navigate('/dashboard'), 2000);
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
              setTimeout(() => router.navigate('/dashboard'), 2000);
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

  // Wait for auth to resolve
  if (authLoading || loading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/2" />
          <div className="h-40 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Course Not Found</h2>
        <p className="text-gray-500">The course you're looking for doesn't exist.</p>
      </div>
    );
  }

  // Auth resolved but no user - redirect to login with return path
  if (!user) {
    router.setRedirectAfterLogin(`/enroll/${slug}`);
    router.navigate('/login');
    return null;
  }

  const config = TIER_CONFIG[course.tier];
  const finalFee = getFinalFee();
  const hasDiscount = coupon && coupon.discount_percent > 0;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Complete Enrollment</h1>
          <p className="mt-2 text-gray-500">You're enrolling in</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 bg-gray-50 border-b border-gray-100">
            <div className="flex items-start gap-4">
              <img src={course.image_url} alt={course.title} className="w-16 h-16 rounded-xl object-cover" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900">{course.title}</h3>
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
                <p className="text-gray-500 text-sm">Redirecting to your dashboard...</p>
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
                  {couponError && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {couponError}</p>}
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
    </div>
  );
}
