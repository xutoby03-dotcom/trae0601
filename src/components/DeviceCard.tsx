import { Link } from 'react-router-dom'
import { Monitor, AlertTriangle, Clock, XCircle } from 'lucide-react'
import type { Device } from '../types'
import { getWarrantyStatus, getDaysLeft, getWarrantyEndDate } from '../utils/dateUtils'
import { WARRANTY_STATUS_LABEL, WARRANTY_STATUS_COLOR } from '../utils/constants'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface DeviceCardProps {
  device: Device
}

function DeviceCard({ device }: DeviceCardProps) {
  const status = getWarrantyStatus(device)
  const daysLeft = getDaysLeft(device)
  const endDate = getWarrantyEndDate(device)

  const badgeClass =
    status === 'in-warranty'
      ? 'badge-success'
      : status === 'expiring-soon'
      ? 'badge-warning'
      : 'badge-danger'

  const statusColor = WARRANTY_STATUS_COLOR[status]

  const cardBorder =
    status === 'expiring-soon'
      ? `2px solid ${statusColor}`
      : status === 'expired'
      ? `2px solid ${statusColor}`
      : undefined

  const StatusIcon =
    status === 'expiring-soon' ? AlertTriangle : status === 'expired' ? XCircle : Clock

  const daysText =
    status === 'expired'
      ? `已过期 ${Math.abs(daysLeft)} 天`
      : daysLeft > 365
      ? `剩余 ${Math.floor(daysLeft / 365)} 年 ${daysLeft % 365} 天`
      : `剩余 ${daysLeft} 天`

  const panelBgColor =
    status === 'in-warranty' ? '#f0fdf4' : status === 'expiring-soon' ? '#fffbeb' : '#fef2f2'
  const panelBorderColor =
    status === 'in-warranty' ? '#bbf7d0' : status === 'expiring-soon' ? '#fde68a' : '#fecaca'

  return (
    <Link
      to={`/devices/${device.id}`}
      className="card"
      style={{
        display: 'block',
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
        border: cardBorder,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow =
          '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = ''
        e.currentTarget.style.transform = ''
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
          position: 'relative',
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
        {status !== 'in-warranty' && (
          <div
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 10px',
              borderRadius: 999,
              backgroundColor: statusColor,
              color: 'white',
              fontSize: 12,
              fontWeight: 600,
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}
          >
            <StatusIcon style={{ width: 14, height: 14 }} />
            {status === 'expiring-soon' ? '即将过保' : '已过保'}
          </div>
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
        <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 12 }}>{device.room}</p>

        <div
          style={{
            padding: '10px 12px',
            borderRadius: 8,
            backgroundColor: panelBgColor,
            border: `1px solid ${panelBorderColor}`,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 4,
              fontWeight: 600,
              fontSize: 14,
              color: statusColor,
            }}
          >
            <StatusIcon style={{ width: 16, height: 16 }} />
            {daysText}
          </div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>
            保修截止：{format(endDate, 'yyyy年MM月dd日', { locale: zhCN })}
          </div>
        </div>
      </div>
    </Link>
  )
}

export default DeviceCard
