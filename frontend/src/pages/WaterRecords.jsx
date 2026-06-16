import { useState, useEffect } from 'react'
import {
  Card,
  Select,
  DatePicker,
  Table,
  Button,
  Modal,
  Tag,
  message,
  Space,
  Form,
} from 'antd'
import dayjs from 'dayjs'
import { getWaterRecords, createWaterRecord } from '@/api/waterRecords'
import { getPlants } from '@/api/plants'
import { getEmployees } from '@/api/employees'
import WaterRecordForm from '@/components/WaterRecordForm'

const { RangePicker } = DatePicker
const { Option } = Select

const soilMoistureMap = {
  dry: { text: '干', color: 'orange' },
  medium: { text: '适中', color: 'green' },
  wet: { text: '湿', color: 'blue' },
}

const leafStatusMap = {
  good: { text: '良好', color: 'green' },
  yellowing: { text: '发黄', color: 'gold' },
  wilting: { text: '萎蔫', color: 'orange' },
  damaged: { text: '受损', color: 'red' },
}

function WaterRecords() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [records, setRecords] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [plants, setPlants] = useState([])
  const [employees, setEmployees] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)

  const fetchPlants = async () => {
    try {
      const res = await getPlants({ pageSize: 1000 })
      if (res.code === 0) {
        setPlants(res.data.list || res.data || [])
      }
    } catch (error) {
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
      console.error('获取员工列表失败:', error)
    }
  }

  const fetchRecords = async () => {
    try {
      setLoading(true)
      const values = form.getFieldsValue()
      const params = {
        page,
        pageSize,
      }
      if (values.plantId) {
        params.plantId = values.plantId
      }
      if (values.employeeId) {
        params.employeeId = values.employeeId
      }
      if (values.dateRange && values.dateRange.length === 2) {
        params.startDate = values.dateRange[0].format('YYYY-MM-DD')
        params.endDate = values.dateRange[1].format('YYYY-MM-DD')
      }
      const res = await getWaterRecords(params)
      if (res.code === 0) {
        const data = res.data.list || res.data || []
        setRecords(data)
        setTotal(res.data.total || data.length)
      }
    } catch (error) {
      message.error('获取浇水记录失败')
      console.error('获取浇水记录失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPage(1)
    fetchRecords()
  }

  const handleReset = () => {
    form.resetFields()
    setPage(1)
    setTimeout(fetchRecords, 0)
  }

  const handleAdd = () => {
    setModalVisible(true)
  }

  const handleModalCancel = () => {
    setModalVisible(false)
  }

  const handleFormSubmit = async (values) => {
    try {
      setSubmitLoading(true)
      const res = await createWaterRecord(values)
      if (res.code === 0) {
        message.success('新增浇水记录成功')
        setModalVisible(false)
        fetchRecords()
      } else {
        message.error(res.message || '新增失败')
      }
    } catch (error) {
      message.error('新增失败')
      console.error('新增浇水记录失败:', error)
    } finally {
      setSubmitLoading(false)
    }
  }

  const handlePageChange = (page, pageSize) => {
    setPage(page)
    setPageSize(pageSize)
  }

  const columns = [
    {
      title: '记录日期',
      dataIndex: 'recordDate',
      key: 'recordDate',
      width: 120,
      render: (date) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: '植物名称',
      dataIndex: 'plantName',
      key: 'plantName',
    },
    {
      title: '操作员工',
      dataIndex: 'employeeName',
      key: 'employeeName',
    },
    {
      title: '土壤干湿',
      dataIndex: 'soilMoisture',
      key: 'soilMoisture',
      render: (value) => {
        const info = soilMoistureMap[value] || { text: value, color: 'default' }
        return <Tag color={info.color}>{info.text}</Tag>
      },
    },
    {
      title: '叶片状态',
      dataIndex: 'leafStatus',
      key: 'leafStatus',
      render: (value) => {
        const info = leafStatusMap[value] || { text: value, color: 'default' }
        return <Tag color={info.color}>{info.text}</Tag>
      },
    },
    {
      title: '浇水量(ml)',
      dataIndex: 'waterAmount',
      key: 'waterAmount',
      width: 100,
      render: (value) => (value !== null && value !== undefined ? value : '-'),
    },
    {
      title: '是否转盆',
      dataIndex: 'rotated',
      key: 'rotated',
      width: 100,
      render: (value) => (value ? '是' : '否'),
    },
    {
      title: '是否跳过',
      dataIndex: 'skipped',
      key: 'skipped',
      width: 100,
      render: (value) => (value ? <Tag color="warning">是</Tag> : '否'),
    },
    {
      title: '跳过原因',
      dataIndex: 'skipReason',
      key: 'skipReason',
      render: (value) => value || '-',
    },
    {
      title: '备注',
      dataIndex: 'notes',
      key: 'notes',
      render: (value) => value || '-',
    },
  ]

  useEffect(() => {
    fetchPlants()
    fetchEmployees()
  }, [])

  useEffect(() => {
    fetchRecords()
  }, [page, pageSize])

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Form form={form} layout="inline">
          <Form.Item label="植物" name="plantId">
            <Select
              placeholder="请选择植物"
              allowClear
              style={{ width: 200 }}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
              }
            >
              {plants.map((plant) => (
                <Option key={plant.id} value={plant.id}>
                  {plant.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="日期范围" name="dateRange">
            <RangePicker />
          </Form.Item>
          <Form.Item label="员工" name="employeeId">
            <Select
              placeholder="请选择员工"
              allowClear
              style={{ width: 200 }}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
              }
            >
              {employees.map((emp) => (
                <Option key={emp.id} value={emp.id}>
                  {emp.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" onClick={handleSearch}>
                查询
              </Button>
              <Button onClick={handleReset}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card
        title="浇水记录"
        extra={
          <Button type="primary" onClick={handleAdd}>
            新增记录
          </Button>
        }
      >
        <Table
          rowKey="id"
          columns={columns}
          dataSource={records}
          loading={loading}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
            onChange: handlePageChange,
          }}
        />
      </Card>

      <Modal
        title="新增浇水记录"
        open={modalVisible}
        onCancel={handleModalCancel}
        footer={null}
        width={600}
        destroyOnClose
      >
        <WaterRecordForm
          onFinish={handleFormSubmit}
          onCancel={handleModalCancel}
          loading={submitLoading}
        />
      </Modal>
    </div>
  )
}

export default WaterRecords
