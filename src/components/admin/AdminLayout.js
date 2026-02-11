import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Calendar,
  Briefcase,
  MessageSquare,
  CreditCard,
  HelpCircle,
  MapPin,
  FileText,
  Image,
  LogOut,
  Menu,
  X,
  Settings,
  Home,
  Layout
} from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import './AdminLayout.css'
import logo from '../../assets/images/logo.png'

const menuItems = [
  { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
  { path: '/admin/bookings', icon: Calendar, label: 'Réservations' },
  { path: '/admin/homepage', icon: Layout, label: "Page d'Accueil" },
  { path: '/admin/hero', icon: Home, label: 'Section Hero' },
  { path: '/admin/services', icon: Briefcase, label: 'Services' },
  { path: '/admin/service-layout', icon: Settings, label: 'Configuration Pages' },
  { path: '/admin/testimonials', icon: MessageSquare, label: 'Témoignages' },
  { path: '/admin/plans', icon: CreditCard, label: 'Forfaits' },
  { path: '/admin/faqs', icon: HelpCircle, label: 'FAQs' },
  { path: '/admin/zones', icon: MapPin, label: 'Zones' },
  { path: '/admin/pages', icon: FileText, label: 'Pages' },
  { path: '/admin/media', icon: Image, label: 'Médias' },
]

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      navigate('/admin/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const isActive = (path) => location.pathname === path

  return (
    <div className="admin-layout">
      {/* Sidebar Desktop */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <Link to="/" className="admin-logo">
            <img src={logo} alt="Dally Nettoyage" />
          </Link>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? 'Fermer la sidebar' : 'Ouvrir la sidebar'}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul>
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                  >
                    <Icon size={20} />
                    {sidebarOpen && <span>{item.label}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            {sidebarOpen && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Menu Button */}
      <button
        className="mobile-menu-btn"
        onClick={() => setMobileMenuOpen(true)}
        aria-label="Ouvrir le menu"
      >
        <Menu size={24} />
      </button>

      {/* Mobile Menu */}
      <div className={`mobile-menu-overlay ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu">
          <div className="mobile-menu-header">
            <img src={logo} alt="Dally Nettoyage" />
            <button onClick={() => setMobileMenuOpen(false)}>
              <X size={24} />
            </button>
          </div>

          <nav>
            <ul>
              {menuItems.map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Icon size={20} />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          <button className="logout-btn mobile" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className={`admin-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="admin-content">
          {children}
        </div>
      </main>
    </div>
  )
}

export default AdminLayout
