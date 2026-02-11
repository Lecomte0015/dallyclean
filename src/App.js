import "./App.css"
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

// Front-Office Components
import Navbar from './components/navbar/Navbar';
import Footer from './components/footer/Footer';
import HomePage from './pages/HomePage'
import ServicesPage from './pages/ServicesPage'
import ServiceDetail from './pages/ServiceDetail'
import BookingPage from './pages/BookingPage'
import Testimonials from './components/testimonials/Testimonials'
import TarifsPage from './pages/TarifsPage'
import AboutPage from './pages/AboutPage'
import PageView from './pages/PageView'

// Admin Components
import ProtectedRoute from './components/admin/ProtectedRoute'
import LoginPage from './pages/admin/LoginPage'
import DashboardPage from './pages/admin/DashboardPage'
import BookingsPage from './pages/admin/BookingsPage'
import AdminServicesPage from './pages/admin/ServicesPage'
import ServiceOptionsPage from './pages/admin/ServiceOptionsPage'
import TestimonialsPage from './pages/admin/TestimonialsPage'
import PlansPage from './pages/admin/PlansPage'
import FAQsPage from './pages/admin/FAQsPage'
import ZonesPage from './pages/admin/ZonesPage'
import PagesPage from './pages/admin/PagesPage'
import MediaPage from './pages/admin/MediaPage'
import DebugOptions from './pages/admin/DebugOptions'
import ServiceLayoutPage from './pages/admin/ServiceLayoutPage'
import HeroPage from './pages/admin/HeroPage'
import HomepagePage from './pages/admin/HomepagePage'

const App = () => {
  return (
    <Router>
      <Routes>
        {/* ===== ADMIN ROUTES ===== */}
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/admin/dashboard" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/bookings" element={
          <ProtectedRoute>
            <BookingsPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/services" element={
          <ProtectedRoute>
            <AdminServicesPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/services/:serviceId/options" element={
          <ProtectedRoute>
            <ServiceOptionsPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/service-layout" element={
          <ProtectedRoute>
            <ServiceLayoutPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/hero" element={
          <ProtectedRoute>
            <HeroPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/testimonials" element={
          <ProtectedRoute>
            <TestimonialsPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/plans" element={
          <ProtectedRoute>
            <PlansPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/faqs" element={
          <ProtectedRoute>
            <FAQsPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/zones" element={
          <ProtectedRoute>
            <ZonesPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/pages" element={
          <ProtectedRoute>
            <PagesPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/media" element={
          <ProtectedRoute>
            <MediaPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/homepage" element={
          <ProtectedRoute>
            <HomepagePage />
          </ProtectedRoute>
        } />
        <Route path="/admin/debug-options" element={
          <ProtectedRoute>
            <DebugOptions />
          </ProtectedRoute>
        } />

        {/* ===== FRONT-OFFICE ROUTES ===== */}
        <Route path="/*" element={
          <>
            <Navbar />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/services" element={<ServicesPage/>} />
              <Route path="/services/:slug" element={<ServiceDetail/>} />
              <Route path="/booking" element={<BookingPage/>} />
              <Route path="/testimonials" element={<Testimonials/>} />
              <Route path="/tarifs" element={<TarifsPage/>} />
              <Route path="/a-propos" element={<AboutPage/>} />
              <Route path="/pages/:slug" element={<PageView/>} />
            </Routes>
            <Footer/>
          </>
        } />
      </Routes>
    </Router>
  )
}


export default App