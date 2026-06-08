import { useMemo } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2, Plus, Award } from 'lucide-react'
import { useCoffeeStore } from '@/store/coffeeStore'
import FlavorRadar from '@/components/FlavorRadar'
import BrewHistoryChart, { calcMatchScore } from '@/components/BrewHistoryChart'
import StarRating from '@/components/StarRating'
import { getRoastColor, getRoastLabel, getProcessLabel, formatDate } from '@/utils/helpers'
import type { Flavor } from '@/types'

export default function BeanDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const beans = useCoffeeStore((s) => s.beans)
  const brews = useCoffeeStore((s) => s.brews)
  const removeBean = useCoffeeStore((s) => s.removeBean)
  const removeBrew = useCoffeeStore((s) => s.removeBrew)

  const bean = beans.find((b) => b.id === id)

  const beanBrews = useMemo(
    () =>
      bean
        ? brews
            .filter((b) => b.beanId === bean.id)
            .sort((a, b) => new Date(b.brewedAt).getTime() - new Date(a.brewedAt).getTime())
        : [],
    [bean, brews]
  )

  const bestBrew = useMemo(() => {
    if (beanBrews.length === 0 || !bean) return null
    return beanBrews.reduce((best, cur) =>
      calcMatchScore(cur.flavor, bean.flavor) > calcMatchScore(best.flavor, bean.flavor) ? cur : best
    )
  }, [beanBrews, bean])

  const bestMatchScore = useMemo(() => {
    if (!bestBrew || !bean) return 0
    return calcMatchScore(bestBrew.flavor, bean.flavor)
  }, [bestBrew, bean])

  if (!bean) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#6F4E37', fontFamily: 'DM Sans' }}>
        未找到该咖啡豆
      </div>
    )
  }

  const roastColor = getRoastColor(bean.roastLevel)
  const weightPercent = Math.max(0, (bean.weightRemaining / bean.weightTotal) * 100)
  const isEmpty = bean.weightRemaining <= 0

  const handleDeleteBean = () => {
    if (window.confirm(`确定删除「${bean.name}」？所有关联冲煮记录也将被删除。`)) {
      removeBean(bean.id)
      navigate('/')
    }
  }

  const handleDeleteBrew = (brewId: string) => {
    if (window.confirm('确定删除这条冲煮记录？')) {
      removeBrew(brewId)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FFF8F0' }}>
      <div
        style={{
          height: 8,
          background: roastColor.band,
          width: '100%',
        }}
      />

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 16px 40px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 0',
          }}
        >
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#6F4E37',
              display: 'flex',
              alignItems: 'center',
              padding: 4,
            }}
          >
            <ArrowLeft size={22} />
          </button>

          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 24,
              fontWeight: 700,
              color: '#3E2412',
              flex: 1,
              textAlign: 'center',
              margin: '0 12px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {bean.name}
          </h1>

          <div style={{ display: 'flex', gap: 8 }}>
            <Link
              to={`/beans/${bean.id}/edit`}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#6F4E37',
                display: 'flex',
                alignItems: 'center',
                padding: 4,
              }}
            >
              <Pencil size={18} />
            </Link>
            <button
              onClick={handleDeleteBean}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#A0522D',
                display: 'flex',
                alignItems: 'center',
                padding: 4,
              }}
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        <div
          style={{
            background: '#FFFDF8',
            border: '1px solid #E8D5C0',
            borderRadius: 12,
            padding: 20,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '14px 24px',
              fontSize: 14,
              fontFamily: 'DM Sans',
              color: '#3E2412',
            }}
          >
            <div>
              <span style={{ color: '#B8A090', fontSize: 12 }}>产地</span>
              <div style={{ marginTop: 2 }}>{bean.origin}</div>
            </div>
            <div>
              <span style={{ color: '#B8A090', fontSize: 12 }}>烘焙度</span>
              <div style={{ marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span
                  style={{
                    display: 'inline-block',
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: roastColor.band,
                  }}
                />
                {getRoastLabel(bean.roastLevel)}
              </div>
            </div>
            <div>
              <span style={{ color: '#B8A090', fontSize: 12 }}>处理法</span>
              <div style={{ marginTop: 2 }}>{getProcessLabel(bean.processMethod)}</div>
            </div>
            <div>
              <span style={{ color: '#B8A090', fontSize: 12 }}>购买日期</span>
              <div style={{ marginTop: 2 }}>{formatDate(bean.purchaseDate)}</div>
            </div>
            <div>
              <span style={{ color: '#B8A090', fontSize: 12 }}>开封日期</span>
              <div style={{ marginTop: 2 }}>{bean.openDate ? formatDate(bean.openDate) : '—'}</div>
            </div>
            <div>
              <span style={{ color: '#B8A090', fontSize: 12 }}>价格</span>
              <div style={{ marginTop: 2 }}>{bean.price != null ? `¥${bean.price}` : '—'}</div>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <span style={{ color: '#B8A090', fontSize: 12 }}>克数</span>
              <div style={{ marginTop: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>
                  {bean.weightRemaining}g / {bean.weightTotal}g
                </span>
                {isEmpty && (
                  <span
                    style={{
                      background: '#A0522D',
                      color: '#FFF',
                      fontSize: 11,
                      padding: '1px 8px',
                      borderRadius: 10,
                    }}
                  >
                    已喝完
                  </span>
                )}
              </div>
              <div
                style={{
                  marginTop: 6,
                  height: 6,
                  borderRadius: 3,
                  background: '#F5E6D3',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${weightPercent}%`,
                    background: roastColor.band,
                    borderRadius: 3,
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 18,
              fontWeight: 600,
              color: '#3E2412',
              marginBottom: 12,
            }}
          >
            风味档案
          </h2>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <FlavorRadar flavor={bean.flavor} />
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 18,
                fontWeight: 600,
                color: '#3E2412',
              }}
            >
              冲煮历史
            </h2>
            {bestBrew && (
              <span
                style={{
                  fontSize: 13,
                  fontFamily: 'DM Sans',
                  color: '#6F4E37',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Award size={14} style={{ color: '#D4A574' }} />
                最贴合口味 · {formatDate(bestBrew.brewedAt)} · {bestMatchScore}%
              </span>
            )}
          </div>
          <BrewHistoryChart brews={beanBrews} beanFlavor={bean.flavor} />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 18,
                fontWeight: 600,
                color: '#3E2412',
              }}
            >
              冲煮记录
            </h2>
            <Link
              to={`/brews/new?beanId=${bean.id}`}
              style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  background: '#6F4E37',
                  color: '#FFF',
                  fontSize: 13,
                  fontFamily: 'DM Sans',
                  fontWeight: 500,
                  padding: '6px 14px',
                  borderRadius: 8,
                  textDecoration: 'none',
                }}
            >
              <Plus size={14} />
              记录冲煮
            </Link>
          </div>

          {beanBrews.length === 0 ? (
            <div
              style={{
                background: '#FFFDF8',
                border: '1px solid #E8D5C0',
                borderRadius: 12,
                padding: 32,
                textAlign: 'center',
                color: '#B8A090',
                fontFamily: 'DM Sans',
                fontSize: 14,
              }}
            >
              还没有冲煮记录，点击上方按钮记录第一次冲煮
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {beanBrews.map((brew) => {
                const isBest = bestBrew?.id === brew.id
                const matchScore = bean ? calcMatchScore(brew.flavor, bean.flavor) : 0
                return (
                  <div
                    key={brew.id}
                    style={{
                      background: isBest ? '#FFF8EE' : '#FFFDF8',
                      border: isBest ? '2px solid #D4A574' : '1px solid #E8D5C0',
                      borderRadius: 12,
                      padding: 16,
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          marginBottom: 6,
                          fontFamily: 'DM Sans',
                          fontSize: 14,
                          color: '#3E2412',
                        }}
                      >
                        <span style={{ fontWeight: 600 }}>{formatDate(brew.brewedAt)}</span>
                        <span style={{ color: '#B8A090', fontSize: 13 }}>{brew.equipment}</span>
                        <span style={{ color: '#B8A090', fontSize: 13 }}>{brew.ratio}</span>
                        {isBest && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 3,
                              background: '#D4A574',
                              color: '#FFF',
                              fontSize: 11,
                              fontWeight: 600,
                              padding: '1px 8px',
                              borderRadius: 10,
                            }}
                          >
                            <Award size={11} />
                            最贴合 {matchScore}%
                          </span>
                        )}
                        {!isBest && (
                          <span
                            style={{
                              fontSize: 11,
                              color: '#8B6914',
                              background: '#F5E6D3',
                              padding: '1px 8px',
                              borderRadius: 10,
                            }}
                          >
                            匹配 {matchScore}%
                          </span>
                        )}
                      </div>
                      <StarRating value={brew.rating} readonly />
                      {brew.notes && (
                        <div
                          style={{
                            marginTop: 6,
                            fontSize: 13,
                            color: '#8B7355',
                            fontFamily: 'DM Sans',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: 400,
                          }}
                        >
                          {brew.notes}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                      <Link
                        to={`/brews/${brew.id}/edit`}
                        aria-label="编辑冲煮记录"
                        title="编辑冲煮记录"
                        className="inline-flex items-center justify-center rounded-lg p-2 text-[#6F4E37] hover:bg-[#F5E6D3] active:bg-[#E8D5BC] transition-colors"
                      >
                        <Pencil size={15} />
                      </Link>
                      <button
                        onClick={() => handleDeleteBrew(brew.id)}
                        aria-label="删除冲煮记录"
                        title="删除冲煮记录"
                        className="inline-flex items-center justify-center rounded-lg p-2 text-[#D4A574] hover:bg-[#F5E6D3] hover:text-[#6F4E37] active:bg-[#E8D5BC] transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
