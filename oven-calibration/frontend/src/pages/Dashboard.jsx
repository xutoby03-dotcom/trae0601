import React, { useState, useEffect, useMemo } from 'react'
import {
  Row,
  Col,
  Card,
  Statistic,
  Select,
  Tag,
  Space,
  Button,
  List,
  Alert,
  Progress,
  Spin,
  Empty,
  Table,
  Typography,
  message,
  Descriptions,
  Modal,
} from 'antd'
import {
  FireOutlined,
  AppstoreOutlined,
  AlertOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  RightOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import ReactECharts from 'echarts-for-react'
import {
  getOverview,
  getDeviationTrend,
  getMaintenanceAlerts,
  getAffectedProducts,
  getDecommissionCandidates,
  getLayerPerformance,
} from '@/api/dashboard'
import { getOvens, updateOvenStatus } from '@/api/ovens'

const { Title, Text } = Typography
const { Option } = Select

const alertTypeMap = {
  high_deviation: { label: '高偏差', color: 'red' },
  frequent_high_deviation: { label: '频繁偏差', color: 'volcano' },
  overdue_maintenance: { label: '超期维护', color: 'gold' },
  frequent_failures: { label: '频繁故障', color: 'orange' },
  no_maintenance: { label: '未维护', color: 'gold' },
  old_equipment: { label: '老旧设备', color: 'default' },
}

const riskLevelMap = {
  high: { label: '高风险', color: 'red' },
  medium: { label: '中风险', color: 'orange' },
  low: { label: '低风险', color: 'gold' },
}

const statusTagMap = {
  active: { color: 'green', label: '运行中' },
  maintenance: { color: 'orange', label: '维护中' },
  decommissioned: { color: 'red', label: '已停用' },
}

const Dashboard = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [overview, setOverview] = useState(null)
  const [deviationTrend, setDeviationTrend] = useState([])
  const [maintenanceAlerts, setMaintenanceAlerts] = useState([])
  const [affectedProducts, setAffectedProducts] = useState([])
  const [decommissionCandidates, setDecommissionCandidates] = useState([])
  const [layerPerformance, setLayerPerformance] = useState([])
  const [ovens, setOvens] = useState([])
  const [selectedOvenId, setSelectedOvenId] = useState(null)
  const [selectedDays, setSelectedDays] = useState(30)
  const [detailVisible, setDetailVisible] = useState(false)
  const [detailOven, setDetailOven] = useState(null)

  useEffect(() => {
    fetchAllData()
  }, [])

  useEffect(() => {
    fetchDeviationTrend()
  }, [selectedOvenId, selectedDays])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const [
        overviewRes,
        alertsRes,
        productsRes,
        candidatesRes,
        layerRes,
        ovensRes,
      ] = await Promise.all([
        getOverview(),
        getMaintenanceAlerts(),
        getAffectedProducts(),
        getDecommissionCandidates(),
        getLayerPerformance(),
        getOvens({ pageSize: 100 }),
      ])
      setOverview(overviewRes)
      setMaintenanceAlerts(alertsRes || [])
      setAffectedProducts(productsRes || [])
      setDecommissionCandidates(candidatesRes || [])
      setLayerPerformance(layerRes || [])
      setOvens(ovensRes?.list || ovensRes || [])
    } catch (err) {
      console.error('获取数据失败:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchDeviationTrend = async () => {
    try {
      const params = { days: selectedDays }
      if (selectedOvenId) {
        params.ovenId = selectedOvenId
      }
      const data = await getDeviationTrend(params)
      setDeviationTrend(data || [])
    } catch (err) {
      console.error('获取偏差趋势失败:', err)
    }
  }

  const handleMarkMaintenance = async (ovenId) => {
    try {
      await updateOvenStatus(ovenId, 'maintenance')
      message.success('已标记为维护中')
      fetchAllData()
    } catch (err) {
      console.error('标记维护失败:', err)
    }
  }

  const handleDecommission = async (ovenId) => {
    try {
      await updateOvenStatus(ovenId, 'decommissioned')
      message.success('已确认停用')
      fetchAllData()
    } catch (err) {
      console.error('停用失败:', err)
    }
  }

  const trendChartOption = useMemo(() => {
    const dates = deviationTrend.map((item) => item.date)
    const values = deviationTrend.map((item) => item.avgDeviation)

    return {
      tooltip: {
        trigger: 'axis',
        formatter: (params) => {
          const data = params[0]
          return `${data.name}<br/>平均偏差: <strong>${data.value}°C</strong>`
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: dates,
        boundaryGap: false,
        axisLabel: {
          rotate: 45,
          fontSize: 11,
        },
      },
      yAxis: {
        type: 'value',
        name: '偏差(°C)',
        axisLine: {
          lineStyle: {
            color: '#999',
          },
        },
      },
      series: [
        {
          name: '平均偏差',
          type: 'line',
          data: values,
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          label: {
            show: true,
            position: 'top',
            formatter: '{c}',
            fontSize: 10,
          },
          lineStyle: {
            width: 2,
            color: '#1890ff',
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: 'rgba(24, 144, 255, 0.5)',
                },
                {
                  offset: 0.5,
                  color: 'rgba(24, 144, 255, 0.1)',
                },
                {
                  offset: 1,
                  color: 'rgba(255, 77, 79, 0.1)',
                },
              ],
            },
          },
          markLine: {
            silent: true,
            symbol: 'none',
            lineStyle: {
              type: 'dashed',
              color: '#999',
              width: 1,
            },
            data: [
              {
                yAxis: 0,
              },
            ],
          },
        },
      ],
    }
  }, [deviationTrend])

  const layerChartOption = useMemo(() => {
    const xAxisData = layerPerformance.map(
      (item) => `${item.model}-${item.layerNumber}层`
    )
    const values = layerPerformance.map((item) => item.avgDeviation)
    const failureRates = layerPerformance.map((item) => item.failureRate)

    const getBarColor = (value) => {
      const absValue = Math.abs(value)
      if (absValue > 20) return '#ff4d4f'
      if (absValue > 10) return '#fa8c16'
      if (absValue > 5) return '#faad14'
      return '#52c41a'
    }

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: (params) => {
          const data = params[0]
          const idx = data.dataIndex
          const fr = failureRates[idx]
          return `${data.name}<br/>平均偏差: <strong>${data.value}°C</strong>${fr > 0 ? `<br/>失败率: <strong>${fr}%</strong>` : ''}`
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: xAxisData,
        axisLabel: {
          rotate: 45,
          fontSize: 10,
          interval: 0,
        },
      },
      yAxis: {
        type: 'value',
        name: '偏差(°C)',
      },
      series: [
        {
          name: '平均偏差',
          type: 'bar',
          data: values.map((value) => ({
            value,
            itemStyle: {
              color: getBarColor(value),
            },
          })),
          barWidth: '60%',
          label: {
            show: true,
            position: 'top',
            formatter: (params) => {
              const fr = failureRates[params.dataIndex]
              if (fr > 0) {
                return `{a|${params.value}°C\n{b|${fr}%}}`
              }
              return `${params.value}°C`
            },
            rich: {
              a: {
                color: '#333',
                fontSize: 10,
              },
              b: {
                color: '#ff4d4f',
                fontSize: 9,
              },
            },
            fontSize: 10,
          },
        },
      ],
    }
  }, [layerPerformance])

  const getDeviationColor = (value) => {
    if (value > 20) return '#ff4d4f'
    if (value > 10) return '#fa8c16'
    return '#52c41a'
  }

  const getSuccessRateColor = (rate) => {
    if (rate < 70) return '#ff4d4f'
    if (rate < 85) return '#fa8c16'
    return '#52c41a'
  }

  const getRiskLevel = (candidate) => {
    if (candidate.reasons?.length >= 3) return 'high'
    if (candidate.reasons?.length === 2) return 'medium'
    return 'low'
  }

  const getMedalIcon = (index) => {
    if (index === 0) return '🥇'
    if (index === 1) return '🥈'
    if (index === 2) return '🥉'
    return `${index + 1}`
  }

  const decommissionWarningList = useMemo(() => {
    if (!decommissionCandidates?.length) return []
    return decommissionCandidates.map((item) => {
      const ovenInfo = ovens.find((o) => o.id === item.ovenId)
      let failedProductCount = 0
      affectedProducts?.forEach((p) => {
        const hasOven = p.affectedOvens?.some((ao) => ao.ovenId === item.ovenId)
        if (hasOven) failedProductCount++
      })
      return {
        ...item,
        employeeName: ovenInfo?.employee?.name || '-',
        latestDeviation: ovenInfo?.latestCalibration?.deviation ?? null,
        failedProductCount,
        status: ovenInfo?.status || 'active',
      }
    })
  }, [decommissionCandidates, ovens, affectedProducts])

  const handleViewOvenDetail = (ovenId) => {
    const ovenInfo = ovens.find((o) => o.id === ovenId)
    if (ovenInfo) {
      setDetailOven(ovenInfo)
      setDetailVisible(true)
    }
  }

  const handleGoToOvens = (ovenId) => {
    navigate('/ovens', { state: { openOvenId: ovenId } })
  }

  const productColumns = [
    {
      title: '排名',
      dataIndex: 'index',
      key: 'index',
      width: 80,
      render: (_, __, index) => (
        <Text strong style={{ fontSize: 16 }}>
          {getMedalIcon(index)}
        </Text>
      ),
    },
    {
      title: '产品名称',
      dataIndex: 'recipeName',
      key: 'recipeName',
    },
    {
      title: '总批次',
      dataIndex: 'totalBatches',
      key: 'totalBatches',
      width: 100,
    },
    {
      title: '失败批次',
      dataIndex: 'failedBatches',
      key: 'failedBatches',
      width: 100,
      render: (text) => <Text type="danger">{text}</Text>,
    },
    {
      title: '失败率',
      dataIndex: 'failureRate',
      key: 'failureRate',
      width: 200,
      render: (rate) => (
        <Progress
          percent={rate}
          showInfo
          strokeColor="#ff4d4f"
          format={(percent) => `${percent}%`}
          size="small"
        />
      ),
    },
    {
      title: '受影响烤箱',
      dataIndex: 'affectedOvens',
      key: 'affectedOvens',
      render: (ovens) => (
        <Space wrap>
          {ovens?.map((oven) => (
            <Tag key={oven.ovenId} color="red">
              {oven.model}
            </Tag>
          ))}
        </Space>
      ),
    },
  ]

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
        <Spin size="large" tip="加载中..." />
      </div>
    )
  }

  const warningIconStyle = {
    color: maintenanceAlerts?.length > 0 ? '#ff4d4f' : '#52c41a',
    animation: maintenanceAlerts?.length > 0 ? 'blink 1s infinite' : 'none',
  }

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={24} md={6}>
          <Card bordered={false}>
            <Statistic
              title={
                <Space>
                  <FireOutlined style={{ color: '#1890ff' }} />
                  <span>烤箱总数</span>
                </Space>
              }
              value={overview?.totalOvens || 0}
              suffix="台"
              valueStyle={{ color: '#1890ff' }}
            />
            <Space wrap style={{ marginTop: 8 }}>
              <Tag color="green">运行中 {overview?.activeOvens || 0}</Tag>
              <Tag color="orange">维护中 {overview?.maintenanceOvens || 0}</Tag>
              <Tag color="red">已停用 {overview?.decommissionedOvens || 0}</Tag>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={24} md={6}>
          <Card bordered={false}>
            <Statistic
              title={
                <Space>
                  <AppstoreOutlined style={{ color: '#722ed1' }} />
                  <span>近30天批次</span>
                </Space>
              }
              value={overview?.totalBatches || 0}
              suffix="批"
              valueStyle={{ color: '#722ed1' }}
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">成功率：</Text>
              <Text
                strong
                style={{ color: getSuccessRateColor(overview?.successRate || 0) }}
              >
                {overview?.successRate || 0}%
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={24} md={6}>
          <Card bordered={false}>
            <Statistic
              title={
                <Space>
                  <AlertOutlined style={{ color: '#fa8c16' }} />
                  <span>近7天平均偏差</span>
                </Space>
              }
              value={overview?.avgDeviation || 0}
              suffix="°C"
              valueStyle={{ color: getDeviationColor(overview?.avgDeviation || 0) }}
              precision={1}
            />
            <div style={{ marginTop: 8 }}>
              <Text
                type={overview?.avgDeviation > 20 ? 'danger' : overview?.avgDeviation > 10 ? 'warning' : 'success'}
              >
                {overview?.avgDeviation > 20
                  ? '偏差严重，需立即处理'
                  : overview?.avgDeviation > 10
                  ? '偏差较大，建议检查'
                  : '偏差正常'}
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={24} md={6}>
          <Card bordered={false}>
            <Statistic
              title={
                <Space>
                  <WarningOutlined style={warningIconStyle} />
                  <span>维修提醒</span>
                </Space>
              }
              value={maintenanceAlerts?.length || 0}
              valueStyle={{ color: maintenanceAlerts?.length > 0 ? '#ff4d4f' : '#52c41a' }}
            />
            <div style={{ marginTop: 8 }}>
              {maintenanceAlerts?.length > 0 ? (
                <Text type="danger">有 {maintenanceAlerts.length} 台烤箱需要维护</Text>
              ) : (
                <Text type="success">所有设备状态良好</Text>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {decommissionWarningList.length > 0 && (
        <Card
          bordered={false}
          style={{ marginBottom: 16 }}
          bodyStyle={{ padding: '12px 24px' }}
          title={
            <Space>
              <ExclamationCircleOutlined style={{ color: '#cf1322', fontSize: 18 }} />
              <Text strong style={{ color: '#cf1322', fontSize: 15 }}>
                停用预警
              </Text>
              <Tag color="red" style={{ marginLeft: 8 }}>
                {decommissionWarningList.length} 台高风险
              </Tag>
            </Space>
          }
          extra={
            <Button
              type="link"
              size="small"
              onClick={() => {
                const el = document.getElementById('decommission-section')
                if (el) el.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              查看全部 <RightOutlined style={{ fontSize: 12 }} />
            </Button>
          }
        >
          <Row gutter={[12, 12]}>
            {decommissionWarningList.slice(0, 4).map((item) => {
              const risk = getRiskLevel(item)
              return (
                <Col xs={24} sm={12} md={6} key={item.ovenId}>
                  <div
                    style={{
                      border: '1px solid #ffccc7',
                      borderRadius: 8,
                      padding: 12,
                      background: '#fff1f0',
                      cursor: 'pointer',
                      transition: 'box-shadow 0.2s',
                    }}
                    onClick={() => handleViewOvenDetail(item.ovenId)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(255,77,79,0.2)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <Space wrap style={{ marginBottom: 8 }}>
                      <Text strong>{item.model}</Text>
                      <Tag color={riskLevelMap[risk]?.color} style={{ margin: 0 }}>
                        {riskLevelMap[risk]?.label}
                      </Tag>
                    </Space>
                    <Descriptions column={2} size="small" colon={false}>
                      <Descriptions.Item label="负责人" span={2}>
                        {item.employeeName}
                      </Descriptions.Item>
                      <Descriptions.Item label="最近偏差">
                        <span style={{ color: getDeviationColor(item.latestDeviation || 0) }}>
                          {item.latestDeviation !== null ? `${item.latestDeviation > 0 ? '+' : ''}${item.latestDeviation}℃` : '-'}
                        </span>
                      </Descriptions.Item>
                      <Descriptions.Item label="失败产品">
                        <Text type="danger">{item.failedProductCount} 个</Text>
                      </Descriptions.Item>
                    </Descriptions>
                    <Button
                      type="link"
                      size="small"
                      style={{ padding: 0, marginTop: 4 }}
                      icon={<EyeOutlined />}
                    >
                      查看详情
                    </Button>
                  </div>
                </Col>
              )
            })}
          </Row>
        </Card>
      )}

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={24} md={12}>
          <Card
            bordered={false}
            title={
              <Space>
                <Title level={5} style={{ margin: 0 }}>
                  温差变化趋势
                </Title>
                <Space>
                  <Select
                    size="small"
                    value={selectedOvenId || undefined}
                    onChange={setSelectedOvenId}
                    placeholder="选择烤箱"
                    style={{ width: 150 }}
                    allowClear
                  >
                    {ovens.map((oven) => (
                      <Option key={oven.id} value={oven.id}>
                        {oven.model}
                      </Option>
                    ))}
                  </Select>
                  <Select
                    size="small"
                    value={selectedDays}
                    onChange={setSelectedDays}
                    style={{ width: 100 }}
                  >
                    <Option value={7}>最近7天</Option>
                    <Option value={14}>最近14天</Option>
                    <Option value={30}>最近30天</Option>
                    <Option value={60}>最近60天</Option>
                  </Select>
                </Space>
              </Space>
            }
          >
            {deviationTrend?.length > 0 ? (
              <ReactECharts
                option={trendChartOption}
                style={{ height: 350 }}
                notMerge
              />
            ) : (
              <Empty description="暂无数据" style={{ padding: "60px 0" }} />
            )}
          </Card>
        </Col>
        <Col xs={24} sm={24} md={12}>
          <Card
            bordered={false}
            title={
              <Title level={5} style={{ margin: 0 }}>
                层位表现
              </Title>
            }
          >
            {layerPerformance?.length > 0 ? (
              <ReactECharts
                option={layerChartOption}
                style={{ height: 350 }}
                notMerge
              />
            ) : (
              <Empty description="暂无数据" style={{ padding: "60px 0" }} />
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={24} md={12}>
          <Card
            bordered={false}
            title={
              <div
                style={{
                  background: '#fff1f0',
                  margin: '-24px',
                  padding: '16px 24px',
                  borderRadius: '8px 8px 0 0',
                  marginBottom: 0,
                }}
              >
                <Title level={5} style={{ margin: 0, color: '#cf1322' }}>
                  ⚠️ 维修提醒
                </Title>
              </div>
            }
            bodyStyle={{ paddingTop: 16 }}
          >
            {maintenanceAlerts?.length > 0 ? (
              <List
                dataSource={maintenanceAlerts}
                renderItem={(item) => (
                  <List.Item
                    key={item.ovenId}
                    style={{
                      border: '1px solid #f0f0f0',
                      borderRadius: 8,
                      marginBottom: 12,
                      padding: 16,
                    }}
                  >
                    <List.Item.Meta
                      title={
                        <Space wrap>
                          <Text strong>{item.model}</Text>
                          <Tag color={statusTagMap[item.status]?.color || 'default'}>
                            {statusTagMap[item.status]?.label || item.status}
                          </Tag>
                        </Space>
                      }
                      description={
                        <div>
                          <Space wrap style={{ marginBottom: 8 }}>
                            {item.alertType?.map((type) => (
                              <Tag
                                key={type}
                                color={alertTypeMap[type]?.color || 'default'}
                              >
                                {alertTypeMap[type]?.label || type}
                              </Tag>
                            ))}
                          </Space>
                          <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
                            {item.suggestion}
                          </Text>
                          <Space>
                            <Button
                              type="primary"
                              size="small"
                              onClick={() => handleMarkMaintenance(item.ovenId)}
                            >
                              标记维修
                            </Button>
                            <Button size="small">查看详情</Button>
                          </Space>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="暂无维修提醒" style={{ padding: '40px 0' }} />
            )}
          </Card>
        </Col>
        <Col xs={24} sm={24} md={12}>
          <Card
            bordered={false}
            title={
              <Title level={5} style={{ margin: 0 }}>
                📉 最受影响产品
              </Title>
            }
          >
            {affectedProducts?.length > 0 ? (
              <Table
                dataSource={affectedProducts}
                columns={productColumns}
                rowKey="recipeId"
                pagination={false}
                size="small"
                scroll={{ x: 600 }}
              />
            ) : (
              <Empty description="暂无数据" style={{ padding: '40px 0' }} />
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <div id="decommission-section">
            <Card
              bordered={false}
              title={
                <Title level={5} style={{ margin: 0 }}>
                  🔴 建议停用烤箱
                </Title>
              }
            >
            {decommissionCandidates?.length > 0 ? (
              <Row gutter={[16, 16]}>
                {decommissionCandidates.map((item) => {
                  const risk = getRiskLevel(item)
                  return (
                    <Col xs={24} sm={24} md={12} lg={8} key={item.ovenId}>
                      <Card
                        style={{
                          border: '1px solid #ffccc7',
                          borderRadius: 8,
                          background: '#fff1f0',
                        }}
                        bodyStyle={{ padding: 16 }}
                      >
                        <Space wrap style={{ marginBottom: 12 }}>
                          <Text strong style={{ fontSize: 16 }}>
                            {item.model}
                          </Text>
                          <Text type="secondary">SN: {item.serialNumber}</Text>
                          <Tag color={riskLevelMap[risk]?.color}>
                            {riskLevelMap[risk]?.label}
                          </Tag>
                        </Space>
                        <div style={{ marginBottom: 12 }}>
                          {item.reasons?.map((reason, idx) => (
                            <div key={idx} style={{ marginBottom: 4 }}>
                              <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                              <Text>{reason}</Text>
                            </div>
                          ))}
                        </div>
                        <Alert
                          type="warning"
                          message={item.recommendation}
                          showIcon
                          style={{ marginBottom: 12 }}
                        />
                        <Space>
                          <Button
                            danger
                            type="primary"
                            size="small"
                            onClick={() => handleDecommission(item.ovenId)}
                          >
                            确认停用
                          </Button>
                          <Button size="small">查看详情</Button>
                        </Space>
                      </Card>
                    </Col>
                  )
                })}
              </Row>
            ) : (
              <div
                style={{
                  textAlign: 'center',
                  padding: '40px 0',
                  color: '#52c41a',
                  fontSize: 16,
                }}
              >
                <CheckCircleOutlined style={{ fontSize: 32, marginBottom: 8 }} />
                <div>所有烤箱状态良好 ✅</div>
              </div>
            )}
            </Card>
          </div>
        </Col>
      </Row>

      <Modal
        title="烤箱详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>
            关闭
          </Button>,
          <Button
            key="goto"
            type="primary"
            onClick={() => {
              handleGoToOvens(detailOven?.id)
              setDetailVisible(false)
            }}
          >
            前往设备页 <RightOutlined />
          </Button>,
        ]}
        width={600}
        destroyOnClose
      >
        {detailOven && (
          <div>
            <Space wrap style={{ marginBottom: 16 }}>
              <Text strong style={{ fontSize: 18 }}>
                {detailOven.model}
              </Text>
              <Tag color={statusTagMap[detailOven.status]?.color}>
                {statusTagMap[detailOven.status]?.label}
              </Tag>
            </Space>
            <Descriptions column={2} size="small" bordered>
              <Descriptions.Item label="序列号">
                {detailOven.serialNumber || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="层数">
                {detailOven.totalLayers || '-'} 层
              </Descriptions.Item>
              <Descriptions.Item label="探针位置">
                {detailOven.probePosition || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="常用温区">
                {detailOven.commonTempZoneLow && detailOven.commonTempZoneHigh
                  ? `${detailOven.commonTempZoneLow} - ${detailOven.commonTempZoneHigh}℃`
                  : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="负责人">
                {detailOven.employee?.name || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="最近偏差">
                <span
                  style={{
                    color: getDeviationColor(
                      detailOven.latestCalibration?.deviation || 0
                    ),
                    fontWeight: 'bold',
                  }}
                >
                  {detailOven.latestCalibration?.deviation !== undefined &&
                  detailOven.latestCalibration?.deviation !== null
                    ? `${
                        detailOven.latestCalibration.deviation > 0 ? '+' : ''
                      }${detailOven.latestCalibration.deviation}℃`
                    : '-'}
                </span>
              </Descriptions.Item>
            </Descriptions>
            <Alert
              type="warning"
              showIcon
              message="提示"
              description="点击右下角按钮前往设备管理页，查看完整校准历史和失败批次记录。"
              style={{ marginTop: 16 }}
            />
          </div>
        )}
      </Modal>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  )
}

export default Dashboard
