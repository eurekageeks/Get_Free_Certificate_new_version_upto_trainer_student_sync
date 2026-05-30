import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { useRouter } from '../lib/router';
import type { CourseAssignment, Course, TopicProgress, TrainerProfile } from '../lib/types';
import { TIER_CONFIG } from '../lib/types';
import {
  BookOpen, Clock, Calendar, CheckCircle, Circle,
  ChevronDown, ChevronUp, GraduationCap, Menu, X, LogOut,
  User, MapPin, Monitor, BarChart3, Play
} from 'lucide-react';

interface AssignmentWithCourse extends CourseAssignment {
  course: Course;
}

interface AssignmentWithProgress extends AssignmentWithCourse {
  topicProgress: TopicProgress[];
  totalTopics: number;
  completedTopics: number;
}

export function TrainerDashboard() {
  const { user, profile, signOut, isTrainer, loading: authLoading } = useAuth();
  const router = useRouter();
  const [assignments, setAssignments] = useState<AssignmentWithProgress[]>([]);
  const [trainerProfile, setTrainerProfile] = useState<TrainerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'courses' | 'progress' | 'profile'>('courses');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || (!isTrainer && profile?.role !== 'admin'))) {
      router.navigate('/trainer/login');
    }
  }, [user, isTrainer, authLoading, profile]);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const [assignRes, trainerRes] = await Promise.all([
      supabase
        .from('course_assignments')
        .select('*, course:courses(*)')
        .eq('trainer_id', user.id)
        .order('assigned_at', { ascending: false }),
      supabase
        .from('trainers')
        .select('*')
        .eq('id', user.id)
        .maybeSingle(),
    ]);

    const assignmentData = (assignRes.data || []) as AssignmentWithCourse[];
    setTrainerProfile(trainerRes.data || null);

    const enriched = await Promise.all(
      assignmentData.map(async (a) => {
        const { data: progress } = await supabase
          .from('topic_progress')
          .select('*')
          .eq('assignment_id', a.id)
          .order('module_index', { ascending: true })
          .order('lesson_index', { ascending: true });

        const totalLessons = a.course?.modules?.reduce(
          (sum, m) => sum + (m.lessons?.length || 0), 0
        ) || 0;

        return {
          ...a,
          topicProgress: progress || [],
          totalTopics: totalLessons,
          completedTopics: (progress || []).filter(p => p.completed).length,
        };
      })
    );

    setAssignments(enriched);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user && !authLoading) loadData();
  }, [user, authLoading, loadData]);

  async function toggleTopicProgress(topicId: string, currentCompleted: boolean) {
    const update = {
      completed: !currentCompleted,
      completed_at: !currentCompleted ? new Date().toISOString() : null,
    };

    await supabase
      .from('topic_progress')
      .update(update)
      .eq('id', topicId);
// recalculate assignment progress
const assignment = assignments.find(a =>
  a.topicProgress.some(tp => tp.id === topicId)
);

if (assignment) {

  const updatedCompleted =
    assignment.topicProgress.filter(tp =>
      tp.id === topicId
        ? !currentCompleted
        : tp.completed
    ).length;

  const totalTopics = assignment.topicProgress.length;

  const percentage =
    totalTopics > 0
      ? Math.round((updatedCompleted / totalTopics) * 100)
      : 0;

  // find student enrollment
  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('id')
    .eq('course_id', assignment.course_id)
    .maybeSingle();

  if (enrollment) {
    await supabase
      .from('enrollments')
      .update({
        progress: percentage,
        status: percentage === 100 ? 'completed' : 'active',
        completed_at:
          percentage === 100
            ? new Date().toISOString()
            : null,
      })
      .eq('id', enrollment.id);
  }
}
    setAssignments(prev =>
      prev.map(a => ({
        ...a,
        topicProgress: a.topicProgress.map(tp =>
          tp.id === topicId
            ? { ...tp, completed: !currentCompleted, completed_at: update.completed_at }
            : tp
        ),
        completedTopics: a.topicProgress.filter(tp =>
          tp.id === topicId ? !currentCompleted : tp.completed
        ).length,
      }))
    );
  }

  async function initializeTopicProgress(assignment: AssignmentWithCourse) {
    if (!assignment.course?.modules) return;

    const rows: { assignment_id: string; topic: string; module_index: number; lesson_index: number }[] = [];
    assignment.course.modules.forEach((mod, mi) => {
      mod.lessons?.forEach((lesson, li) => {
        rows.push({
          assignment_id: assignment.id,
          topic: lesson,
          module_index: mi,
          lesson_index: li,
        });
      });
    });

    if (rows.length > 0) {
      await supabase.from('topic_progress').insert(rows);
      loadData();
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const activeAssignments = assignments.filter(a => a.status === 'active');
const upcomingAssignments = assignments.filter(a => a.status === 'upcoming');
const completedAssignments = assignments.filter(a => a.status === 'completed');

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 transform transition-transform lg:translate-x-0 lg:static ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-800">
            <div className="w-9 h-9 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md shadow-teal-500/20">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-white tracking-tight">SkillForge</span>
              <span className="block text-[10px] text-teal-400 font-medium uppercase tracking-widest">Trainer</span>
            </div>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1">
            {[
              { id: 'courses' as const, label: 'My Courses', icon: BookOpen },
              { id: 'progress' as const, label: 'Progress Tracking', icon: BarChart3 },
              { id: 'profile' as const, label: 'My Profile', icon: User },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
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

          <div className="px-4 py-4 border-t border-gray-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center text-xs font-bold text-gray-300">
                {(profile?.full_name || 'T').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-200 truncate">{profile?.full_name || 'Trainer'}</div>
                <div className="text-xs text-gray-500 truncate">{user.email}</div>
              </div>
            </div>
            <button
              onClick={() => { signOut(); router.navigate('/trainer/login'); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h1 className="text-lg font-bold text-gray-900 capitalize">{activeTab === 'courses' ? 'My Courses' : activeTab === 'progress' ? 'Progress Tracking' : 'My Profile'}</h1>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-teal-50 text-teal-700 rounded-lg border border-teal-200">
            <GraduationCap className="w-3 h-3" /> Trainer
          </span>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          {activeTab === 'courses' && (
            <CoursesTab
              activeAssignments={activeAssignments}
              upcomingAssignments={upcomingAssignments}
              completedAssignments={completedAssignments}
            />
          )}
          {activeTab === 'progress' && (
            <ProgressTab
              assignments={assignments}
              expandedCourse={expandedCourse}
              setExpandedCourse={setExpandedCourse}
              toggleTopicProgress={toggleTopicProgress}
              initializeTopicProgress={initializeTopicProgress}
            />
          )}
          {activeTab === 'profile' && (
            <ProfileTab trainer={trainerProfile} profile={profile} />
          )}
        </main>
      </div>
    </div>
  );
}

function CoursesTab({ activeAssignments, upcomingAssignments, completedAssignments }: {
  activeAssignments: AssignmentWithProgress[];
  upcomingAssignments: AssignmentWithProgress[];
  completedAssignments: AssignmentWithProgress[];
}) {
  return (
    <div className="space-y-8">
      <Section title="Active Courses" count={activeAssignments.length}>
  {activeAssignments.map(a => (
    <AssignmentCard key={a.id} assignment={a} />
  ))}
</Section>
      <Section title="Upcoming Courses" count={upcomingAssignments.length}>
        {upcomingAssignments.map(a => <AssignmentCard key={a.id} assignment={a} />)}
      </Section>
      <Section title="Completed Courses" count={completedAssignments.length}>
        {completedAssignments.map(a => <AssignmentCard key={a.id} assignment={a} />)}
      </Section>
    </div>
  );
}

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        {title}
        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">{count}</span>
      </h2>
      {count === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400 text-sm">
          No {title.toLowerCase()} yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
      )}
    </div>
  );
}

function AssignmentCard({ assignment }: { assignment: AssignmentWithProgress }) {
  const course = assignment.course;
  if (!course) return null;
  const config = TIER_CONFIG[course.tier];
  const progressPercent = assignment.totalTopics > 0
    ? Math.round((assignment.completedTopics / assignment.totalTopics) * 100)
    : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative h-32 bg-gray-100">
        <img src={course.image_url} alt={course.title} className="w-full h-full object-cover" />
        <div className="absolute top-2 left-2 flex gap-1.5">
          <span className={`px-2 py-0.5 text-xs font-semibold rounded-lg ${config.bg} ${config.color} border ${config.border}`}>
            {config.label}
          </span>
          <span className={`px-2 py-0.5 text-xs font-semibold rounded-lg ${
            assignment.status === 'active' ? 'bg-emerald-500 text-white' :
            assignment.status === 'upcoming' ? 'bg-blue-500 text-white' :
            'bg-gray-500 text-white'
          }`}>
            {assignment.status}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2">{course.title}</h3>
        <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-3">
          {assignment.schedule_days?.length > 0 && (
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {assignment.schedule_days.join(', ')}</span>
          )}
          {assignment.schedule_time && (
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {assignment.schedule_time}</span>
          )}
          {assignment.schedule_start && (
            <span className="flex items-center gap-1">
              <Play className="w-3 h-3" />
              {new Date(assignment.schedule_start).toLocaleDateString()}
            </span>
          )}
        </div>
        {assignment.totalTopics > 0 && (
          <div>
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Progress</span>
              <span className="font-medium">{progressPercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ProgressTab({
  assignments,
  expandedCourse,
  setExpandedCourse,
  toggleTopicProgress,
  initializeTopicProgress
}: {
  assignments: AssignmentWithProgress[];
  expandedCourse: string | null;
  setExpandedCourse: (id: string | null) => void;
  toggleTopicProgress: (id: string, completed: boolean) => void;
  initializeTopicProgress: (a: AssignmentWithCourse) => void;
}) {

  return (
    <div className="space-y-4">
      {assignments.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No course assignments to track.</p>
        </div>
      ) : (
        assignments.map(assignment =>  {
          const course = assignment.course;
          if (!course) return null;
          const isExpanded = expandedCourse === assignment.id;
          const hasProgress = assignment.topicProgress.length > 0;

          return (
            <div key={assignment.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <button
                onClick={() => setExpandedCourse(isExpanded ? null : assignment.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img src={course.image_url} alt={course.title} className="w-12 h-12 rounded-lg object-cover" />
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">{course.title}</h3>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {assignment.completedTopics}/{assignment.totalTopics} topics completed
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {assignment.totalTopics > 0 && (
                    <div className="hidden sm:block w-24">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>{Math.round((assignment.completedTopics / assignment.totalTopics) * 100)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full"
                          style={{ width: `${(assignment.completedTopics / assignment.totalTopics) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-gray-100 p-4">
                  {!hasProgress ? (
                    <div className="text-center py-6">
                      <p className="text-sm text-gray-500 mb-3">No topic progress initialized yet.</p>
                      <button
                        onClick={() => initializeTopicProgress(assignment)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 transition-colors"
                      >
                        <Play className="w-4 h-4" /> Initialize Topics
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {course.modules?.map((mod, mi) => (
                        <div key={mi}>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <div className="w-6 h-6 bg-teal-50 text-teal-600 rounded flex items-center justify-center text-xs font-bold">
                              {mi + 1}
                            </div>
                            {mod.title}
                          </h4>
                          <div className="space-y-1 ml-8">
                            {mod.lessons?.map((lesson, li) => {
                              const tp = assignment.topicProgress.find(
                                p => p.module_index === mi && p.lesson_index === li
                              );
                              const isCompleted = tp?.completed || false;

                              return (
                                <button
                                  key={li}
                                  onClick={() => tp && toggleTopicProgress(tp.id, isCompleted)}
                                  className="w-full flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors text-left group"
                                >
                                  {isCompleted ? (
                                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                  ) : (
                                    <Circle className="w-4 h-4 text-gray-300 flex-shrink-0 group-hover:text-teal-400 transition-colors" />
                                  )}
                                  <span className={`text-sm ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-700'}`}>
                                    {lesson}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

function ProfileTab({ trainer, profile }: { trainer: TrainerProfile | null; profile: { full_name: string; email: string; address: string; date_of_birth: string | null; avatar_url: string } | null }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden">
          {trainer?.profile_image_url || profile?.avatar_url ? (
            <img src={trainer?.profile_image_url || profile?.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-teal-50">
              <User className="w-8 h-8 text-teal-400" />
            </div>
          )}
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{trainer?.full_name || profile?.full_name || 'Trainer'}</h2>
          <p className="text-sm text-gray-500">{trainer?.email || profile?.email}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ProfileField icon={User} label="Name" value={trainer?.full_name || profile?.full_name || '-'} />
        <ProfileField icon={Monitor} label="Training Mode" value={trainer?.mode_of_training ? trainer.mode_of_training.charAt(0).toUpperCase() + trainer.mode_of_training.slice(1) : '-'} />
        <ProfileField icon={MapPin} label="Address" value={trainer?.address || profile?.address || '-'} />
        <ProfileField icon={Calendar} label="Date of Birth" value={trainer?.date_of_birth || profile?.date_of_birth ? new Date(trainer?.date_of_birth || profile?.date_of_birth || '').toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'} />
      </div>
      {trainer?.skills && trainer.skills.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Skills</h3>
          <div className="flex flex-wrap gap-1.5">
            {trainer.skills.map(s => (
              <span key={s} className="px-2.5 py-1 text-xs font-medium bg-teal-50 text-teal-700 rounded-lg border border-teal-200">{s}</span>
            ))}
          </div>
        </div>
      )}
      {trainer?.bio && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Bio</h3>
          <p className="text-sm text-gray-700 leading-relaxed">{trainer.bio}</p>
        </div>
      )}
    </div>
  );
}

function ProfileField({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) {
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
