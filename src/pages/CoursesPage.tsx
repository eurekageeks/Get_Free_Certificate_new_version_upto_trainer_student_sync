import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from '../lib/router';
import type { Course, Tier } from '../lib/types';
import { formatCurrency, TIER_CONFIG } from '../lib/types';
import { Clock, BookOpen, ArrowRight, Star, Search, SlidersHorizontal } from 'lucide-react';

export function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTier, setActiveTier] = useState<Tier | 'all'>('all');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');


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

  const categories = ['all', ...Array.from(new Set(courses.map(c => c.category)))];

 const today = new Date();
today.setHours(0, 0, 0, 0);

const filtered = courses.filter((c) => {
  if (!c.is_published) return false;

  if (c.batch_start_date && c.batch_end_date) {
    const startDate = new Date(c.batch_start_date);
    const endDate = new Date(c.batch_end_date);

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    // Hide course during running batch period
    if (today >= startDate && today <= endDate) {
      return false;
    }
  }

  if (activeTier !== 'all' && c.tier !== activeTier) return false;
  if (category !== 'all' && c.category !== category) return false;

  if (
    search &&
    !c.title.toLowerCase().includes(search.toLowerCase()) &&
    !c.description.toLowerCase().includes(search.toLowerCase())
  ) {
    return false;
  }

  return true;
});
  const tiers: (Tier | 'all')[] = ['all', 'beginner', 'intermediate', 'advanced'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">All Courses</h1>
        <p className="mt-2 text-gray-500">Free training + Certification | Pay only registration fee</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
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
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          >
            {categories.map(c => (
              <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tier Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {tiers.map((tier) => (
          <button
            key={tier}
            onClick={() => setActiveTier(tier)}
            className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
              activeTier === tier
                ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-teal-300 hover:text-teal-700'
            }`}
          >
            {tier === 'all' ? 'All Levels' : TIER_CONFIG[tier].label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
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
        <div className="text-center py-16 text-gray-400">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-lg">No courses match your search.</p>
        </div>
      )}
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
            View Details <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </span>
        </div>
      </div>
    </Link>
  );
}
