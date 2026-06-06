import { v4 as uuidv4 } from 'uuid';
import { StoryConfig, StoryParagraph } from './types';

const names: Record<string, string[]> = {
  '男': ['小明', '阿杰', '子轩', '浩然', '天宇'],
  '女': ['小红', '小美', '雨萱', '诗琪', '梦瑶'],
  '中性': ['小雨', '阿星', '子墨', '清风', '云帆']
};

const storyTemplates: Record<string, string[]> = {
  '童话': [
    '在遥远的{scene}里，住着一位{personality}的{occupation}{name}。',
    '{name}说道："我一定要找到传说中的宝藏！"',
    '一路上，{name}遇到了许多神奇的生物，它们都被{name}的善良所打动。',
    '神秘的老者缓缓说道："只有真正勇敢的人才能通过这道考验。"',
    '最终，{name}不仅找到了宝藏，还收获了珍贵的友谊，从此过上了幸福的生活。'
  ],
  '科幻': [
    '公元3024年，{personality}的{occupation}{name}驾驶着星际飞船抵达了{scene}。',
    '{name}对着通讯器喊道："发现未知生命信号，全员戒备！"',
    '船舱内的警报声突然响起，红色的灯光闪烁着，气氛骤然紧张。',
    'AI助手冷静地报告："检测到时空裂隙正在扩大，建议立即撤离。"',
    '经过一番惊心动魄的冒险，{name}成功拯救了整个星系，成为了传奇英雄。'
  ],
  '奇幻': [
    '在魔法世界的{scene}中，{personality}的{occupation}{name}正在修炼古老的法术。',
    '{name}举起法杖吟唱道："以吾之名，召唤元素之力！"',
    '天空中乌云密布，雷电交加，一场惊天动地的魔法大战即将展开。',
    '龙族长老深沉地说："预言中的救世主终于出现了。"',
    '{name}凭借着坚定的信念和强大的魔力，最终战胜了黑暗势力，拯救了世界。'
  ],
  '推理': [
    '雨夜的{scene}发生了一起离奇案件，{personality}的{occupation}{name}被请来调查。',
    '{name}推了推眼镜说道："真相永远只有一个，我已经知道凶手是谁了。"',
    '房间里的每个人都有不在场证明，但{name}注意到了一个微小的细节。',
    '嫌疑人紧张地辩解："不是我！我当时真的在房间里！"',
    '经过缜密的推理，{name}终于揭开了真相，将真凶绳之以法，正义得到了伸张。'
  ],
  '言情': [
    '阳光明媚的{scene}里，{personality}的{occupation}{name}邂逅了命中注定的那个人。',
    '{name}红着脸小声说："其实...我喜欢你很久了。"',
    '风吹过窗台，带来了阵阵花香，空气中弥漫着甜蜜的气息。',
    '对方温柔地回应："我也是，从见到你的第一眼起就喜欢你了。"',
    '从此，{name}和爱人携手走过春夏秋冬，谱写了一段动人的爱情故事。'
  ]
};

const sceneDescriptions: Record<string, string> = {
  '古城堡': '古老的城堡，石墙上爬满了藤蔓，塔楼在月光下显得神秘而庄严',
  '太空船': '巨大的太空船，金属外壳在星光下闪烁，舷窗外是浩瀚的宇宙',
  '校园': '美丽的校园，樱花飘落的操场，书香四溢的图书馆',
  '街市': '热闹的街市，叫卖声此起彼伏，各色店铺琳琅满目',
  '火山': '炽热的火山，岩浆在地表流淌，空气中弥漫着硫磺的气息'
};

export function generateRandomName(gender: string): string {
  const nameList = names[gender] || names['中性'];
  return nameList[Math.floor(Math.random() * nameList.length)];
}

export function generateStory(config: StoryConfig): StoryParagraph[] {
  const { type, protagonist, scene } = config;
  const templates = storyTemplates[type] || storyTemplates['童话'];
  const { name, personality, occupation } = protagonist;

  const paragraphs: StoryParagraph[] = [];

  paragraphs.push({
    id: uuidv4(),
    content: sceneDescriptions[scene] + '。',
    type: 'narration'
  });

  templates.forEach((template) => {
    let content = template
      .replace(/{name}/g, name)
      .replace(/{personality}/g, personality)
      .replace(/{occupation}/g, occupation)
      .replace(/{scene}/g, scene);

    const isDialogue = content.includes('"') || content.includes('："') || content.includes('说道');
    
    let speaker: string | undefined;
    if (content.includes(`${name}说道`) || content.includes(`${name}举起`) || content.includes(`${name}对着`) || content.includes(`${name}推了推`) || content.includes(`${name}红着脸`)) {
      speaker = name;
    } else if (content.includes('"')) {
      const speakerMatch = content.match(/(.+?)[说道|缓缓|冷静|深沉|紧张|温柔]/);
      if (speakerMatch) {
        speaker = speakerMatch[1].trim();
      }
    }

    paragraphs.push({
      id: uuidv4(),
      content,
      type: isDialogue ? 'dialogue' : 'narration',
      speaker
    });
  });

  return paragraphs;
}

export function regenerateParagraph(
  paragraph: StoryParagraph,
  config: StoryConfig
): StoryParagraph {
  const { type, protagonist, scene } = config;
  const { name, personality, occupation } = protagonist;
  const templates = storyTemplates[type] || storyTemplates['童话'];

  const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
  let content = randomTemplate
    .replace(/{name}/g, name)
    .replace(/{personality}/g, personality)
    .replace(/{occupation}/g, occupation)
    .replace(/{scene}/g, scene);

  const isDialogue = content.includes('"') || content.includes('："');
  let speaker: string | undefined;
  if (content.includes(`${name}说道`) || content.includes(`${name}举起`)) {
    speaker = name;
  }

  return {
    ...paragraph,
    content,
    type: isDialogue ? 'dialogue' : 'narration',
    speaker
  };
}
