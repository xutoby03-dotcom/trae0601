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
  Row,
  Col,
  Switch,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { getEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee } from '../api/employees'

const { Option } = Select

const statusMap = {
  1: { text: '在职', color: 'green' },
  0: { text: '离职', color: 'default' },
}

function Employees() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [groupFilter, setGroupFilter] = useState('')
  const [groupOptions, setGroupOptions] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState(null)
  const [form] = Form.useForm()

  const fetchEmployees = async (page = 1, pageSize = 10, groupName = '') => {
    setLoading(true)
    try {
      const params = { page, pageSize }
      if (groupName) params.groupName = groupName
      const res = await getEmployees(params)
      if (res.code === 0) {
        const list = res.data.list || res.data || []
        setData(list)
        const groups = [...new Set(list.map((e) => e.groupName).filter(Boolean))]
        setGroupOptions(groups)
        setPagination((prev) => ({
          ...prev,
          current: page,
          pageSize,
          total: res.data.total || list.length,
        }))
      } else {
        message.error(res.message || '获取员工列表失败')
      }
    } catch (err) {
      console.error('获取员工列表失败:', err)
      message.error('获取员工列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmployees()
  }, [])

  const handleSearch = () => {
    fetchEmployees(1, pagination.pageSize, groupFilter)
  }

  const handleTableChange = (page) => {
    fetchEmployees(page.current, page.pageSize, groupFilter)
  }

  const handleAdd = () => {
    setEditingEmployee(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = async (record) => {
    setEditingEmployee(record)
    try {
      const res = await getEmployeeById(record.id)
      if (res.code === 0) {
        form.setFieldsValue(res.data)
      }
    } catch (err) {
      console.error('获取员工详情失败:', err)
      form.setFieldsValue(record)
    }
    setModalVisible(true)
  }

  const handleDelete = async (id) => {
    try {
      const res = await deleteEmployee(id)
      if (res.code === 0) {
        message.success('删除成功')
        fetchEmployees(pagination.current, pagination.pageSize, groupFilter)
      } else {
        message.error(res.message || '删除失败')
      }
    } catch (err) {
      console.error('删除员工失败:', err)
      message.error('删除失败')
    }
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      if (editingEmployee) {
        const res = await updateEmployee(editingEmployee.id, values)
        if (res.code === 0) {
          message.success('更新成功')
          setModalVisible(false)
          fetchEmployees(pagination.current, pagination.pageSize, groupFilter)
        } else {
          message.error(res.message || '更新失败')
        }
      } else {
        const res = await createEmployee(values)
        if (res.code === 0) {
          message.success('创建成功')
          setModalVisible(false)
          fetchEmployees(1, pagination.pageSize, groupFilter)
        } else {
          message.error(res.message || '创建失败')
        }
      }
    } catch (error) {
      if (error.errorFields) return
      message.error(editingEmployee ? '更新失败' : '创建失败')
    }
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 70 },
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '小组', dataIndex: 'groupName', key: 'groupName', width: 100 },
    { title: '邮箱', dataIndex: 'email', key: 'email' },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (value) => {
        const item = statusMap[value] || { text: value, color: 'default' }
        return <Tag color={item.color}>{item.text}</Tag>
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定要删除这名员工吗？" onConfirm={() => handleDelete(record.id)} okText="确定" cancelText="取消">
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <Card title="员工管理">
      <div style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col span={8}>
            <Select
              placeholder="请选择小组"
              allowClear
              style={{ width: '100%' }}
              value={groupFilter || undefined}
              onChange={(value) => setGroupFilter(value || '')}
            >
              {groupOptions.map((item) => (
                <Option key={item} value={item}>
                  {item}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={16} style={{ textAlign: 'right' }}>
            <Space>
              <Button type="primary" onClick={handleSearch}>
                搜索
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                新增员工
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
        onChange={handleTableChange}
      />

      <Modal
        title={editingEmployee ? '编辑员工' : '新增员工'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={500}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>
          <Form.Item
            name="groupName"
            label="小组"
            rules={[{ required: true, message: '请输入小组' }]}
          >
            <Input placeholder="请输入小组" />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { type: 'email', message: '请输入正确的邮箱格式' },
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item
            name="isActive"
            label="状态"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch checkedChildren="在职" unCheckedChildren="离职" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}

export default Employees
