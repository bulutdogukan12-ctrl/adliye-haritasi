import { useCallback, useEffect, useRef, useState } from 'react'
import type { LatLngBoundsExpression, Layer, PathOptions } from 'leaflet'
import { CircleMarker, GeoJSON, MapContainer, Popup, TileLayer, Tooltip, useMap } from 'react-leaflet'
import { ChevronLeft, Layers3, LoaderCircle, Map as MapIcon } from 'lucide-react'
import { loadDistrictsGeoJson, loadProvincesGeoJson } from '../data/repository'
import type { JudicialDistrictRecord, LocationRecord } from '../types'

interface GeoFeature {
  properties: {
    id: string
    name: string
    provinceId?: string
    provinceName?: string
    center: [number, number]
  }
}

interface StyledLayer extends Layer {
  getBounds?: () => LatLngBoundsExpression
  setStyle?: (style: PathOptions) => void
}

const TURKEY_CENTER: [number, number] = [39.05, 35.15]
const TURKEY_BOUNDS: LatLngBoundsExpression = [[34.3, 24], [44.5, 47.2]]

function ViewController({
  selected,
  provinceBounds,
  resetVersion,
}: {
  selected?: LocationRecord
  provinceBounds?: LatLngBoundsExpression
  resetVersion: number
}) {
  const map = useMap()
  const previousReset = useRef(resetVersion)

  useEffect(() => {
    if (previousReset.current !== resetVersion) {
      previousReset.current = resetVersion
      map.flyTo(TURKEY_CENTER, 5.4, { duration: 0.45 })
      return
    }

    if (selected) {
      map.flyTo(selected.center, 9, { duration: 0.5 })
    } else if (provinceBounds) {
      map.flyToBounds(provinceBounds, { duration: 0.45, maxZoom: 8.25, padding: [42, 42] })
    }
  }, [map, provinceBounds, resetVersion, selected])

  return null
}

interface SimpleJudicialMapProps {
  locations: LocationRecord[]
  selected?: LocationRecord
  selectedRecord?: JudicialDistrictRecord
  onSelect: (location: LocationRecord) => void
  onClearSelection: () => void
  darkMode: boolean
}

export function SimpleJudicialMap({ locations, selected, selectedRecord, onSelect, onClearSelection, darkMode }: SimpleJudicialMapProps) {
  const [provinces, setProvinces] = useState<any>()
  const [districts, setDistricts] = useState<any>()
  const [activeProvinceId, setActiveProvinceId] = useState<string>()
  const [activeProvinceName, setActiveProvinceName] = useState<string>()
  const [provinceBounds, setProvinceBounds] = useState<LatLngBoundsExpression>()
  const [showTiles, setShowTiles] = useState(false)
  const [mapError, setMapError] = useState(false)
  const [loadingProvince, setLoadingProvince] = useState(false)
  const [resetVersion, setResetVersion] = useState(0)
  const loadSequence = useRef(0)
  const selectedIdRef = useRef(selected?.id)
  const showTilesRef = useRef(showTiles)
  const darkModeRef = useRef(darkMode)

  selectedIdRef.current = selected?.id
  showTilesRef.current = showTiles
  darkModeRef.current = darkMode

  useEffect(() => {
    loadProvincesGeoJson().then(setProvinces).catch(() => setMapError(true))
  }, [])

  const districtStyle = useCallback((districtId?: string): PathOptions => {
    const isSelected = selectedIdRef.current === districtId
    const isDark = darkModeRef.current
    return {
      color: isSelected ? '#d59343' : (isDark ? '#75929d' : '#607b87'),
      weight: isSelected ? 3 : 1.15,
      fillColor: isSelected ? '#d99a3f' : (isDark ? '#213d47' : '#f7f2e6'),
      fillOpacity: showTilesRef.current ? (isSelected ? 0.68 : 0.32) : (isSelected ? 0.94 : 0.78),
    }
  }, [])

  const provinceStyle = useCallback((): PathOptions => ({
    color: darkModeRef.current ? '#7897a5' : '#294e68',
    weight: 1.45,
    fillColor: darkModeRef.current ? '#1c3945' : '#d9e7df',
    fillOpacity: showTilesRef.current ? 0.28 : 0.82,
  }), [])

  const loadProvince = useCallback(async (
    provinceId: string,
    provinceName: string,
    bounds?: LatLngBoundsExpression,
  ) => {
    const requestId = ++loadSequence.current
    setActiveProvinceId(provinceId)
    setActiveProvinceName(provinceName)
    setProvinceBounds(bounds)
    setDistricts(undefined)
    setLoadingProvince(true)
    setMapError(false)

    try {
      const geoJson = await loadDistrictsGeoJson(provinceId)
      if (requestId !== loadSequence.current) return
      setDistricts(geoJson)
    } catch {
      if (requestId === loadSequence.current) setMapError(true)
    } finally {
      if (requestId === loadSequence.current) setLoadingProvince(false)
    }
  }, [])

  useEffect(() => {
    if (!selected?.provinceId || selected.provinceId === activeProvinceId) return
    void loadProvince(selected.provinceId, selected.provinceName)
  }, [activeProvinceId, loadProvince, selected])

  const openProvince = (feature: GeoFeature, layer: StyledLayer) => {
    onClearSelection()
    void loadProvince(
      feature.properties.id,
      feature.properties.name,
      layer.getBounds?.(),
    )
  }

  const openDistrict = (feature: GeoFeature) => {
    const location = locations.find((item) => item.id === feature.properties.id)
    if (location) onSelect(location)
  }

  const resetToTurkey = () => {
    loadSequence.current += 1
    onClearSelection()
    setDistricts(undefined)
    setActiveProvinceId(undefined)
    setActiveProvinceName(undefined)
    setProvinceBounds(undefined)
    setLoadingProvince(false)
    setMapError(false)
    setResetVersion((value) => value + 1)
  }

  return (
    <div className="v2-map-shell">
      <div className="v2-map-help" aria-live="polite">
        {loadingProvince ? <LoaderCircle className="v2-spin" size={16} /> : <Layers3 size={16} />}
        <span>
          {loadingProvince
            ? `${activeProvinceName ?? 'İl'} ilçeleri yükleniyor…`
            : activeProvinceName
              ? <><b>{activeProvinceName}</b> · İlçe sınırına tıklayın</>
              : 'Detay için bir ile tıklayın'}
        </span>
      </div>

      <div className="v2-map-actions" aria-label="Harita araçları">
        {activeProvinceId && (
          <button className="v2-map-action v2-map-back" onClick={resetToTurkey}>
            <ChevronLeft size={15} /> Tüm Türkiye
          </button>
        )}
        <button
          className={`v2-map-action ${showTiles ? 'active' : ''}`}
          aria-pressed={showTiles}
          onClick={() => setShowTiles((value) => !value)}
        >
          <MapIcon size={14} /> {showTiles ? 'Sade harita' : 'OSM tabanı'}
        </button>
      </div>

      {mapError && <div className="v2-map-error" role="alert">Harita sınırları yüklenemedi. Listeden seçim yapabilirsiniz.</div>}

      <MapContainer
        center={TURKEY_CENTER}
        zoom={5.4}
        zoomSnap={0.25}
        zoomDelta={0.5}
        minZoom={4.75}
        maxZoom={12}
        maxBounds={TURKEY_BOUNDS}
        maxBoundsViscosity={0.72}
        preferCanvas
        className="v2-map"
      >
        {showTiles && <TileLayer attribution="&copy; OpenStreetMap katkıda bulunanlar" url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />}

        {provinces && !activeProvinceId && (
          <GeoJSON
            data={provinces}
            style={provinceStyle()}
            onEachFeature={(feature: GeoFeature, leafletLayer: Layer) => {
              const layer = leafletLayer as StyledLayer
              layer.bindTooltip(feature.properties.name, { sticky: true, className: 'v2-tooltip' })
              layer.on({
                mouseover: () => layer.setStyle?.({ color: '#d59343', weight: 2.2, fillColor: darkModeRef.current ? '#315563' : '#c2d9ce', fillOpacity: showTilesRef.current ? 0.48 : 0.95 }),
                mouseout: () => layer.setStyle?.(provinceStyle()),
                click: () => openProvince(feature, layer),
              })
            }}
          />
        )}

        {districts && activeProvinceId && (
          <GeoJSON
            key={activeProvinceId}
            data={districts}
            style={(feature) => districtStyle(feature?.properties.id)}
            onEachFeature={(feature: GeoFeature, leafletLayer: Layer) => {
              const layer = leafletLayer as StyledLayer
              layer.bindTooltip(feature.properties.name, { sticky: true, className: 'v2-tooltip' })
              layer.on({
                mouseover: () => layer.setStyle?.({ color: '#d59343', weight: 2.1, fillColor: darkModeRef.current ? '#4a5f53' : '#ead9ad', fillOpacity: showTilesRef.current ? 0.58 : 0.92 }),
                mouseout: () => layer.setStyle?.(districtStyle(feature.properties.id)),
                click: () => openDistrict(feature),
              })
            }}
          />
        )}

        {selected && selectedRecord && (
          <CircleMarker center={selected.center} radius={8} pathOptions={{ color: '#fff', weight: 2, fillColor: '#a65e22', fillOpacity: 1 }}>
            <Tooltip permanent direction="top" offset={[0, -7]} className="v2-marker-label">{selected.districtName}</Tooltip>
            <Popup><b>{selected.districtName}</b><br />{selectedRecord.courthouseSeat} Adliyesi</Popup>
          </CircleMarker>
        )}

        <ViewController selected={selected} provinceBounds={provinceBounds} resetVersion={resetVersion} />
      </MapContainer>

      <div className="v2-map-legend" aria-hidden="true">
        <span><i className="province" /> İl sınırı</span>
        <span><i className="selected" /> Seçili ilçe</span>
      </div>
      <div className="v2-attribution">Sınırlar: HDX / ttezer · MIT</div>
    </div>
  )
}
