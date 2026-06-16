import { useState, useEffect } from 'react'
import {
  Card,
  Table,
  Button,
  Form,
  Input,
  Select,
  Tag,
  Space,
  Modal,
  message,
  Popconfirm,
  Tabs,
  DatePicker,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import {
  getHolidays,
  createHoliday,
  deleteHoliday,
} from '../api/holidays'
import {
  getLeaveList,
  createLeave,
  updateLeave,
  deleteLeave,
  getAutoSubstitute,
} from '../api/leave'
import { getEmployees } from '../api/employees'

const { Option } = Select
const { RangePicker } = DatePicker

const statusMap = {
  pending: { text: '待审批', color: 'gold' },
  approved: { text: '已批准', color: 'green' },
  rejected: { text: '已拒绝', color: 'red' },
}

function Holidays() {
  const [activeTab, setActiveTab] = useState('holidays')

  const [holidayLoading, setHolidayLoading] = useState(false)
  const [holidayList, setHolidayList] = useState([])
  const [holidayPagination, setHolidayPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [holidayModalVisible, setHolidayModalVisible] = useState(false)
  const [holidayForm] = Form.useForm()

  const [leaveLoading, setLeaveLoading] = useState(false)
  const [leaveList, setLeaveList] = useState([])
  const [leavePagination, setLeavePagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [leaveModalVisible, setLeaveModalVisible] = useState(false)
  const [editingLeave, setEditingLeave] = useState(null)
  const [leaveForm] = Form.useForm()
  const [employees, setEmployees] = useState([])
  const [autoSubstituteLoading, setAutoSubstituteLoading] = useState(false)

  const fetchHolidays = async (page = 1, pageSize = 10) => {
    setHolidayLoading(true)
    try {
      const res = await getHolidays({ page, pageSize })
      if (res.code === 0) {
        setHolidayList(res.data.list || res.data || [])
        setHolidayPagination((prev) => ({
          ...prev,
          current: page,
          pageSize,
          total: res.data.total || 0,
        }))
      } else {
        message.error(res.message || '获取节假日列表失败')
      }
    } catch (err) {
      console.error('获取节假日列表失败:', err)
      message.error('获取节假日列表失败')
    } finally {
      setHolidayLoading(false)
    }
  }

  const fetchLeaveList = async (page = 1, pageSize = 10) => {
    setLeaveLoading(true)
    try {
      const res = await getLeaveList({ page, pageSize })
      if (res.code === 0) {
        setLeaveList(res.data.list || res.data || [])
        setLeavePagination((prev) => ({
          ...prev,
          current: page,
          pageSize,
          total: res.data.total || 0,
        }))
      } else {
        message.error(res.message || '获取请假记录失败')
      }
    } catch (err) {
      console.error('获取请假记录失败:', err)
      message.error('获取请假记录失败')
    } finally {
      setLeaveLoading(false)
    }
  }

  const fetchEmployees = async () => {
    try {
      const res = await getEmployees({ page: 1, pageSize: 100 })
      if (res.code === 0) {
        setEmployees(res.data.list || res.data || [])
      }
    } catch (err) {
      console.error('获取员工列表失败:', err)
    }
  }

  useEffect(() => {
    fetchHolidays()
    fetchLeaveList()
    fetchEmployees()
  }, [])

  const handleHolidayTableChange = (page) => {
    fetchHolidays(page.current, page.pageSize)
  }

  const handleLeaveTableChange = (page) => {
    fetchLeaveList(page.current, page.pageSize)
  }

  const handleAddHoliday = () => {
    holidayForm.resetFields()
    setHolidayModalVisible(true)
  }

  const handleHolidayModalOk = async () => {
    try {
      const values = await holidayForm.validateFields()
      const dates = values.dates || []
      const data = dates.map((date) => ({
        date: date.format('YYYY-MM-DD'),
        name: values.name,
      }))
      const results = await Promise.all(
        data.map((item) => createHoliday(item))
      )
      const allSuccess = results.every((res) => res.code === 0)
      if (allSuccess) {
        message.success('新增节假日成功')
        setHolidayModalVisible(false)
        fetchHolidays(1, holidayPagination.pageSize)
      } else {
        const failedResult = results.find((res) => res.code !== 0)
        message.error(failedResult?.message || '新增节假日失败')
      }
    } catch (error) {
      if (error.errorFields) return
      message.error('新增节假日失败')
    }
  }

  const handleDeleteHoliday = async (id) => {
    try {
      const res = await deleteHoliday(id)
      if (res.code === 0) {
        message.success('删除成功')
        fetchHolidays(holidayPagination.current, holidayPagination.pageSize)
      } else {
        message.error(res.message || '删除失败')
      }
    } catch (err) {
      console.error('删除节假日失败:', err)
      message.error('删除失败')
    }
  }

  const handleAddLeave = () => {
    setEditingLeave(null)
    leaveForm.resetFields()
    setLeaveModalVisible(true)
  }

  const handleEditLeave = (record) => {
    setEditingLeave(record)
    leaveForm.setFieldsValue({
      ...record,
      leaveDate: record.leaveDate ? dayjs(record.leaveDate) : null,
    })
    setLeaveModalVisible(true)
  }

  const handleDeleteLeave = async (id) => {
    try {
      const res = await deleteLeave(id)
      if (res.code === 0) {
        message.success('删除成功')
        fetchLeaveList(leavePagination.current, leavePagination.pageSize)
      } else {
        message.error(res.message || '删除失败')
      }
    } catch (err) {
      console.error('删除请假记录失败:', err)
      message.error('删除失败')
    }
  }

  const handleLeaveModalOk = async () => {
    try {
      const values = await leaveForm.validateFields()
      const data = {
        ...values,
        leaveDate: values.leaveDate ? values.leaveDate.format('YYYY-MM-DD') : null,
      }
      if (editingLeave) {
        const res = await updateLeave(editingLeave.id, data)
        if (res.code === 0) {
          message.success('更新成功')
          setLeaveModalVisible(false)
          fetchLeaveList(leavePagination.current, leavePagination.pageSize)
        } else {
          message.error(res.message || '更新失败')
        }
      } else {
        const res = await createLeave(data)
        if (res.code === 0) {
          message.success('创建成功')
          setLeaveModalVisible(false)
          fetchLeaveList(1, leavePagination.pageSize)
        } else {
          message.error(res.message || '创建失败')
        }
      }
    } catch (error) {
      if (error.errorFields) return
      message.error(editingLeave ? '更新失败' : '创建失败')
    }
  }

  const handleAutoSubstitute = async () => {
    try {
      const employeeId = leaveForm.getFieldValue('employeeId')
      const leaveDate = leaveForm.getFieldValue('leaveDate')
      if (!employeeId) {
        message.warning('请先选择请假人')
        return
      }
      if (!leaveDate) {
        message.warning('请先选择请假日期')
        return
      }
      setAutoSubstituteLoading(true)
      const res = await getAutoSubstitute(employeeId, leaveDate.format('YYYY-MM-DD'))
      if (res.code === 0) {
        leaveForm.setFieldsValue({ substituteEmployeeId: res.data?.id || res.data })
        message.success('已自动分配替班人')
      } else {
        message.error(res.message || '自动分配失败')
      }
    } catch (err) {
      console.error('自动分配替班人失败:', err)
      message.error('自动分配失败')
    } finally {
      setAutoSubstituteLoading(false)
    }
  }

  const getEmployeeName = (id) => {
    const emp = employees.find((e) => e.id === id)
    return emp?.name || '-'
  }

  const getEmployeeGroup = (id) => {
    const emp = employees.find((e) => e.id === id)
    return emp?.groupName || '-'
  }

  const holidayColumns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      render: (value) => (value ? dayjs(value).format('YYYY-MM-DD') : '-'),
    },
    {
      title: '节假日名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Popconfirm
            title="确定要删除这个节假日吗？"
            onConfirm={() => handleDeleteHoliday(record.id)}
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

  const leaveColumns = [
    {
      title: '请假日期',
      dataIndex: 'leaveDate',
      key: 'leaveDate',
      render: (value) => (value ? dayjs(value).format('YYYY-MM-DD') : '-'),
    },
    {
      title: '请假人',
      dataIndex: 'employeeId',
      key: 'employeeName',
      render: (value) => getEmployeeName(value),
    },
    {
      title: '所属小组',
      dataIndex: 'employeeId',
      key: 'employeeGroup',
      render: (value) => getEmployeeGroup(value),
    },
    {
      title: '替班人',
      dataIndex: 'substituteEmployeeId',
      key: 'substituteEmployeeName',
      render: (value) => (value ? getEmployeeName(value) : '-'),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (value) => {
        const item = statusMap[value] || { text: value, color: 'default' }
        return <Tag color={item.color}>{item.text}</Tag>
      },
    },
    {
      title: '备注',
      dataIndex: 'notes',
      key: 'notes',
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditLeave(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这条请假记录吗？"
            onConfirm={() => handleDeleteLeave(record.id)}
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

  const tabItems = [
    {
      key: 'holidays',
      label: '节假日管理',
      children: (
        <div>
          <div style={{ marginBottom: 16, textAlign: 'right' }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddHoliday}>
              新增节假日
            </Button>
          </div>
          <Table
            columns={holidayColumns}
            dataSource={holidayList}
            rowKey="id"
            loading={holidayLoading}
            pagination={{
              current: holidayPagination.current,
              pageSize: holidayPagination.pageSize,
              total: holidayPagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条`,
            }}
            onChange={handleHolidayTableChange}
          />
        </div>
      ),
    },
    {
      key: 'leave',
      label: '请假管理',
      children: (
        <div>
          <div style={{ marginBottom: 16, textAlign: 'right' }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddLeave}>
              新增请假
            </Button>
          </div>
          <Table
            columns={leaveColumns}
            dataSource={leaveList}
            rowKey="id"
            loading={leaveLoading}
            pagination={{
              current: leavePagination.current,
              pageSize: leavePagination.pageSize,
              total: leavePagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条`,
            }}
            onChange={handleLeaveTableChange}
          />
        </div>
      ),
    },
  ]

  return (
    <Card>
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />

      <Modal
        title="新增节假日"
        open={holidayModalVisible}
        onOk={handleHolidayModalOk}
        onCancel={() => setHolidayModalVisible(false)}
        width={500}
        destroyOnClose
      >
        <Form form={holidayForm} layout="vertical">
          <Form.Item
            name="dates"
            label="日期"
            rules={[{ required: true, message: '请选择日期' }]}
          >
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="name"
            label="节假日名称"
            rules={[{ required: true, message: '请输入节假日名称' }]}
          >
            <Input placeholder="请输入节假日名称" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingLeave ? '编辑请假' : '新增请假'}
        open={leaveModalVisible}
        onOk={handleLeaveModalOk}
        onCancel={() => setLeaveModalVisible(false)}
        width={500}
        destroyOnClose
      >
        <Form form={leaveForm} layout="vertical">
          <Form.Item
            name="employeeId"
            label="请假人"
            rules={[{ required: true, message: '请选择请假人' }]}
          >
            <Select placeholder="请选择请假人">
              {employees.map((emp) => (
                <Option key={emp.id} value={emp.id}>
                  {emp.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="leaveDate"
            label="请假日期"
            rules={[{ required: true, message: '请选择请假日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="替班人">
            <Space.Compact style={{ width: '100%' }}>
              <Form.Item name="substituteEmployeeId" noStyle>
                <Select placeholder="请选择替班人（可选）" style={{ width: 'calc(100% - 100px)' }}>
                  {employees.map((emp) => (
                    <Option key={emp.id} value={emp.id}>
                      {emp.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleAutoSubstitute}
                loading={autoSubstituteLoading}
              >
                自动分配
              </Button>
            </Space.Compact>
          </Form.Item>
          <Form.Item name="notes" label="备注">
            <Input.TextArea rows={3} placeholder="请输入备注" />
          </Form.Item>
          <Form.Item
            name="status"
            label="状态"
            initialValue="pending"
          >
            <Select placeholder="请选择状态">
              {Object.entries(statusMap).map(([key, item]) => (
                <Option key={key} value={key}>
                  {item.text}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}

export default Holidays
