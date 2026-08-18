import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import BrowseHub from './pages/BrowseHub'
import Browse from './pages/Browse'
import BrowseRequirements from './pages/BrowseRequirements'
import Post from './pages/Post'
import PostRequirement from './pages/PostRequirement'
import EditListing from './pages/EditListing'
import Dashboard from './pages/Dashboard'
import Enquiries from './pages/Enquiries'
import Profile from './pages/Profile'
import Admin from './pages/Admin'
import ListingDetail from './pages/ListingDetail'
import ServiceProviders from './pages/ServiceProviders'
import ServiceProviderDetail from './pages/ServiceProviderDetail'
import ServiceProviderSetup from './pages/ServiceProviderSetup'
import ServiceRequirements from './pages/ServiceRequirements'
import ServiceRequirementDetail from './pages/ServiceRequirementDetail'
import PostServiceRequirement from './pages/PostServiceRequirement'
import EditServiceRequirement from './pages/EditServiceRequirement'
import Jobs from './pages/Jobs'
import JobPostDetail from './pages/JobPostDetail'
import PostJob from './pages/PostJob'
import EditJobPost from './pages/EditJobPost'
import JobSeekers from './pages/JobSeekers'
import JobSeekerDetail from './pages/JobSeekerDetail'
import JobSeekerProfileSetup from './pages/JobSeekerProfileSetup'
import JobWorkVendors from './pages/JobWorkVendors'
import JobWorkVendorDetail from './pages/JobWorkVendorDetail'
import JobWorkVendorSetup from './pages/JobWorkVendorSetup'
import JobWorkRequirements from './pages/JobWorkRequirements'
import JobWorkRequirementDetail from './pages/JobWorkRequirementDetail'
import PostJobWorkRequirement from './pages/PostJobWorkRequirement'
import EditJobWorkRequirement from './pages/EditJobWorkRequirement'
import InstallButton from './components/InstallButton'
import './App.css'

function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" />
}

function AdminRoute({ children }) {
  const { user } = useAuth()
  return user?.role === 'admin' ? children : <Navigate to="/dashboard" />
}

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <InstallButton />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route path="/" element={<Home />} />
            <Route path="/browse" element={<BrowseHub />} />

            <Route path="/marketplace" element={<Browse />} />
            <Route path="/marketplace/requirements" element={<BrowseRequirements />} />
            <Route path="/marketplace/requirements/new" element={<PostRequirement />} />
            <Route path="/marketplace/sell/new" element={<Post />} />
            <Route path="/marketplace/post/edit/:id" element={<EditListing />} />
            <Route path="/marketplace/:id" element={<ListingDetail />} />

            <Route path="/services" element={<ServiceProviders />} />
            <Route path="/services/providers/:profileId" element={<ServiceProviderDetail />} />
            <Route path="/services/provider/setup" element={<ServiceProviderSetup />} />
            <Route path="/services/requirements" element={<ServiceRequirements />} />
            <Route path="/services/requirements/new" element={<PostServiceRequirement />} />
            <Route path="/services/requirements/edit/:id" element={<EditServiceRequirement />} />
            <Route path="/services/requirements/:id" element={<ServiceRequirementDetail />} />

            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/new" element={<PostJob />} />
            <Route path="/jobs/edit/:id" element={<EditJobPost />} />
            <Route path="/jobs/seekers" element={<JobSeekers />} />
            <Route path="/jobs/seeker/setup" element={<JobSeekerProfileSetup />} />
            <Route path="/jobs/seekers/:profileId" element={<JobSeekerDetail />} />
            <Route path="/jobs/:id" element={<JobPostDetail />} />

            <Route path="/job-work" element={<JobWorkVendors />} />
            <Route path="/job-work/vendors/:profileId" element={<JobWorkVendorDetail />} />
            <Route path="/job-work/vendor/setup" element={<JobWorkVendorSetup />} />
            <Route path="/job-work/requirements" element={<JobWorkRequirements />} />
            <Route path="/job-work/requirements/new" element={<PostJobWorkRequirement />} />
            <Route path="/job-work/requirements/edit/:id" element={<EditJobWorkRequirement />} />
            <Route path="/job-work/requirements/:id" element={<JobWorkRequirementDetail />} />

            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/enquiries" element={<Enquiries />} />
            <Route path="/enquiries/:id" element={<Enquiries />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
          </Route>
        </Routes>
      </HashRouter>
    </AuthProvider>
  )
}

export default App
