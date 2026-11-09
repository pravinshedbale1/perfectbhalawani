import { Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from './components/PublicLayout';
import DashLayout from './components/DashLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Setup from './pages/Setup';
import AdminDashboard from './pages/admin/Dashboard';
import Batches from './pages/admin/Batches';
import Students from './pages/admin/Students';
import StudentDetail from './pages/admin/StudentDetail';
import Fees from './pages/admin/Fees';
import PrintReceipts from './pages/admin/PrintReceipts';
import Exercises from './pages/admin/Exercises';
import Submissions from './pages/admin/Submissions';
import AdminLeaderboard from './pages/admin/Leaderboard';
import Notices from './pages/admin/Notices';
import Settings from './pages/admin/Settings';
import StudentHome from './pages/student/Home';
import StudentExercises from './pages/student/Exercises';
import StudentResults from './pages/student/Results';
import StudentLeaderboard from './pages/student/Leaderboard';
import StudentProfile from './pages/student/Profile';
import { isConfigured } from './firebase';

const adminLinks = [
  { to: '/admin', end: true, icon: '🏠', label: 'डॅशबोर्ड' },
  { to: '/admin/batches', icon: '🗂️', label: 'बॅच' },
  { to: '/admin/students', icon: '👨‍🎓', label: 'विद्यार्थी' },
  { to: '/admin/fees', icon: '💰', label: 'फी व पावती' },
  { to: '/admin/exercises', icon: '📚', label: 'अभ्यासक्रम व सराव' },
  { to: '/admin/submissions', icon: '📝', label: 'मूल्यांकन' },
  { to: '/admin/leaderboard', icon: '🏆', label: 'लीडरबोर्ड' },
  { to: '/admin/notices', icon: '📢', label: 'सूचना फलक' },
  { to: '/admin/settings', icon: '⚙️', label: 'सेटिंग्ज' },
];

const studentLinks = [
  { to: '/student', end: true, icon: '🏠', label: 'माझे डॅशबोर्ड' },
  { to: '/student/exercises', icon: '📚', label: 'सराव (Exercises)' },
  { to: '/student/results', icon: '📊', label: 'माझे गुण' },
  { to: '/student/leaderboard', icon: '🏆', label: 'लीडरबोर्ड' },
  { to: '/student/profile', icon: '👤', label: 'माझी माहिती' },
];

export default function App() {
  if (!isConfigured) {
    return (
      <div className="page">
        <div className="alert info">
          Firebase सेटअप बाकी आहे — <code>src/config.js</code> मध्ये FIREBASE_CONFIG ची मूल्ये भरा.
        </div>
      </div>
    );
  }
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/setup" element={<Setup />} />
      </Route>

      <Route path="/admin/print" element={<PrintReceipts />} />
      <Route path="/admin" element={<DashLayout role="admin" links={adminLinks} />}>
        <Route index element={<AdminDashboard />} />
        <Route path="batches" element={<Batches />} />
        <Route path="students" element={<Students />} />
        <Route path="students/:id" element={<StudentDetail />} />
        <Route path="fees" element={<Fees />} />
        <Route path="exercises" element={<Exercises />} />
        <Route path="submissions" element={<Submissions />} />
        <Route path="leaderboard" element={<AdminLeaderboard />} />
        <Route path="notices" element={<Notices />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="/student" element={<DashLayout role="student" links={studentLinks} />}>
        <Route index element={<StudentHome />} />
        <Route path="exercises" element={<StudentExercises />} />
        <Route path="results" element={<StudentResults />} />
        <Route path="leaderboard" element={<StudentLeaderboard />} />
        <Route path="profile" element={<StudentProfile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
