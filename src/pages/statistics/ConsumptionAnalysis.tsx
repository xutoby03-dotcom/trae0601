import { useState, useMemo } from 'react';
import {
  Card,
  DatePicker,
  Select,
  Switch,
  Tabs,
  Table,
  Tag,
  Row,
  Col,
  Progress,
  Tooltip,
  Empty,
} from 'antd';
import {
  TrendingUp,
  Calendar,
  BarChart3,
  Flame,
  Award,
  Package,
  ChevronDown,
  ChevronUp,
  Activity,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { RangePickerProps } from 'antd/es/date-picker';
import dayjs from 'dayjs';
import { mockConsumptionData, mockCounters } from '@/mock/data';
import { useCounterStore } from '@/stores';
import type { MaterialType } from '@/types/index';
import { MATERIAL_CONFIG } from '@/types/index';

const { RangePicker } = DatePicker;
const { Option } = Select;

const MATERIAL_TYPES: MaterialType[] = ['scentPaper', 'coffeeBean', 'sprayNozzle', 'cleaningCloth', 'labelSticker'];
const COUNTER_COLORS = ['#722F37', '#C9A962', '#4A6741', '#2A52BE', '#FF6B35'];

export default function ConsumptionAnalysis() {
  const { counters } = useCounterStore();
  const counterList = counters.length > 0 ? counters : mockCounters;

  const today = dayjs();
  const defaultRange: [dayjs.Dayjs, dayjs.Dayjs] = [today.subtract(29, 'day'), today];

  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>(defaultRange);
  const [selectedCounters, setSelectedCounters] = useState<string[]>(counterList.map(c => c.id));
  const [selectedMaterials, setSelectedMaterials] = useState<MaterialType[]>([...MATERIAL_TYPES]);
  const [onlyActivity, setOnlyActivity] = useState(false);
  const [activeTab, setActiveTab] = useState('line');
  const [showDetailTable, setShowDetailTable] = useState(false);

  const filteredData = useMemo(() => {
    const [start, end] = dateRange;
    if (!start || !end) return mockConsumptionData;

    return mockConsumptionData.filter(item => {
      const itemDate = dayjs(item.date);
      const dateMatch = itemDate.isAfter(start.subtract(1, 'day')) && itemDate.isBefore(end.add(1, 'day'));
      const counterMatch = selectedCounters.includes(item.counterId);
      const materialMatch = selectedMaterials.includes(item.materialType);
      const activityMatch = onlyActivity ? item.isActivity : true;

      return dateMatch && counterMatch && materialMatch && activityMatch;
    });
  }, [dateRange, selectedCounters, selectedMaterials, onlyActivity]);

  const stats = useMemo(() => {
    const total = filteredData.reduce((sum, item) => sum + item.consumed, 0);
    const [start, end] = dateRange;
    const days = start && end ? end.diff(start, 'day') + 1 : 30;
    const avgDaily = Math.round(total / days);

    const activityData = filteredData.filter(d => d.isActivity);
    const nonActivityData = filteredData.filter(d => !d.isActivity);
    const activityAvg = activityData.length > 0
      ? activityData.reduce((s, i) => s + i.consumed, 0) / (days * selectedCounters.length * 0.3)
      : 0;
    const nonActivityAvg = nonActivityData.length > 0
      ? nonActivityData.reduce((s, i) => s + i.consumed, 0) / (days * selectedCounters.length * 0.7)
      : 0;
    const activityIncrease = nonActivityAvg > 0
      ? Math.round(((activityAvg - nonActivityAvg) / nonActivityAvg) * 100)
      : 0;

    const counterConsumption = selectedCounters.map(cid => {
      const sum = filteredData.filter(d => d.counterId === cid).reduce((s, i) => s + i.consumed, 0);
      const counter = counterList.find(c => c.id === cid);
      return { id: cid, name: counter?.name || cid, total: sum };
    }).sort((a, b) => b.total - a.total);

    const materialConsumption = selectedMaterials.map(m => {
      const sum = filteredData.filter(d => d.materialType === m).reduce((s, i) => s + i.consumed, 0);
      return { type: m, name: MATERIAL_CONFIG[m].name, total: sum, unit: MATERIAL_CONFIG[m].unit };
    }).sort((a, b) => b.total - a.total);

    const topCounter = counterConsumption[0];
    const topMaterial = materialConsumption[0];

    return {
      total,
      avgDaily,
      activityIncrease,
      topCounter,
      topMaterial,
      counterConsumption,
      materialConsumption,
      days,
    };
  }, [filteredData, dateRange, selectedCounters, selectedMaterials, counterList]);

  const lineChartData = useMemo(() => {
    const [start, end] = dateRange;
    if (!start || !end) return [];

    const dateMap: Record<string, Record<string, number>> = {};
    let cur = start.startOf('day');
    while (cur.isBefore(end.add(1, 'day'))) {
      dateMap[cur.format('MM-DD')] = {};
      selectedCounters.forEach(cid => {
        dateMap[cur.format('MM-DD')][cid] = 0;
      });
      cur = cur.add(1, 'day');
    }

    filteredData.forEach(item => {
      const d = dayjs(item.date).format('MM-DD');
      if (dateMap[d] !== undefined && selectedCounters.includes(item.counterId)) {
        dateMap[d][item.counterId] = (dateMap[d][item.counterId] || 0) + item.consumed;
      }
    });

    return Object.entries(dateMap).map(([date, counters]) => {
      const row: Record<string, string | number> = { date };
      Object.entries(counters).forEach(([cid, val]) => {
        const counter = counterList.find(c => c.id === cid);
        row[counter?.name || cid] = val;
      });
      return row;
    });
  }, [filteredData, dateRange, selectedCounters, counterList]);

  const barChartData = useMemo(() => {
    return selectedCounters.map(cid => {
      const counter = counterList.find(c => c.id === cid);
      const row: Record<string, string | number> = { name: counter?.name || cid };
      selectedMaterials.forEach(m => {
        const sum = filteredData
          .filter(d => d.counterId === cid && d.materialType === m)
          .reduce((s, i) => s + i.consumed, 0);
        row[MATERIAL_CONFIG[m].name] = sum;
      });
      return row;
    });
  }, [filteredData, selectedCounters, selectedMaterials, counterList]);

  const heatmapData = useMemo(() => {
    const [start, end] = dateRange;
    if (!start || !end) return [];

    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const result: Array<{ weekday: string; counterName: string; value: number; maxValue: number }> = [];
    const maxByCounter: Record<string, number> = {};

    selectedCounters.forEach(cid => {
      const counter = counterList.find(c => c.id === cid);
      const cname = counter?.name || cid;
      weekdays.forEach(wd => {
        maxByCounter[`${cname}-${wd}`] = 0;
      });
    });

    selectedCounters.forEach(cid => {
      const counter = counterList.find(c => c.id === cid);
      const cname = counter?.name || cid;

      weekdays.forEach(wd => {
        const wdIdx = weekdays.indexOf(wd);
        const sum = filteredData
          .filter(d => {
            return d.counterId === cid && dayjs(d.date).day() === wdIdx;
          })
          .reduce((s, i) => s + i.consumed, 0);

        maxByCounter[`${cname}-${wd}`] = sum;
      });
    });

    const globalMax = Math.max(...Object.values(maxByCounter), 1);

    selectedCounters.forEach(cid => {
      const counter = counterList.find(c => c.id === cid);
      const cname = counter?.name || cid;

      weekdays.forEach(wd => {
        result.push({
          weekday: wd,
          counterName: cname,
          value: maxByCounter[`${cname}-${wd}`],
          maxValue: globalMax,
        });
      });
    });

    return result;
  }, [filteredData, dateRange, selectedCounters, counterList]);

  const detailTableData = useMemo(() => {
    const [start, end] = dateRange;
    if (!start || !end) return [];

    const dateMap: Record<string, Record<string, number>> = {};
    let cur = start.startOf('day');
    while (cur.isBefore(end.add(1, 'day'))) {
      dateMap[cur.format('YYYY-MM-DD')] = {};
      selectedCounters.forEach(cid => {
        const counter = counterList.find(c => c.id === cid);
        dateMap[cur.format('YYYY-MM-DD')][counter?.name || cid] = 0;
      });
      dateMap[cur.format('YYYY-MM-DD')]['合计'] = 0;
      cur = cur.add(1, 'day');
    }

    filteredData.forEach(item => {
      const d = item.date;
      if (dateMap[d]) {
        const counter = counterList.find(c => c.id === item.counterId);
        const cname = counter?.name || item.counterId;
        dateMap[d][cname] = (dateMap[d][cname] || 0) + item.consumed;
        dateMap[d]['合计'] += item.consumed;
      }
    });

    return Object.entries(dateMap)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([date, data]) => ({ date, ...data, key: date }));
  }, [filteredData, dateRange, selectedCounters, counterList]);

  const detailColumns = useMemo(() => {
    type Col = {
      title: string;
      dataIndex: string;
      key: string;
      width: number;
      fixed?: 'left' | 'right';
      align?: 'left' | 'right' | 'center';
      render?: (v: unknown) => React.ReactNode;
    };
    const baseCols: Col[] = [
      {
        title: '日期',
        dataIndex: 'date',
        key: 'date',
        fixed: 'left',
        width: 130,
        render: (v: unknown) => {
          const str = String(v);
          const d = dayjs(str);
          return (
            <div>
              <div className="font-medium text-wine-700">{str}</div>
              <div className="text-xs text-cream-500">
                {['周日', '周一', '周二', '周三', '周四', '周五', '周六'][d.day()]}
              </div>
            </div>
          );
        },
      },
    ];

    selectedCounters.forEach(cid => {
      const counter = counterList.find(c => c.id === cid);
      baseCols.push({
        title: counter?.name || cid,
        dataIndex: counter?.name || cid,
        key: cid,
        width: 120,
        align: 'right',
        render: (v: unknown) => {
          const num = Number(v);
          return (
            <span className={num > 0 ? 'text-wine-700 font-medium' : 'text-cream-400'}>
              {num.toLocaleString()}
            </span>
          );
        },
      });
    });

    baseCols.push({
      title: '合计',
      dataIndex: '合计',
      key: 'total',
      width: 120,
      align: 'right',
      render: (v: unknown) => (
        <span className="text-gold-600 font-bold">{Number(v).toLocaleString()}</span>
      ),
    });

    return baseCols;
  }, [selectedCounters, counterList]);

  const maxCounterTotal = Math.max(...stats.counterConsumption.map(c => c.total), 1);

  const renderStatCard = (
    icon: React.ReactNode,
    title: string,
    value: string | number,
    sub: string,
    color: string
  ) => (
    <Card className="card-elegant !rounded-xl">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-cream-500 mb-2">{title}</p>
          <p className="text-2xl font-bold" style={{ color }}>{typeof value === 'number' ? value.toLocaleString() : value}</p>
          <p className="text-xs text-cream-400 mt-1">{sub}</p>
        </div>
        <div
          className="p-3 rounded-xl"
          style={{ backgroundColor: `${color}15`, color }}
        >
          {icon}
        </div>
      </div>
    </Card>
  );

  const getHeatColor = (value: number, max: number) => {
    const ratio = max > 0 ? value / max : 0;
    if (ratio === 0) return '#FAF8F5';
    if (ratio < 0.25) return '#F5E6E7';
    if (ratio < 0.5) return '#E8C5C8';
    if (ratio < 0.75) return '#BC5E68';
    return '#722F37';
  };

  const renderHeatmap = () => {
    if (heatmapData.length === 0) {
      return <Empty description="暂无数据" />;
    }
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const counterNames = [...new Set(heatmapData.map(d => d.counterName))];
    const globalMax = heatmapData[0]?.maxValue || 1;

    return (
      <div className="p-4">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-2 text-left text-sm text-cream-500 font-medium w-24">品牌区 / 星期</th>
                {weekdays.map(wd => (
                  <th key={wd} className="p-2 text-center text-sm text-cream-500 font-medium">{wd}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {counterNames.map(cname => (
                <tr key={cname}>
                  <td className="p-2 text-sm font-medium text-wine-700">{cname}</td>
                  {weekdays.map(wd => {
                    const cell = heatmapData.find(d => d.counterName === cname && d.weekday === wd);
                    const val = cell?.value || 0;
                    return (
                      <td key={wd} className="p-1">
                        <Tooltip title={`消耗：${val}`}>
                          <div
                            className="w-full h-10 rounded flex items-center justify-center text-xs font-medium transition-all hover:scale-105 cursor-default"
                            style={{
                              backgroundColor: getHeatColor(val, globalMax),
                              color: val / globalMax > 0.5 ? '#fff' : '#2C2C2C',
                            }}
                          >
                            {val > 0 ? val : ''}
                          </div>
                        </Tooltip>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-end mt-4 gap-2 text-xs text-cream-500">
          <span>低</span>
          {['#FAF8F5', '#F5E6E7', '#E8C5C8', '#BC5E68', '#722F37'].map((c, i) => (
            <div key={i} className="w-6 h-4 rounded" style={{ backgroundColor: c }} />
          ))}
          <span>高</span>
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fade-in-up space-y-6">
      <Card className="card-elegant">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gold-500" />
            <span className="text-sm text-wine-700 font-medium">日期：</span>
            <RangePicker
              value={dateRange as RangePickerProps['value']}
              onChange={(val) => setDateRange(val as [dayjs.Dayjs | null, dayjs.Dayjs | null])}
              className="!w-64"
            />
          </div>
          <div className="flex items-center gap-2 min-w-0 flex-1 max-w-sm">
            <span className="text-sm text-wine-700 font-medium shrink-0">品牌区：</span>
            <Select
              mode="multiple"
              value={selectedCounters}
              onChange={setSelectedCounters}
              placeholder="选择品牌区"
              className="!min-w-0 !flex-1"
              maxTagCount={2}
            >
              {counterList.map(c => (
                <Option key={c.id} value={c.id}>{c.name}</Option>
              ))}
            </Select>
          </div>
          <div className="flex items-center gap-2 min-w-0 flex-1 max-w-sm">
            <Package className="w-4 h-4 text-gold-500 shrink-0" />
            <span className="text-sm text-wine-700 font-medium shrink-0">耗材：</span>
            <Select
              mode="multiple"
              value={selectedMaterials}
              onChange={setSelectedMaterials}
              placeholder="选择耗材类型"
              className="!min-w-0 !flex-1"
              maxTagCount={2}
            >
              {MATERIAL_TYPES.map(m => (
                <Option key={m} value={m}>{MATERIAL_CONFIG[m].name}</Option>
              ))}
            </Select>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Activity className="w-4 h-4 text-gold-500" />
            <span className="text-sm text-wine-700 font-medium">仅活动日</span>
            <Switch checked={onlyActivity} onChange={setOnlyActivity} />
          </div>
        </div>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          {renderStatCard(
            <Package className="w-6 h-6" />,
            '总消耗量',
            stats.total.toLocaleString(),
            `${stats.days} 天累计`,
            '#722F37'
          )}
        </Col>
        <Col xs={24} sm={12} lg={6}>
          {renderStatCard(
            <BarChart3 className="w-6 h-6" />,
            '日均消耗量',
            stats.avgDaily.toLocaleString(),
            '平均每天',
            '#C9A962'
          )}
        </Col>
        <Col xs={24} sm={12} lg={6}>
          {renderStatCard(
            <Flame className="w-6 h-6" />,
            '活动日增量',
            `${stats.activityIncrease > 0 ? '+' : ''}${stats.activityIncrease}%`,
            '活动日 vs 非活动日',
            stats.activityIncrease > 0 ? '#FF6B35' : '#4CAF50'
          )}
        </Col>
        <Col xs={24} sm={12} lg={6}>
          {renderStatCard(
            <Award className="w-6 h-6" />,
            '消耗最高',
            `${stats.topCounter?.name || '-'} / ${stats.topMaterial?.name || '-'}`,
            `${stats.topCounter?.total.toLocaleString() || 0} / ${stats.topMaterial?.total.toLocaleString() || 0}${stats.topMaterial?.unit || ''}`,
            '#2A52BE'
          )}
        </Col>
      </Row>

      <Card className="card-elegant">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-wine-700 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-gold-500" />
            消耗趋势分析
          </h3>
        </div>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'line',
              label: '折线图',
              children: (
                <div className="h-96">
                  {lineChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={lineChartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#EDE4D4" />
                        <XAxis dataKey="date" tick={{ fill: '#5C252C', fontSize: 12 }} />
                        <YAxis tick={{ fill: '#5C252C', fontSize: 12 }} />
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #E8C5C8',
                            borderRadius: 8,
                            boxShadow: '0 4px 20px -2px rgba(114, 47, 55, 0.12)',
                          }}
                        />
                        <Legend />
                        {selectedCounters.map((cid, idx) => {
                          const counter = counterList.find(c => c.id === cid);
                          return (
                            <Line
                              key={cid}
                              type="monotone"
                              dataKey={counter?.name || cid}
                              stroke={COUNTER_COLORS[idx % COUNTER_COLORS.length]}
                              strokeWidth={2}
                              dot={{ r: 3, strokeWidth: 1 }}
                              activeDot={{ r: 5 }}
                            />
                          );
                        })}
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <Empty description="暂无数据" />
                  )}
                </div>
              ),
            },
            {
              key: 'bar',
              label: '堆叠柱状图',
              children: (
                <div className="h-96">
                  {barChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barChartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#EDE4D4" />
                        <XAxis dataKey="name" tick={{ fill: '#5C252C', fontSize: 12 }} />
                        <YAxis tick={{ fill: '#5C252C', fontSize: 12 }} />
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #E8C5C8',
                            borderRadius: 8,
                            boxShadow: '0 4px 20px -2px rgba(114, 47, 55, 0.12)',
                          }}
                        />
                        <Legend />
                        {selectedMaterials.map(m => (
                          <Bar
                            key={m}
                            dataKey={MATERIAL_CONFIG[m].name}
                            stackId="a"
                            fill={MATERIAL_CONFIG[m].color}
                            radius={[0, 0, 0, 0]}
                          />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <Empty description="暂无数据" />
                  )}
                </div>
              ),
            },
            {
              key: 'heat',
              label: '热力图',
              children: renderHeatmap(),
            },
          ]}
        />
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card className="card-elegant h-full" title={
            <span className="text-wine-700 font-medium flex items-center gap-2">
              <Award className="w-4 h-4 text-gold-500" />
              品牌区消耗排行榜
            </span>
          }>
            <div className="space-y-4">
              {stats.counterConsumption.map((item, idx) => (
                <div key={item.id}>
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          idx === 0 ? 'bg-gold-500 text-white' :
                          idx === 1 ? 'bg-cream-400 text-wine-700' :
                          idx === 2 ? 'bg-wine-300 text-white' :
                          'bg-wine-50 text-wine-500'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <span className="font-medium text-wine-700">{item.name}</span>
                    </div>
                    <span className="text-sm text-gold-600 font-bold">{item.total.toLocaleString()}</span>
                  </div>
                  <Progress
                    percent={Math.round((item.total / maxCounterTotal) * 100)}
                    showInfo={false}
                    strokeColor={{ '0%': COUNTER_COLORS[idx % COUNTER_COLORS.length], '100%': '#D4949A' }}
                    trailColor="#F5E6E7"
                    size="small"
                  />
                </div>
              ))}
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card className="card-elegant h-full" title={
            <span className="text-wine-700 font-medium flex items-center gap-2">
              <Package className="w-4 h-4 text-gold-500" />
              耗材 TOP3
            </span>
          }>
            <div className="space-y-3">
              {stats.materialConsumption.slice(0, 3).map((item, idx) => (
                <div
                  key={item.type}
                  className="p-4 rounded-xl border transition-all hover:shadow-elegant"
                  style={{
                    backgroundColor: `${MATERIAL_CONFIG[item.type].color}08`,
                    borderColor: `${MATERIAL_CONFIG[item.type].color}25`,
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: MATERIAL_CONFIG[item.type].color }}
                      >
                        {idx + 1}
                      </span>
                      <div>
                        <div className="font-medium text-wine-700">{item.name}</div>
                        <div className="text-xs text-cream-500">单位：{item.unit}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-end justify-between">
                    <div className="text-2xl font-bold" style={{ color: MATERIAL_CONFIG[item.type].color }}>
                      {item.total.toLocaleString()}
                    </div>
                    <Tag
                      className="!m-0"
                      style={{
                        backgroundColor: `${MATERIAL_CONFIG[item.type].color}15`,
                        color: MATERIAL_CONFIG[item.type].color,
                        border: `1px solid ${MATERIAL_CONFIG[item.type].color}30`,
                      }}
                    >
                      {Math.round((item.total / stats.total) * 100)}%
                    </Tag>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      <Card className="card-elegant">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setShowDetailTable(v => !v)}
        >
          <h3 className="text-lg font-bold text-wine-700 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-gold-500" />
            消耗明细表
          </h3>
          <div className="flex items-center gap-2 text-gold-600 text-sm font-medium">
            {showDetailTable ? (
              <>
                收起 <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                展开 <ChevronDown className="w-4 h-4" />
              </>
            )}
          </div>
        </div>
        {showDetailTable && (
          <div className="mt-4 animate-fade-in-up">
            <Table
              dataSource={detailTableData}
              columns={detailColumns}
              scroll={{ x: 800 }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条记录`,
              }}
              size="middle"
            />
          </div>
        )}
      </Card>
    </div>
  );
}
