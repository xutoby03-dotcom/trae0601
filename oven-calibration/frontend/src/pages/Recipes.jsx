import React, { useState, useEffect } from 'react'
import {
  Table,
  Card,
  Select,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Tag,
  Space,
  Popconfirm,
  message,
  Descriptions,
  Row,
  Col,
  Statistic,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { PhotoDetail, PhotoThumb } from '@/components'
import {
  getRecipes,
  getRecipe,
  createRecipe,
  updateRecipe,
  deleteRecipe,
} from '@/api/recipes'
import { getBatches } from '@/api/batches'
import { getOvens } from '@/api/ovens'
import { getCalibrations } from '@/api/calibration'
import { getEmployees } from '@/api/employees'

const { Option } = Select
const { TextArea } = Input

const statusMap = {
  active: { text: '正常', color: 'green' },
  maintenance: { text: '维护中', color: 'orange' },
  inactive: { text: '停用', color: 'red' },
}

const highlightFailureReason = (reason) => {
  if (!reason) return '-'
  const tempKeywords = ['温度', '度', '低', '高', '过热', '过冷', '预热']
  const hasTempKeyword = tempKeywords.some((keyword) => reason.includes(keyword))
  if (hasTempKeyword) {
    return (
      <span style={{ color: '#f5222d', fontWeight: 'bold' }}>{reason}</span>
    )
  }
  return reason
}

const Recipes = () => {
  const [recipes, setRecipes] = useState([])
  const [ovens, setOvens] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [ovenFilter, setOvenFilter] = useState(null)

  const [form] = Form.useForm()
  const [modalVisible, setModalVisible] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)

  const [detailVisible, setDetailVisible] = useState(false)
  const [detailData, setDetailData] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    fetchOvens()
  }, [])

  useEffect(() => {
    fetchRecipes()
  }, [pagination.current, pagination.pageSize, ovenFilter])

  const fetchOvens = async () => {
    try {
      const res = await getOvens({ pageSize: 100 })
      setOvens(res.list || [])
    } catch (err) {
      console.error('获取烤箱列表失败:', err)
    }
  }

  const fetchRecipes = async () => {
    setLoading(true)
    try {
      const params = {
        page: pagination.current,
        pageSize: pagination.pageSize,
      }
      if (ovenFilter) {
        params.recommendedOvenId = ovenFilter
      }
      const res = await getRecipes(params)
      setRecipes(res.list || [])
      setPagination((prev) => ({ ...prev, total: res.total || 0 }))
    } catch (err) {
      console.error('获取配方列表失败:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingRecord(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (record) => {
    setEditingRecord(record)
    form.setFieldsValue({
      name: record.name,
      recommendedOvenId: record.recommendedOvenId,
      recommendedLayer: record.recommendedLayer,
      tempCompensation: record.tempCompensation,
      description: record.description,
    })
    setModalVisible(true)
  }

  const handleDelete = async (id) => {
    try {
      await deleteRecipe(id)
      message.success('删除成功')
      fetchRecipes()
    } catch (err) {
      console.error('删除失败:', err)
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingRecord) {
        await updateRecipe(editingRecord.id, values)
        message.success('更新成功')
      } else {
        await createRecipe(values)
        message.success('创建成功')
      }
      setModalVisible(false)
      fetchRecipes()
    } catch (err) {
      console.error('提交失败:', err)
    }
  }

  const handleViewDetail = async (record) => {
    setDetailLoading(true)
    setDetailVisible(true)
    try {
      const [recipeRes, batchesRes] = await Promise.all([
        getRecipe(record.id),
        getBatches({ recipeId: record.id, pageSize: 1000 }),
      ])

      const allBatches = batchesRes.list || []
      const successCount = allBatches.filter((b) => b.result === 'success').length
      const failedCount = allBatches.filter((b) => b.result === 'failed').length
      const successRate = allBatches.length > 0
        ? ((successCount / allBatches.length) * 100).toFixed(1) + '%'
        : '0%'

      let lastDeviation = null
      if (recipeRes.oven) {
        try {
          const calibRes = await getCalibrations({ ovenId: recipeRes.oven.id, pageSize: 1 })
          if (calibRes.list?.length > 0) {
            lastDeviation = calibRes.list[0].deviation
          }
        } catch (e) {
          console.error('获取校准数据失败:', e)
        }
      }

      setDetailData({
        ...recipeRes,
        stats: {
          total: allBatches.length,
          success: successCount,
          failed: failedCount,
          successRate,
        },
        ovenWithDeviation: recipeRes.oven
          ? { ...recipeRes.oven, lastDeviation }
          : null,
      })
    } catch (err) {
      console.error('获取详情失败:', err)
    } finally {
      setDetailLoading(false)
    }
  }

  const columns = [
    {
      title: '产品名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '推荐烤箱',
      dataIndex: 'oven',
      key: 'oven',
      render: (oven) => oven?.model || '-',
    },
    {
      title: '推荐层位',
      dataIndex: 'recommendedLayer',
      key: 'recommendedLayer',
      render: (layer) => (layer !== null && layer !== undefined ? `第${layer}层` : '-'),
    },
    {
      title: '补偿温度',
      dataIndex: 'tempCompensation',
      key: 'tempCompensation',
      render: (temp) => {
        if (temp === null || temp === undefined) return '-'
        const sign = temp > 0 ? '+' : ''
        const color = temp > 0 ? '#f5222d' : temp < 0 ? '#1890ff' : '#52c41a'
        return <span style={{ color, fontWeight: 'bold' }}>{sign}{temp}°C</span>
      },
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text) => text || '-',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            详情
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个配方吗？"
            description="删除后无法恢复"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const batchColumns = [
    {
      title: '生产日期',
      dataIndex: 'producedAt',
      key: 'producedAt',
      render: (date) => date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: '使用烤箱',
      dataIndex: 'ovenModel',
      key: 'ovenModel',
      render: (model) => model || '-',
    },
    {
      title: '层位',
      dataIndex: 'layerUsed',
      key: 'layerUsed',
      render: (layer) => (layer !== null && layer !== undefined ? `第${layer}层` : '-'),
    },
    {
      title: '实际温度',
      dataIndex: 'actualTemp',
      key: 'actualTemp',
      render: (temp) => (temp !== null && temp !== undefined ? `${temp}°C` : '-'),
    },
    {
      title: '结果',
      dataIndex: 'result',
      key: 'result',
      render: (result) => (
        <Tag color={result === 'success' ? 'green' : 'red'}>
          {result === 'success' ? '成功' : '失败'}
        </Tag>
      ),
    },
    {
      title: '失败原因',
      dataIndex: 'failureReason',
      key: 'failureReason',
      render: highlightFailureReason,
    },
  ]

  const failedBatchesWithPhotos = detailData?.recentBatches?.filter(
    (b) => b.result === 'failed' && b.photoUrl
  ) || []

  return (
    <div>
      <Card
        title="产品配方管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增配方
          </Button>
        }
      >
        <div style={{ marginBottom: 16 }}>
          <Space>
            <span>按烤箱筛选：</span>
            <Select
              style={{ width: 200 }}
              placeholder="请选择烤箱"
              allowClear
              value={ovenFilter}
              onChange={(value) => {
                setOvenFilter(value)
                setPagination((prev) => ({ ...prev, current: 1 }))
              }}
            >
              {ovens.map((oven) => (
                <Option key={oven.id} value={oven.id}>
                  {oven.model} ({oven.serialNumber})
                </Option>
              ))}
            </Select>
          </Space>
        </div>

        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={recipes}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
            onChange: (page, pageSize) => {
              setPagination((prev) => ({ ...prev, current: page, pageSize }))
            },
          }}
        />
      </Card>

      <Modal
        title={editingRecord ? '编辑配方' : '新增配方'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText="确定"
        cancelText="取消"
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="配方名称"
            rules={[{ required: true, message: '请输入配方名称' }]}
          >
            <Input placeholder="请输入配方名称" />
          </Form.Item>
          <Form.Item
            name="recommendedOvenId"
            label="推荐烤箱"
          >
            <Select placeholder="请选择推荐烤箱" allowClear>
              {ovens.map((oven) => (
                <Option key={oven.id} value={oven.id}>
                  {oven.model} ({oven.serialNumber})
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="recommendedLayer"
            label="推荐层位"
          >
            <InputNumber
              min={1}
              placeholder="请输入推荐层位"
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item
            name="tempCompensation"
            label="补偿温度(°C)"
            rules={[{ required: true, message: '请输入补偿温度' }]}
          >
            <InputNumber
              placeholder="可正可负，单位：°C"
              style={{ width: '100%' }}
              formatter={(value) => (value === null || value === undefined ? '' : `${value}°C`)}
              parser={(value) => value ? Number(value.replace('°C', '')) : null}
            />
          </Form.Item>
          <Form.Item
            name="description"
            label="描述"
          >
            <TextArea rows={3} placeholder="请输入配方描述" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="配方详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={900}
      >
        {detailLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>加载中...</div>
        ) : detailData ? (
          <div>
            <Descriptions title="配方基本信息" bordered column={2} style={{ marginBottom: 24 }}>
              <Descriptions.Item label="配方名称">{detailData.name}</Descriptions.Item>
              <Descriptions.Item label="补偿温度">
                {detailData.tempCompensation !== null && detailData.tempCompensation !== undefined
                  ? `${detailData.tempCompensation > 0 ? '+' : ''}${detailData.tempCompensation}°C`
                  : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="推荐层位">
                {detailData.recommendedLayer
                  ? `第${detailData.recommendedLayer}层`
                  : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="描述">
                {detailData.description || '-'}
              </Descriptions.Item>
            </Descriptions>

            {detailData.ovenWithDeviation && (
              <Card
                title="推荐烤箱信息"
                size="small"
                style={{ marginBottom: 24 }}
              >
                <Descriptions bordered column={2} size="small">
                  <Descriptions.Item label="型号">
                    {detailData.ovenWithDeviation.model}
                  </Descriptions.Item>
                  <Descriptions.Item label="状态">
                    <Tag color={statusMap[detailData.ovenWithDeviation.status]?.color || 'default'}>
                      {statusMap[detailData.ovenWithDeviation.status]?.text || detailData.ovenWithDeviation.status}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="序列号">
                    {detailData.ovenWithDeviation.serialNumber}
                  </Descriptions.Item>
                  <Descriptions.Item label="最近偏差">
                    {detailData.ovenWithDeviation.lastDeviation !== null
                      ? (
                        <span style={{
                          color: detailData.ovenWithDeviation.lastDeviation > 0 ? '#f5222d'
                            : detailData.ovenWithDeviation.lastDeviation < 0 ? '#1890ff'
                            : '#52c41a',
                          fontWeight: 'bold',
                        }}>
                          {detailData.ovenWithDeviation.lastDeviation > 0 ? '+' : ''}
                          {detailData.ovenWithDeviation.lastDeviation}°C
                        </span>
                      )
                      : '-'}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            )}

            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={6}>
                <Card>
                  <Statistic title="总批次" value={detailData.stats.total} />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="成功数"
                    value={detailData.stats.success}
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="失败数"
                    value={detailData.stats.failed}
                    valueStyle={{ color: '#cf1322' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="成功率"
                    value={detailData.stats.successRate}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
            </Row>

            <Card
              title="最近20条批次记录"
              size="small"
              style={{ marginBottom: 24 }}
            >
              <Table
                rowKey="id"
                columns={batchColumns}
                dataSource={detailData.recentBatches || []}
                pagination={false}
                size="small"
              />
            </Card>

            {failedBatchesWithPhotos.length > 0 && (
              <Card title="失败批次照片" size="small">
                <Row gutter={[16, 16]}>
                  {failedBatchesWithPhotos.map((batch) => (
                    <Col key={batch.id} xs={12} sm={8} md={6}>
                      <div style={{ marginBottom: 8 }}>
                        <PhotoDetail
                          src={batch.photoUrl}
                          alt={`批次${batch.id}失败照片`}
                        />
                        <div style={{ fontSize: 12, color: '#666', marginTop: 4, textAlign: 'center' }}>
                          {dayjs(batch.producedAt).format('MM-DD HH:mm')}
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Card>
            )}
          </div>
        ) : null}
      </Modal>
    </div>
  )
}

export default Recipes
