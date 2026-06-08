import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { PetPost } from '@/types'
import { STATUS_COLORS, TYPE_COLORS } from '@/types'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

interface MapViewProps {
  posts: PetPost[]
  onPostClick: (id: string) => void
}

function MapUpdater({ posts }: { posts: PetPost[] }) {
  const map = useMap()

  useEffect(() => {
    if (posts.length === 0) return
    const validPosts = posts.filter((p) => p.lat && p.lng)
    if (validPosts.length === 0) return
    const bounds = L.latLngBounds(validPosts.map((p) => [p.lat, p.lng] as L.LatLngTuple))
    map.flyToBounds(bounds, { padding: [50, 50], maxZoom: 15 })
  }, [posts, map])

  return null
}

const STATUS_TEXT: Record<string, string> = {
  searching: '寻找中',
  clue: '疑似线索',
  reunited: '已团圆',
}

export default function MapView({ posts, onPostClick }: MapViewProps) {
  return (
    <div className="h-full w-full">
      <MapContainer center={[39.9042, 116.4074]} zoom={13} scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> 贡献者'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater posts={posts} />
        {posts.map((post) => {
          const color = post.status === 'reunited' ? '#22C55E' : TYPE_COLORS[post.type]
          const icon = L.divIcon({
            className: '',
            html: `<div style="
              width: 14px;
              height: 14px;
              border-radius: 50%;
              background: ${color};
              border: 2px solid white;
              box-shadow: 0 1px 3px rgba(0,0,0,0.4);
            "></div>`,
            iconSize: [14, 14],
            iconAnchor: [7, 7],
            popupAnchor: [0, -7],
          })
          return (
            <Marker key={post.id} position={[post.lat, post.lng]} icon={icon}>
              <Popup>
                <div style={{ minWidth: 160 }}>
                  {post.photos.length > 0 && (
                    <img
                      src={post.photos[0]}
                      alt={post.name}
                      style={{ width: 80, borderRadius: 4, marginBottom: 6, display: 'block' }}
                    />
                  )}
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{post.name}</div>
                  <div style={{ fontSize: 12, color: '#666', margin: '2px 0' }}>{post.breed}</div>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '1px 8px',
                      borderRadius: 10,
                      fontSize: 11,
                      color: '#fff',
                      background: STATUS_COLORS[post.status],
                    }}
                  >
                    {STATUS_TEXT[post.status]}
                  </span>
                  <div style={{ marginTop: 6 }}>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        onPostClick(post.id)
                      }}
                      style={{ fontSize: 13, color: '#3B82F6', textDecoration: 'none' }}
                    >
                      查看详情
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}
