import "./App.css"
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

// Front-Office Components
import Navbar from './components/navbar/Navbar';
import Footer from './components/footer/Footer';
import Banner from './components/banner/Banner';
import ServicesPage from './pages/ServicesPage'
import ServiceDetail from './pages/ServiceDetail'
import BookingPage from './pages/BookingPage'
import Testimonials from './components/testimonials/Testimonials'
import TarifsPage from './pages/TarifsPage'
import AboutPage from './pages/AboutPage'
import PageView from './pages/PageView'
import HomeServices from './components/home/HomeServices'
import HomePlans from './components/home/HomePlans'
import HomeProcess from './components/home/HomeProcess'
import HomeAreas from './components/home/HomeAreas'
import HomeFAQ from './components/home/HomeFAQ'
import HomeCTA from './components/home/HomeCTA'

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
              <Route path="/" element={
                <>
                  <Banner />
                  <HomeServices />
                  <HomeProcess />
                  <Testimonials />
                  <HomePlans />
                  <HomeAreas />
                  <HomeFAQ />
                  <HomeCTA />
                </>
              } />
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