import type { ClothingType, DamageLocation, UpcycleIdea, Difficulty } from '@/types'

interface IdeaTemplate {
  title: string
  description: string
  difficulty: Difficulty
  estimatedTime: string
  requiredMaterialIds: string[]
  steps: string[]
  applicableTypes: ClothingType[]
  applicableDamages?: DamageLocation[]
}

const ideaTemplates: IdeaTemplate[] = [
  {
    title: '改围裙',
    description: '把旧衬衫改造成厨房围裙，保留扣子作为装饰，背部面料做腰带，实用又有故事感。',
    difficulty: '简单',
    estimatedTime: '1-2小时',
    requiredMaterialIds: ['scissors', 'needle', 'pins'],
    steps: [
      '将衬衫平铺，从肩线处剪开，保留前片完整',
      '剪掉袖子，沿袖窿处修齐边缘',
      '用背部面料剪两条长条做腰带',
      '将腰带缝在围裙两侧',
      '锁边处理所有剪裁边缘',
      '熨烫平整，完成！'
    ],
    applicableTypes: ['衬衫'],
  },
  {
    title: '改抱枕套',
    description: '利用衬衫的柔软面料和精美扣子，制作一个别致的抱枕套，扣子成为天然装饰。',
    difficulty: '简单',
    estimatedTime: '1-2小时',
    requiredMaterialIds: ['scissors', 'needle', 'pins', 'fabric'],
    steps: [
      '测量抱枕尺寸，在衬衫上标记裁剪线',
      '剪下两片等大的面料，保留一排扣子作为装饰',
      '将两片正面相对，三边缝合',
      '翻转到正面，通过扣子开口塞入抱枕芯',
      '调整形状，完成！'
    ],
    applicableTypes: ['衬衫'],
  },
  {
    title: '改布艺花',
    description: '将衬衫剪成花瓣形状，叠加缝制成永不凋谢的布艺花朵，可做胸针或装饰。',
    difficulty: '中等',
    estimatedTime: '2-3小时',
    requiredMaterialIds: ['scissors', 'needle', 'fabric', 'embroidery'],
    steps: [
      '在衬衫面料上画出不同大小的花瓣形状',
      '剪下8-12片花瓣',
      '将每片花瓣边缘向内卷曲，用针线固定',
      '从大到小依次叠加花瓣，中心缝合固定',
      '缝上别针或发夹底座',
      '用剩余面料做叶子装饰'
    ],
    applicableTypes: ['衬衫'],
  },
  {
    title: '改手提包',
    description: '牛仔裤最耐磨的部位做成包身，口袋变成装饰，一条旧裤子变成潮牌手提包。',
    difficulty: '中等',
    estimatedTime: '3-4小时',
    requiredMaterialIds: ['scissors', 'needle', 'zipper', 'pins', 'fabric'],
    steps: [
      '将牛仔裤从裤裆处剪开，取两条裤腿',
      '拆开一条裤腿的侧缝，展开成大片面料',
      '剪出包身前后片和底部',
      '保留原有口袋作为装饰元素',
      '缝合包身三面，安装拉链',
      '用另一条裤腿剪出提手，缝合固定'
    ],
    applicableTypes: ['牛仔裤'],
  },
  {
    title: '改短裤',
    description: '长牛仔裤改短裤最简单，剪短裤腿即可，毛边风格还很时髦。',
    difficulty: '简单',
    estimatedTime: '30分钟',
    requiredMaterialIds: ['scissors'],
    steps: [
      '试穿牛仔裤，用粉笔标记想要的长度',
      '脱下后沿标记线剪断，预留2cm',
      '如想卷边，将边缘向内卷1-2cm',
      '用针线固定卷边，或保持毛边自然风格',
      '洗涤一次让边缘自然磨损更时髦'
    ],
    applicableTypes: ['牛仔裤'],
    applicableDamages: ['膝盖', '面料磨损'],
  },
  {
    title: '改拼布坐垫',
    description: '将牛仔裤不同深浅的蓝色部位剪成方块，拼缝成复古风坐垫，耐磨又好看。',
    difficulty: '中等',
    estimatedTime: '4-5小时',
    requiredMaterialIds: ['scissors', 'needle', 'pins', 'fabric'],
    steps: [
      '将牛仔裤拆解，剪出多个等大正方形布块',
      '按颜色深浅排列出想要的图案',
      '逐行缝合布块，再拼接各行',
      '剪一块背布，与拼布面正面相对缝合三边',
      '翻转后塞入填充棉，缝合最后一面',
      '整理形状，完成！'
    ],
    applicableTypes: ['牛仔裤'],
  },
  {
    title: '改抱枕',
    description: '毛衣的柔软质感最适合做抱枕，温暖的触感让家里多一份温馨。',
    difficulty: '简单',
    estimatedTime: '1-2小时',
    requiredMaterialIds: ['scissors', 'needle', 'pins'],
    steps: [
      '将毛衣平铺，测量抱枕大小画裁剪线',
      '剪下前后两片，注意沿编织纹理剪',
      '将两片正面相对，三边缝合',
      '翻转后从开口塞入抱枕芯',
      '用暗针法缝合开口',
      '整理形状，可以保留毛衣的罗纹边作装饰'
    ],
    applicableTypes: ['毛衣'],
  },
  {
    title: '改毛线帽',
    description: '把毛衣拆成毛线重新编织，或者直接利用毛衣的圆筒形状做成帽子。',
    difficulty: '中等',
    estimatedTime: '2-3小时',
    requiredMaterialIds: ['scissors', 'needle', 'unpicker'],
    steps: [
      '从毛衣下摆处剪下一段约25cm高的圆筒',
      '将一端用针线抽紧收口，形成帽顶',
      '翻转到正面，整理帽型',
      '用剩余面料做一条帽边装饰',
      '缝合帽边，可加一个毛球装饰',
      '试戴调整大小'
    ],
    applicableTypes: ['毛衣'],
  },
  {
    title: '改围脖',
    description: '利用毛衣的弹性面料，剪一段做成套头围脖，保暖又时尚。',
    difficulty: '简单',
    estimatedTime: '30分钟-1小时',
    requiredMaterialIds: ['scissors', 'needle'],
    steps: [
      '从毛衣上部剪下约30cm宽的一段圆筒',
      '保留原有的罗纹边作为围脖的边缘装饰',
      '将剪裁边缘向内折叠1cm',
      '用暗针法缝合边缘，防止脱线',
      '如果面料有洞，可用绣花方式装饰遮挡',
      '试戴确认舒适度'
    ],
    applicableTypes: ['毛衣'],
  },
  {
    title: '改购物袋',
    description: 'T恤的弹性面料做成购物袋，轻便可折叠，替代塑料袋环保出行。',
    difficulty: '简单',
    estimatedTime: '30分钟-1小时',
    requiredMaterialIds: ['scissors', 'needle'],
    steps: [
      '剪掉T恤的袖子和领口',
      '将T恤正面相对，缝合底部和两侧',
      '剪掉领口形成一个大的袋口',
      '用剪下的袖子面料做提手',
      '将提手缝在袋口两侧',
      '翻转到正面即可使用'
    ],
    applicableTypes: ['T恤'],
  },
  {
    title: '改拖把布',
    description: '棉质T恤吸水性好，剪成条状编成拖把布，废物利用零成本。',
    difficulty: '简单',
    estimatedTime: '20-30分钟',
    requiredMaterialIds: ['scissors'],
    steps: [
      '将T恤剪成3-4cm宽的长条',
      '将布条三根一组编成麻花辫',
      '编到合适长度后对折固定',
      '将多根编好的布条并排缝合在一起',
      '中间固定一个挂环方便使用',
      '完成！可随时替换新的布条'
    ],
    applicableTypes: ['T恤'],
  },
  {
    title: '改头带',
    description: '利用T恤的弹性面料做成运动头带，吸汗又舒适。',
    difficulty: '简单',
    estimatedTime: '20分钟',
    requiredMaterialIds: ['scissors', 'needle'],
    steps: [
      '从T恤下摆处剪下一条8cm宽的布条',
      '将布条对折，正面相对',
      '沿长边缝合形成管状',
      '翻转到正面，将两端缝合连接成环',
      '整理平整，可以叠加多圈增加厚度',
      '试戴调整松紧度'
    ],
    applicableTypes: ['T恤'],
  },
  {
    title: '改围巾',
    description: '裙子的轻盈面料做成飘逸围巾，印花的裙子尤其适合。',
    difficulty: '简单',
    estimatedTime: '1小时',
    requiredMaterialIds: ['scissors', 'needle', 'pins'],
    steps: [
      '将裙子沿侧缝拆开，展开成大片面料',
      '剪出一个长方形（约180cm×25cm）',
      '将长边向内折叠1cm，熨烫固定',
      '用卷边缝法缝合所有边缘',
      '两端可剪成流苏状增加装饰感',
      '轻柔手洗后晾干即可使用'
    ],
    applicableTypes: ['裙子'],
  },
  {
    title: '改桌布',
    description: '大面料的裙子很适合改小桌布，给餐桌添一份复古气质。',
    difficulty: '简单',
    estimatedTime: '1-2小时',
    requiredMaterialIds: ['scissors', 'needle', 'pins', 'fabric'],
    steps: [
      '测量桌面尺寸，加上垂边长度',
      '在裙子面料上标记裁剪线',
      '如一块面料不够，可拼接多块',
      '将边缘向内折叠2cm，熨烫固定',
      '缝合所有边缘，四角可做斜角处理',
      '熨烫平整后铺桌使用'
    ],
    applicableTypes: ['裙子'],
  },
  {
    title: '改布艺蝴蝶结',
    description: '裙子的漂亮面料做成蝴蝶结发饰或胸针，小巧精致。',
    difficulty: '中等',
    estimatedTime: '1-2小时',
    requiredMaterialIds: ['scissors', 'needle', 'fabric', 'embroidery'],
    steps: [
      '剪一块15cm×10cm的长方形面料',
      '将长边对折缝合形成环状',
      '在中间用针线抽紧形成蝴蝶结形状',
      '剪一小条面料包裹中间固定',
      '在背面缝上发夹或别针底座',
      '可叠加多层做更立体的效果'
    ],
    applicableTypes: ['裙子'],
  },
  {
    title: '改野餐垫',
    description: '外套的防风面料和保暖层，改造成户外野餐垫，一物多用。',
    difficulty: '中等',
    estimatedTime: '3-4小时',
    requiredMaterialIds: ['scissors', 'needle', 'pins', 'fabric'],
    steps: [
      '将外套沿缝线拆解，取最大面积面料',
      '将多块面料拼接成野餐垫大小（约150×200cm）',
      '如外套有防水层，保留作为正面',
      '拼接处用双线缝合加固',
      '边缘折叠2cm缝合，四角加扣环',
      '可加两根绑带方便卷起收纳'
    ],
    applicableTypes: ['外套'],
  },
  {
    title: '改宠物窝',
    description: '外套的保暖面料做成宠物窝垫，毛孩子也喜欢有主人气味的窝。',
    difficulty: '中等',
    estimatedTime: '2-3小时',
    requiredMaterialIds: ['scissors', 'needle', 'pins', 'fabric'],
    steps: [
      '将外套拆解成大片面料',
      '剪出圆形底片和环形侧壁',
      '侧壁对折缝合成圆环',
      '将侧壁与底片缝合',
      '塞入填充棉或旧衣物碎片',
      '缝合填充口，整理形状'
    ],
    applicableTypes: ['外套'],
  },
  {
    title: '改拼布毯',
    description: '多件旧外套的厚重面料拼成一条拼布毯，每块都是一段记忆。',
    difficulty: '困难',
    estimatedTime: '8-10小时',
    requiredMaterialIds: ['scissors', 'needle', 'sewing_machine', 'pins', 'fabric'],
    steps: [
      '收集3-5件外套，拆解后剪成等大正方形',
      '按颜色和质感排列出满意图案',
      '逐行缝合布块，注意对齐缝线',
      '拼接各行形成毯面',
      '准备一块背布和填充层',
      '三层一起绗缝固定，最后缝合边缘'
    ],
    applicableTypes: ['外套'],
  },
]

export function getRecommendations(
  clothingType: ClothingType,
  damageLocation?: DamageLocation
): Omit<UpcycleIdea, 'id' | 'clothingId' | 'favorited'>[] {
  const results = ideaTemplates
    .filter(template => {
      const typeMatch = template.applicableTypes.includes(clothingType)
      if (!typeMatch) return false
      if (template.applicableDamages && damageLocation && damageLocation !== '无破损') {
        return template.applicableDamages.includes(damageLocation) || template.applicableDamages.length === 0
      }
      return true
    })
    .map(template => ({
      title: template.title,
      description: template.description,
      difficulty: template.difficulty,
      estimatedTime: template.estimatedTime,
      requiredMaterialIds: template.requiredMaterialIds,
      steps: template.steps,
    }))

  if (results.length === 0) {
    return ideaTemplates
      .filter(t => t.applicableTypes.includes(clothingType))
      .slice(0, 3)
      .map(template => ({
        title: template.title,
        description: template.description,
        difficulty: template.difficulty,
        estimatedTime: template.estimatedTime,
        requiredMaterialIds: template.requiredMaterialIds,
        steps: template.steps,
      }))
  }

  return results.slice(0, 3)
}

export function determineGroup(
  difficulty: Difficulty,
  ownedMaterialIds: string[],
  requiredMaterialIds: string[]
): 'easy' | 'missing' | 'inspiration' {
  const missingCount = requiredMaterialIds.filter(id => !ownedMaterialIds.includes(id)).length
  if (difficulty === '简单' && missingCount === 0) return 'easy'
  if (missingCount > 0) return 'missing'
  return 'inspiration'
}
