import { EmailComponent, EmailTemplate } from '@/types/email';
import { generateId } from './id';

function c(type: EmailComponent['type'], overrides: Partial<EmailComponent> = {}): EmailComponent {
  const defaults = getComponentDefaultProps(type);
  return {
    id: generateId(),
    type,
    properties: { ...defaults, ...overrides.properties },
    ...(overrides.children ? { children: overrides.children } : {}),
  };
}

import { getComponentDefaultProps } from './exportHtml';

function heading(text: string, color = '#1a1a1a', align = 'center', fontSize = 28): EmailComponent {
  return c('heading', { properties: { text, color, align, fontSize } });
}

function paragraph(text: string, align = 'left', color = '#333333', fontSize = 16): EmailComponent {
  return c('paragraph', { properties: { text, align, color, fontSize } });
}

function button(text: string, url: string, bgColor = '#3b82f6', color = '#ffffff'): EmailComponent {
  return c('button', { properties: { text, url, backgroundColor: bgColor, color } });
}

function image(prompt: string): EmailComponent {
  return c('image', { properties: { src: `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prompt)}&image_size=landscape_16_9` } });
}

function divider(): EmailComponent {
  return c('divider');
}

function spacer(height = 20): EmailComponent {
  return c('spacer', { properties: { height } });
}

function footer(company: string): EmailComponent {
  return c('footer', { properties: { text: `© 2026 ${company}\n地址：XX省XX市XX区XX路XX号\n退订邮件 | 联系我们` } });
}

function socialIcons(): EmailComponent {
  return c('social-icons');
}

export const presetTemplates: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt' | 'thumbnail'>[] = [
  {
    name: '营销活动',
    backgroundColor: '#f3f4f6',
    components: [
      image('flash sale promotional banner with discount tags and vibrant red and gold colors'),
      spacer(16),
      heading('🔥 限时特惠 全场低至3折', '#e11d48'),
      paragraph('亲爱的 {{name}}，我们为您精心挑选了超值优惠！限时3天，错过不再有。', 'center'),
      button('立即抢购', 'https://example.com/sale', '#e11d48'),
      divider(),
      c('two-column', {
        properties: { columnRatio: '50,50', padding: '10px 20px', gap: 10 },
        children: [
          [paragraph('🎁 满减优惠\n满200减50', 'center', '#e11d48', 14)],
          [paragraph('🚚 免费配送\n全场包邮', 'center', '#e11d48', 14)],
        ],
      }),
      divider(),
      footer('星辰商城'),
    ],
  },
  {
    name: '产品发布',
    backgroundColor: '#0f172a',
    components: [
      image('sleek product launch announcement dark background with neon blue accents'),
      spacer(20),
      heading('全新 X1 Pro 正式发布', '#ffffff', 'center', 32),
      paragraph('突破性的性能提升，前所未有的使用体验。X1 Pro 带来革命性的改变。', 'center', '#94a3b8'),
      button('了解更多', 'https://example.com/product', '#3b82f6'),
      spacer(20),
      c('three-column', {
        properties: { columnRatio: '33,34,33', padding: '10px 20px', gap: 10 },
        children: [
          [paragraph('⚡ 超强性能\n提升200%', 'center', '#60a5fa', 14)],
          [paragraph('🔋 续航持久\n续航48小时', 'center', '#60a5fa', 14)],
          [paragraph('🎯 精准操控\n毫秒级响应', 'center', '#60a5fa', 14)],
        ],
      }),
      footer('TechVision'),
    ],
  },
  {
    name: '订单确认',
    backgroundColor: '#f0fdf4',
    components: [
      spacer(10),
      heading('✅ 订单确认', '#16a34a', 'center', 26),
      paragraph('亲爱的 {{name}}，您的订单已确认！', 'center', '#166534'),
      divider(),
      heading('订单详情', '#1a1a1a', 'left', 20),
      paragraph('订单号：{{order_id}}\n下单时间：{{date}}\n收件邮箱：{{email}}', 'left', '#333333', 14),
      divider(),
      heading('物流信息', '#1a1a1a', 'left', 20),
      paragraph('预计3-5个工作日内送达，您可以在订单详情页查看物流状态。', 'left', '#333333', 14),
      button('查看订单', 'https://example.com/order', '#16a34a'),
      footer('绿色生活商城'),
    ],
  },
  {
    name: '新闻简报',
    backgroundColor: '#eff6ff',
    components: [
      spacer(10),
      heading('📰 每周简报', '#1e40af', 'center', 26),
      paragraph('{{date}} | 第42期', 'center', '#6b7280', 13),
      divider(),
      heading('本周热点', '#1e40af', 'left', 20),
      paragraph('AI技术持续突破，多款产品亮相科技峰会。全球碳中和进程加速，新能源投资创新高。', 'left'),
      button('阅读全文', 'https://example.com/news/1', '#1e40af'),
      divider(),
      heading('行业动态', '#1e40af', 'left', 20),
      paragraph('跨境电商新规出台，海外仓布局加速。5G覆盖率突破80%，应用场景持续拓展。', 'left'),
      button('阅读全文', 'https://example.com/news/2', '#1e40af'),
      divider(),
      socialIcons(),
      footer('科技前沿周刊'),
    ],
  },
  {
    name: '欢迎邮件',
    backgroundColor: '#faf5ff',
    components: [
      image('welcome email banner with confetti and celebration theme purple and gold'),
      spacer(16),
      heading('🎉 欢迎加入！', '#7c3aed', 'center', 30),
      paragraph('亲爱的 {{name}}，感谢您注册 {{company}}！\n我们很高兴您的加入，让我们一起开始精彩旅程。', 'center'),
      spacer(10),
      heading('快速开始', '#7c3aed', 'left', 20),
      c('two-column', {
        properties: { columnRatio: '50,50', padding: '10px 20px', gap: 10 },
        children: [
          [paragraph('1️⃣ 完善个人资料\n让推荐更精准', 'left', '#555', 14)],
          [paragraph('2️⃣ 探索热门内容\n发现感兴趣的话题', 'left', '#555', 14)],
        ],
      }),
      button('开始探索', 'https://example.com/start', '#7c3aed'),
      footer('CloudNest'),
    ],
  },
  {
    name: '活动邀请',
    backgroundColor: '#fff7ed',
    components: [
      image('elegant event invitation banner with gold and navy blue decorations'),
      spacer(16),
      heading('诚挚邀请', '#92400e', 'center', 30),
      paragraph('亲爱的 {{name}}，\n诚邀您参加 2026 年度创新峰会', 'center', '#78350f'),
      spacer(10),
      heading('📅 活动信息', '#92400e', 'left', 20),
      paragraph('时间：2026年7月15日 09:00-18:00\n地点：上海国际会议中心\n主题：创新驱动 · 智启未来', 'left', '#333'),
      divider(),
      paragraph('席位有限，请尽早确认出席', 'center', '#92400e', 14),
      button('确认出席', 'https://example.com/rsvp', '#d97706'),
      footer('创新峰会组委会'),
    ],
  },
  {
    name: '密码重置',
    backgroundColor: '#f8fafc',
    components: [
      spacer(30),
      heading('🔒 密码重置请求', '#dc2626', 'center', 26),
      paragraph('我们收到了您的密码重置请求。如果这不是您的操作，请忽略此邮件。', 'center', '#374151'),
      spacer(20),
      paragraph('点击下方按钮重置您的密码：', 'center', '#374151'),
      button('重置密码', 'https://example.com/reset-password?token=xxx', '#dc2626'),
      spacer(20),
      paragraph('此链接将在24小时后失效。\n如按钮无法点击，请复制以下链接到浏览器：\nhttps://example.com/reset-password?token=xxx', 'center', '#6b7280', 13),
      divider(),
      footer('安全团队'),
    ],
  },
  {
    name: '客户回访',
    backgroundColor: '#f0fdf4',
    components: [
      spacer(10),
      heading('💭 我们想听听您的声音', '#059669', 'center', 26),
      paragraph('亲爱的 {{name}}，感谢您选择 {{company}}！\n我们非常重视您的使用体验，希望能听到您的宝贵意见。', 'center'),
      divider(),
      heading('满意度调查', '#059669', 'left', 20),
      paragraph('只需2分钟，您的每一条反馈都将帮助我们做得更好。完成问卷还有机会获得优惠券！', 'left'),
      button('开始调查', 'https://example.com/survey', '#059669'),
      divider(),
      paragraph('如有任何疑问，请随时联系我们的客服团队。', 'center', '#6b7280', 13),
      footer('{{company}}'),
    ],
  },
  {
    name: '节日问候',
    backgroundColor: '#fef2f2',
    components: [
      image('festive holiday greeting card with warm red and gold decorations snowflakes'),
      spacer(16),
      heading('🎊 新年快乐', '#dc2626', 'center', 32),
      paragraph('亲爱的 {{name}}，\n在新年到来之际，{{company}} 全体员工祝您\n万事如意、阖家欢乐！', 'center', '#991b1b'),
      divider(),
      paragraph('感谢您过去一年的支持与信任，\n新的一年我们将继续为您提供更优质的服务。', 'center', '#7f1d1d'),
      spacer(10),
      socialIcons(),
      footer('{{company}}'),
    ],
  },
  {
    name: '周报摘要',
    backgroundColor: '#f1f5f9',
    components: [
      spacer(10),
      heading('📊 本周数据概览', '#0369a1', 'center', 26),
      paragraph('{{date}} | 团队周报', 'center', '#64748b', 13),
      divider(),
      c('three-column', {
        properties: { columnRatio: '33,34,33', padding: '10px 20px', gap: 10 },
        children: [
          [paragraph('访客数\n12,345', 'center', '#0369a1', 16)],
          [paragraph('转化率\n3.2%', 'center', '#0369a1', 16)],
          [paragraph('收入\n¥89,000', 'center', '#0369a1', 16)],
        ],
      }),
      divider(),
      heading('本周亮点', '#0369a1', 'left', 20),
      paragraph('• 新用户注册量增长15%\n• 移动端访问占比首次超过70%\n• 客户满意度评分提升至4.8', 'left'),
      button('查看完整报告', 'https://example.com/report', '#0369a1'),
      divider(),
      heading('下周计划', '#0369a1', 'left', 20),
      paragraph('• 上线v2.0版本新功能\n• 启动Q3营销活动\n• 完成用户调研分析', 'left'),
      footer('数据洞察团队'),
    ],
  },
];

export function createTemplateFromPreset(index: number): EmailTemplate {
  const preset = presetTemplates[index];
  return {
    id: generateId(),
    name: preset.name,
    backgroundColor: preset.backgroundColor,
    components: preset.components,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    thumbnail: '',
  };
}
