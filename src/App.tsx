import { AuthProvider } from './lib/auth';
import { RouterProvider, useRouter } from './lib/router';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { CoursesPage } from './pages/CoursesPage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import { EnrollPage } from './pages/EnrollPage';
import { DashboardPage } from './pages/DashboardPage';
import { CertificateVerifyPage } from './pages/CertificatePage';
import { AdminLoginPage, AdminRegisterPage } from './pages/AdminAuthPages';
import { AdminDashboard } from './pages/AdminDashboard';
import { TrainerLoginPage, TrainerRegisterPage } from './pages/TrainerAuthPages';
import { TrainerDashboard } from './pages/TrainerDashboard';
import { AboutPage, TermsPage, RefundPage, ContactPage } from './pages/StaticPages';

function AppRoutes() {
  const { path, params } = useRouter();

  // Admin routes - no student layout
  if (path === '/admin/login') return <AdminLoginPage />;
  if (path === '/admin/register') return <AdminRegisterPage />;
  if (path === '/admin/dashboard') return <AdminDashboard />;

  // Trainer routes - no student layout
  if (path === '/trainer/login') return <TrainerLoginPage />;
  if (path === '/trainer/register') return <TrainerRegisterPage />;
  if (path === '/trainer/dashboard') return <TrainerDashboard />;
  if (path === '/trainer/profile') return <TrainerDashboard />;

  // Student/public routes - wrapped in Layout
  if (path === '/') return <Layout><HomePage /></Layout>;
  if (path === '/courses') return <Layout><CoursesPage /></Layout>;
  if (path.startsWith('/course/')) return <Layout><CourseDetailPage slug={params.slug} /></Layout>;
  if (path === '/login') return <Layout><LoginPage /></Layout>;
  if (path === '/register') return <Layout><RegisterPage /></Layout>;
  if (path.startsWith('/enroll/')) return <Layout><EnrollPage slug={params.slug} /></Layout>;
  if (path === '/dashboard') return <Layout><DashboardPage /></Layout>;
  if (path.startsWith('/verify/')) return <Layout><CertificateVerifyPage certificateNumber={params.certificateNumber} /></Layout>;
  if (path === '/certificate/') return <Layout><CertificateVerifyPage /></Layout>;
  if (path === '/about') return <Layout><AboutPage /></Layout>;
  if (path === '/terms') return <Layout><TermsPage /></Layout>;
  if (path === '/refund') return <Layout><RefundPage /></Layout>;
  if (path === '/contact') return <Layout><ContactPage /></Layout>;
  if (path.startsWith('/courses'))
  return (
    <Layout>
      <CoursesPage />
    </Layout>
  );
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h2>
        <p className="text-gray-500">The page you're looking for doesn't exist.</p>
      </div>
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <RouterProvider>
        <AppRoutes />
      </RouterProvider>
    </AuthProvider>
  );
}

export default App;
