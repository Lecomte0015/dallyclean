import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import Banner from '../components/banner/Banner'
import HomeServices from '../components/home/HomeServices'
import HomeProcess from '../components/home/HomeProcess'
import Testimonials from '../components/testimonials/Testimonials'
import HomePlans from '../components/home/HomePlans'
import HomeAreas from '../components/home/HomeAreas'
import HomeFAQ from '../components/home/HomeFAQ'
import HomeCTA from '../components/home/HomeCTA'

const SECTION_COMPONENTS = {
  banner: Banner,
  services: HomeServices,
  process: HomeProcess,
  testimonials: Testimonials,
  plans: HomePlans,
  areas: HomeAreas,
  faq: HomeFAQ,
  cta: HomeCTA
}

const DEFAULT_SECTIONS = [
  { key: 'banner', label: 'Bannière / Hero', visible: true, order: 0 },
  { key: 'services', label: 'Nos Services', visible: true, order: 1 },
  { key: 'process', label: 'Notre Processus', visible: true, order: 2 },
  { key: 'testimonials', label: 'Témoignages', visible: true, order: 3 },
  { key: 'plans', label: 'Nos Forfaits', visible: true, order: 4 },
  { key: 'areas', label: "Zones d'Intervention", visible: true, order: 5 },
  { key: 'faq', label: 'FAQ', visible: true, order: 6 },
  { key: 'cta', label: "Appel à l'Action", visible: true, order: 7 }
]

const HomePage = () => {
  const [sections, setSections] = useState(DEFAULT_SECTIONS)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'homepage_sections')
          .single()

        if (error && error.code !== 'PGRST116') {
          throw error
        }

        if (data && data.value) {
          setSections(data.value)
        }
      } catch (error) {
        console.error('Error loading homepage config:', error)
      } finally {
        setLoaded(true)
      }
    }
    loadConfig()
  }, [])

  if (!loaded) return null

  const visibleSections = sections
    .filter(s => s.visible)
    .sort((a, b) => a.order - b.order)

  return (
    <>
      {visibleSections.map(section => {
        const Component = SECTION_COMPONENTS[section.key]
        if (!Component) return null
        return <Component key={section.key} />
      })}
    </>
  )
}

export default HomePage
