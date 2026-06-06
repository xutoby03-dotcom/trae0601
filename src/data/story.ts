import { SceneNode } from '../types';

export const STORY_NODES: Record<string, SceneNode> = {
  intro: {
    id: 'intro',
    title: '序章',
    description: `
在遥远的艾尔兰德王国，和平持续了上百年。直到有一天，远古黑龙从千年沉睡中苏醒，它焚毁了边境的村庄，掳走了美丽的公主。

国王悲痛欲绝，向全国发布公告：谁能救出公主，就能获得半个王国的财富，并迎娶公主为妻。

你，一个刚刚结束修炼的年轻冒险者，站在了王城的广场上。你的手中只有一把生锈的短剑，但你心中燃烧着正义的火焰。

"我一定要救出公主！" 你握紧了拳头。
    `,
    options: [
      { text: '前往武器店购买装备', nextNodeId: 'weapon_shop' },
      { text: '直接出发去龙穴', nextNodeId: 'village_entrance' },
      { text: '先去酒馆打听消息', nextNodeId: 'tavern' },
      { text: '查看背包', nextNodeId: 'intro', givesItem: 'potion' },
    ],
    giveItem: 'wooden_sword',
    autoSave: true,
  },

  weapon_shop: {
    id: 'weapon_shop',
    title: '武器店',
    description: `
武器店里弥漫着钢铁和油的气味。老板是个留着大胡子的壮汉，正在擦拭一把长剑。

"哟，年轻人，看你这模样是要去打龙吧？别怪我没提醒你，就你那把小木剑，恐怕连龙鳞都砍不动。"

老板指了指货架上的武器："铁剑只要50金币，锁子甲80金币。当然，如果你有更多钱...嘿嘿。"

你看了看钱包里的100金币，陷入了沉思。
    `,
    options: [
      { text: '购买铁剑 (-50金币)', nextNodeId: 'weapon_shop_bought_sword', givesItem: 'iron_sword' },
      { text: '购买锁子甲 (-80金币)', nextNodeId: 'weapon_shop_bought_armor', givesItem: 'chain_mail' },
      { text: '什么都不买，离开', nextNodeId: 'village_entrance' },
    ],
  },

  weapon_shop_bought_sword: {
    id: 'weapon_shop_bought_sword',
    title: '武器店',
    description: `
"好眼光！这把剑虽然不是什么神兵，但砍砍小怪绰绰有余。"

老板把铁剑递给你，你感觉手中沉甸甸的，心中多了几分底气。
    `,
    options: [
      { text: '购买锁子甲 (-80金币)', nextNodeId: 'weapon_shop_bought_both', givesItem: 'chain_mail' },
      { text: '离开武器店', nextNodeId: 'village_entrance' },
    ],
    giveItem: 'potion',
  },

  weapon_shop_bought_armor: {
    id: 'weapon_shop_bought_armor',
    title: '武器店',
    description: `
"嘿，懂得先保护自己是对的。活着才有输出嘛！"

你穿上锁子甲，感觉身体沉重了不少，但安全感也大大提升。
    `,
    options: [
      { text: '离开武器店', nextNodeId: 'village_entrance' },
    ],
  },

  weapon_shop_bought_both: {
    id: 'weapon_shop_bought_both',
    title: '武器店',
    description: `
"不错不错，现在的你看起来像个真正的冒险者了！祝你好运，年轻人！"

老板送给你一瓶治疗药水作为临别赠礼。
    `,
    options: [
      { text: '离开武器店', nextNodeId: 'village_entrance' },
    ],
    giveItem: 'potion',
  },

  tavern: {
    id: 'tavern',
    title: '醉龙酒馆',
    description: `
酒馆里人声鼎沸，冒险者们三三两两地聚在一起喝酒吹牛。

角落坐着一个戴着斗篷的神秘老人，他似乎在注意着你。

吧台后的老板娘擦着杯子，看到你进来，露出了职业性的微笑。
    `,
    options: [
      { text: '和神秘老人搭话', nextNodeId: 'mysterious_old_man' },
      { text: '向老板娘打听消息', nextNodeId: 'tavern_keeper' },
      { text: '听其他冒险者聊天', nextNodeId: 'adventurer_talk' },
      { text: '离开酒馆', nextNodeId: 'village_entrance' },
    ],
  },

  mysterious_old_man: {
    id: 'mysterious_old_man',
    title: '神秘老人',
    description: `
你走到老人面前，他抬起头，浑浊的眼睛里似乎藏着无尽的智慧。

"年轻人，你也是去屠龙的吗？...呵呵，很多人都去了，但没有一个回来。"

老人从怀里掏出一颗闪闪发光的宝石。

"这是龙之眼，是我年轻时从一条沉睡的古龙那里得到的。据说它能削弱黑龙的力量。如果你愿意帮我一个小忙，我就把它送给你。"
    `,
    options: [
      { text: '"请说，我一定尽力！"', nextNodeId: 'old_man_quest' },
      { text: '"还是算了吧，我赶时间"', nextNodeId: 'tavern' },
    ],
  },

  old_man_quest: {
    id: 'old_man_quest',
    title: '老人的请求',
    description: `
"在村庄东边的古老神殿里，沉睡着我的女儿。五十年前，她被诅咒陷入了永恒的睡眠。只有用真爱之吻才能唤醒她...但我已经太老了，无法通过神殿的试炼。"

老人叹了口气："如果你能唤醒她，龙之眼就是你的。而且...我女儿醒来后，一定会好好报答你的。"
    `,
    options: [
      { text: '"我明白了，我去唤醒她"', nextNodeId: 'temple_entrance', setsFlag: 'accepted_old_man_quest' },
      { text: '"抱歉，我还有更重要的事"', nextNodeId: 'tavern' },
    ],
  },

  tavern_keeper: {
    id: 'tavern_keeper',
    title: '酒馆老板娘',
    description: `
"哟，小哥儿，想去打龙啊？姐姐劝你一句，那黑龙可不是好惹的。"

老板娘凑近了一些，压低声音说："不过呢，我听说龙穴的西边有个秘密入口，那里的守卫比较弱。但需要一把古老钥匙才能打开...听说那钥匙在暗黑骑士手里。"

她递给你一瓶药水："喏，这个送你，算姐姐给你饯行。活着回来啊。"
    `,
    options: [
      { text: '"谢谢老板娘！"', nextNodeId: 'tavern' },
    ],
    giveItem: 'potion',
    setFlag: 'knows_secret_entrance',
  },

  adventurer_talk: {
    id: 'adventurer_talk',
    title: '冒险者的闲聊',
    description: `
你走近一桌冒险者，他们正在聊关于龙穴的传闻。

"...听说那龙穴里除了黑龙，还有好多宝藏呢！金银珠宝堆积如山！"

"宝藏？命都没了要宝藏有啥用？我听说啊，那黑龙的弱点是它的左眼，那里有一道旧伤疤。"

"切，你咋知道的？你见过？"

"我...我也是听别人说的嘛！"
    `,
    options: [
      { text: '离开酒馆', nextNodeId: 'village_entrance' },
    ],
    setFlag: 'knows_dragon_weakness',
  },

  village_entrance: {
    id: 'village_entrance',
    title: '村庄入口',
    description: `
你站在村庄的入口处。前方是通往龙穴的道路，道路在森林中蜿蜒延伸。

西边的小路通向古老神殿，传说那里有远古的秘密。

东边则是暗黑骑士的废弃城堡，据说里面藏着通往龙穴的秘密通道。
    `,
    options: [
      { text: '沿主路前往龙穴', nextNodeId: 'forest_path' },
      { text: '前往古老神殿', nextNodeId: 'temple_entrance' },
      { text: '前往废弃城堡', nextNodeId: 'castle_entrance' },
      { text: '回村庄补给', nextNodeId: 'weapon_shop' },
    ],
    autoSave: true,
  },

  forest_path: {
    id: 'forest_path',
    title: '幽暗森林',
    description: `
森林里光线昏暗，树木高大茂密。你小心翼翼地前行，突然听到草丛中有动静。

一只绿色的史莱姆跳了出来，挡住了你的去路！
    `,
    options: [
      { text: '战斗！', nextNodeId: 'forest_victory', startsBattle: 'slime' },
      { text: '尝试绕过去', nextNodeId: 'forest_ambush' },
    ],
  },

  forest_victory: {
    id: 'forest_victory',
    title: '战斗胜利',
    description: `
史莱姆在你的攻击下化作一滩黏液。你继续向前走，发现路边有一个小箱子。

打开箱子，里面有一瓶治疗药水和一些金币！
    `,
    options: [
      { text: '继续前进', nextNodeId: 'forest_clearing' },
    ],
    giveItem: 'potion',
  },

  forest_ambush: {
    id: 'forest_ambush',
    title: '遭遇埋伏',
    description: `
你试图悄悄绕过史莱姆，但没走几步，一只哥布林从树后跳了出来！

"交出你的金币！" 哥布林挥舞着生锈的小刀喊道。
    `,
    options: [
      { text: '战斗！', nextNodeId: 'forest_clearing', startsBattle: 'goblin' },
    ],
  },

  forest_clearing: {
    id: 'forest_clearing',
    title: '森林空地',
    description: `
穿过密林，你来到一片开阔的空地。前方有一个岔路口：

左边的小路向上延伸，似乎通向一个山洞，里面传来狼嚎声。

右边的路继续向前，能看到远处龙穴入口的黑烟。

空地中央有一块大石头，上面刻着奇怪的符文，似乎是个休息的好地方。
    `,
    options: [
      { text: '在石头上休息一下', nextNodeId: 'forest_rest', healsPlayer: true },
      { text: '走左边去山洞看看', nextNodeId: 'wolf_cave' },
      { text: '走右边继续前往龙穴', nextNodeId: 'dragon_mountain' },
    ],
    autoSave: true,
  },

  forest_rest: {
    id: 'forest_rest',
    title: '短暂的休息',
    description: `
你坐在大石头上，闭上眼睛休息。温暖的阳光透过树叶洒在身上，你感觉体力和魔力都在慢慢恢复。

突然，你注意到石头下面好像有什么东西在闪闪发光...
    `,
    options: [
      { text: '查看一下', nextNodeId: 'found_treasure' },
      { text: '休息够了，继续前进', nextNodeId: 'forest_clearing' },
    ],
  },

  found_treasure: {
    id: 'found_treasure',
    title: '意外发现',
    description: `
你搬开石头，发现下面藏着一个小盒子！打开一看，里面有一瓶高级药水和100金币！

"太棒了！" 你喜出望外，把东西收好。
    `,
    options: [
      { text: '继续前进', nextNodeId: 'forest_clearing' },
    ],
    giveItem: 'hi_potion',
  },

  wolf_cave: {
    id: 'wolf_cave',
    title: '野狼洞穴',
    description: `
山洞里阴暗潮湿，散发着野兽的腥臭味。你小心翼翼地往里走，突然，两双绿色的眼睛在黑暗中亮起！

两只野狼从暗处扑了出来！
    `,
    options: [
      { text: '战斗！', nextNodeId: 'wolf_victory', startsBattle: 'wolf' },
      { text: '赶紧逃跑！', nextNodeId: 'forest_clearing' },
    ],
  },

  wolf_victory: {
    id: 'wolf_victory',
    title: '洞穴深处',
    description: `
野狼倒在地上不动了。你深入洞穴，发现了野狼的巢穴。

角落里有一具冒险者的遗骸，他的身边放着一把还算完好的铁剑，以及一些金币。

你默默为逝者祈祷，然后收下了装备——相信他也希望这些东西能帮助到有需要的人。
    `,
    options: [
      { text: '离开洞穴', nextNodeId: 'forest_clearing' },
    ],
    giveItem: 'iron_sword',
  },

  dragon_mountain: {
    id: 'dragon_mountain',
    title: '龙穴山脚',
    description: `
你终于来到了龙穴所在的山脚下。巨大的山洞入口冒着滚滚黑烟，空气中弥漫着硫磺的气味。

山洞门口站着一个骷髅兵，它空洞的眼眶里闪烁着幽火，手里握着生锈的长枪。

旁边还有一条隐蔽的小路，似乎绕到山的另一侧。
    `,
    options: [
      { text: '正面突破！', nextNodeId: 'skeleton_battle', startsBattle: 'skeleton' },
      { text: '走隐蔽小路', nextNodeId: 'secret_path' },
      { text: '先观察一下', nextNodeId: 'observe_entrance' },
    ],
    autoSave: true,
  },

  skeleton_battle: {
    id: 'skeleton_battle',
    title: '骷髅守卫',
    description: `
骷髅兵发出刺耳的怪叫，挥舞着长枪向你冲来！
    `,
    options: [
      { text: '继续', nextNodeId: 'cave_entrance', startsBattle: 'skeleton' },
    ],
  },

  cave_entrance: {
    id: 'cave_entrance',
    title: '龙穴入口',
    description: `
骷髅兵散落成一地骨头。你跨过它的残骸，进入了龙穴。

里面比想象中更加宽敞，火把在墙上忽明忽暗地燃烧。通道分向两个方向：

左边传来巨大的呼噜声，应该就是黑龙的巢穴了。

右边似乎有脚步声，可能还有其他守卫。
    `,
    options: [
      { text: '直接去黑龙巢穴', nextNodeId: 'dragon_lair' },
      { text: '先去右边看看', nextNodeId: 'orc_guard' },
    ],
  },

  secret_path: {
    id: 'secret_path',
    title: '隐蔽小路',
    description: `
你沿着小路绕到山的另一侧，发现了一扇锈迹斑斑的铁门，门上有一个古老的锁孔。

如果有古老钥匙的话，应该就能打开这扇门，从后面潜入龙穴...
    `,
    options: [
      { text: '使用古老钥匙开门', nextNodeId: 'secret_entrance', requiresItem: 'ancient_key' },
      { text: '回到正面入口', nextNodeId: 'dragon_mountain' },
    ],
  },

  secret_entrance: {
    id: 'secret_entrance',
    title: '秘密通道',
    description: `
古老钥匙完美地契合了锁孔，铁门"吱呀"一声打开了。

里面是一条狭窄的隧道，直通龙穴深处。你小心翼翼地前进，没有惊动任何人。

隧道的尽头，你看到了惊人的一幕——公主被关在一个巨大的笼子里，而黑龙正在另一边呼呼大睡！

你可以趁机救走公主，也可以悄悄接近黑龙，给它致命一击...
    `,
    options: [
      { text: '悄悄救走公主', nextNodeId: 'rescue_princess_stealth' },
      { text: '偷袭黑龙！', nextNodeId: 'dragon_sneak_attack', startsBattle: 'dragon' },
    ],
    setFlag: 'secret_path_used',
  },

  observe_entrance: {
    id: 'observe_entrance',
    title: '观察敌情',
    description: `
你躲在岩石后面观察了一会儿。骷髅兵似乎很警觉，一直站在门口不动。

不过你注意到，每隔一段时间，骷髅兵就会转过身去，背对洞口检查身后的情况。

也许可以趁这个机会溜进去？
    `,
    options: [
      { text: '趁骷髅兵转身时溜进去', nextNodeId: 'sneak_in_success' },
      { text: '还是正面战斗吧', nextNodeId: 'skeleton_battle', startsBattle: 'skeleton' },
      { text: '走隐蔽小路', nextNodeId: 'secret_path' },
    ],
  },

  sneak_in_success: {
    id: 'sneak_in_success',
    title: '潜入成功',
    description: `
你屏住呼吸，趁骷髅兵转身的瞬间，像猫一样溜进了龙穴。

完美！你成功避开了守卫。
    `,
    options: [
      { text: '继续前进', nextNodeId: 'cave_entrance' },
    ],
  },

  orc_guard: {
    id: 'orc_guard',
    title: '兽人守卫',
    description: `
你向右边的通道走去，转过一个弯，迎面撞上了一个高大的兽人战士！

"人类？！你怎么进来的？！" 兽人咆哮着举起了巨斧。
    `,
    options: [
      { text: '战斗！', nextNodeId: 'orc_victory', startsBattle: 'orc' },
      { text: '赶紧跑！', nextNodeId: 'cave_entrance' },
    ],
  },

  orc_victory: {
    id: 'orc_victory',
    title: '宝箱',
    description: `
兽人笨重地倒下了。你在它守卫的房间里发现了一个大宝箱！

打开一看，里面有一副板甲、几瓶药水，还有大量金币！
    `,
    options: [
      { text: '继续前进', nextNodeId: 'dragon_lair' },
    ],
    giveItem: 'plate_armor',
  },

  dragon_lair: {
    id: 'dragon_lair',
    title: '黑龙巢穴',
    description: `
你终于来到了黑龙的巢穴。

巨大的黑龙正盘踞在金币堆上睡觉，它的鳞片如同黑曜石般闪闪发光。每一次呼吸，鼻孔中都会喷出一缕青烟。

公主被关在不远处的一个金色笼子里，她看到你，眼睛里充满了惊喜，但她不敢出声，怕惊醒黑龙。

你注意到黑龙的左眼上确实有一道旧伤疤——看来酒馆里的冒险者说的是真的。
    `,
    options: [
      { text: '大声挑战黑龙！', nextNodeId: 'dragon_battle', startsBattle: 'dragon' },
      { text: '使用龙之眼削弱黑龙', nextNodeId: 'dragon_weakened', requiresItem: 'dragon_eye' },
      { text: '悄悄救走公主', nextNodeId: 'rescue_princess_stealth' },
    ],
    autoSave: true,
  },

  dragon_weakened: {
    id: 'dragon_weakened',
    title: '龙之眼的力量',
    description: `
你举起龙之眼，宝石发出耀眼的光芒！

黑龙被光芒惊醒，发出痛苦的咆哮。它的力量似乎被大大削弱了，鳞片失去了光泽，动作也变得迟缓。

"该死的人类...你怎么会有那个东西？！"
    `,
    options: [
      { text: '趁现在攻击！', nextNodeId: 'dragon_battle_weak', startsBattle: 'dragon_weak' },
    ],
  },

  dragon_battle: {
    id: 'dragon_battle',
    title: '决战黑龙',
    description: `
黑龙被你的声音惊醒，它张开巨大的翅膀，整个洞穴都在震动。

"渺小的人类，竟敢打扰我的沉睡？！我要把你烧成灰烬！"
    `,
    options: [
      { text: '战斗！', nextNodeId: 'dragon_victory', startsBattle: 'dragon' },
    ],
  },

  dragon_battle_weak: {
    id: 'dragon_battle_weak',
    title: '决战黑龙',
    description: `
虚弱的黑龙愤怒地向你扑来，但它的速度明显慢了很多！

"我...我不甘心...！"
    `,
    options: [
      { text: '战斗！', nextNodeId: 'dragon_victory', startsBattle: 'dragon_weak' },
    ],
  },

  dragon_victory: {
    id: 'dragon_victory',
    title: '胜利！',
    description: `
经过一番苦战，黑龙终于发出最后一声哀鸣，重重地倒在了金币堆上，不再动弹。

你赢了！你真的打败了传说中的黑龙！

公主激动地流下了眼泪："谢谢你...勇敢的冒险者。你救了我，也救了整个王国。"

你打开笼子，公主扑进了你的怀里。
    `,
    options: [
      { text: '带公主回王城', nextNodeId: 'ending_good' },
    ],
    setFlag: 'defeated_dragon',
  },

  rescue_princess_stealth: {
    id: 'rescue_princess_stealth',
    title: '秘密营救',
    description: `
你蹑手蹑脚地走到笼子旁边，用剑撬开了锁。

"嘘..." 你示意公主不要出声。

公主点点头，小心翼翼地走出笼子。就在你们准备离开的时候，公主的裙子勾到了一个金币...

"叮——"

清脆的响声在寂静的洞穴中回荡。黑龙的眼睛睁开了！
    `,
    options: [
      { text: '挡在公主身前，迎战黑龙！', nextNodeId: 'dragon_battle', startsBattle: 'dragon' },
      { text: '拉着公主快跑！', nextNodeId: 'escape_attempt' },
    ],
  },

  escape_attempt: {
    id: 'escape_attempt',
    title: '惊险逃亡',
    description: `
你拉着公主的手拼命向外跑！黑龙在身后发出愤怒的咆哮，火焰从你身边掠过，烧焦了你的衣角。

你们一路冲出龙穴，黑龙没有追出来——它似乎受了重伤，无法长时间飞行。

公主喘着气说："我们...我们成功了？"
    `,
    options: [
      { text: '带公主回王城', nextNodeId: 'ending_neutral' },
    ],
    setFlag: 'escaped_with_princess',
  },

  temple_entrance: {
    id: 'temple_entrance',
    title: '古老神殿',
    description: `
古老神殿坐落在村庄西边的山顶。神殿的大门已经半塌，但依然能看出它曾经的辉煌。

门口有两个石像守卫，它们的眼睛似乎在随着你的移动而转动。

神殿入口处刻着一行古老的文字："唯有心怀真爱与勇气之人，方能通过试炼。"
    `,
    options: [
      { text: '进入神殿', nextNodeId: 'temple_trial_1' },
      { text: '离开', nextNodeId: 'village_entrance' },
    ],
  },

  temple_trial_1: {
    id: 'temple_trial_1',
    title: '第一试炼：勇气',
    description: `
你走进神殿，大门在你身后"砰"地一声关上了。

一个空灵的声音响起："第一试炼——勇气。面对你内心的恐惧，证明你有拯救他人的决心。"

突然，你的面前出现了一个幻影——那是你自己，但浑身是伤，倒在地上痛苦地呻吟。

"放弃吧...你救不了任何人的..." 幻影虚弱地说。
    `,
    options: [
      { text: '"我绝不会放弃！"', nextNodeId: 'temple_trial_2' },
      { text: '"也许...你说得对..."', nextNodeId: 'temple_fail' },
    ],
  },

  temple_trial_2: {
    id: 'temple_trial_2',
    title: '第二试炼：真爱',
    description: `
"很好...你通过了第一试炼。现在——第二试炼：真爱。"

你的面前出现了三个身影，她们都长得一模一样，都是沉睡的少女。

"三个之中只有一个是真正的沉睡者。另外两个是幻象。用你的心去感受，找到真正的她，然后吻醒她。"

三个少女都沉睡着，面容美丽而安详。你仔细观察，发现左边的少女眼角有一滴未干的泪水，中间的少女嘴角带着微笑，右边的少女眉头微蹙，似乎在做噩梦。
    `,
    options: [
      { text: '吻左边的少女', nextNodeId: 'temple_wrong' },
      { text: '吻中间的少女', nextNodeId: 'temple_wrong' },
      { text: '吻右边的少女', nextNodeId: 'temple_success' },
    ],
  },

  temple_success: {
    id: 'temple_success',
    title: '试炼通过',
    description: `
你的唇触碰少女的瞬间，她的身体发出柔和的光芒。少女缓缓睁开眼睛，那是一双清澈如水的眸子。

"你...你终于来了..." 她轻声说，"我等了好久..."

原来，真正的沉睡者因为五十年的等待而悲伤，所以眉头微蹙。

少女站起来，她的身上散发出圣洁的光芒："我是神殿的守护者，感谢你唤醒了我。按照约定，我会给你奖励。"
    `,
    options: [
      { text: '接受奖励', nextNodeId: 'temple_reward' },
    ],
    setFlag: 'awakened_guardian',
  },

  temple_wrong: {
    id: 'temple_wrong',
    title: '选择错误',
    description: `
当你的唇触碰到少女的瞬间，她的身体化作了飞灰！

"愚蠢的人类...你选择了幻象。" 空灵的声音带着一丝失望，"不过...我再给你一次机会。"

你回到了三个少女面前。
    `,
    options: [
      { text: '重新选择', nextNodeId: 'temple_trial_2' },
    ],
  },

  temple_fail: {
    id: 'temple_fail',
    title: '试炼失败',
    description: `
"你缺乏勇气...无法通过试炼..." 声音逐渐远去。

大门重新打开，你被一股无形的力量推出了神殿。

石像的眼睛似乎在嘲笑你。你灰溜溜地下山了。
    `,
    options: [
      { text: '回到村庄', nextNodeId: 'village_entrance' },
    ],
  },

  temple_reward: {
    id: 'temple_reward',
    title: '守护者的馈赠',
    description: `
少女从怀里取出龙之眼，还有一把闪耀着圣光的长剑。

"这把烈焰之刃，是神殿的至宝。有了它，你一定能打败黑龙。"

她微笑着说："另外...如果有一天，你打败了黑龙，拯救了公主...请记得，在王国的北方，还有一个更大的威胁在沉睡。到那时，也许我们还会再见。"
    `,
    options: [
      { text: '感谢她，离开神殿', nextNodeId: 'village_entrance' },
    ],
    giveItem: 'dragon_eye',
    setFlag: 'has_dragon_eye',
  },

  castle_entrance: {
    id: 'castle_entrance',
    title: '废弃城堡',
    description: `
暗黑骑士的城堡已经废弃多年，城墙残破，爬满了藤蔓。但你能感受到里面散发着不祥的气息。

城门虚掩着，里面传来盔甲碰撞的声音。

据说暗黑骑士是黑龙的部下，他守护着通往龙穴的秘密通道。
    `,
    options: [
      { text: '进入城堡', nextNodeId: 'castle_hall' },
      { text: '离开', nextNodeId: 'village_entrance' },
    ],
  },

  castle_hall: {
    id: 'castle_hall',
    title: '城堡大厅',
    description: `
你走进城堡大厅，阴暗的光线下，你看到几个骷髅兵在巡逻。

大厅的尽头是一个通往地下的楼梯，那里应该就是秘密通道的入口。
    `,
    options: [
      { text: '悄悄绕过骷髅兵', nextNodeId: 'castle_stairs' },
      { text: '消灭它们！', nextNodeId: 'castle_battle', startsBattle: 'skeleton' },
    ],
  },

  castle_battle: {
    id: 'castle_battle',
    title: '战斗',
    description: `
骷髅兵发现了你，怪叫着冲了上来！
    `,
    options: [
      { text: '继续', nextNodeId: 'castle_stairs', startsBattle: 'skeleton' },
    ],
  },

  castle_stairs: {
    id: 'castle_stairs',
    title: '地下楼梯',
    description: `
你沿着楼梯向下走，来到一个宽敞的地下室。地下室的中央，站着一个身穿黑色盔甲的骑士——暗黑骑士！

"又一个来送死的冒险者...哼，你的灵魂将成为我主人的食粮！" 暗黑骑士拔出了剑。

你注意到他腰间挂着一把古老的钥匙。
    `,
    options: [
      { text: '战斗！', nextNodeId: 'dark_knight_victory', startsBattle: 'dark_knight' },
      { text: '尝试说服他', nextNodeId: 'persuade_knight' },
    ],
  },

  persuade_knight: {
    id: 'persuade_knight',
    title: '交涉',
    description: `
"等等！" 你喊道，"你曾经是王国的骑士，不是吗？为什么要效忠黑龙？"

暗黑骑士的动作顿了一下："你...你怎么知道？"

"你的盔甲上还有王国的徽章。我知道你不是坏人！和我一起，打败黑龙，赎罪吧！"

暗黑骑士沉默了很久："...赎罪？我还有机会吗？"
    `,
    options: [
      { text: '"当然！任何人都可以赎罪！"', nextNodeId: 'knight_joined' },
      { text: '趁机攻击！', nextNodeId: 'dark_knight_victory', startsBattle: 'dark_knight' },
    ],
  },

  knight_joined: {
    id: 'knight_joined',
    title: '同盟',
    description: `
暗黑骑士缓缓放下了剑："你说得对...我已经在黑暗中待得太久了。"

他把古老钥匙递给你："这是通往龙穴秘密通道的钥匙。我...我在这里待了太久，已经没有勇气面对黑龙了。但是你，你有这个力量。"

"去吧，年轻人。打败黑龙，拯救公主。"

他顿了顿，又说："另外...小心北方。那里有比黑龙更可怕的东西。"
    `,
    options: [
      { text: '感谢他，通过秘密通道', nextNodeId: 'secret_entrance' },
    ],
    giveItem: 'ancient_key',
    setFlag: 'knight_allied',
  },

  dark_knight_victory: {
    id: 'dark_knight_victory',
    title: '胜利',
    description: `
暗黑骑士倒在地上，盔甲发出清脆的响声。

"咳...没想到...我居然会被一个小鬼打败..." 他艰难地说，"也罢...这对我来说，也许是一种解脱..."

"钥匙...在我身上...秘密通道...一直走..." 他的声音逐渐消失了。

你从他身上找到了古老钥匙。
    `,
    options: [
      { text: '通过秘密通道', nextNodeId: 'secret_entrance' },
    ],
    giveItem: 'ancient_key',
  },

  ending_good: {
    id: 'ending_good',
    title: '【结局一：英雄归来】',
    description: `
你带着公主回到了王城。整个城市都在欢呼，人们把你捧为英雄。

国王履行了承诺，将半个王国的财富赏赐给你，并为你和公主举办了盛大的婚礼。

婚礼那天，阳光明媚。公主穿着洁白的婚纱，美丽得如同天使。

"你知道吗？" 公主在你耳边轻声说，"当我在龙穴里看到你的时候，我就知道，你是我的命中注定。"

你紧紧握住她的手。从此，你们过上了幸福快乐的生活。

而你的传说，将永远被人们传唱——勇者斗恶龙，英雄抱得美人归。

【好结局 达成】
    `,
    options: [
      { text: '返回标题画面', nextNodeId: 'title' },
    ],
    isEnding: true,
    endingType: 'good',
  },

  ending_neutral: {
    id: 'ending_neutral',
    title: '【结局二：有得有失】',
    description: `
你带着公主回到了王城。虽然没有杀死黑龙，但你成功救出了公主，依然被人们视为英雄。

国王为你举行了欢迎宴会，但你注意到他的眉宇间有一丝忧虑。

"勇士，感谢你救了我的女儿。但是...黑龙还活着，它总有一天会回来报复的。"

公主握住你的手："不管怎样，你救了我。这就够了。"

后来，你和公主结婚了，过上了平静的生活。但你知道，黑龙的阴影始终笼罩着这片土地...

也许，某一天，你还会再次踏上征途。

【普通结局 达成】
    `,
    options: [
      { text: '返回标题画面', nextNodeId: 'title' },
    ],
    isEnding: true,
    endingType: 'neutral',
  },

  ending_bad: {
    id: 'ending_bad',
    title: '【结局三：堕落】',
    description: `
在与黑龙的战斗中，你渐渐感到体力不支。黑龙的力量太强了...

"人类，你很有潜力..." 黑龙的声音在你脑海中响起，"与其死在这里，不如成为我的部下吧。我会赐予你永恒的生命和强大的力量。"

你的意志开始动摇...永恒的生命？强大的力量？

...

当你再次清醒时，你发现自己站在黑龙身边，浑身散发着黑暗的气息。

"很好...从今天起，你就是我的左膀右臂了。" 黑龙满意地说。

公主的哭声从远处传来，但你已经不在乎了。

力量...你现在只想要更强大的力量...

【坏结局 达成】
    `,
    options: [
      { text: '返回标题画面', nextNodeId: 'title' },
    ],
    isEnding: true,
    endingType: 'bad',
  },

  ending_hidden: {
    id: 'ending_hidden',
    title: '【隐藏结局：真正的勇者】',
    description: `
打败黑龙后，你没有立刻回王城。你想起了神殿守护者的话——北方还有更大的威胁。

带着公主的祝福，你踏上了新的旅程。

在北方的冰封之地，你发现了一座黑暗神殿。神殿的最深处，魔王正在苏醒。

经过无数次战斗，你终于站在了魔王面前。

"有趣...区区人类，竟敢来到这里..." 魔王的声音如同惊雷，"你以为打败了那条笨龙就很了不起了吗？"

你握紧了手中的屠龙剑——这是用黑龙的骸骨打造的最强武器。

"来吧，魔王。我要彻底终结这一切！"

最终的战斗开始了。这一战，将决定整个世界的命运...

...

许多年后，人们依然在传颂着你的传说。你不仅打败了黑龙，还消灭了威胁整个世界的魔王。

你成为了真正的传说——有史以来最伟大的勇者。

而在你身边，始终有两个最重要的人：你深爱的公主，和那个被你从沉睡中唤醒的神殿守护者。

你们三人一起，守护着这片大陆的和平。

【隐藏结局 达成！恭喜你完成了所有内容！】
    `,
    options: [
      { text: '返回标题画面', nextNodeId: 'title' },
    ],
    isEnding: true,
    endingType: 'hidden',
  },

  title: {
    id: 'title',
    title: '龙之传说',
    description: `
欢迎来到《龙之传说》！

这是一个古早风格的文字冒险RPG。你将扮演一名新手冒险者，踏上打龙救公主的旅程。

游戏特色：
• 丰富的剧情分支，多种选择
• 背包系统，收集装备和道具
• 回合制战斗，策略取胜
• 多种结局等你探索
• 最多5个存档位
    `,
    options: [
      { text: '开始新游戏', nextNodeId: 'intro' },
      { text: '读取存档', nextNodeId: 'load' },
      { text: '游戏说明', nextNodeId: 'help' },
      { text: '退出游戏', nextNodeId: 'title' },
    ],
  },

  help: {
    id: 'help',
    title: '游戏说明',
    description: `
【操作说明】
• 点击选项按钮进行选择
• 战斗中选择攻击、技能、道具或逃跑
• 使用消耗品恢复生命和魔力
• 装备武器和护甲提升属性

【小贴士】
• 多探索，很多好东西藏在角落里
• 记得经常存档
• 战斗打不过就跑，不丢人
• 有些结局需要特定条件才能触发
• 隐藏结局需要完成所有支线任务

祝你游戏愉快！
    `,
    options: [
      { text: '返回标题', nextNodeId: 'title' },
    ],
  },

  load: {
    id: 'load',
    title: '读取存档',
    description: `
选择一个存档读取，或者返回标题画面。
    `,
    options: [
      { text: '返回标题', nextNodeId: 'title' },
    ],
  },
};
