import { useState, useEffect } from 'react'
import {
  Card,
  Table,
  Select,
  Button,
  Modal,
  Form,
  message,
  Space,
  Tag,
  Popconfirm,
  Alert,
} from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import {
  getDutySchedule,
  createDutySchedule,
  deleteDutySchedule,
  getUpcomingHolidayPlants,
} from '../api/duty'
import { getPlants } from '../api/plants'
import { getEmployees } from '../api/employees'

const WEEK_DAYS = [
  { key: 1, label: '周一' },
  { key: 2, label: '周二' },
  { key: 3, label: '周三' },
  { key: 4, label: '周四' },
  { key: 5, label: '周五' },
  { key: 6, label: '周六' },
  { key: 7, label: '周日' },
]

function Duty() {
  const [loading, setLoading] = useState(false)
  const [plants, setPlants] = useState([])
  const [employees, setEmployees] = useState([])
  const [dutyData, setDutyData] = useState([])
  const [holidayData, setHolidayData] = useState(null)
  const [selectedGroup, setSelectedGroup] = useState()
  const [selectedPlant, setSelectedPlant] = useState()
  const [modalVisible, setModalVisible] = useState(false)
  const [form] = Form.useForm()
  const [currentCell, setCurrentCell] = useState(null)

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

  const fetchDutySchedule = async () => {
    setLoading(true)
    try {
      const params = {}
      if (selectedPlant) params.plantId = selectedPlant
      const res = await getDutySchedule(params)
      if (res.code === 0) {
        setDutyData(res.data || [])
      } else {
        message.error(res.message || '获取轮值表失败')
      }
    } catch (error) {
      message.error('获取轮值表失败')
      console.error('获取轮值表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchHolidayPlants = async () => {
    try {
      const res = await getUpcomingHolidayPlants()
      if (res.code === 0) {
        setHolidayData(res.data || null)
      }
    } catch (error) {
      console.error('获取节假日植物提醒失败:', error)
    }
  }

  useEffect(() => {
    fetchPlants()
    fetchEmployees()
    fetchHolidayPlants()
  }, [])

  useEffect(() => {
    fetchDutySchedule()
  }, [selectedPlant])

  const getDutyEmployee = (plantId, weekday) => {
    const duty = dutyData.find(
      (d) => d.plantId === plantId && d.weekday === weekday
    )
    return duty || null
  }

  const handleCellClick = (plantId, weekday) => {
    const duty = getDutyEmployee(plantId, weekday)
    setCurrentCell({ plantId, weekday, duty })
    form.setFieldsValue({
      plantId: plantId,
      weekday: weekday,
      employeeId: duty ? duty.employeeId : undefined,
    })
    setModalVisible(true)
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      if (currentCell?.duty) {
        await deleteDutySchedule(currentCell.duty.id)
      }
      const res = await createDutySchedule(values)
      if (res.code === 0) {
        message.success('设置成功')
        setModalVisible(false)
        fetchDutySchedule()
      } else {
        message.error(res.message || '设置失败')
      }
    } catch (error) {
      if (error.errorFields) return
      message.error('设置失败')
      console.error('设置轮值失败:', error)
    }
  }

  const handleDelete = async (id) => {
    try {
      const res = await deleteDutySchedule(id)
      if (res.code === 0) {
        message.success('删除成功')
        fetchDutySchedule()
      } else {
        message.error(res.message || '删除失败')
      }
    } catch (error) {
      message.error('删除失败')
      console.error('删除轮值失败:', error)
    }
  }

  const groups = [...new Set(plants.map((p) => p.groupName).filter(Boolean))]

  const filteredPlants = selectedGroup
    ? plants.filter((p) => p.groupName === selectedGroup)
    : plants

  const tableData = selectedPlant
    ? filteredPlants.filter((p) => p.id === selectedPlant)
    : filteredPlants

  const columns = [
    {
      title: '植物',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      fixed: 'left',
      render: (text, record) => (
        <Space>
          <span>{text}</span>
          {record.groupName && <Tag color="blue">{record.groupName}</Tag>}
        </Space>
      ),
    },
    ...WEEK_DAYS.map((day) => ({
      title: day.label,
      dataIndex: `day_${day.key}`,
      key: `day_${day.key}`,
      render: (_, record) => {
        const duty = getDutyEmployee(record.id, day.key)
        return (
          <div
            style={{
              minHeight: 50,
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '6px',
              background: duty ? '#e6f7ff' : '#fafafa',
              border: duty ? '1px solid #91d5ff' : '1px dashed #d9d9d9',
              transition: 'all 0.3s',
            }}
            onClick={() => handleCellClick(record.id, day.key)}
          >
            {duty ? (
              <Space direction="vertical" size={4} style={{ width: '100%' }}>
                <span style={{ color: '#1890ff' }}>{duty.employeeName}</span>
                <Popconfirm
                  title="确定删除该轮值安排?"
                  onConfirm={(e) => {
                    e.stopPropagation()
                    handleDelete(duty.id)
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    style={{ padding: 0, height: 'auto', fontSize: 12 }}
                  >
                    删除
                  </Button>
                </Popconfirm>
              </Space>
            ) : (
              <PlusOutlined style={{ color: '#bfbfbf', fontSize: 16 }} />
            )}
          </div>
        )
      },
    })),
  ]

  return (
    <div style={{ padding: 24 }}>
      {holidayData?.plants && holidayData.plants.length > 0 && (
        <Alert
          message="节假日前植物提醒"
          description={
            <div>
              <p style={{ marginBottom: 8 }}>
                即将到来的节假日：
                <strong>
                  {dayjs(holidayData.holiday?.date).format('YYYY-MM-DD')}{' '}
                  {holidayData.holiday?.name}
                </strong>
              </p>
              <p>需要提前处理的植物：</p>
              <Space wrap>
                {holidayData.plants.map((item) => (
                  <Tag key={item.id} color="orange">
                    {item.name}
                  </Tag>
                ))}
              </Space>
            </div>
          }
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Card
        title="轮值表"
        extra={
          <Space>
            <Select
              placeholder="按小组筛选"
              style={{ width: 160 }}
              allowClear
              value={selectedGroup}
              onChange={(value) => setSelectedGroup(value)}
              options={groups.map((g) => ({ label: g, value: g }))}
            />
            <Select
              placeholder="按植物筛选"
              style={{ width: 160 }}
              allowClear
              value={selectedPlant}
              onChange={(value) => setSelectedPlant(value)}
              showSearch
              optionFilterProp="label"
              options={plants.map((p) => ({ label: p.name, value: p.id }))}
            />
          </Space>
        }
      >
        <Table
          loading={loading}
          columns={columns}
          dataSource={tableData}
          rowKey="id"
          pagination={false}
          scroll={{ x: 900 }}
        />
      </Card>

      <Modal
        title={currentCell?.duty ? '修改轮值' : '新增轮值'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
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
            label="员工"
            name="employeeId"
            rules={[{ required: true, message: '请选择员工' }]}
          >
            <Select
              placeholder="请选择员工"
              showSearch
              optionFilterProp="label"
              options={employees.map((e) => ({
                label: e.name,
                value: e.id,
              }))}
            />
          </Form.Item>
          <Form.Item
            label="星期几"
            name="weekday"
            rules={[{ required: true, message: '请选择星期几' }]}
          >
            <Select
              placeholder="请选择星期几"
              options={WEEK_DAYS.map((d) => ({
                label: d.label,
                value: d.key,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Duty
