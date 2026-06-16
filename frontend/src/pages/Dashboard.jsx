import { useState, useEffect } from 'react'
import {
  Card,
  Row,
  Col,
  Statistic,
  Tabs,
  Table,
  Tag,
  Spin,
  Empty,
  message,
} from 'antd'
import ReactECharts from 'echarts-for-react'
import dayjs from 'dayjs'
import {
  getSummary,
  getWaterRisk,
  getCompletionRate,
  getWorstCorners,
  getWeeklyStats,
} from '../api/dashboard'

const statusMap = {
  healthy: { text: '健康', color: '#52c41a' },
  warning: { text: '注意', color: '#faad14' },
  sick: { text: '生病', color: '#f5222d' },
  dead: { text: '死亡', color: '#bfbfbf' },
}

function Dashboard() {
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState(null)
  const [waterRisk, setWaterRisk] = useState({ waterRisk: [], overwatered: [] })
  const [completionRate, setCompletionRate] = useState([])
  const [worstCorners, setWorstCorners] = useState([])
  const [weeklyStats, setWeeklyStats] = useState([])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [
        summaryRes,
        waterRiskRes,
        completionRes,
        cornersRes,
        weeklyRes,
      ] = await Promise.all([
        getSummary(),
        getWaterRisk(),
        getCompletionRate({ type: 'location' }),
        getWorstCorners(),
        getWeeklyStats(),
      ])

      if (summaryRes.code === 0) {
        setSummary(summaryRes.data)
      } else {
        message.error(summaryRes.message || '获取统计数据失败')
      }

      if (waterRiskRes.code === 0) {
        setWaterRisk(waterRiskRes.data || { waterRisk: [], overwatered: [] })
      } else {
        message.error(waterRiskRes.message || '获取风险数据失败')
      }

      if (completionRes.code === 0) {
        setCompletionRate(completionRes.data || [])
      } else {
        message.error(completionRes.message || '获取完成率数据失败')
      }

      if (cornersRes.code === 0) {
        setWorstCorners(cornersRes.data || [])
      } else {
        message.error(cornersRes.message || '获取角落数据失败')
      }

      if (weeklyRes.code === 0) {
        setWeeklyStats(weeklyRes.data || [])
      } else {
        message.error(weeklyRes.message || '获取周统计数据失败')
      }
    } catch (error) {
      console.error('获取看板数据失败:', error)
      message.error('获取看板数据失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const getStatusDistribution = () => {
    if (!summary?.statusDistribution) return []
    return Object.entries(summary.statusDistribution).map(([status, count]) => ({
      status,
      count,
    }))
  }

  const getPieOption = () => {
    const data = getStatusDistribution()
    return {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)',
      },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'center',
      },
      color: ['#52c41a', '#faad14', '#f5222d', '#bfbfbf'],
      series: [
        {
          name: '植物状态',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['35%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: false,
            position: 'center',
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 16,
              fontWeight: 'bold',
            },
          },
          labelLine: {
            show: false,
          },
          data: data.map((item) => ({
            value: item.count,
            name: statusMap[item.status]?.text || item.status,
          })),
        },
      ],
    }
  }

  const getBarOption = () => {
    const dates = weeklyStats.map((item) => item.date)
    const counts = weeklyStats.map((item) => item.completedCount || 0)
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: dates,
        axisLabel: {
          rotate: 30,
        },
      },
      yAxis: {
        type: 'value',
        name: '浇水次数',
      },
      series: [
        {
          name: '浇水次数',
          type: 'bar',
          data: counts,
          barWidth: '50%',
          itemStyle: {
            color: '#1890ff',
            borderRadius: [4, 4, 0, 0],
          },
        },
      ],
    }
  }

  const getHorizontalBarOption = () => {
    const locations = completionRate.map((item) => item.name || item.location).reverse()
    const rates = completionRate.map((item) => item.completionRate || item.rate || 0).reverse()
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: '{b}: {c}%',
      },
      grid: {
        left: '3%',
        right: '8%',
        bottom: '3%',
        top: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'value',
        max: 100,
        name: '完成率(%)',
      },
      yAxis: {
        type: 'category',
        data: locations,
      },
      series: [
        {
          name: '完成率',
          type: 'bar',
          data: rates,
          barWidth: '50%',
          itemStyle: {
            color: '#52c41a',
            borderRadius: [0, 4, 4, 0],
          },
          label: {
            show: true,
            position: 'right',
            formatter: '{c}%',
          },
        },
      ],
    }
  }

  const getWorstCornersOption = () => {
    const corners = worstCorners.slice(0, 10).reverse()
    const names = corners.map((item) => item.location)
    const rates = corners.map((item) => item.unhealthyRatio || item.unhealthyRate || 0)
    const colors = corners.map((item) => {
      const rate = item.unhealthyRatio || item.unhealthyRate || 0
      if (rate >= 50) return '#f5222d'
      if (rate >= 30) return '#faad14'
      return '#fa8c16'
    })
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: '{b}: {c}%',
      },
      grid: {
        left: '3%',
        right: '8%',
        bottom: '3%',
        top: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'value',
        max: 100,
        name: '不健康比例(%)',
      },
      yAxis: {
        type: 'category',
        data: names,
      },
      series: [
        {
          name: '不健康比例',
          type: 'bar',
          data: rates.map((value, index) => ({
            value,
            itemStyle: {
              color: colors[index],
              borderRadius: [0, 4, 4, 0],
            },
          })),
          barWidth: '60%',
          label: {
            show: true,
            position: 'right',
            formatter: '{c}%',
          },
        },
      ],
    }
  }

  const getRiskLevelTag = (level) => {
    const levelMap = {
      overdueHigh: { text: '高风险', color: 'red' },
      overdueLow: { text: '中风险', color: 'orange' },
      upcoming: { text: '即将到期', color: 'blue' },
      overwatered: { text: '过浇风险', color: 'cyan' },
    }
    const info = levelMap[level] || { text: level, color: 'default' }
    return <Tag color={info.color}>{info.text}</Tag>
  }

  const needWaterColumns = [
    {
      title: '植物名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '位置',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: '上次浇水',
      dataIndex: 'lastWateredAt',
      key: 'lastWateredAt',
      render: (value) =>
        value ? dayjs(value).format('YYYY-MM-DD') : '从未浇水',
    },
    {
      title: '间隔天数',
      dataIndex: 'waterIntervalDays',
      key: 'waterIntervalDays',
      render: (value) => `${value || 7} 天`,
    },
    {
      title: '距上次浇水',
      dataIndex: 'daysSinceWater',
      key: 'daysSinceWater',
      render: (value) => `${value || 0} 天`,
    },
    {
      title: '风险等级',
      dataIndex: 'riskLevel',
      key: 'riskLevel',
      render: (value) => getRiskLevelTag(value),
    },
  ]

  const overWaterColumns = [
    {
      title: '植物名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '位置',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: '上次浇水',
      dataIndex: 'lastWateredAt',
      key: 'lastWateredAt',
      render: (value) =>
        value ? dayjs(value).format('YYYY-MM-DD') : '-',
    },
    {
      title: '距上次浇水',
      dataIndex: 'daysSinceWater',
      key: 'daysSinceWater',
      render: (value) => `${value || 0} 天`,
    },
    {
      title: '风险等级',
      dataIndex: 'riskLevel',
      key: 'riskLevel',
      render: (value) => getRiskLevelTag(value),
    },
  ]

  const tabItems = [
    {
      key: 'needWater',
      label: '缺水风险',
      children: (
        <Table
          rowKey="id"
          columns={needWaterColumns}
          dataSource={waterRisk.waterRisk || []}
          pagination={false}
          locale={{ emptyText: <Empty description="暂无缺水风险植物" /> }}
        />
      ),
    },
    {
      key: 'overWater',
      label: '过浇风险',
      children: (
        <Table
          rowKey="id"
          columns={overWaterColumns}
          dataSource={waterRisk.overwatered || []}
          pagination={false}
          locale={{ emptyText: <Empty description="暂无过浇风险植物" /> }}
        />
      ),
    },
  ]

  return (
    <div>
      <Spin spinning={loading}>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="植物总数"
                value={summary?.totalPlants || 0}
                suffix="株"
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="健康植物数"
                value={summary?.statusDistribution?.healthy || 0}
                suffix="株"
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="今日待浇水"
                value={summary?.todayTasks || 0}
                suffix="株"
                valueStyle={{ color: '#1890ff' }}
              />
              <div style={{ color: '#999', fontSize: 12, marginTop: 4 }}>
                已完成 {summary?.completedTasks || 0} 株
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="完成率"
                value={summary?.completionRate || 0}
                suffix="%"
                valueStyle={{ color: '#fa8c16' }}
              />
              <div style={{ color: '#999', fontSize: 12, marginTop: 4 }}>
                今日浇水任务
              </div>
            </Card>
          </Col>
        </Row>

        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={12}>
            <Card title="植物状态分布">
              <ReactECharts
                option={getPieOption()}
                style={{ height: 300 }}
                notMerge={true}
                lazyUpdate={true}
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card title="近7天浇水统计">
              <ReactECharts
                option={getBarOption()}
                style={{ height: 300 }}
                notMerge={true}
                lazyUpdate={true}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={12}>
            <Card title="各区域完成率">
              <ReactECharts
                option={getHorizontalBarOption()}
                style={{ height: 300 }}
                notMerge={true}
                lazyUpdate={true}
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card title="状态最差角落排行">
              <ReactECharts
                option={getWorstCornersOption()}
                style={{ height: 300 }}
                notMerge={true}
                lazyUpdate={true}
              />
            </Card>
          </Col>
        </Row>

        <Card title="风险植物列表">
          <Tabs items={tabItems} />
        </Card>
      </Spin>
    </div>
  )
}

export default Dashboard
