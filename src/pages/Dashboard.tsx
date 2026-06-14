import { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, List, Tag, Button, Progress, App, Spin, Empty } from 'antd';
import {
  ExperimentOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
  ArrowRightOutlined,
  AlertOutlined,
} from '@ant-design/icons';
import { useStore } from '../store/useStore';
import { formatDate } from '../utils/dateUtils';
import dayjs from 'dayjs';
import type { PurchaseSuggestion } from '../types';
import type { ExpiringSoonItem } from '../api/stats';

type PageKey = 'dashboard' | 'ingredients' | 'openRecords' | 'usageHistory' | 'statistics';

interface Props {
  onNavigate: (key: PageKey) => void;
}

function Dashboard({ onNavigate }: Props) {
  const { message } = App.useApp();
  const ingredients = useStore((s) => s.ingredients);
  const openRecords = useStore((s) => s.openRecords);
  const usageRecords = useStore((s) => s.usageRecords);
  const alerts = useStore((s) => s.alerts);
  const getExpiringSoon = useStore((s) => s.getExpiringSoon);
  const getPurchaseSuggestions = useStore((s) => s.getPurchaseSuggestions);
  const fetchAlerts = useStore((s) => s.fetchAlerts);

  const [expiringSoon, setExpiringSoon] = useState<ExpiringSoonItem[]>([]);
  const [suggestions, setSuggestions] = useState<PurchaseSuggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [exp, sug] = await Promise.all([
          getExpiringSoon(7),
          getPurchaseSuggestions(),
        ]);
        setExpiringSoon(exp);
        setSuggestions(sug);
      } catch (e: unknown) {
        const err = e as Error;
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [getExpiringSoon, getPurchaseSuggestions]);

  const activeOpenRecords = openRecords.filter((r) => !r.isDiscarded);
  const discardedRecords = openRecords.filter((r) => r.isDiscarded);

  const todayUsages = usageRecords.filter(
    (u) => u.usageDate === dayjs().format('YYYY-MM-DD')
  );
  const todayUsedTypes = new Set(todayUsages.map((u) => u.ingredientId)).size;

  const dangerAlerts = alerts.filter((a) => a.level === 'danger' && !a.acknowledged);
  const warningAlerts = alerts.filter((a) => a.level === 'warning' && !a.acknowledged);

  const handleNavigate = (key: PageKey) => {
    onNavigate(key);
    message.info(`已切换到「${key}」`);
  };

  const getExpiryTag = (daysLeft: number) => {
    if (daysLeft < 0)
      return <span className="expiry-tag-danger">已超期 {Math.abs(daysLeft)} 天</span>;
    if (daysLeft <= 1) return <span className="expiry-tag-warning">剩余 {daysLeft} 天</span>;
    return <span className="expiry-tag-normal">剩余 {daysLeft} 天</span>;
  };

  const daysUntilExpiryLocal = (item: ExpiringSoonItem) => {
    return item.daysLeft;
  };

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={6}>
          <Card className="stat-card" hoverable onClick={() => handleNavigate('ingredients')}>
            <Statistic
              title="原料种类"
              value={ingredients.length}
              suffix="种"
              prefix={<ExperimentOutlined style={{ color: '#fa8c16' }} />}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>
              点击管理原料档案 <ArrowRightOutlined />
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card" hoverable onClick={() => handleNavigate('openRecords')}>
            <Statistic
              title="已开封原料"
              value={activeOpenRecords.length}
              suffix="件"
              valueStyle={{ color: activeOpenRecords.length > 0 ? '#1677ff' : '#8c8c8c' }}
              prefix={<CalendarOutlined />}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>
              点击查看开封管理 <ArrowRightOutlined />
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card" hoverable onClick={() => handleNavigate('usageHistory')}>
            <Statistic
              title="今日取用"
              value={todayUsedTypes}
              suffix={`类 / ${todayUsages.length}次`}
              valueStyle={{ color: '#389e0d' }}
              prefix={<CheckCircleOutlined />}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>
              点击查看取用记录 <ArrowRightOutlined />
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card" hoverable onClick={() => handleNavigate('statistics')}>
            <Statistic
              title="累计报废"
              value={discardedRecords.length}
              suffix="次"
              valueStyle={{ color: '#cf1322' }}
              prefix={<WarningOutlined />}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>
              点击查看统计报表 <ArrowRightOutlined />
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Card
            className="table-card"
            title={
              <span>
                <AlertOutlined style={{ color: '#fa8c16', marginRight: 8 }} />
                临期 / 过期提醒
                <Tag color="red" style={{ marginLeft: 8 }}>
                  严重 {dangerAlerts.length}
                </Tag>
                <Tag color="orange" style={{ marginLeft: 4 }}>
                  警告 {warningAlerts.length}
                </Tag>
              </span>
            }
            extra={
              <Button size="small" type="link" onClick={() => handleNavigate('openRecords')}>
                去处理 <ArrowRightOutlined />
              </Button>
            }
            style={{ height: '100%' }}
          >
            {loading ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <Spin />
              </div>
            ) : expiringSoon.length === 0 ? (
              <Empty description="✅ 所有原料状态正常" style={{ padding: '32px 0' }} />
            ) : (
              <List
                dataSource={expiringSoon.slice(0, 6)}
                renderItem={(item) => {
                  const daysLeft = daysUntilExpiryLocal(item);
                  const percent = Math.max(
                    0,
                    Math.min(100, Math.round((daysLeft / item.ingredient.openedDays) * 100))
                  );
                  return (
                    <List.Item key={item.id}>
                      <List.Item.Meta
                        avatar={
                          <div
                            style={{
                              width: 40,
                              height: 40,
                              background: '#fff7e6',
                              borderRadius: 8,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 20,
                            }}
                          >
                            🍰
                          </div>
                        }
                        title={
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <span>
                              {item.ingredient.name}
                              <Tag style={{ marginLeft: 8 }} color="default">
                                {item.ingredient.brand}
                              </Tag>
                            </span>
                            {getExpiryTag(daysLeft)}
                          </div>
                        }
                        description={
                          <div>
                            <Progress
                              percent={100 - percent}
                              size="small"
                              strokeColor={percent <= 20 ? '#cf1322' : percent <= 50 ? '#faad14' : '#52c41a'}
                              showInfo={false}
                              style={{ marginBottom: 4 }}
                            />
                            <div style={{ fontSize: 12, color: '#8c8c8c', display: 'flex', justifyContent: 'space-between' }}>
                              <span>开封日期：{formatDate(item.openDate)}</span>
                              <span>剩余：{item.remainingWeight}{item.ingredient.unit}</span>
                              <span>存放：{item.freezerLocation}</span>
                            </div>
                          </div>
                        }
                      />
                    </List.Item>
                  );
                }}
              />
            )}
          </Card>
        </Col>

        <Col span={12}>
          <Card
            className="table-card"
            title={
              <span>
                <ExperimentOutlined style={{ color: '#fa8c16', marginRight: 8 }} />
                采购建议（按紧急度）
              </span>
            }
            extra={
              <Button size="small" type="link" onClick={() => handleNavigate('statistics')}>
                查看详情 <ArrowRightOutlined />
              </Button>
            }
            style={{ height: '100%' }}
          >
            {loading ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <Spin />
              </div>
            ) : (
              <List
                dataSource={suggestions.slice(0, 6)}
                renderItem={(item) => {
                  const urgencyColor =
                    item.urgency === 'high' ? 'red' : item.urgency === 'medium' ? 'orange' : 'green';
                  const urgencyText =
                    item.urgency === 'high' ? '紧急' : item.urgency === 'medium' ? '建议' : '充足';
                  return (
                    <List.Item key={item.ingredientId}>
                      <List.Item.Meta
                        title={
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <span>
                              <strong>{item.ingredientName}</strong>
                              <Tag style={{ marginLeft: 8 }} color="default">
                                {item.brand}
                              </Tag>
                            </span>
                            <Tag color={urgencyColor}>{urgencyText}</Tag>
                          </div>
                        }
                        description={
                          <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                            <Row gutter={8}>
                              <Col span={8}>
                                当前库存：
                                <span style={{ color: item.currentStock <= 0 ? '#cf1322' : '#262626', fontWeight: 500 }}>
                                  {item.currentStock}
                                </span>
                                {item.unit}
                              </Col>
                              <Col span={8}>
                                日均用量：{item.avgDailyUsage}{item.unit}
                              </Col>
                              <Col span={8}>
                                建议采购：<strong style={{ color: '#fa8c16' }}>{item.suggestedQuantity}</strong>{item.unit}
                              </Col>
                            </Row>
                          </div>
                        }
                      />
                    </List.Item>
                  );
                }}
              />
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 20 }}>
        <Col span={24}>
          <Card
            className="table-card"
            title={
              <span>
                <CheckCircleOutlined style={{ color: '#389e0d', marginRight: 8 }} />
                当前开封中原料一览
              </span>
            }
          >
            <Row gutter={[16, 16]}>
              {activeOpenRecords.length === 0 ? (
                <Col span={24}>
                  <div style={{ textAlign: 'center', padding: '24px 0', color: '#8c8c8c' }}>
                    暂无开封中的原料
                  </div>
                </Col>
              ) : (
                activeOpenRecords.map((r) => {
                  const ing = ingredients.find((i) => i.id === r.ingredientId);
                  if (!ing) return null;
                  const daysLeft = expiringSoon.find((e) => e.id === r.id)?.daysLeft ??
                    Math.floor(
                      (dayjs(r.openDate).add(ing.openedDays, 'day').valueOf() - Date.now()) / (24 * 3600 * 1000)
                    );
                  const percent = Math.max(
                    0,
                    Math.min(100, Math.round((r.remainingWeight / ing.totalWeight) * 100))
                  );
                  return (
                    <Col span={8} key={r.id}>
                      <Card
                        size="small"
                        style={{
                          borderLeft:
                            daysLeft < 0
                              ? '4px solid #cf1322'
                              : daysLeft <= 1
                              ? '4px solid #faad14'
                              : '4px solid #52c41a',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <strong>{ing.name}</strong>
                          {getExpiryTag(daysLeft)}
                        </div>
                        <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 8 }}>
                          {ing.brand} · 批次 {ing.batch}
                        </div>
                        <Progress
                          percent={percent}
                          size="small"
                          format={(p) => `${p}% (${r.remainingWeight}${ing.unit})`}
                        />
                        <div
                          style={{
                            marginTop: 8,
                            fontSize: 12,
                            color: '#595959',
                            display: 'flex',
                            justifyContent: 'space-between',
                          }}
                        >
                          <span>👤 {r.operator}</span>
                          <span>📅 {formatDate(r.openDate)}</span>
                          <span>❄️ {r.freezerLocation}</span>
                        </div>
                      </Card>
                    </Col>
                  );
                })
              )}
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Dashboard;
