import { Link } from 'react-router-dom'
import { Monitor } from 'lucide-react'
import type { Device } from '../types'
import { getWarrantyStatus, getDaysLeft, formatDate } from '../utils/dateUtils'
import { WARRANTY_STATUS_LABEL, WARRANTY_STATUS_COLOR } from '../utils/constants'

interface DeviceCardProps {
  device: Device
}

function DeviceCard({ device }: DeviceCardProps) {
  const status = getWarrantyStatus(device)
  const daysLeft = getDaysLeft(device)

  const badgeClass =
    status === 'in-warranty'
      ? 'badge-success'
      : status === 'expiring-soon'
      ? 'badge-warning'
      : 'badge-danger'

  const statusColor = WARRANTY_STATUS_COLOR[status]

  return (
    <Link
      to={`/devices/${device.id}`}
      className="card"
      style={{ display: 'block', transition: 'box-shadow 0.2s ease' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = ''
      }}
    >
      <div
        style={{
          height: 160,
          backgroundColor: '#f3f4f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {device.devicePhoto ? (
          <img
            src={device.devicePhoto}
            alt={device.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <Monitor style={{ width: 64, height: 64, color: '#9ca3af' }} />
        )}
      </div>
      <div className="card-padding">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 12,
          }}
        >
          <h3
            style={{
              fontSize: 18,
              fontWeight: 600,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              paddingRight: 8,
              flex: 1,
            }}
          >
            {device.name}
          </h3>
          <span className={`badge ${badgeClass}`}>{WARRANTY_STATUS_LABEL[status]}</span>
        </div>
        <p style={{ fontSize: 14, color: '#4b5563', marginBottom: 4 }}>
          {device.brand} {device.model}
        </p>
        <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>{device.room}</p>
        <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 12 }}>
          购买日期：{formatDate(device.purchaseDate)}
        </p>
        {status === 'expiring-soon' && (
          <p style={{ fontSize: 14, fontWeight: 500, color: statusColor }}>
            还有{Math.abs(daysLeft)}天过期
          </p>
        )}
        {status === 'expired' && (
          <p style={{ fontSize: 14, fontWeight: 500, color: statusColor }}>
            已过期{Math.abs(daysLeft)}天
          </p>
        )}
      </div>
    </Link>
  )
}

export default DeviceCard
