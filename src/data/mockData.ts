import type { AppState, Book, User, BorrowRecord, Review, BookCategory, BookCondition, LendType } from '@/types';
import { generateId } from '@/utils/bookUtils';
import { addDays, subDays } from 'date-fns';

const sampleTitles: { title: string; author: string; category: BookCategory }[] = [
  { title: '活着', author: '余华', category: '文学小说' },
  { title: '百年孤独', author: '加西亚·马尔克斯', category: '文学小说' },
  { title: '三体', author: '刘慈欣', category: '文学小说' },
  { title: '围城', author: '钱钟书', category: '文学小说' },
  { title: '平凡的世界', author: '路遥', category: '文学小说' },
  { title: '红楼梦', author: '曹雪芹', category: '文学小说' },
  { title: 'JavaScript高级程序设计', author: 'Nicholas C. Zakas', category: '科技编程' },
  { title: '深入理解计算机系统', author: 'Randal E. Bryant', category: '科技编程' },
  { title: '算法导论', author: 'Thomas H. Cormen', category: '科技编程' },
  { title: '代码整洁之道', author: 'Robert C. Martin', category: '科技编程' },
  { title: '人类简史', author: '尤瓦尔·赫拉利', category: '历史传记' },
  { title: '万历十五年', author: '黄仁宇', category: '历史传记' },
  { title: '苏东坡传', author: '林语堂', category: '历史传记' },
  { title: '明朝那些事儿', author: '当年明月', category: '历史传记' },
  { title: '被讨厌的勇气', author: '岸见一郎', category: '心理成长' },
  { title: '非暴力沟通', author: '马歇尔·卢森堡', category: '心理成长' },
  { title: '心流', author: '米哈里·契克森米哈赖', category: '心理成长' },
  { title: '自卑与超越', author: '阿尔弗雷德·阿德勒', category: '心理成长' },
  { title: '设计心理学', author: '唐纳德·诺曼', category: '艺术设计' },
  { title: '写给大家看的设计书', author: 'Robin Williams', category: '艺术设计' },
  { title: '原则', author: '瑞·达利欧', category: '商业管理' },
  { title: '穷查理宝典', author: '彼得·考夫曼', category: '商业管理' },
  { title: '影响力', author: '罗伯特·西奥迪尼', category: '商业管理' },
  { title: '深度工作', author: '卡尔·纽波特', category: '商业管理' },
  { title: '山茶文具店', author: '小川糸', category: '生活休闲' },
  { title: '人间草木', author: '汪曾祺', category: '生活休闲' },
  { title: '小王子', author: '安托万·德·圣-埃克苏佩里', category: '儿童绘本' },
  { title: '猜猜我有多爱你', author: '山姆·麦克布雷尼', category: '儿童绘本' },
];

const conditions: BookCondition[] = ['全新', '九成新', '八成新', '七成新', '有磨损'];
const lendTypes: LendType[] = ['borrow', 'borrow', 'borrow', 'gift'];
const shelfLetters = ['A', 'B', 'C', 'D', 'E'];

const now = new Date();

const generateCoverColor = (category: BookCategory): string => {
  const palettes: Record<BookCategory, string[]> = {
    '文学小说': ['#E11D48', '#BE123C', '#9F1239'],
    '科技编程': ['#0284C7', '#0369A1', '#075985'],
    '历史传记': ['#B45309', '#92400E', '#78350F'],
    '心理成长': ['#059669', '#047857', '#065F46'],
    '艺术设计': ['#7C3AED', '#6D28D9', '#5B21B6'],
    '商业管理': ['#475569', '#334155', '#1E293B'],
    '生活休闲': ['#0D9488', '#0F766E', '#115E59'],
    '儿童绘本': ['#DB2777', '#BE185D', '#9D174D'],
    '其他': ['#57534E', '#44403C', '#292524'],
  };
  const arr = palettes[category];
  return arr[Math.floor(Math.random() * arr.length)];
};

const createSvgCover = (title: string, author: string, category: BookCategory): string => {
  const color = generateCoverColor(category);
  const titleShort = title.length > 6 ? title.slice(0, 6) + '…' : title;
  const authorShort = author.length > 8 ? author.slice(0, 8) : author;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="160" height="220" viewBox="0 0 160 220">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${color};stop-opacity:0.75" />
        </linearGradient>
      </defs>
      <rect width="160" height="220" fill="url(#g)"/>
      <rect x="8" y="8" width="144" height="204" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
      <rect x="0" y="0" width="10" height="220" fill="rgba(0,0,0,0.2)"/>
      <text x="24" y="80" font-family="Georgia, serif" font-size="22" font-weight="bold" fill="#FFF8E1" writing-mode="tb">${titleShort}</text>
      <text x="120" y="190" font-family="Georgia, serif" font-size="11" fill="rgba(255,248,225,0.85)" transform="rotate(90, 120, 190)">${authorShort}</text>
      <circle cx="130" cy="40" r="14" fill="rgba(255,255,255,0.12)"/>
      <path d="M125 34 L130 29 L135 34 L135 46 L130 51 L125 46 Z" fill="#FFD700" opacity="0.6"/>
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
};

const createUsers = (): User[] => {
  const names = ['小林', '阿杰', '小美', '老张', '阿May', '大刘', '思远', '雅琴', '周周', '方晴'];
  return names.map((n, i) => ({
    id: generateId('user'),
    nickname: n,
    createdAt: subDays(now, 60 - i * 5).toISOString(),
  }));
};

const createBooks = (users: User[]): Book[] => {
  return sampleTitles.map((t, i) => {
    const lender = users[i % users.length];
    const createdDate = subDays(now, Math.floor(Math.random() * 80) + 2);
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    const lendType = lendTypes[Math.floor(Math.random() * lendTypes.length)];
    const shelf = `${shelfLetters[i % shelfLetters.length]}-${String((i % 12) + 1).padStart(2, '0')}`;

    let status: Book['status'] = 'available';
    let currentHolderId: string | undefined;
    let borrowCount = Math.floor(Math.random() * 6);

    if (i % 5 === 1 && lendType === 'borrow') {
      status = 'borrowed';
      currentHolderId = users[(i + 3) % users.length].id;
      borrowCount += 1;
    }
    if (i % 9 === 4) {
      status = 'gifted';
    }

    return {
      id: generateId('book'),
      title: t.title,
      author: t.author,
      category: t.category,
      condition,
      shelfId: shelf,
      coverUrl: createSvgCover(t.title, t.author, t.category),
      lenderId: lender.id,
      lendType,
      status,
      currentHolderId,
      borrowCount,
      reviewCount: Math.floor(Math.random() * 4),
      createdAt: createdDate.toISOString(),
      lastActiveAt: status === 'available'
        ? subDays(now, Math.random() > 0.6 ? Math.floor(Math.random() * 40) + 5 : Math.floor(Math.random() * 6)).toISOString()
        : subDays(now, Math.floor(Math.random() * 10)).toISOString(),
    };
  });
};

const createBorrowRecords = (books: Book[], users: User[]): BorrowRecord[] => {
  const records: BorrowRecord[] = [];

  books.forEach((book) => {
    records.push({
      id: generateId('rec'),
      bookId: book.id,
      userId: book.lenderId,
      action: 'register',
      isOverdue: false,
      createdAt: book.createdAt,
    });

    for (let i = 0; i < book.borrowCount - (book.status === 'borrowed' ? 1 : 0); i++) {
      const borrower = users[(users.findIndex((u) => u.id === book.lenderId) + i * 2 + 1) % users.length];
      const borrowDate = subDays(new Date(book.createdAt), -(i * 8 + 5));
      const expectedDate = addDays(borrowDate, 14);
      const actualDate = addDays(borrowDate, Math.floor(Math.random() * 20) + 3);

      records.push({
        id: generateId('rec'),
        bookId: book.id,
        userId: borrower.id,
        action: 'borrow',
        borrowDate: borrowDate.toISOString(),
        expectedReturnDate: expectedDate.toISOString(),
        isOverdue: false,
        createdAt: borrowDate.toISOString(),
      });
      records.push({
        id: generateId('rec'),
        bookId: book.id,
        userId: borrower.id,
        action: 'return',
        actualReturnDate: actualDate.toISOString(),
        isOverdue: false,
        createdAt: actualDate.toISOString(),
      });
    }

    if (book.status === 'borrowed' && book.currentHolderId) {
      const borrowDate = subDays(now, Math.floor(Math.random() * 15) + 2);
      const expectedDays = Math.floor(Math.random() * 30) - 5;
      const expectedDate = addDays(now, expectedDays);
      const overdue = expectedDays < 0;

      records.push({
        id: generateId('rec'),
        bookId: book.id,
        userId: book.currentHolderId,
        action: 'borrow',
        borrowDate: borrowDate.toISOString(),
        expectedReturnDate: expectedDate.toISOString(),
        isOverdue: overdue,
        createdAt: borrowDate.toISOString(),
      });
    }

    if (book.status === 'gifted') {
      const claimDate = addDays(new Date(book.createdAt), Math.floor(Math.random() * 10) + 1);
      const claimer = users[(users.findIndex((u) => u.id === book.lenderId) + 2) % users.length];
      records.push({
        id: generateId('rec'),
        bookId: book.id,
        userId: claimer.id,
        action: 'claim',
        isOverdue: false,
        createdAt: claimDate.toISOString(),
      });
    }
  });

  return records;
};

const createReviews = (books: Book[], users: User[]): Review[] => {
  const reviews: Review[] = [];
  const sampleReasons = ['文笔细腻', '引人入胜', '发人深省', '干货满满', '温暖治愈', '脑洞大开', '经典必读', '轻松好读'];
  const sampleContents = [
    '熬夜看完，余韵悠长，推荐给每一个热爱生活的人。',
    '书中的观点改变了我对很多事情的看法，获益良多。',
    '作者的文字有一种魔力，让人欲罢不能。',
    '作为入门书非常合适，深入浅出，讲得很清楚。',
    '睡前翻几页，心情会变得平静下来。',
    '二刷依然感动，每次读都有新的体会。',
    '朋友推荐的，果然没有让我失望！',
    '读完想推荐给身边所有朋友。',
  ];

  books.forEach((book, i) => {
    for (let j = 0; j < book.reviewCount; j++) {
      const reviewer = users[(i + j * 3) % users.length];
      if (reviewer.id === book.lenderId && j === 0) continue;
      reviews.push({
        id: generateId('rev'),
        bookId: book.id,
        userId: reviewer.id,
        content: sampleContents[(i + j) % sampleContents.length],
        recommendReason: sampleReasons[(i * 2 + j) % sampleReasons.length],
        rating: 4 + Math.floor(Math.random() * 2),
        createdAt: subDays(now, Math.floor(Math.random() * 50) + 3).toISOString(),
      });
    }
  });

  return reviews;
};

export const createMockData = (): AppState => {
  const users = createUsers();
  const books = createBooks(users);
  const borrowRecords = createBorrowRecords(books, users);
  const reviews = createReviews(books, users);

  return {
    currentUser: users[0],
    users,
    books,
    borrowRecords,
    reviews,
  };
};
