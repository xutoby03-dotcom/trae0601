import React, { useState, useMemo } from 'react';
import { Button, Table, Input, Select, Popconfirm, message, Space, Card, Image, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, FormOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import PointForm from '../components/PointForm';
import InspectionForm from '../components/InspectionForm';
import type { Point, PointFormValues, InspectionFormValues } from '../types';
import { isOverdue, getDaysUntilDue, formatDate, getDeviceTypeIcon } from '../utils/helpers';
import type { ColumnsType } from 'antd/es/table';

const PointPage: React.FC = () => {
  const navigate = useNavigate();
  const { points, addPoint, updatePoint, deletePoint, addInspectionRecord } = useStore();
  const [searchText, setSearchText] = useState('');
  const [areaFilter, setAreaFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [inspectionFormOpen, setInspectionFormOpen] = useState(false);
  const [editingPoint, setEditingPoint] = useState<Point | null>(null);
  const [selectedPointId, setSelectedPointId] = useState<string | undefined>(undefined);

  const filteredPoints = useMemo(() => {
    return points.filter((point) => {
      const matchSearch =
        point.deviceNo.toLowerCase().includes(searchText.toLowerCase()) ||
        point.personInCharge.toLowerCase().includes(searchText.toLowerCase());
      const matchArea = !areaFilter || point.area === areaFilter;
      const matchType = !typeFilter || point.deviceType === typeFilter;
      return matchSearch && matchArea && matchType;
    });
  }, [points, searchText, areaFilter, typeFilter]);

  const handleAdd = () => {
    setEditingPoint(null);
    setFormOpen(true);
  };

  const handleEdit = (point: Point) => {
    setEditingPoint(point);
    setFormOpen(true);
  };

  const handleDelete = (id: string) => {
    deletePoint(id);
    message.success('删除成功');
  };

  const handleFormSubmit = (values: PointFormValues) => {
    if (editingPoint) {
      updatePoint(editingPoint.id, values);
      message.success('修改成功');
    } else {
      addPoint(values);
      message.success('创建成功');
    }
    setFormOpen(false);
  };

  const handleQuickInspect = (point: Point) => {
    setSelectedPointId(point.id);
    setInspectionFormOpen(true);
  };

  const handleInspectionSubmit = (values: InspectionFormValues) => {
    addInspectionRecord(values);
    message.success('巡检记录已提交');
    setInspectionFormOpen(false);
    setSelectedPointId(undefined);
  };

  const columns: ColumnsType<Point> = [
    {
      title: '照片',
      dataIndex: 'photo',
      key: 'photo',
      width: 80,
      render: (photo: string | undefined, record) => (
        <div className="flex items-center gap-2">
          <span className="text-xl">{getDeviceTypeIcon(record.deviceType)}</span>
          {photo && (
            <Image
              width={40}
              height={40}
              src={photo}
              className="rounded-lg object-cover border border-gray-200"
              preview={{ mask: '查看' }}
            />
          )}
        </div>
      ),
    },
    {
      title: '区域',
      dataIndex: 'area',
      key: 'area',
      width: 80,
      render: (area: string) => (
        <Tag color="blue" className="text-sm font-medium">
          {area}
        </Tag>
      ),
    },
    {
      title: '设备类型',
      dataIndex: 'deviceType',
      key: 'deviceType',
      width: 120,
    },
    {
      title: '设备编号',
      dataIndex: 'deviceNo',
      key: 'deviceNo',
      width: 120,
      render: (no: string) => <span className="font-mono text-gray-700">{no}</span>,
    },
    {
      title: '责任人',
      dataIndex: 'personInCharge',
      key: 'personInCharge',
      width: 100,
    },
    {
      title: '检查周期',
      dataIndex: 'inspectionCycle',
      key: 'inspectionCycle',
      width: 100,
      render: (cycle: number) => <span>每 {cycle} 天</span>,
    },
    {
      title: '上次巡检',
      dataIndex: 'lastInspectionDate',
      key: 'lastInspectionDate',
      width: 120,
      render: (date?: string) => date || <span className="text-gray-400">从未巡检</span>,
    },
    {
      title: '下次巡检',
      dataIndex: 'nextInspectionDate',
      key: 'nextInspectionDate',
      width: 140,
      render: (date: string, record) => {
        const overdue = isOverdue(record);
        const days = getDaysUntilDue(record);
        if (overdue) {
          return (
            <Tag color="red" className="animate-pulse">
              已逾期 {Math.abs(days)} 天
            </Tag>
          );
        }
        if (days <= 3) {
          return (
            <Tag color="orange">
              {formatDate(date)} ({days}天后)
            </Tag>
          );
        }
        return <span>{formatDate(date)}</span>;
      },
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<FormOutlined />}
            onClick={() => handleQuickInspect(record)}
          >
            巡检
          </Button>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个点位吗？"
            description="相关的巡检记录和异常工单也会被删除"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const areas = Array.from(new Set(points.map((p) => p.area)));
  const deviceTypes = Array.from(new Set(points.map((p) => p.deviceType)));

  const stats = useMemo(() => {
    const total = points.length;
    const overdue = points.filter(isOverdue).length;
    const upcoming = points.filter((p) => {
      const days = getDaysUntilDue(p);
      return days > 0 && days <= 7;
    }).length;
    return { total, overdue, upcoming };
  }, [points]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">点位总数</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">📍</span>
            </div>
          </div>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">已逾期</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{stats.overdue}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
          </div>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">7天内到期</p>
              <p className="text-3xl font-bold text-orange-600 mt-1">{stats.upcoming}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">⏰</span>
            </div>
          </div>
        </Card>

        <Card
          className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-gradient-to-r from-red-500 to-red-600"
          onClick={() => navigate('/anomaly')}
        >
          <div className="flex items-center justify-between text-white">
            <div>
              <p className="text-red-100 text-sm">异常管理</p>
              <p className="text-3xl font-bold mt-1">前往处理</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">→</span>
            </div>
          </div>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex flex-wrap items-center gap-3">
            <Input
              placeholder="搜索设备编号或责任人"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-64"
              allowClear
            />
            <Select
              placeholder="筛选区域"
              value={areaFilter}
              onChange={setAreaFilter}
              allowClear
              className="w-32"
            >
              {areas.map((area) => (
                <Select.Option key={area} value={area}>
                  {area}
                </Select.Option>
              ))}
            </Select>
            <Select
              placeholder="筛选类型"
              value={typeFilter}
              onChange={setTypeFilter}
              allowClear
              className="w-36"
            >
              {deviceTypes.map((type) => (
                <Select.Option key={type} value={type}>
                  {type}
                </Select.Option>
              ))}
            </Select>
          </div>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            className="bg-red-600 hover:bg-red-700"
          >
            新增点位
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={filteredPoints}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 个点位`,
          }}
          rowClassName={(record) =>
            isOverdue(record) ? 'bg-red-50/50' : ''
          }
          scroll={{ x: 1200 }}
        />
      </Card>

      <PointForm
        open={formOpen}
        editingPoint={editingPoint}
        onCancel={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      <InspectionForm
        open={inspectionFormOpen}
        points={points}
        selectedPointId={selectedPointId}
        onCancel={() => {
          setInspectionFormOpen(false);
          setSelectedPointId(undefined);
        }}
        onSubmit={handleInspectionSubmit}
      />
    </div>
  );
};

export default PointPage;
