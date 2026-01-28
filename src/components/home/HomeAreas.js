import React, { useMemo, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import './HomeAreas.css'
import { areas as localAreas } from '../../assets/homeContent'
import { supabase } from '../../lib/supabaseClient'

const HomeAreas = () => {
  const [hoverCity, setHoverCity] = useState(null)
  const [areas, setAreas] = useState(localAreas)
  const navigate = useNavigate()

  const cityCoords = useMemo(() => ({
    // Genève
    'Genève': { lat: 46.2044, lon: 6.1432 },
    'Carouge': { lat: 46.1820, lon: 6.1390 },
    'Lancy': { lat: 46.1890, lon: 6.1160 },
    'Meyrin': { lat: 46.2330, lon: 6.0720 },
    'Vernier': { lat: 46.2140, lon: 6.0840 },
    'Onex': { lat: 46.1840, lon: 6.1010 },
    'Chêne-Bougeries': { lat: 46.1930, lon: 6.1750 },
    'Chêne-Bourg': { lat: 46.1950, lon: 6.1910 },
    // Vaud
    'Lausanne': { lat: 46.5190, lon: 6.6320 },
    'Nyon': { lat: 46.3830, lon: 6.2300 },
    'Morges': { lat: 46.5110, lon: 6.4970 },
    'Renens': { lat: 46.5380, lon: 6.5880 },
    'Gland': { lat: 46.4200, lon: 6.2690 },
    'Vevey': { lat: 46.4630, lon: 6.8430 },
    'Montreux': { lat: 46.4330, lon: 6.9110 }
  }), [])

  const cantonBbox = '5.9%2C46.05%2C6.95%2C46.75' // default view (GE & VD)

  const bboxFromLatLon = useCallback((lat, lon, delta = 0.03) => {
    const minLon = (lon - delta).toFixed(4)
    const minLat = (lat - delta).toFixed(4)
    const maxLon = (lon + delta).toFixed(4)
    const maxLat = (lat + delta).toFixed(4)
    // encode as bbox=minLon,minLat,maxLon,maxLat
    return `${encodeURIComponent(minLon)},${encodeURIComponent(minLat)},${encodeURIComponent(maxLon)},${encodeURIComponent(maxLat)}`
  }, [])

  const mapSrc = useMemo(() => {
    if (hoverCity && cityCoords[hoverCity]) {
      const { lat, lon } = cityCoords[hoverCity]
      const bbox = bboxFromLatLon(lat, lon, 0.02)
      const marker = `${encodeURIComponent(lat)},${encodeURIComponent(lon)}`
      return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${marker}`
    }
    return `https://www.openstreetmap.org/export/embed.html?bbox=${cantonBbox}&layer=mapnik`
  }, [hoverCity, cityCoords, bboxFromLatLon])

  const onEnter = (city) => () => setHoverCity(city)
  const onLeave = () => setHoverCity(null)
  const onClickCity = (city) => () => {
    const params = new URLSearchParams({ city })
    navigate(`/booking?${params.toString()}`)
  }

  // Fetch zones from Supabase with fallback to local
  useEffect(() => {
    const loadZones = async () => {
      try {
        const { data, error } = await supabase
          .from('zones')
          .select('name')
          .order('name', { ascending: true })
        if (error) throw error
        if (data && data.length) {
          // Pour compatibilité, garder la structure geneve/vaud
          // et mettre toutes les zones dans les deux listes
          const zoneNames = data.map(z => z.name)
          // Séparer approximativement basé sur les noms des villes
          const ge = zoneNames.filter(name =>
            name.toLowerCase().includes('genève') ||
            name.toLowerCase().includes('carouge') ||
            name.toLowerCase().includes('lancy') ||
            name.toLowerCase().includes('meyrin') ||
            name.toLowerCase().includes('vernier')
          )
          const vd = zoneNames.filter(name =>
            name.toLowerCase().includes('lausanne') ||
            name.toLowerCase().includes('vaud') ||
            name.toLowerCase().includes('nyon') ||
            name.toLowerCase().includes('morges')
          )
          // Si aucune zone ne correspond aux filtres, mettre toutes les zones dans les deux
          if (ge.length === 0 && vd.length === 0) {
            setAreas({ geneve: zoneNames, vaud: [] })
          } else {
            setAreas({ geneve: ge, vaud: vd })
          }
        }
      } catch (_) {
        setAreas(localAreas)
      }
    }
    loadZones()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const cantonFromCity = (city) => {
    if (!city) return null
    if (areas.geneve.includes(city)) return 'geneve'
    if (areas.vaud.includes(city)) return 'vaud'
    return null
  }

  return (
    <section className="home-areas section bg-soft">
      <div className="container">
        <div className="areas-header">
          <h2>Zones desservies</h2>
          <p className="text-secondary">Nous intervenons dans les cantons de Genève et Vaud</p>
        </div>
        <div className="areas-content">
          <div className="areas-grid">
            <article className={`card area-card ${cantonFromCity(hoverCity)==='geneve' ? 'active' : ''}`}>
              <h3>Canton de Genève</h3>
              <ul>
                {areas.geneve.map(v => (
                  <li key={v} onMouseEnter={onEnter(v)} onMouseLeave={onLeave} onClick={onClickCity(v)}>
                    <span className="city-bullet">•</span>
                    <span className="city-name">{v}</span>
                  </li>
                ))}
              </ul>
            </article>
            <article className={`card area-card ${cantonFromCity(hoverCity)==='vaud' ? 'active' : ''}`}>
              <h3>Canton de Vaud</h3>
              <ul>
                {areas.vaud.map(v => (
                  <li key={v} onMouseEnter={onEnter(v)} onMouseLeave={onLeave} onClick={onClickCity(v)}>
                    <span className="city-bullet">•</span>
                    <span className="city-name">{v}</span>
                  </li>
                ))}
              </ul>
            </article>
          </div>
          <div className="areas-map" aria-label="Carte des zones desservies">
            <iframe
              title="Carte des zones desservies (Genève & Vaud)"
              src={mapSrc}
              className={hoverCity ? 'fading' : ''}
              style={{border:0}}
              allowFullScreen
            />
            <p className="text-muted map-caption">
              Carte indicative couvrant le canton de Genève et le canton de Vaud
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HomeAreas
