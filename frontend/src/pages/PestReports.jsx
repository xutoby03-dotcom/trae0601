import { useState, useEffect } from 'react'
import {
  Card,
  Table,
  Select,
  Button,
  Modal,
  Form,
  Input,
  message,
  Space,
  Tag,
  Popconfirm,
  Upload,
  Image,
  Radio,
  DatePicker,
} from 'antd'
import {
  PlusOutlined,
  EyeOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  PictureOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import {
  getPestReports,
  getPestReport,
  createPestReport,
  resolvePestReport,
  deletePestReport,
} from '../api/pestReports'
import { getPlants } from '../api/plants'
import { getEmployees } from '../api/employees'

const { TextArea } = Input

const SEVERITY_MAP = {
  low: { label: '轻微', color: 'green' },
  medium: { label: '中等', color: 'orange' },
  high: { label: '严重', color: 'red' },
}

function PhotoThumb({ src }) {
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    setFailed(false)
  }, [src])
  if (!src) return <span style={{ color: '#bfbfbf' }}>无</span>
  if (failed) {
    return (
      <div
        style={{
          width: 60,
          height: 40,
          borderRadius: 4,
          background: '#f5f5f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        <PictureOutlined style={{ color: '#d9d9d9', fontSize: 14 }} />
        <span style={{ color: '#bfbfbf', fontSize: 10, marginTop: 2 }}>不可用</span>
      </div>
    )
  }
  return (
    <Image
      width={60}
      height={40}
      src={src}
      style={{ objectFit: 'cover', borderRadius: 4 }}
      onError={() => setFailed(true)}
      preview={false}
    />
  )
}

function PhotoDetail({ src }) {
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    setFailed(false)
  }, [src])
  if (!src) return null
  if (failed) {
    return (
      <div
        style={{
          padding: '32px 0',
          textAlign: 'center',
          background: '#fafafa',
          borderRadius: 8,
          border: '1px dashed #e8e8e8',
        }}
      >
        <PictureOutlined style={{ fontSize: 40, color: '#d9d9d9' }} />
        <div style={{ color: '#bfbfbf', marginTop: 8 }}>照片不可用，文件可能已被删除</div>
      </div>
    )
  }
  return <Image src={src} style={{ maxWidth: '100%' }} onError={() => setFailed(true)} />
}

function PestReports() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [plants, setPlants] = useState([])
  const [employees, setEmployees] = useState([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [filters, setFilters] = useState({
    plantId: undefined,
    resolved: undefined,
    severity: undefined,
  })
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [detailData, setDetailData] = useState(null)
  const [createForm] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)
  const [resolveModalVisible, setResolveModalVisible] = useState(false)
  const [resolveForm] = Form.useForm()
  const [currentRecord, setCurrentRecord] = useState(null)

  const fetchPlants = async () => {
    try {
      const res = await getPlants({ pageSize: 1000 })
      if (res.code === 0) {
        setPlants(res.data.list || res.data || [])
      }
    } catch (error) {
      message.error('获取植物列表失败')
      console.error('获取植物列表失败:', error)
    }
  }

  const fetchEmployees = async () => {
    try {
      const res = await getEmployees({ pageSize: 1000 })
      if (res.code === 0) {
        setEmployees(res.data.list || res.data || [])
      }
    } catch (error) {
      message.error('获取员工列表失败')
      console.error('获取员工列表失败:', error)
    }
  }

  const fetchPestReports = async (page = 1, pageSize = 10) => {
    setLoading(true)
    try {
      const params = {
        page,
        pageSize,
      }
      if (filters.plantId) params.plantId = filters.plantId
      if (filters.resolved !== undefined) params.resolved = filters.resolved
      if (filters.severity) params.severity = filters.severity
      const res = await getPestReports(params)
      if (res.code === 0) {
        setData(res.data?.list || res.data || [])
        setPagination({
          current: page,
          pageSize,
          total: res.data?.total || (res.data || []).length,
        })
      } else {
        message.error(res.message || '获取上报记录失败')
      }
    } catch (error) {
      message.error('获取上报记录失败')
      console.error('获取上报记录失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlants()
    fetchEmployees()
  }, [])

  useEffect(() => {
    fetchPestReports(pagination.current, pagination.pageSize)
  }, [filters])

  const handleTableChange = (pag) => {
    fetchPestReports(pag.current, pag.pageSize)
  }

  const handleViewDetail = async (record) => {
    try {
      const res = await getPestReport(record.id)
      if (res.code === 0) {
        setDetailData(res.data)
        setDetailModalVisible(true)
      } else {
        message.error(res.message || '获取详情失败')
      }
    } catch (error) {
      message.error('获取详情失败')
      console.error('获取详情失败:', error)
    }
  }

  const handleCreateSubmit = async () => {
    try {
      const values = await createForm.validateFields()
      setSubmitting(true)

      const formData = new FormData()
      formData.append('plant_id', values.plantId)
      formData.append('employee_id', values.employeeId)
      formData.append('description', values.description)
      formData.append('severity', values.severity)
      formData.append('report_date', values.reportDate.format('YYYY-MM-DD'))

      if (values.photo && values.photo.fileList && values.photo.fileList.length > 0) {
        const file = values.photo.fileList[0]
        if (file.originFileObj) {
          formData.append('photo', file.originFileObj)
        }
      }

      const res = await createPestReport(formData)
      if (res.code === 0) {
        message.success('上报成功')
        setCreateModalVisible(false)
        createForm.resetFields()
        fetchPestReports(pagination.current, pagination.pageSize)
      } else {
        message.error(res.message || '上报失败')
      }
    } catch (error) {
      if (error.errorFields) return
      message.error('上报失败')
      console.error('上报失败:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleResolve = (record) => {
    setCurrentRecord(record)
    resolveForm.resetFields()
    setResolveModalVisible(true)
  }

  const handleResolveSubmit = async () => {
    try {
      const values = await resolveForm.validateFields()
      const res = await resolvePestReport(currentRecord.id, values.resolvedNotes)
      if (res.code === 0) {
        message.success('标记解决成功')
        setResolveModalVisible(false)
        fetchPestReports(pagination.current, pagination.pageSize)
      } else {
        message.error(res.message || '操作失败')
      }
    } catch (error) {
      if (error.errorFields) return
      message.error('操作失败')
      console.error('标记解决失败:', error)
    }
  }

  const handleDelete = async (id) => {
    try {
      const res = await deletePestReport(id)
      if (res.code === 0) {
        message.success('删除成功')
        fetchPestReports(pagination.current, pagination.pageSize)
      } else {
        message.error(res.message || '删除失败')
      }
    } catch (error) {
      message.error('删除失败')
      console.error('删除失败:', error)
    }
  }

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>上传</div>
    </div>
  )

  const normFile = (e) => {
    if (Array.isArray(e)) return e
    return e?.fileList
  }

  const getStatusText = (resolved) => {
    return resolved
      ? { label: '已解决', color: 'green' }
      : { label: '未解决', color: 'red' }
  }

  const columns = [
    {
      title: '上报日期',
      dataIndex: 'reportDate',
      key: 'reportDate',
      render: (text) => dayjs(text).format('YYYY-MM-DD'),
    },
    {
      title: '植物名称',
      dataIndex: 'plantName',
      key: 'plantName',
    },
    {
      title: '上报人',
      dataIndex: 'employeeName',
      key: 'employeeName',
    },
    {
      title: '问题描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '严重程度',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity) => {
        const info = SEVERITY_MAP[severity] || { label: severity, color: 'default' }
        return <Tag color={info.color}>{info.label}</Tag>
      },
    },
    {
      title: '照片',
      dataIndex: 'photoUrl',
      key: 'photoUrl',
      render: (photoUrl) => <PhotoThumb src={photoUrl} />,
    },
    {
      title: '状态',
      dataIndex: 'resolved',
      key: 'resolved',
      render: (resolved) => {
        const info = getStatusText(resolved)
        return <Tag color={info.color}>{info.label}</Tag>
      },
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            查看
          </Button>
          {!record.resolved && (
            <Button
              type="text"
              size="small"
              icon={<CheckCircleOutlined />}
              style={{ color: '#52c41a' }}
              onClick={() => handleResolve(record)}
            >
              标记解决
            </Button>
          )}
          <Popconfirm
            title="确定删除该上报记录?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="text" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div style={{ padding: 24 }}>
      <Card
        title="病虫害上报"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              createForm.resetFields()
              createForm.setFieldsValue({
                reportDate: dayjs(),
                severity: 'medium',
              })
              setCreateModalVisible(true)
            }}
          >
            新增上报
          </Button>
        }
      >
        <Space style={{ marginBottom: 16 }} wrap>
          <span>筛选：</span>
          <Select
            placeholder="植物"
            style={{ width: 160 }}
            allowClear
            value={filters.plantId}
            onChange={(value) => setFilters({ ...filters, plantId: value })}
            showSearch
            optionFilterProp="label"
            options={plants.map((p) => ({ label: p.name, value: p.id }))}
          />
          <Select
            placeholder="状态"
            style={{ width: 140 }}
            allowClear
            value={filters.resolved}
            onChange={(value) => setFilters({ ...filters, resolved: value })}
            options={[
              { label: '未解决', value: 0 },
              { label: '已解决', value: 1 },
            ]}
          />
          <Select
            placeholder="严重程度"
            style={{ width: 140 }}
            allowClear
            value={filters.severity}
            onChange={(value) => setFilters({ ...filters, severity: value })}
            options={Object.entries(SEVERITY_MAP).map(([key, val]) => ({
              label: val.label,
              value: key,
            }))}
          />
        </Space>

        <Table
          loading={loading}
          columns={columns}
          dataSource={data}
          rowKey="id"
          pagination={pagination}
          onChange={handleTableChange}
        />
      </Card>

      <Modal
        title="新增上报"
        open={createModalVisible}
        onOk={handleCreateSubmit}
        onCancel={() => setCreateModalVisible(false)}
        confirmLoading={submitting}
        destroyOnClose
        width={600}
      >
        <Form form={createForm} layout="vertical" initialValues={{ severity: 'medium' }}>
          <Form.Item
            label="植物"
            name="plantId"
            rules={[{ required: true, message: '请选择植物' }]}
          >
            <Select
              placeholder="请选择植物"
              showSearch
              optionFilterProp="label"
              options={plants.map((p) => ({ label: p.name, value: p.id }))}
            />
          </Form.Item>
          <Form.Item
            label="上报人"
            name="employeeId"
            rules={[{ required: true, message: '请选择上报人' }]}
          >
            <Select
              placeholder="请选择上报人"
              showSearch
              optionFilterProp="label"
              options={employees.map((e) => ({ label: e.name, value: e.id }))}
            />
          </Form.Item>
          <Form.Item
            label="问题描述"
            name="description"
            rules={[{ required: true, message: '请输入问题描述' }]}
          >
            <TextArea rows={4} placeholder="请描述病虫害情况" />
          </Form.Item>
          <Form.Item
            label="严重程度"
            name="severity"
            rules={[{ required: true, message: '请选择严重程度' }]}
          >
            <Radio.Group>
              <Radio value="low">
                <Tag color="green">轻微</Tag>
              </Radio>
              <Radio value="medium">
                <Tag color="orange">中等</Tag>
              </Radio>
              <Radio value="high">
                <Tag color="red">严重</Tag>
              </Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            label="照片"
            name="photo"
            valuePropName="fileList"
            getValueFromEvent={normFile}
          >
            <Upload
              listType="picture-card"
              beforeUpload={() => false}
              accept="image/*"
              maxCount={1}
            >
              {uploadButton}
            </Upload>
          </Form.Item>
          <Form.Item
            label="上报日期"
            name="reportDate"
            rules={[{ required: true, message: '请选择上报日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="上报详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={600}
      >
        {detailData && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ color: '#888', marginBottom: 4 }}>上报日期</div>
              <div>{dayjs(detailData.reportDate).format('YYYY-MM-DD')}</div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ color: '#888', marginBottom: 4 }}>植物名称</div>
              <div>{detailData.plantName}</div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ color: '#888', marginBottom: 4 }}>上报人</div>
              <div>{detailData.employeeName}</div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ color: '#888', marginBottom: 4 }}>严重程度</div>
              <Tag color={SEVERITY_MAP[detailData.severity]?.color || 'default'}>
                {SEVERITY_MAP[detailData.severity]?.label || detailData.severity}
              </Tag>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ color: '#888', marginBottom: 4 }}>状态</div>
              <Tag color={getStatusText(detailData.resolved).color}>
                {getStatusText(detailData.resolved).label}
              </Tag>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ color: '#888', marginBottom: 4 }}>问题描述</div>
              <div style={{ whiteSpace: 'pre-wrap' }}>{detailData.description}</div>
            </div>
            {detailData.photoUrl && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ color: '#888', marginBottom: 4 }}>照片</div>
                <PhotoDetail src={detailData.photoUrl} />
              </div>
            )}
            {detailData.resolvedNotes && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ color: '#888', marginBottom: 4 }}>解决说明</div>
                <div style={{ whiteSpace: 'pre-wrap' }}>{detailData.resolvedNotes}</div>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        title="标记解决"
        open={resolveModalVisible}
        onOk={handleResolveSubmit}
        onCancel={() => setResolveModalVisible(false)}
        destroyOnClose
      >
        <Form form={resolveForm} layout="vertical">
          <Form.Item label="解决说明" name="resolvedNotes">
            <TextArea rows={4} placeholder="请输入解决说明（可选）" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default PestReports
