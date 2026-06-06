import type { Template } from '../types';

export const templates: Template[] = [
  {
    id: 'argumentative',
    name: '议论文',
    category: '写作',
    icon: 'message-square',
    description: '标准议论文结构，论点明确，论据充分',
    content: `<h1>议论文标题</h1>
<p><strong>引言部分</strong>：简述背景，引出话题，提出中心论点。</p>
<h2>一、分论点一</h2>
<p>阐述第一个分论点，结合具体事例、数据或名人名言进行论证。说明该论点的合理性和重要性。</p>
<h2>二、分论点二</h2>
<p>阐述第二个分论点，从另一个角度支撑中心论点。可以使用对比论证、类比论证等方法。</p>
<h2>三、分论点三</h2>
<p>阐述第三个分论点，进一步深化主题。可以联系现实，指出该观点的实际意义。</p>
<h2>四、反驳与回应</h2>
<p>简要提及可能的反对意见，然后进行有力的反驳，显示思考的全面性。</p>
<h2>结论</h2>
<p>总结全文，重申中心论点，发出呼吁或展望未来。</p>`
  },
  {
    id: 'book-review',
    name: '读后感',
    category: '写作',
    icon: 'book-open',
    description: '读书心得，内容介绍+个人感悟',
    content: `<h1>《书名》读后感</h1>
<p><strong>作品简介</strong>：作者XXX的《书名》是一部XXX类型的作品，讲述了......的故事。</p>
<h2>一、内容概述</h2>
<p>简要介绍书籍的主要内容、核心情节或主要观点。注意不要剧透过多关键情节。</p>
<h2>二、精彩片段</h2>
<p>选取书中让你印象深刻的段落或情节，分析其写作手法和表达效果。</p>
<blockquote>
<p>"这里可以引用书中的精彩原文..."</p>
</blockquote>
<h2>三、个人感悟</h2>
<p>谈谈这本书给你带来的启发和思考。可以结合自身经历，说说你从中学到了什么。</p>
<h2>四、推荐理由</h2>
<p>总结这本书的价值，向读者推荐，说明适合什么样的人群阅读。</p>
<p><em>完成于：XXXX年XX月XX日</em></p>`
  },
  {
    id: 'weekly-report',
    name: '周报',
    category: '工作',
    icon: 'calendar',
    description: '工作周报模板，本周总结+下周计划',
    content: `<h1>工作周报</h1>
<p><strong>姓名</strong>：XXX &nbsp;&nbsp; <strong>部门</strong>：XXX &nbsp;&nbsp; <strong>日期</strong>：XXXX年XX月XX日-XX月XX日</p>
<h2>一、本周工作完成情况</h2>
<ul>
<li><strong>项目A</strong>：完成了XXX功能的开发，进行了XXX测试，解决了XXX问题</li>
<li><strong>项目B</strong>：参与需求评审，输出设计文档，协调XXX资源</li>
<li><strong>日常工作</strong>：处理邮件XX封，参加会议XX次，协助同事完成XXX</li>
</ul>
<h2>二、工作成果与亮点</h2>
<p>本周取得的主要成绩：XXX指标提升XX%，提前完成XXX任务，获得了XXX好评。</p>
<h2>三、遇到的问题与解决方案</h2>
<p>在XXX工作中遇到了XXX困难，通过XXX方式解决。总结经验教训：...</p>
<h2>四、下周工作计划</h2>
<ul>
<li>继续推进XXX项目，目标是完成XXX</li>
<li>开始启动XXX新任务，预计XX时间完成</li>
<li>学习XXX技能/知识，提升工作能力</li>
</ul>
<h2>五、需要的支持与资源</h2>
<p>希望获得XXX方面的支持，需要协调XXX资源。</p>`
  },
  {
    id: 'wechat-article',
    name: '公众号文章',
    category: '新媒体',
    icon: 'smartphone',
    description: '微信公众号文章风格，吸引读者点击',
    content: `<h1>【标题】用一句话抓住读者眼球</h1>
<p><em>点击上方蓝字关注我们～</em></p>
<p>🌟 <strong>导语</strong>：用一个有趣的故事、热点事件或发人深省的问题开头，引起读者兴趣。</p>
<h2>📌 第一部分：痛点引入</h2>
<p>描述目标读者普遍遇到的问题或困惑，让读者产生共鸣。</p>
<blockquote>
<p>"可以引用一句名人名言或网络金句"</p>
</blockquote>
<h2>💡 第二部分：解决方案</h2>
<p>分点阐述解决问题的方法或思路，每点都要有实际可操作的建议。</p>
<p><strong>要点一：</strong>具体内容...</p>
<p><strong>要点二：</strong>具体内容...</p>
<p><strong>要点三：</strong>具体内容...</p>
<h2>🎯 第三部分：案例佐证</h2>
<p>举一个真实的案例或故事，证明以上方法的有效性。</p>
<h2>✨ 总结与互动</h2>
<p>总结全文要点，呼吁读者行动起来。</p>
<p><strong>【今日话题】</strong>你对此有什么看法？欢迎在评论区留言分享～</p>
<p>👉 如果觉得有用，别忘了<strong>点赞</strong> + <strong>在看</strong> + <strong>转发</strong>哦！</p>
<p>--------------------------</p>
<p><em>关注【公众号名称】，每天分享XXX干货</em></p>`
  },
  {
    id: 'story',
    name: '故事',
    category: '创作',
    icon: 'feather',
    description: '故事创作模板，起承转合完整结构',
    content: `<h1>故事标题</h1>
<h2>第一章：开端</h2>
<p>介绍故事发生的时间、地点、主要人物。描绘主人公的日常生活状态，为后续情节做铺垫。</p>
<p>"那是一个普通的早晨，XXX像往常一样..."</p>
<h2>第二章：发展</h2>
<p>一个意外事件打破了平静，主人公遇到了挑战或机遇。描述事件的经过和主人公的初步反应。</p>
<h2>第三章：高潮</h2>
<p>矛盾冲突达到顶点，主人公面临重大抉择。紧张的情节、激烈的冲突、情感的爆发都在这一部分展现。</p>
<h2>第四章：转折</h2>
<p>高潮过后，情况发生了变化。可能是问题得到解决，也可能是出现了新的状况。主人公有了新的认识或成长。</p>
<h2>第五章：结局</h2>
<p>故事的最终走向。各个人物的归宿，事件的最后结果。可以留下一点余味让读者思考。</p>
<p><em>（完）</em></p>`
  },
  {
    id: 'email',
    name: '邮件',
    category: '办公',
    icon: 'mail',
    description: '正式商务邮件格式规范',
    content: `<h1>邮件主题：简要说明邮件目的</h1>
<p><strong>收件人</strong>：XXX@xxx.com</p>
<p><strong>抄送</strong>：XXX@xxx.com</p>
<hr>
<p>尊敬的XXX先生/女士：</p>
<p>您好！</p>
<p>首先，感谢您在百忙之中阅读此邮件。我是XXX公司的XXX，就XXX事宜与您联系。</p>
<h2>一、事由说明</h2>
<p>简要说明发邮件的原因、背景和目的。</p>
<h2>二、具体内容</h2>
<p>详细阐述需要沟通的事项：</p>
<ul>
<li>要点一：具体说明</li>
<li>要点二：具体说明</li>
<li>要点三：具体说明</li>
</ul>
<h2>三、期望与请求</h2>
<p>希望对方在XX时间前给予回复，或需要对方提供什么支持。</p>
<p>如有任何疑问，请随时与我联系。</p>
<p>联系电话：XXX-XXXXXXX</p>
<p>期待您的回复！</p>
<p>此致<br>敬礼！</p>
<p><strong>XXX</strong><br>
XXX公司 | XXX职位<br>
电话：XXX-XXXXXXX | 邮箱：XXX@xxx.com<br>
地址：XX市XX区XX路XX号</p>`
  },
  {
    id: 'resume',
    name: '简历',
    category: '求职',
    icon: 'file-text',
    description: '个人简历，简洁专业展示优势',
    content: `<h1>张 三</h1>
<p>📱 138-XXXX-XXXX | 📧 zhangsan@email.com | 📍 北京市朝阳区</p>
<h2>🎯 求职意向</h2>
<p><strong>目标职位</strong>：高级前端工程师</p>
<p><strong>期望薪资</strong>：25K-35K</p>
<h2>💼 工作经历</h2>
<p><strong>XX科技有限公司</strong> | 前端工程师 | 2021.03 - 至今</p>
<ul>
<li>负责公司核心产品的前端架构设计与开发，使用React+TypeScript技术栈</li>
<li>优化首页加载性能，首屏时间从3.2s降至1.5s，提升用户体验</li>
<li>搭建组件库，提高团队开发效率30%</li>
</ul>
<p><strong>XX互联网公司</strong> | 前端开发 | 2019.07 - 2021.02</p>
<ul>
<li>参与电商平台的开发与维护，负责商品详情页、购物车等模块</li>
<li>使用Vue.js框架，配合后端完成接口联调</li>
</ul>
<h2>🎓 教育背景</h2>
<p><strong>XX大学</strong> | 计算机科学与技术 | 本科 | 2015.09 - 2019.06</p>
<h2>💻 专业技能</h2>
<ul>
<li><strong>前端框架</strong>：React、Vue、Next.js</li>
<li><strong>编程语言</strong>：TypeScript、JavaScript、Node.js</li>
<li><strong>其他技能</strong>：Webpack、Vite、Git、Docker</li>
</ul>
<h2>🏆 项目经历/获奖</h2>
<ul>
<li>2023年公司技术创新大赛二等奖</li>
<li>开源项目XXX获得GitHub 2000+ Stars</li>
</ul>`
  },
  {
    id: 'notice',
    name: '通知',
    category: '办公',
    icon: 'bell',
    description: '正式通知公告，格式规范',
    content: `<h1>关于XXXX的通知</h1>
<p style="text-align: right;"><strong>XX字〔XXXX〕XX号</strong></p>
<p>各部门、各单位：</p>
<p>为了XXXX目的，根据XXXX文件精神，经研究决定，现就有关事项通知如下：</p>
<h2>一、指导思想</h2>
<p>阐明开展此项工作的背景、目的和意义。</p>
<h2>二、主要内容</h2>
<p>详细说明通知的具体事项：</p>
<ul>
<li><strong>时间安排</strong>：XXXX年XX月XX日-XX月XX日</li>
<li><strong>参与范围</strong>：全体员工/各部门负责人</li>
<li><strong>具体要求</strong>：...</li>
</ul>
<h2>三、工作要求</h2>
<p>1. 提高认识，加强领导。各部门要高度重视此项工作...</p>
<p>2. 精心组织，狠抓落实。按照时间节点推进各项任务...</p>
<p>3. 加强沟通，及时反馈。工作进展中遇到的问题及时上报...</p>
<h2>四、联系方式</h2>
<p>联系人：XXX</p>
<p>联系电话：XXX-XXXXXXX</p>
<p>邮箱：XXX@xxx.com</p>
<p>特此通知。</p>
<p style="text-align: right;"><strong>XXXX单位（盖章）</strong></p>
<p style="text-align: right;">XXXX年XX月XX日</p>`
  }
];

export const getTemplateById = (id: string): Template | undefined => {
  return templates.find(t => t.id === id);
};

export const getTemplatesByCategory = (category: string): Template[] => {
  return templates.filter(t => t.category === category);
};

export const categories = ['全部', '写作', '工作', '新媒体', '创作', '办公', '求职'];
