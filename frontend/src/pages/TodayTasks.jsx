import { useState, useEffect } from 'react'
import {
  Card,
  Row,
  Col,
  Statistic,
  Select,
  Table,
  Tag,
  Button,
  Modal,
  Alert,
  message,
  Space,
} from 'antd'
import dayjs from 'dayjs'
import { getTodayTasks } from '@/api/duty'
import { getEmployees } from '@/api/employees'
import { getHolidays } from '@/api/holidays'
import { createWaterRecord } from '@/api/waterRecords'
import WaterRecordForm from '@/components/WaterRecordForm'

const { Option } = Select

const statusMap = {
  pending: { text: '待完成', color: 'default' },
  completed: { text: '已完成', color: 'success' },
  skipped: { text: '已跳过', color: 'warning' },
}

function TodayTasks() {
  const [loading, setLoading] = useState(false)
  const [tasks, setTasks] = useState([])
  const [total, setTotal] = useState(0)
  const [completedCount, setCompletedCount] = useState(0)
  const [employeeId, setEmployeeId] = useState()
  const [employees, setEmployees] = useState([])
  const [isHoliday, setIsHoliday] = useState(false)
  const [holidayName, setHolidayName] = useState('')
  const [modalVisible, setModalVisible] = useState(false)
  const [currentTask, setCurrentTask] = useState(null)
  const [submitLoading, setSubmitLoading] = useState(false)

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

  const checkHoliday = async () => {
    try {
      const today = dayjs().format('YYYY-MM-DD')
      const res = await getHolidays()
      if (res.code === 0) {
        const list = res.data.list || res.data || []
        const holiday = list.find((h) => dayjs(h.date).format('YYYY-MM-DD') === today)
        if (holiday) {
          setIsHoliday(true)
          setHolidayName(holiday.name || '')
        }
      }
    } catch (error) {
      console.error('获取节假日信息失败:', error)
    }
  }

  const getTaskStatus = (task) => {
    if (!task.isCompleted) return 'pending'
    if (task.waterRecord?.skipped) return 'skipped'
    return 'completed'
  }

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const res = await getTodayTasks()
      if (res.code === 0) {
        let data = res.data.list || res.data || []
        if (employeeId) {
          data = data.filter((t) => t.employeeId === employeeId)
        }
        setTasks(data)
        setTotal(data.length)
        const completed = data.filter(
          (t) => getTaskStatus(t) === 'completed' || getTaskStatus(t) === 'skipped'
        ).length
        setCompletedCount(completed)
      }
    } catch (error) {
      message.error('获取今日任务失败')
      console.error('获取今日任务失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleWater = (task) => {
    setCurrentTask(task)
    setModalVisible(true)
  }

  const handleModalCancel = () => {
    setModalVisible(false)
    setCurrentTask(null)
  }

  const handleFormSubmit = async (values) => {
    try {
      setSubmitLoading(true)
      const res = await createWaterRecord(values)
      if (res.code === 0) {
        message.success('浇水记录提交成功')
        setModalVisible(false)
        setCurrentTask(null)
        fetchTasks()
      } else {
        message.error(res.message || '提交失败')
      }
    } catch (error) {
      message.error('提交失败')
      console.error('提交浇水记录失败:', error)
    } finally {
      setSubmitLoading(false)
    }
  }

  const getInitialValues = () => {
    if (!currentTask) return {}
    return {
      plantId: currentTask.plantId,
      employeeId: currentTask.employeeId,
      recordDate: dayjs(),
    }
  }

  const completionRate = total > 0 ? ((completedCount / total) * 100).toFixed(1) : 0

  const columns = [
    {
      title: '植物名称',
      dataIndex: 'plantName',
      key: 'plantName',
    },
    {
      title: '位置',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: '负责员工',
      dataIndex: 'employeeName',
      key: 'employeeName',
      render: (text, record) => {
        return (
          <Space direction="vertical" size={0}>
            <span>{record.employeeName || '-'}</span>
            {record.hasSubstitute && (
              <Tag color="orange" style={{ margin: 0 }}>
                替班 (原: {record.originalEmployeeName})
              </Tag>
            )}
          </Space>
        )
      },
    },
    {
      title: '状态',
      key: 'status',
      render: (_, record) => {
        const status = getTaskStatus(record)
        const info = statusMap[status] || { text: status, color: 'default' }
        return <Tag color={info.color}>{info.text}</Tag>
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          onClick={() => handleWater(record)}
          disabled={record.isCompleted}
        >
          去浇水
        </Button>
      ),
    },
  ]

  useEffect(() => {
    fetchEmployees()
    checkHoliday()
  }, [])

  useEffect(() => {
    fetchTasks()
  }, [employeeId])

  return (
    <div>
      {isHoliday && (
        <Alert
          type="warning"
          showIcon
          message={`今天是节假日${holidayName ? `：${holidayName}` : ''}，请合理安排工作`}
          style={{ marginBottom: 16 }}
        />
      )}

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic title="今日日期" value={dayjs().format('YYYY年MM月DD日')} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="任务总数" value={total} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="已完成数" value={completedCount} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="完成率" value={completionRate} suffix="%" />
          </Card>
        </Col>
      </Row>

      <Card
        title="今日任务"
        extra={
          <Select
            placeholder="筛选员工"
            allowClear
            style={{ width: 200 }}
            value={employeeId}
            onChange={setEmployeeId}
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
        }
      >
        <Table
          rowKey="id"
          columns={columns}
          dataSource={tasks}
          loading={loading}
          pagination={false}
        />
      </Card>

      <Modal
        title="浇水记录"
        open={modalVisible}
        onCancel={handleModalCancel}
        footer={null}
        width={600}
        destroyOnClose
      >
        <WaterRecordForm
          initialValues={getInitialValues()}
          onFinish={handleFormSubmit}
          onCancel={handleModalCancel}
          loading={submitLoading}
        />
      </Modal>
    </div>
  )
}

export default TodayTasks
