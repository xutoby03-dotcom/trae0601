export type StoryType = '童话' | '科幻' | '奇幻' | '推理' | '言情';
export type Gender = '男' | '女' | '中性';
export type Personality = '勇敢' | '聪明' | '温柔' | '调皮' | '冷静';
export type Occupation = '学生' | '侦探' | '魔法师' | '宇航员' | '医生';
export type Scene = '古城堡' | '太空船' | '校园' | '街市' | '火山';

export interface Protagonist {
  gender: Gender;
  personality: Personality;
  occupation: Occupation;
  name: string;
}

export interface StoryParagraph {
  id: string;
  content: string;
  type: 'narration' | 'dialogue';
  speaker?: string;
}

export interface Story {
  id: string;
  title: string;
  type: StoryType;
  protagonist: Protagonist;
  scene: Scene;
  paragraphs: StoryParagraph[];
  createdAt: number;
  updatedAt: number;
  isFavorite: boolean;
  category: string;
}

export interface StoryConfig {
  type: StoryType;
  protagonist: Protagonist;
  scene: Scene;
}
