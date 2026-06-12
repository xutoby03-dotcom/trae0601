import React, { useState, useMemo } from 'react';
import { Button, Table, Select, Card, Image, Tag, Timeline, Empty, Modal } from 'antd';
import { PlusOutlined, SearchOutlined, EyeOutlined } from '@ant-design/icons';
import { useStore } from '../store/useStore';
import InspectionForm from '../components/InspectionForm';
import StatusBadge from '../components/StatusBadge';
import type { InspectionRecord, InspectionFormValues } from '../types';
import { formatDateTime, getDeviceTypeIcon } from '../utils/helpers';
import type { ColumnsType } from 'antd/es/table';

const InspectionPage: React.FC = () => {
  const { points, inspectionRecords, addInspectionRecord, getPointById, getRecordsByPointId, getTicketByRecordId } = useStore();
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [pointFilter, setPointFilter] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [detailRecord, setDetailRecord] = useState<InspectionRecord | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const filteredRecords = useMemo(() => {
    let records = [...inspectionRecords].sort(
      (a, b) => new Date(b.inspectionTime).getTime() - new Date(a.inspectionTime).getTime()
    );

    if (statusFilter) {
      records = records.filter((r) => r.status === statusFilter);
    }
    if (pointFilter) {
      records = records.filter((r) => r.pointId === pointFilter);
    }

    return records;
  }, [inspectionRecords, statusFilter, pointFilter]);

  const handleFormSubmit = (values: InspectionFormValues) => {
    addInspectionRecord(values);
    setFormOpen(false);
  };

  const handleViewDetail = (record: InspectionRecord) => {
    setDetailRecord(record);
    setDetailModalOpen(true);
  };

  const handleViewHistory = (pointId: string) => {
    setPointFilter(pointId);
  };

  const columns: ColumnsType<InspectionRecord> = [
    {
      title: '巡检时间',
      dataIndex: 'inspectionTime',
      key: 'inspectionTime',
      width: 180,
      render: (time: string) => (
        <span className="text-gray-700">{formatDateTime(time)}</span>
      ),
      sorter: (a, b) =>
        new Date(a.inspectionTime).getTime() - new Date(b.inspectionTime).getTime(),
    },
    {
      title: '点位信息',
      key: 'point',
      width: 250,
      render: (_, record) => {
        const point = getPointById(record.pointId);
        if (!point) return <span className="text-gray-400">点位已删除</span>;
        return (
          <div className="flex items-center gap-2">
            <span className="text-xl">{getDeviceTypeIcon(point.deviceType)}</span>
            <div>
              <div className="font-medium text-gray-800">
                {point.area} - {point.deviceType}
              </div>
              <div className="text-xs text-gray-500 font-mono">{point.deviceNo}</div>
            </div>
          </div>
        );
      },
    },
    {
      title: '巡检状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: InspectionRecord['status']) => (
        <StatusBadge type="inspection" status={status} />
      ),
    },
    {
      title: '检测数据',
      key: 'data',
      width: 200,
      render: (_, record) => {
        const items: React.ReactNode[] = [];
        if (record.pressure !== undefined) {
          const isNormal = record.pressure >= 1.0 && record.pressure <= 1.5;
          items.push(
            <div key="pressure" className={isNormal ? 'text-green-600' : 'text-red-600'}>
              压力: {record.pressure} MPa
            </div>
          );
        }
        if (record.lightingStatus) {
          const isNormal = record.lightingStatus === '正常';
          items.push(
            <div key="lighting" className={isNormal ? 'text-green-600' : 'text-red-600'}>
              灯光: {record.lightingStatus}
            </div>
          );
        }
        return <div className="space-y-1">{items}</div>;
      },
    },
    {
      title: '异常说明',
      dataIndex: 'anomalyDescription',
      key: 'anomalyDescription',
      width: 250,
      render: (desc?: string) =>
        desc ? (
          <Tag color="red" className="whitespace-normal max-w-full">
            {desc}
          </Tag>
        ) : (
          <span className="text-gray-400">-</span>
        ),
    },
    {
      title: '巡检人',
      dataIndex: 'inspector',
      key: 'inspector',
      width: 100,
    },
    {
      title: '照片',
      dataIndex: 'photo',
      key: 'photo',
      width: 80,
      render: (photo?: string) =>
        photo ? (
          <Image
            width={40}
            height={40}
            src={photo}
            className="rounded object-cover border border-gray-200"
            preview={{ mask: '查看' }}
          />
        ) : (
          <span className="text-gray-400 text-sm">无</span>
        ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record)}
        >
          详情
        </Button>
      ),
    },
  ];

  const stats = useMemo(() => {
    const total = inspectionRecords.length;
    const normal = inspectionRecords.filter((r) => r.status === 'normal').length;
    const anomaly = inspectionRecords.filter((r) => r.status === 'anomaly').length;
    const rate = total > 0 ? Math.round((normal / total) * 100) : 0;
    return { total, normal, anomaly, rate };
  }, [inspectionRecords]);

  const pointOptions = points.map((p) => ({
    value: p.id,
    label: `${getDeviceTypeIcon(p.deviceType)} ${p.area} - ${p.deviceType} - ${p.deviceNo}`,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">巡检记录总数</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">📋</span>
            </div>
          </div>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">正常</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats.normal}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">异常</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{stats.anomaly}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">❌</span>
            </div>
          </div>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">合格率</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{stats.rate}%</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex flex-wrap items-center gap-3">
            <Select
              placeholder="筛选点位"
              value={pointFilter}
              onChange={setPointFilter}
              allowClear
              className="w-72"
              showSearch
              optionFilterProp="label"
              options={pointOptions}
            />
            <Select
              placeholder="筛选状态"
              value={statusFilter}
              onChange={setStatusFilter}
              allowClear
              className="w-32"
            >
              <Select.Option value="normal">正常</Select.Option>
              <Select.Option value="anomaly">异常</Select.Option>
            </Select>
            {pointFilter && (
              <Button onClick={() => setPointFilter(null)}>清除点位筛选</Button>
            )}
          </div>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setFormOpen(true)}
            className="bg-red-600 hover:bg-red-700"
          >
            新增巡检
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={filteredRecords}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          expandable={{
            expandedRowRender: (record) => {
              const point = getPointById(record.pointId);
              if (!point) return <Empty description="点位信息已删除" />;
              const history = getRecordsByPointId(point.id)
                .filter((r) => r.id !== record.id)
                .sort(
                  (a, b) =>
                    new Date(b.inspectionTime).getTime() -
                    new Date(a.inspectionTime).getTime()
                )
                .slice(0, 5);

              if (history.length === 0) {
                return <Empty description="暂无历史记录" />;
              }

              return (
                <div className="py-4">
                  <h4 className="text-gray-700 font-medium mb-4">最近5次巡检历史</h4>
                  <Timeline
                    items={history.map((h) => ({
                      color: h.status === 'normal' ? 'green' : 'red',
                      children: (
                        <div className="pb-2">
                          <div className="flex items-center gap-2">
                            <StatusBadge type="inspection" status={h.status} />
                            <span className="text-sm text-gray-500">
                              {formatDateTime(h.inspectionTime)}
                            </span>
                            <span className="text-sm text-gray-600">
                              巡检人: {h.inspector}
                            </span>
                          </div>
                          {h.anomalyDescription && (
                            <p className="text-sm text-red-600 mt-1">
                              {h.anomalyDescription}
                            </p>
                          )}
                        </div>
                      ),
                    }))}
                  />
                </div>
              );
            },
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      <InspectionForm
        open={formOpen}
        points={points}
        onCancel={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      <Modal
        title="巡检记录详情"
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalOpen(false)}>
            关闭
          </Button>,
          detailRecord && (
            <Button
              key="history"
              type="primary"
              onClick={() => {
                handleViewHistory(detailRecord.pointId);
                setDetailModalOpen(false);
              }}
            >
              查看该点位历史
            </Button>
          ),
        ]}
        width={600}
      >
        {detailRecord && (
          <div className="space-y-4">
            {(() => {
              const point = getPointById(detailRecord.pointId);
              const ticket = getTicketByRecordId(detailRecord.id);
              return (
                <>
                  <Card size="small" className="bg-gray-50">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">点位：</span>
                        <span className="font-medium">
                          {point
                            ? `${point.area} - ${point.deviceType} - ${point.deviceNo}`
                            : '已删除'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">责任人：</span>
                        <span className="font-medium">{point?.personInCharge || '-'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">巡检时间：</span>
                        <span className="font-medium">
                          {formatDateTime(detailRecord.inspectionTime)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">巡检人：</span>
                        <span className="font-medium">{detailRecord.inspector}</span>
                      </div>
                    </div>
                  </Card>

                  <div className="flex items-center gap-4">
                    <span className="text-gray-600">巡检状态：</span>
                    <StatusBadge type="inspection" status={detailRecord.status} />
                  </div>

                  {detailRecord.pressure !== undefined && (
                    <div className="flex items-center gap-4">
                      <span className="text-gray-600">压力值：</span>
                      <span
                        className={
                          detailRecord.pressure >= 1.0 && detailRecord.pressure <= 1.5
                            ? 'text-green-600 font-medium'
                            : 'text-red-600 font-medium'
                        }
                      >
                        {detailRecord.pressure} MPa
                        <span className="text-gray-400 text-xs ml-2">
                          (正常范围 1.0-1.5)
                        </span>
                      </span>
                    </div>
                  )}

                  {detailRecord.lightingStatus && (
                    <div className="flex items-center gap-4">
                      <span className="text-gray-600">亮灯情况：</span>
                      <span
                        className={
                          detailRecord.lightingStatus === '正常'
                            ? 'text-green-600 font-medium'
                            : 'text-red-600 font-medium'
                        }
                      >
                        {detailRecord.lightingStatus}
                      </span>
                    </div>
                  )}

                  {detailRecord.anomalyDescription && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-800 font-medium mb-2">异常说明：</p>
                      <p className="text-red-700">{detailRecord.anomalyDescription}</p>
                    </div>
                  )}

                  {ticket && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <p className="text-orange-800 font-medium mb-2">关联异常工单：</p>
                      <div className="flex items-center gap-2 mb-2">
                        <StatusBadge type="anomaly" status={ticket.status} />
                        <span className="text-sm text-gray-600">
                          工单编号: {ticket.id}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">
                        上报人: {ticket.reporter} | 上报时间:{' '}
                        {formatDateTime(ticket.reportTime)}
                      </p>
                      {ticket.repairer && (
                        <p className="text-sm text-gray-700">
                          维修人: {ticket.repairer} | 维修时间:{' '}
                          {ticket.repairTime && formatDateTime(ticket.repairTime)}
                        </p>
                      )}
                      {ticket.reviewer && (
                        <p className="text-sm text-gray-700">
                          复查人: {ticket.reviewer} | 复查时间:{' '}
                          {ticket.reviewTime && formatDateTime(ticket.reviewTime)}
                        </p>
                      )}
                    </div>
                  )}

                  {detailRecord.photo && (
                    <div>
                      <p className="text-gray-600 mb-2">现场照片：</p>
                      <Image
                        src={detailRecord.photo}
                        width={300}
                        className="rounded-lg border border-gray-200"
                        preview
                      />
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default InspectionPage;
