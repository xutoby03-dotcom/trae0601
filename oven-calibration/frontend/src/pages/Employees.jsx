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
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from '../api/employees'

const ROLE_MAP = {
  master: { label: '烘焙师', color: 'blue' },
  apprentice: { label: '学徒', color: 'cyan' },
  manager: { label: '店长', color: 'purple' },
}

function Employees() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [roleFilter, setRoleFilter] = useState(undefined)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)

  const fetchEmployees = async (page = 1, pageSize = 10) => {
    setLoading(true)
    try {
      const params = { page, pageSize }
      if (roleFilter) params.role = roleFilter
      const res = await getEmployees(params)
      if (res.code === 0) {
        setData(res.data?.list || res.data || [])
        setPagination({
          current: page,
          pageSize,
          total: res.data?.total || (res.data || []).length,
        })
      } else {
        message.error(res.message || '获取员工列表失败')
      }
    } catch (error) {
      message.error('获取员工列表失败')
      console.error('获取员工列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmployees(pagination.current, pagination.pageSize)
  }, [roleFilter])

  const handleTableChange = (pag) => {
    fetchEmployees(pag.current, pag.pageSize)
  }

  const handleCreate = () => {
    setEditingId(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = async (record) => {
    try {
      const res = await getEmployee(record.id)
      if (res.code === 0) {
        setEditingId(record.id)
        form.setFieldsValue(res.data)
        setModalVisible(true)
      } else {
        message.error(res.message || '获取员工详情失败')
      }
    } catch (error) {
      message.error('获取员工详情失败')
      console.error('获取员工详情失败:', error)
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setSubmitting(true)

      let res
      if (editingId) {
        res = await updateEmployee(editingId, values)
      } else {
        res = await createEmployee(values)
      }

      if (res.code === 0) {
        message.success(editingId ? '编辑成功' : '创建成功')
        setModalVisible(false)
        fetchEmployees(pagination.current, pagination.pageSize)
      } else {
        message.error(res.message || '操作失败')
      }
    } catch (error) {
      if (error.errorFields) return
      message.error('操作失败')
      console.error('操作失败:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      const res = await deleteEmployee(id)
      if (res.code === 0) {
        message.success('删除成功')
        fetchEmployees(pagination.current, pagination.pageSize)
      } else {
        message.error(res.message || '删除失败')
      }
    } catch (error) {
      message.error('删除失败')
      console.error('删除失败:', error)
    }
  }

  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        const info = ROLE_MAP[role] || { label: role, color: 'default' }
        return <Tag color={info.color}>{info.label}</Tag>
      },
    },
    {
      title: '电话',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone) => phone || '-',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => text ? text.split(' ')[0] : '-',
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除该员工?"
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
        title="员工管理"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            新增员工
          </Button>
        }
      >
        <Space style={{ marginBottom: 16 }}>
          <span>筛选：</span>
          <Select
            placeholder="角色"
            style={{ width: 140 }}
            allowClear
            value={roleFilter}
            onChange={(value) => setRoleFilter(value)}
            options={Object.entries(ROLE_MAP).map(([key, val]) => ({
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
        title={editingId ? '编辑员工' : '新增员工'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        confirmLoading={submitting}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="姓名"
            name="name"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>
          <Form.Item
            label="角色"
            name="role"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select
              placeholder="请选择角色"
              options={Object.entries(ROLE_MAP).map(([key, val]) => ({
                label: val.label,
                value: key,
              }))}
            />
          </Form.Item>
          <Form.Item
            label="电话"
            name="phone"
          >
            <Input placeholder="请输入电话号码（可选）" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Employees
