import React, { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { supabase } from '../../lib/supabaseClient'
import {
  Calendar,
  Briefcase,
  MessageSquare,
  MapPin,
  TrendingUp,
  Clock
} from 'lucide-react'
import './DashboardPage.css'

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    totalServices: 0,
    totalTestimonials: 0,
    totalZones: 0,
  })
  const [recentBookings, setRecentBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Load statistics
      const [bookings, services, testimonials, zones] = await Promise.all([
        supabase.from('bookings').select('id, created_at', { count: 'exact' }),
        supabase.from('services').select('id', { count: 'exact' }),
        supabase.from('testimonials').select('id', { count: 'exact' }),
        supabase.from('zones').select('id', { count: 'exact' }).eq('active', true),
      ])

      // Get recent bookings (last 5)
      const { data: recent } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

      setStats({
        totalBookings: bookings.count || 0,
        pendingBookings: bookings.data?.filter(b => {
          const createdAt = new Date(b.created_at)
          const daysSince = (Date.now() - createdAt) / (1000 * 60 * 60 * 24)
          return daysSince < 7
        }).length || 0,
        totalServices: services.count || 0,
        totalTestimonials: testimonials.count || 0,
        totalZones: zones.count || 0,
      })

      setRecentBookings(recent || [])
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Réservations totales',
      value: stats.totalBookings,
      icon: Calendar,
      color: 'primary',
      subtitle: `${stats.pendingBookings} cette semaine`
    },
    {
      title: 'Services actifs',
      value: stats.totalServices,
      icon: Briefcase,
      color: 'accent'
    },
    {
      title: 'Témoignages',
      value: stats.totalTestimonials,
      icon: MessageSquare,
      color: 'success'
    },
    {
      title: 'Zones desservies',
      value: stats.totalZones,
      icon: MapPin,
      color: 'info'
    },
  ]

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-page-header">
          <h1>Tableau de bord</h1>
          <p>Chargement...</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="dashboard-page">
        <div className="admin-page-header">
          <div>
            <h1>Tableau de bord</h1>
            <p>Vue d'ensemble de votre activité</p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="stats-grid">
          {statCards.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className={`stat-card ${stat.color}`}>
                <div className="stat-icon">
                  <Icon size={24} />
                </div>
                <div className="stat-content">
                  <h3>{stat.title}</h3>
                  <div className="stat-value">{stat.value}</div>
                  {stat.subtitle && (
                    <p className="stat-subtitle">
                      <TrendingUp size={14} />
                      {stat.subtitle}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Recent Bookings */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h2>Dernières réservations</h2>
            <a href="/admin/bookings" className="btn btn-outline btn-sm">
              Voir tout
            </a>
          </div>

          {recentBookings.length === 0 ? (
            <div className="empty-state">
              <Calendar size={48} />
              <p>Aucune réservation pour le moment</p>
            </div>
          ) : (
            <div className="bookings-list">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="booking-item">
                  <div className="booking-info">
                    <h4>{booking.name}</h4>
                    <p className="booking-details">
                      {booking.email} • {booking.phone || 'Pas de téléphone'}
                    </p>
                    {booking.service_id && (
                      <span className="booking-service">Service demandé</span>
                    )}
                  </div>
                  <div className="booking-meta">
                    <div className="booking-date">
                      <Clock size={16} />
                      {formatDate(booking.created_at)}
                    </div>
                    {booking.date && (
                      <div className="booking-scheduled">
                        Prévu le {new Date(booking.date).toLocaleDateString('fr-FR')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

export default DashboardPage
