import { useDocumentStore } from '@/store/documentStore';
import type { Document, Material } from '@/types';
import { generateId } from './dateUtils';

export const generateMockData = () => {
  useDocumentStore.getState();

  const today = new Date();
  const addDays = (days: number) => {
    const date = new Date(today);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  };

  const mockDocuments: Omit<Document, 'id' | 'createdAt' | 'updatedAt' | 'remindDays' | 'processStatus'>[] = [
    {
      type: 'id_card',
      holder: '张三',
      expireDate: addDays(-15),
      issueLocation: '北京市朝阳区派出所',
      photo: '',
      needAnnualReview: false,
      notes: '已过期，需尽快补办新身份证',
    },
    {
      type: 'passport',
      holder: '张三',
      expireDate: addDays(45),
      issueLocation: '北京市出入境管理局',
      photo: '',
      needAnnualReview: false,
      notes: '计划国庆出国旅游，需提前更新护照',
    },
    {
      type: 'driver_license',
      holder: '李四',
      expireDate: addDays(20),
      issueLocation: '上海市车管所',
      photo: '',
      needAnnualReview: false,
      notes: '需要换证，记得准备体检表',
    },
    {
      type: 'hk_macau_permit',
      holder: '张三',
      expireDate: addDays(120),
      issueLocation: '广州市出入境',
      photo: '',
      needAnnualReview: false,
      notes: '签注还有效，明年需要续签',
    },
    {
      type: 'bank_card',
      holder: '李四',
      expireDate: addDays(-60),
      issueLocation: '招商银行深圳分行',
      photo: '',
      needAnnualReview: false,
      notes: '储蓄卡已过期，需去银行更新',
    },
    {
      type: 'id_card',
      holder: '王小宝',
      expireDate: 'long_term',
      issueLocation: '杭州市公安局',
      photo: '',
      needAnnualReview: false,
      notes: '长期有效身份证',
    },
    {
      type: 'passport',
      holder: '李四',
      expireDate: addDays(200),
      issueLocation: '上海市出入境管理局',
      photo: '',
      needAnnualReview: false,
      notes: '',
    },
    {
      type: 'driver_license',
      holder: '张三',
      expireDate: addDays(365),
      issueLocation: '北京市车管所',
      photo: '',
      needAnnualReview: true,
      notes: '每年需要年审，记得按时提交体检证明',
    },
    {
      type: 'bank_card',
      holder: '张三',
      expireDate: addDays(180),
      issueLocation: '工商银行北京分行',
      photo: '',
      needAnnualReview: false,
      notes: '信用卡，到期前银行会自动寄送新卡',
    },
    {
      type: 'other',
      holder: '王小宝',
      expireDate: addDays(30),
      issueLocation: '学校教务处',
      photo: '',
      needAnnualReview: true,
      notes: '学生证，每年需要注册盖章',
    },
  ];

  mockDocuments.forEach((docData, index) => {
    const tempId = generateId();
    const now = new Date().toISOString();

    const newDoc: Document = {
      ...docData,
      id: tempId,
      createdAt: now,
      updatedAt: now,
      remindDays: index < 3 ? 30 : index < 6 ? 90 : 180,
      processStatus: index === 0 ? 'submitted' : index === 1 ? 'appointment' : index === 4 ? 'waiting' : 'not_started',
    };

    useDocumentStore.getState().documents.push(newDoc);

    const defaultMaterials = [
      { name: '证件照片', isReady: index % 3 !== 0 },
      { name: '身份证复印件', isReady: index % 2 === 0 },
      { name: '申请表', isReady: index % 4 === 0 },
      { name: '户口本复印件', isReady: false },
      { name: '居住证明', isReady: index % 3 === 0 },
    ];

    defaultMaterials.forEach(m => {
      const newMaterial: Material = {
        id: generateId(),
        documentId: tempId,
        name: m.name,
        isReady: m.isReady,
      };
      useDocumentStore.getState().materials.push(newMaterial);
    });
  });

  localStorage.setItem('document-manager-storage', JSON.stringify({
    state: useDocumentStore.getState(),
  }));
};
