import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { TZ_GEOJSON, REGION_CENTROIDS } from '../data/tz_regions_geo'

// ── Choropleth color scale ────────────────────────────────
function interpolateColor(t) {
  const stops = [
    { t:0.00, r:11,  g:37,  b:69  },
    { t:0.20, r:14,  g:60,  b:100 },
    { t:0.40, r:16,  g:108, b:135 },
    { t:0.60, r:194, g:120, b:10  },
    { t:0.80, r:220, g:60,  b:20  },
    { t:1.00, r:155, g:15,  b:15  },
  ]
  const clamp = Math.max(0, Math.min(1, t))
  let lo = stops[0], hi = stops[stops.length - 1]
  for (let i = 0; i < stops.length - 1; i++) {
    if (clamp >= stops[i].t && clamp <= stops[i+1].t) { lo=stops[i]; hi=stops[i+1]; break }
  }
  const f = lo.t===hi.t ? 0 : (clamp-lo.t)/(hi.t-lo.t)
  const r = Math.round(lo.r+(hi.r-lo.r)*f)
  const g = Math.round(lo.g+(hi.g-lo.g)*f)
  const b = Math.round(lo.b+(hi.b-lo.b)*f)
  return `rgb(${r},${g},${b})`
}

const LEGEND_STOPS  = [0, 0.2, 0.4, 0.6, 0.8, 1.0]
const LEGEND_LABELS = {
  popShare: ['<1%','2%','3%','5%','7%','>8%'],
  density:  ['<20','50','100','200','500','>3k'],
}

// ── Sub-component: flies map to selected region/scope ─────
function FlyController({ selectedRegion, scope }) {
  const map = useMap()
  useEffect(() => {
    if (selectedRegion && REGION_CENTROIDS[selectedRegion]) {
      const [lon, lat] = REGION_CENTROIDS[selectedRegion]
      map.flyTo([lat, lon], 8, { duration: 1.2, easeLinearity: 0.4 })
    } else if (scope === 'zanzibar') {
      map.flyTo([-6.0, 39.6], 9, { duration: 1.0 })
    } else if (scope === 'mainland') {
      map.flyTo([-6.5, 35.0], 6, { duration: 1.0 })
    } else {
      map.flyTo([-6.3, 35.5], 6, { duration: 1.0 })
    }
  }, [selectedRegion, scope, map])
  return null
}

// ═══════════════════════════════════════════════════════════
// Main TanzaniaMap component — uses react-leaflet
// Props are identical to the previous react-simple-maps version
// ═══════════════════════════════════════════════════════════
export default function TanzaniaMap({
  scope,           // 'national' | 'mainland' | 'zanzibar'
  selectedRegion,  // string | null
  regionData,      // array: {region, pop, popShare, density, hh}
  onRegionClick,
  darkMode,
  t,
}) {
  const [metric,      setMetric]      = useState('popShare')
  const [hovered,     setHovered]     = useState(null)
  const [hoveredData, setHoveredData] = useState(null)
  const [tooltipPos,  setTooltipPos]  = useState({ x: 0, y: 0 })
  const [showTip,     setShowTip]     = useState(false)
  const mapRef = useRef(null)

  // Build lookup map from regionData array
  const dataMap = useMemo(() => {
    const m = {}
    regionData?.forEach(d => { m[d.region] = d })
    return m
  }, [regionData])

  // Max value for colour normalisation
  const maxValue = useMemo(() => {
    if (!regionData?.length) return 1
    return Math.max(...regionData.map(d => d[metric] || 0))
  }, [regionData, metric])

  // Filter GeoJSON features by jurisdiction scope
  const filteredGeoJSON = useMemo(() => {
    if (!TZ_GEOJSON) return null
    const features = TZ_GEOJSON.features.filter(f => {
      if (scope === 'zanzibar') return f.properties.jurisdiction === 'zanzibar'
      if (scope === 'mainland') return f.properties.jurisdiction === 'mainland'
      return true
    })
    return { ...TZ_GEOJSON, features }
  }, [scope])

  // Leaflet style function — called per feature on mount & re-key
  const styleFeature = useCallback((feature) => {
    const name       = feature.properties.name
    const d          = dataMap[name]
    const value      = d?.[metric] || 0
    const isSelected = name === selectedRegion
    const normalized = maxValue > 0 ? value / maxValue : 0

    if (selectedRegion && !isSelected) {
      return {
        fillColor:   '#0f1e35',
        fillOpacity: 0.30,
        color:       '#0a1628',
        weight:      0.5,
        opacity:     0.6,
      }
    }
    return {
      fillColor:   interpolateColor(normalized),
      fillOpacity: 0.85,
      color:       isSelected ? '#00d4ff' : '#0a1628',
      weight:      isSelected ? 2.5 : 0.8,
      opacity:     1,
    }
  }, [dataMap, metric, maxValue, selectedRegion])

  // onEachFeature wires up hover + click per layer
  const onEachFeature = useCallback((feature, layer) => {
    const name = feature.properties.name

    layer.on({
      mouseover: (e) => {
        setHovered(name)
        setHoveredData(dataMap[name] || null)
        setTooltipPos({ x: e.originalEvent.clientX, y: e.originalEvent.clientY })
        setShowTip(true)
        // Highlight hovered layer directly (no re-render needed)
        if (!selectedRegion || name === selectedRegion) {
          layer.setStyle({ fillOpacity: 1, weight: 2.5, color: '#00d4ff' })
        } else {
          layer.setStyle({ fillOpacity: 0.5 })
        }
        layer.bringToFront()
      },
      mousemove: (e) => {
        setTooltipPos({ x: e.originalEvent.clientX, y: e.originalEvent.clientY })
      },
      mouseout: () => {
        setHovered(null)
        setHoveredData(null)
        setShowTip(false)
        // Restore original style via the style function
        layer.setStyle(styleFeature(feature))
      },
      click: (e) => {
        L.DomEvent.stopPropagation(e)
        onRegionClick?.(name === selectedRegion ? null : name)
      },
    })
  }, [dataMap, selectedRegion, styleFeature, onRegionClick])

  // Re-key GeoJSON whenever scope / metric / selectedRegion changes
  // so Leaflet rebuilds the layer with fresh styles
  const geoKey = `${scope}-${metric}-${selectedRegion ?? 'none'}`

  // Initial map center
  const initCenter = scope === 'zanzibar' ? [-6.0, 39.6] : [-6.3, 35.5]
  const initZoom   = scope === 'zanzibar' ? 9 : 6

  return (
    <div className={`${t.card} border ${t.cardBorder} rounded-xl overflow-hidden`}>

      {/* ── Header ──────────────────────────────────────── */}
      <div className={`px-5 py-4 border-b ${t.border} flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
        <div>
          <p className={`font-bold text-sm ${t.text}`}>
            {selectedRegion
              ? `${selectedRegion} — Population Map`
              : scope === 'zanzibar'
                ? 'Zanzibar Islands — Population Distribution'
                : 'Tanzania — Population Choropleth Map'}
          </p>
          <p className={`text-[10px] ${t.textSub} mt-0.5`}>
            {selectedRegion
              ? 'Region-level view · click another region to compare · scroll to zoom'
              : 'Click any region to drill down · scroll to zoom · NBS 2022 Census'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {/* Metric toggle */}
          {[
            { key:'popShare', label:'Pop Share' },
            { key:'density',  label:'Density'   },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setMetric(key)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase border transition-all
                         ${metric===key
                           ? 'bg-[#00d4ff]/10 border-[#00d4ff]/40 text-[#00d4ff]'
                           : darkMode
                             ? 'bg-gray-100 border-gray-300 text-gray-500'
                             : 'bg-white/5 border-[#1e2d45] text-gray-500 hover:text-gray-300'}`}>
              {label}
            </button>
          ))}
          {selectedRegion && (
            <button
              onClick={() => onRegionClick?.(null)}
              className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase border
                         bg-[#00ff9d]/10 border-[#00ff9d]/40 text-[#00ff9d] hover:bg-[#00ff9d]/20 transition-all">
              ← Back
            </button>
          )}
        </div>
      </div>

      {/* ── Map + Sidebar ────────────────────────────────── */}
      <div className="flex flex-col xl:flex-row">

        {/* Leaflet map */}
        <div className="flex-1 relative" style={{ minHeight: 400 }}>
          <MapContainer
            ref={mapRef}
            center={initCenter}
            zoom={initZoom}
            zoomControl={true}
            scrollWheelZoom={true}
            style={{ height: 420, width: '100%', background: '#0b111e' }}
            className="rounded-none"
          >
            {/* CartoDB dark tiles — matches NBS dashboard theme */}
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              subdomains="abcd"
              maxZoom={19}
            />

            {/* GeoJSON choropleth layer */}
            {filteredGeoJSON && (
              <GeoJSON
                key={geoKey}
                data={filteredGeoJSON}
                style={styleFeature}
                onEachFeature={onEachFeature}
              />
            )}

            {/* Auto-fly controller */}
            <FlyController selectedRegion={selectedRegion} scope={scope} />
          </MapContainer>

          {/* Floating tooltip (React-rendered, follows mouse) */}
          {showTip && hovered && (
            <div
              className="fixed z-[9999] pointer-events-none"
              style={{ left: tooltipPos.x + 16, top: tooltipPos.y - 90 }}
            >
              <div className="bg-[#0d1f38] border border-[#1e3a5f] rounded-xl px-3 py-2.5 shadow-2xl min-w-[170px]">
                <p className="font-bold text-xs text-white mb-1.5">{hovered}</p>
                {hoveredData ? (
                  <div className="space-y-1">
                    <div className="flex justify-between gap-4">
                      <span className="text-[10px] text-gray-400">Population</span>
                      <span className="text-[10px] font-mono text-[#00d4ff]">
                        {hoveredData.pop?.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-[10px] text-gray-400">Share</span>
                      <span className="text-[10px] font-mono text-[#00ff9d]">
                        {hoveredData.popShare}%
                      </span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-[10px] text-gray-400">Density</span>
                      <span className="text-[10px] font-mono text-orange-400">
                        {hoveredData.density}/km²
                      </span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-[10px] text-gray-400">Households</span>
                      <span className="text-[10px] font-mono text-gray-300">
                        {hoveredData.hh?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-[10px] text-gray-500">No census data</p>
                )}
                <div className="mt-2 text-[9px] text-gray-600 border-t border-[#1e3a5f] pt-1.5">
                  {selectedRegion===hovered ? 'Click to deselect' : 'Click to zoom in'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar: Legend + Top regions + Selected card */}
        <div className={`xl:w-56 p-4 border-t xl:border-t-0 xl:border-l ${t.border} flex flex-col gap-4`}>

          {/* Colour legend */}
          <div>
            <p className={`text-[9px] font-mono uppercase tracking-widest ${t.textDim} mb-2`}>
              {metric === 'popShare' ? 'Population Share' : 'Density (per km²)'}
            </p>
            <div className="space-y-1">
              {LEGEND_STOPS.map((stop, i) => (
                <div key={stop} className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-sm shrink-0"
                    style={{
                      backgroundColor: interpolateColor(stop),
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  />
                  <span className={`text-[9px] font-mono ${t.textDim}`}>
                    {LEGEND_LABELS[metric][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top 6 regions */}
          <div>
            <p className={`text-[9px] font-mono uppercase tracking-widest ${t.textDim} mb-2`}>
              Top Regions
            </p>
            <div className="space-y-1.5">
              {(regionData || [])
                .slice()
                .sort((a, b) => (b[metric]||0) - (a[metric]||0))
                .slice(0, 6)
                .map((d, i) => {
                  const val   = d[metric] || 0
                  const norm  = maxValue > 0 ? val / maxValue : 0
                  const color = interpolateColor(norm)
                  const label = metric === 'popShare' ? `${val}%` : val?.toLocaleString()
                  const short = d.region
                    .replace(' (Mjini Magharibi)','').replace(' (Kaskazini Unguja)','')
                    .replace(' (Kusini Unguja)','').replace(' (Kaskazini Pemba)','')
                    .replace(' (Kusini Pemba)','')
                  return (
                    <div
                      key={d.region}
                      className="flex items-center gap-1.5 cursor-pointer rounded px-1 py-0.5 transition-colors hover:bg-white/5"
                      onClick={() => onRegionClick?.(d.region)}
                    >
                      <span className={`text-[9px] font-mono w-3 shrink-0 ${t.textDim}`}>{i+1}</span>
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                      <span className={`text-[10px] truncate flex-1 ${selectedRegion===d.region?'text-[#00d4ff] font-bold':t.text}`}>
                        {short}
                      </span>
                      <span className={`text-[9px] font-mono shrink-0 ${t.textDim}`}>{label}</span>
                    </div>
                  )
                })}
            </div>
          </div>

          {/* Selected region detail card */}
          {selectedRegion && dataMap[selectedRegion] && (
            <div className="mt-auto p-3 rounded-xl border border-[#00d4ff]/20 bg-[#00d4ff]/5">
              <p className="text-[9px] font-mono uppercase tracking-widest text-[#00d4ff] mb-2">Selected</p>
              <p className="text-xs font-bold text-white leading-tight mb-2">
                {selectedRegion
                  .replace(' (Mjini Magharibi)','').replace(' (Kaskazini Unguja)','')
                  .replace(' (Kusini Unguja)','').replace(' (Kaskazini Pemba)','')
                  .replace(' (Kusini Pemba)','')}
              </p>
              {[
                { label:'Population', val: dataMap[selectedRegion].pop?.toLocaleString(),          color:'text-[#00ff9d]'  },
                { label:'Share',      val: `${dataMap[selectedRegion].popShare}%`,                 color:'text-[#00d4ff]'  },
                { label:'Density',    val: `${dataMap[selectedRegion].density}/km²`,               color:'text-orange-400' },
                { label:'Households', val: dataMap[selectedRegion].hh?.toLocaleString(),           color:'text-gray-300'   },
              ].map(({ label, val, color }) => (
                <div key={label} className="flex justify-between items-center mb-1">
                  <span className="text-[9px] text-gray-400">{label}</span>
                  <span className={`text-[10px] font-mono font-bold ${color}`}>{val}</span>
                </div>
              ))}
              <button
                onClick={() => onRegionClick?.(null)}
                className="mt-2 w-full text-[9px] text-gray-500 hover:text-red-400 transition-colors text-center"
              >
                × Deselect
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className={`px-5 py-2 border-t ${t.border} flex items-center justify-between`}>
        <p className={`text-[9px] ${t.textDim}`}>
          Source: NBS Tanzania, Population &amp; Housing Census 2022 · Simplified boundaries
        </p>
        <p className="text-[9px] text-gray-600">react-leaflet</p>
      </div>
    </div>
  )
}

