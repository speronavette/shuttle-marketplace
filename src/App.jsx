import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import PublishRide from './pages/PublishRide'
import AvailableRides from './pages/AvailableRides'
import RideDetail from './pages/RideDetail'
import MyCourses from './pages/MyCourses'
import MyCandidatures from './pages/MyCandidatures'
import RateCourse from './pages/RateCourse'
import EditProfile from './pages/EditProfile'
import AdminDashboard from './pages/AdminDashboard'
import CGU from './pages/CGU'
import PrivacyPolicy from './pages/PrivacyPolicy'



function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/publish-ride" element={<PublishRide />} />
          <Route path="/available-rides" element={<AvailableRides />} />
          <Route path="/ride/:id" element={<RideDetail />} />
          <Route path="/my-courses" element={<MyCourses />} />
          <Route path="/my-candidatures" element={<MyCandidatures />} />
          <Route path="/rate/:id" element={<RateCourse />} />
          <Route path="/profile" element={<EditProfile />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/cgu" element={<CGU />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App