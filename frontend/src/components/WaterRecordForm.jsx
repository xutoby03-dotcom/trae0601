import { useState, useEffect } from 'react'
import {
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Radio,
  Switch,
  Button,
  Alert,
  Space,
} from 'antd'
import dayjs from 'dayjs'
import { getPlants } from '@/api/plants'
import { getEmployees } from '@/api/employees'

const { TextArea } = Input
const { Option } = Select

const soilMoistureOptions = [
  { label: '干', value: 'dry' },
  { label: '适中', value: 'medium' },
  { label: '湿', value: 'wet' },
]

const leafStatusOptions = [
  { label: '良好', value: 'good' },
  { label: '发黄', value: 'yellowing' },
  { label: '萎蔫', value: 'wilting' },
  { label: '受损', value: 'damaged' },
]

function WaterRecordForm({ initialValues, onFinish, onCancel, loading }) {
  const [form] = Form.useForm()
  const [plants, setPlants] = useState([])
  const [employees, setEmployees] = useState([])
  const [plantsLoading, setPlantsLoading] = useState(false)
  const [employeesLoading, setEmployeesLoading] = useState(false)

  const isSkipped = Form.useWatch('skipped', form)
  const soilMoisture = Form.useWatch('soilMoisture', form)

  const fetchPlants = async () => {
    try {
      setPlantsLoading(true)
      const res = await getPlants({ pageSize: 1000 })
      if (res.code === 0) {
        setPlants(res.data.list || res.data || [])
      }
    } catch (error) {
      console.error('获取植物列表失败:', error)
    } finally {
      setPlantsLoading(false)
    }
  }

  const fetchEmployees = async () => {
    try {
      setEmployeesLoading(true)
      const res = await getEmployees({ pageSize: 1000 })
      if (res.code === 0) {
        setEmployees(res.data.list || res.data || [])
      }
    } catch (error) {
      console.error('获取员工列表失败:', error)
    } finally {
      setEmployeesLoading(false)
    }
  }

  const handleFinish = async (values) => {
    const data = {
      ...values,
      recordDate: values.recordDate ? values.recordDate.format('YYYY-MM-DD') : undefined,
    }
    onFinish?.(data)
  }

  useEffect(() => {
    fetchPlants()
    fetchEmployees()
  }, [])

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        recordDate: initialValues.recordDate
          ? dayjs(initialValues.recordDate)
          : dayjs(),
      })
    }
  }, [initialValues, form])

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      initialValues={{
        recordDate: dayjs(),
        skipped: false,
        rotated: false,
      }}
    >
      {soilMoisture === 'wet' && (
        <Form.Item>
          <Alert
            type="info"
            showIcon
            message="土壤还湿，可以选择跳过"
            style={{ marginBottom: 0 }}
          />
        </Form.Item>
      )}

      <Form.Item
        label="植物"
        name="plantId"
        rules={[{ required: true, message: '请选择植物' }]}
      >
        <Select
          placeholder="请选择植物"
          loading={plantsLoading}
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

      <Form.Item
        label="员工"
        name="employeeId"
        rules={[{ required: true, message: '请选择员工' }]}
      >
        <Select
          placeholder="请选择员工"
          loading={employeesLoading}
          showSearch
          optionFilterProp="children"
          filterOption={(input, option) =>
            (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
          }
        >
          {employees.map((employee) => (
            <Option key={employee.id} value={employee.id}>
              {employee.name}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        label="记录日期"
        name="recordDate"
        rules={[{ required: true, message: '请选择记录日期' }]}
      >
        <DatePicker style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item
        label="土壤干湿"
        name="soilMoisture"
        rules={[{ required: true, message: '请选择土壤干湿' }]}
      >
        <Radio.Group options={soilMoistureOptions} />
      </Form.Item>

      <Form.Item
        label="叶片状态"
        name="leafStatus"
        rules={[{ required: true, message: '请选择叶片状态' }]}
      >
        <Radio.Group options={leafStatusOptions} />
      </Form.Item>

      <Form.Item
        label="浇水量(ml)"
        name="waterAmount"
        rules={
          isSkipped
            ? []
            : [{ required: true, message: '请输入浇水量' }]
        }
      >
        <InputNumber
          style={{ width: '100%' }}
          min={0}
          disabled={isSkipped}
          placeholder="请输入浇水量"
        />
      </Form.Item>

      <Form.Item label="是否转盆" name="rotated" valuePropName="checked">
        <Switch />
      </Form.Item>

      <Form.Item label="是否跳过" name="skipped" valuePropName="checked">
        <Switch />
      </Form.Item>

      {isSkipped && (
        <Form.Item
          label="跳过原因"
          name="skipReason"
          rules={[{ required: true, message: '请输入跳过原因' }]}
        >
          <TextArea rows={3} placeholder="请输入跳过原因" />
        </Form.Item>
      )}

      <Form.Item label="备注" name="notes">
        <TextArea rows={3} placeholder="请输入备注" />
      </Form.Item>

      <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
        <Space>
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            确定
          </Button>
        </Space>
      </Form.Item>
    </Form>
  )
}

export default WaterRecordForm
