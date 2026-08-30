import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import BrowseHub from './pages/BrowseHub'
import Browse from './domains/marketplace/pages/Browse'
import BrowseRequirements from './domains/marketplace/pages/BrowseRequirements'
import Post from './domains/marketplace/pages/Post'
import PostRequirement from './domains/marketplace/pages/PostRequirement'
import EditListing from './domains/marketplace/pages/EditListing'
import Dashboard from './pages/Dashboard'
import Enquiries from './pages/Enquiries'
import Profile from './pages/Profile'
import Admin from './pages/Admin'
import ListingDetail from './domains/marketplace/pages/ListingDetail'
import ServiceProviders from './domains/services/pages/ServiceProviders'
import ServiceProviderDetail from './domains/services/pages/ServiceProviderDetail'
import ServiceProviderSetup from './domains/services/pages/ServiceProviderSetup'
import ServiceRequirements from './domains/services/pages/ServiceRequirements'
import ServiceRequirementDetail from './domains/services/pages/ServiceRequirementDetail'
import PostServiceRequirement from './domains/services/pages/PostServiceRequirement'
import EditServiceRequirement from './domains/services/pages/EditServiceRequirement'
import Jobs from './domains/jobs/pages/Jobs'
import JobPostDetail from './domains/jobs/pages/JobPostDetail'
import PostJob from './domains/jobs/pages/PostJob'
import EditJobPost from './domains/jobs/pages/EditJobPost'
import JobSeekers from './domains/jobs/pages/JobSeekers'
import JobSeekerDetail from './domains/jobs/pages/JobSeekerDetail'
import JobSeekerProfileSetup from './domains/jobs/pages/JobSeekerProfileSetup'
import JobWorkVendors from './domains/jobwork/pages/JobWorkVendors'
import JobWorkVendorDetail from './domains/jobwork/pages/JobWorkVendorDetail'
import JobWorkVendorSetup from './domains/jobwork/pages/JobWorkVendorSetup'
import JobWorkRequirements from './domains/jobwork/pages/JobWorkRequirements'
import JobWorkRequirementDetail from './domains/jobwork/pages/JobWorkRequirementDetail'
import PostJobWorkRequirement from './domains/jobwork/pages/PostJobWorkRequirement'
import EditJobWorkRequirement from './domains/jobwork/pages/EditJobWorkRequirement'
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

            <Route path="/marketplace" element={<Browse section="MACHINERY" />} />
            <Route path="/marketplace/tools-accessories" element={<Browse section="TOOLS_ACCESSORIES" />} />
            <Route path="/marketplace/scrap" element={<Browse section="SCRAP" />} />

            <Route path="/marketplace/requirements" element={<BrowseRequirements section="MACHINERY" />} />
            <Route path="/marketplace/tools-accessories/requirements" element={<BrowseRequirements section="TOOLS_ACCESSORIES" />} />
            <Route path="/marketplace/scrap/requirements" element={<BrowseRequirements section="SCRAP" />} />

            <Route path="/marketplace/requirements/new" element={<PostRequirement section="MACHINERY" />} />
            <Route path="/marketplace/tools-accessories/requirements/new" element={<PostRequirement section="TOOLS_ACCESSORIES" />} />
            <Route path="/marketplace/scrap/requirements/new" element={<PostRequirement section="SCRAP" />} />

            <Route path="/marketplace/sell/new" element={<Post section="MACHINERY" />} />
            <Route path="/marketplace/tools-accessories/sell/new" element={<Post section="TOOLS_ACCESSORIES" />} />
            <Route path="/marketplace/scrap/sell/new" element={<Post section="SCRAP" />} />

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
