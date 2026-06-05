import { useState } from 'react';
import { useAuth } from '../lib/auth';
import { Link, useRouter } from '../lib/router';
import { GraduationCap, Menu, X, LogOut, User } from 'lucide-react';

export function Layout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, profile, signOut, isAdmin, isTrainer } = useAuth();
  const { path, navigate } = useRouter();

  function handleMobileNav(to: string) {
    setMobileOpen(false);
    navigate(to);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md shadow-teal-500/20 group-hover:shadow-teal-500/40 transition-shadow">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">A1TI SkillForge</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              <NavLink to="/courses" active={path === '/courses' || path === '/'}>Courses</NavLink>
              {user ? (
                <>
                  {isTrainer ? (
                    <NavLink to="/trainer/dashboard" active={path.startsWith('/trainer')}>Trainer Panel</NavLink>
                  ) : (
                    <NavLink to="/dashboard" active={path === '/dashboard' || path.startsWith('/enroll')}>Dashboard</NavLink>
                  )}
                  {isAdmin && <NavLink to="/admin/dashboard" active={path.startsWith('/admin')}>Admin Panel</NavLink>}
                  <div className="ml-3 flex items-center gap-3 pl-3 border-l border-gray-200">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="w-4 h-4" />
                      <span className="font-medium text-gray-800">{profile?.full_name || 'User'}</span>
                    </div>
                    <button
                      onClick={signOut}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Sign out"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="ml-3 flex items-center gap-2 pl-3 border-l border-gray-200">
                  <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                    Sign In
                  </Link>
                  <Link to="/register" className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-teal-500 to-emerald-600 rounded-lg hover:from-teal-600 hover:to-emerald-700 shadow-sm shadow-teal-500/20 transition-all">
                    Get Started
                  </Link>
                </div>
              )}
            </nav>

            <button
              className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-3 space-y-1">
              <button onClick={() => handleMobileNav('/courses')} className="w-full text-left px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
                Courses
              </button>
              {user ? (
                <>
                  {isTrainer ? (
                    <button onClick={() => handleMobileNav('/trainer/dashboard')} className="w-full text-left px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
                      Trainer Panel
                    </button>
                  ) : (
                    <button onClick={() => handleMobileNav('/dashboard')} className="w-full text-left px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
                      Dashboard
                    </button>
                  )}
                  {isAdmin && (
                    <button onClick={() => handleMobileNav('/admin/dashboard')} className="w-full text-left px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
                      Admin Panel
                    </button>
                  )}
                  <button
                    onClick={() => { signOut(); setMobileOpen(false); }}
                    className="w-full text-left px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </>
              ) : (
                <div className="pt-2 space-y-2 border-t border-gray-100 mt-2">
                  <button onClick={() => handleMobileNav('/login')} className="w-full text-left px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
                    Sign In
                  </button>
                  <button onClick={() => handleMobileNav('/register')} className="w-full text-left px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
                    Get Started
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-gray-900 text-gray-400 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold text-white">SkillForge</span>
              </div>
              <p className="text-sm leading-relaxed">Free training + Certification. Pay only a small registration fee. Build real skills, earn verified certificates.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Courses</h4>
              <div className="space-y-2 text-sm">
                <Link to="/courses" className="block hover:text-teal-400 transition-colors">All Courses</Link>
                <Link to="/courses" className="block hover:text-teal-400 transition-colors">Beginner</Link>
                <Link to="/courses" className="block hover:text-teal-400 transition-colors">Intermediate</Link>
                <Link to="/courses" className="block hover:text-teal-400 transition-colors">Advanced</Link>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Company</h4>
              <div className="space-y-2 text-sm">
                <Link to="/about" className="block hover:text-teal-400 transition-colors">About Us</Link>
                <Link to="/contact" className="block hover:text-teal-400 transition-colors">Contact</Link>
                <Link to="/terms" className="block hover:text-teal-400 transition-colors">Terms of Service</Link>
                <Link to="/refund" className="block hover:text-teal-400 transition-colors">Refund Policy</Link>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Support</h4>
              <div className="space-y-2 text-sm">
                <Link to="/contact" className="block hover:text-teal-400 transition-colors">Help Center</Link>
                <Link to="/verify" className="block hover:text-teal-400 transition-colors">Verify Certificate</Link>
                <p className="text-gray-500">support@skillforge.io</p>
              </div>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-gray-800 text-sm text-center text-gray-500">
            &copy; {new Date().getFullYear()} SkillForge. All rights reserved. Free training + Certification | Pay only registration fee.
          </div>
        </div>
      </footer>
    </div>
  );
}

function NavLink({ to, active, children }: { to: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
        active ? 'text-teal-700 bg-teal-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      {children}
    </Link>
  );
}
