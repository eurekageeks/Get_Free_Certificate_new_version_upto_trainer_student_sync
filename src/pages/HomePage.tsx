import {
  FaChalkboardTeacher,
  FaUserGraduate,
  FaCertificate
} from "react-icons/fa";
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Link, useRouter } from '../lib/router';
import type { Course, Tier } from '../lib/types';
import { formatCurrency, TIER_CONFIG } from '../lib/types';
import { Clock, BookOpen, ArrowRight, Star, Users, Award, Zap } from 'lucide-react';
import { FaChalkboardTeacher, FaLightbulb, FaTasks, FaCertificate } from "react-icons/fa";
export function HomePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTier, setActiveTier] = useState<Tier | 'all'>('all');
  const router = useRouter();

  useEffect(() => {
    loadCourses();
  }, []);

  async function loadCourses() {
    const { data } = await supabase
      .from('courses')
      .select('*')
      .eq('is_published', true)
      .order('registration_fee', { ascending: true });
    setCourses(data || []);
    setLoading(false);
  }

  const filtered = activeTier === 'all'
    ? courses
    : courses.filter(c => c.tier === activeTier);

  const tiers: (Tier | 'all')[] = ['all', 'beginner', 'intermediate', 'advanced'];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-400/5 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-teal-500/10 border border-teal-500/20 rounded-full text-teal-400 text-sm font-medium mb-6">
              <Zap className="w-3.5 h-3.5" />
              Free Training + Certification + Only Pay Registeration Fees
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight">
              Build Real Skills.
              <br />
              <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
                Earn Verified Certificates.
              </span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-300 leading-relaxed max-w-2xl">
               <p>
  Register for an industry-recognized certification program by paying only a small registration fee.
</p>

<ul className="space-y-3 mt-4">
  <li className="flex items-center gap-2">
    <FaChalkboardTeacher className="text-teal-400 text-lg" />
    <span>Attend 10–20 hours of online instructor-led training</span>
  </li>

  <li className="flex items-center gap-2">
    <FaLightbulb className="text-teal-400 text-lg" />
    <span>Learn practical concepts and industry-relevant skills</span>
  </li>

  <li className="flex items-center gap-2">
    <FaTasks className="text-teal-400 text-lg" />
    <span>Complete the certification requirements</span>
  </li>

  <li className="flex items-center gap-2">
    <FaCertificate className="text-teal-400 text-lg" />
    <span>Receive a Verified Certificate of Completion</span>
  </li>
</ul>
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-teal-600 hover:to-emerald-700 shadow-lg shadow-teal-500/25 transition-all hover:shadow-teal-500/40 hover:-translate-y-0.5"
              >
                Explore Courses <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/verify"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all"
              >
                Verify Certificate
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-8 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-400" />
                <span>10,000+ Students</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-teal-400" />
                <span>11 Courses</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-teal-400" />
                <span>Verified Certificates</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
            <p className="mt-3 text-gray-500">Simple, transparent, and affordable</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Choose a Course', desc: 'Browse our catalog of beginner to advanced IT courses. All course content is free to access.', icon: BookOpen },
              { step: '2', title: 'Pay Registration Fee', desc: 'Pay a small registration fee (₹199–₹999) to enroll. This covers assessment and certification costs.', icon: Star },
              { step: '3', title: 'Learn & Get Certified', desc: 'Complete the course at your pace, pass the assessment, and receive a verified certificate with QR code.', icon: Award },
            ].map((item) => (
              <div key={item.step} className="relative p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:border-teal-200 hover:shadow-lg hover:shadow-teal-500/5 transition-all group">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-lg mb-4 shadow-md shadow-teal-500/20 group-hover:scale-110 transition-transform">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses */}
      <section className="py-16 bg-gray-50" id="courses">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">Free Certification Courses</h2>
            <p className="mt-3 text-gray-500">Pay only registration fee | Training + Certificate included</p>
          </div>

          {/* Tier Filter */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-white rounded-xl p-1.5 shadow-sm border border-gray-200">
              {tiers.map((tier) => (
                <button
                  key={tier}
                  onClick={() => setActiveTier(tier)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    activeTier === tier
                      ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {tier === 'all' ? 'All Courses' : TIER_CONFIG[tier].label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-full" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              No courses found in this category.
            </div>
          )}
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Affordable Pricing Tiers</h2>
            <p className="mt-3 text-gray-500">Free training + Certification | Pay only registration fee</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { tier: 'beginner' as Tier, fee: '₹199–₹299', courses: '3 Courses', features: ['HTML, CSS, Python', 'Computer Fundamentals', 'Beginner Certificate', 'Self-paced Learning'] },
              { tier: 'intermediate' as Tier, fee: '₹299–₹599', courses: '4 Courses', features: ['JavaScript, React', 'Git & GitHub, Linux', 'Intermediate Certificate', 'Project-based Learning'], popular: true },
              { tier: 'advanced' as Tier, fee: '₹599–₹999', courses: '4 Courses', features: ['DevOps, Cloud, Security', 'Data Analytics', 'Advanced Certificate', 'Career-ready Skills'] },
            ].map((plan) => {
              const config = TIER_CONFIG[plan.tier];
              return (
                <div
                  key={plan.tier}
                  className={`relative p-6 rounded-2xl border-2 transition-all hover:shadow-lg ${
                    plan.popular
                      ? 'border-teal-500 bg-gradient-to-b from-teal-50/50 to-white shadow-md shadow-teal-500/10'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-teal-500 to-emerald-600 text-white text-xs font-semibold rounded-full">
                      Most Popular
                    </div>
                  )}
                  <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${config.bg} ${config.color}`}>
                    {config.label}
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{plan.fee}</div>
                  <div className="text-sm text-gray-500 mb-4">Registration Fee Only</div>
                  <div className="text-sm font-medium text-gray-700 mb-3">{plan.courses}</div>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-teal-500 rounded-full flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => router.navigate('/courses')}
                    className="w-full py-2.5 text-sm font-semibold rounded-xl border-2 border-teal-500 text-teal-600 hover:bg-teal-500 hover:text-white transition-colors"
                  >
                    View Courses
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Start Learning Today
          </h2>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of learners building their IT careers. Free course content, verified certificates, and affordable registration fees.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-teal-600 hover:to-emerald-700 shadow-lg shadow-teal-500/25 transition-all hover:shadow-teal-500/40 hover:-translate-y-0.5"
          >
            Create Free Account <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

function CourseCard({ course }: { course: Course }) {
  const config = TIER_CONFIG[course.tier];
  const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);

  return (
    <Link
      to={`/course/${course.slug}`}
      className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 hover:border-teal-200 transition-all hover:-translate-y-1"
    >
      <div className="relative h-48 overflow-hidden bg-gray-100">
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
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-teal-700 transition-colors mb-2">
          {course.title}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-2 mb-4">{course.description}</p>
        <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {course.duration_hours}h
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" /> {course.modules.length} modules
          </span>
          <span className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5" /> {totalLessons} lessons
          </span>
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div>
            <span className="text-xs text-gray-400">Registration Fee</span>
            <div className="text-lg font-bold text-teal-600">{formatCurrency(course.registration_fee)}</div>
          </div>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-teal-600 group-hover:text-teal-700">
            Enroll <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </span>
        </div>
      </div>
    </Link>
  );
}
