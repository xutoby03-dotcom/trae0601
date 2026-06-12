import type { Book, BorrowRecord, Review, Box } from "@/types";

const today = new Date();
const daysAgo = (days: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - days);
  return d.toISOString().split("T")[0];
};
const daysLater = (days: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
};

export const mockBoxes: Box[] = [
  { id: "box-1", name: "一号漂流箱", location: "教学楼A门口" },
  { id: "box-2", name: "二号漂流箱", location: "教学楼B门口" },
  { id: "box-3", name: "三号漂流箱", location: "图书馆门口" },
];

export const mockBooks: Book[] = [
  {
    id: "book-1",
    title: "小王子",
    author: "安托万·德·圣-埃克苏佩里",
    donor: "张老师",
    gradeLevel: "四年级",
    boxId: "box-1",
    coverImage:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=little%20prince%20book%20cover%20illustration%20starry%20sky&image_size=portrait_4_3",
    status: "in_box",
    createdAt: daysAgo(30),
  },
  {
    id: "book-2",
    title: "夏洛的网",
    author: "E.B.怀特",
    donor: "李小明家长",
    gradeLevel: "三年级",
    boxId: "box-1",
    coverImage:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=charlotte%27s%20web%20book%20cover%20pig%20spider%20barn%20illustration&image_size=portrait_4_3",
    status: "borrowed",
    createdAt: daysAgo(25),
  },
  {
    id: "book-3",
    title: "草房子",
    author: "曹文轩",
    donor: "王校长",
    gradeLevel: "五年级",
    boxId: "box-2",
    coverImage:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20countryside%20straw%20house%20children%20book%20cover%20warm%20tones&image_size=portrait_4_3",
    status: "overdue",
    createdAt: daysAgo(50),
  },
  {
    id: "book-4",
    title: "西游记少儿版",
    author: "吴承恩",
    donor: "家委会",
    gradeLevel: "二年级",
    boxId: "box-1",
    coverImage:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=journey%20to%20the%20west%20monkey%20king%20children%20book%20cover%20colorful&image_size=portrait_4_3",
    status: "in_box",
    createdAt: daysAgo(15),
  },
  {
    id: "book-5",
    title: "哈利波特与魔法石",
    author: "J.K.罗琳",
    donor: "陈老师",
    gradeLevel: "六年级",
    boxId: "box-3",
    coverImage:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=harry%20potter%20book%20cover%20magic%20castle%20wizard%20illustration&image_size=portrait_4_3",
    status: "borrowed",
    createdAt: daysAgo(40),
  },
  {
    id: "book-6",
    title: "了不起的狐狸爸爸",
    author: "罗尔德·达尔",
    donor: "刘妈妈",
    gradeLevel: "三年级",
    boxId: "box-2",
    coverImage:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fantastic%20mr%20fox%20book%20cover%20fox%20illustration%20forest&image_size=portrait_4_3",
    status: "damaged",
    createdAt: daysAgo(60),
  },
  {
    id: "book-7",
    title: "窗边的小豆豆",
    author: "黑柳彻子",
    donor: "赵老师",
    gradeLevel: "四年级",
    boxId: "box-3",
    coverImage:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=japanese%20school%20girl%20by%20window%20book%20cover%20soft%20illustration&image_size=portrait_4_3",
    status: "in_box",
    createdAt: daysAgo(20),
  },
  {
    id: "book-8",
    title: "夏洛的网",
    author: "E.B.怀特",
    donor: "家委会",
    gradeLevel: "三年级",
    boxId: "box-3",
    coverImage:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=charlotte%27s%20web%20book%20cover%20pig%20spider%20barn%20illustration&image_size=portrait_4_3",
    status: "in_box",
    createdAt: daysAgo(10),
  },
  {
    id: "book-9",
    title: "海底两万里",
    author: "儒勒·凡尔纳",
    donor: "孙老师",
    gradeLevel: "七年级",
    boxId: "box-2",
    coverImage:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=20000%20leagues%20under%20sea%20book%20cover%20submarine%20ocean%20adventure&image_size=portrait_4_3",
    status: "borrowed",
    createdAt: daysAgo(35),
  },
  {
    id: "book-10",
    title: "安徒生童话",
    author: "安徒生",
    donor: "周校长",
    gradeLevel: "一年级",
    boxId: "box-1",
    coverImage:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=andersen%20fairy%20tales%20book%20cover%20castle%20magical%20colorful%20illustration&image_size=portrait_4_3",
    status: "overdue",
    createdAt: daysAgo(55),
  },
];

export const mockBorrowRecords: BorrowRecord[] = [
  {
    id: "br-1",
    bookId: "book-2",
    borrowerName: "小明",
    borrowerClass: "三(2)班",
    borrowDate: daysAgo(5),
    expectedReturnDate: daysLater(10),
    contact: "13800138001",
    status: "borrowing",
  },
  {
    id: "br-2",
    bookId: "book-3",
    borrowerName: "小红",
    borrowerClass: "五(1)班",
    borrowDate: daysAgo(25),
    expectedReturnDate: daysAgo(5),
    contact: "13800138002",
    status: "overdue",
  },
  {
    id: "br-3",
    bookId: "book-5",
    borrowerName: "小华",
    borrowerClass: "六(3)班",
    borrowDate: daysAgo(3),
    expectedReturnDate: daysLater(12),
    contact: "13800138003",
    status: "borrowing",
  },
  {
    id: "br-4",
    bookId: "book-6",
    borrowerName: "小强",
    borrowerClass: "三(1)班",
    borrowDate: daysAgo(15),
    expectedReturnDate: daysAgo(3),
    actualReturnDate: daysAgo(2),
    contact: "13800138004",
    status: "damaged",
    damageNote: "封面有明显折痕，第20页有水渍",
  },
  {
    id: "br-5",
    bookId: "book-9",
    borrowerName: "小丽",
    borrowerClass: "七(2)班",
    borrowDate: daysAgo(7),
    expectedReturnDate: daysLater(7),
    contact: "13800138005",
    status: "borrowing",
  },
  {
    id: "br-6",
    bookId: "book-10",
    borrowerName: "小刚",
    borrowerClass: "一(1)班",
    borrowDate: daysAgo(30),
    expectedReturnDate: daysAgo(10),
    contact: "13800138006",
    status: "overdue",
  },
  {
    id: "br-7",
    bookId: "book-1",
    borrowerName: "小芳",
    borrowerClass: "四(2)班",
    borrowDate: daysAgo(20),
    expectedReturnDate: daysAgo(6),
    actualReturnDate: daysAgo(5),
    contact: "13800138007",
    status: "returned",
  },
  {
    id: "br-8",
    bookId: "book-4",
    borrowerName: "小军",
    borrowerClass: "二(1)班",
    borrowDate: daysAgo(10),
    expectedReturnDate: daysAgo(1),
    actualReturnDate: daysAgo(1),
    contact: "13800138008",
    status: "returned",
  },
];

export const mockReviews: Review[] = [
  {
    id: "rv-1",
    bookId: "book-1",
    studentName: "小芳",
    rating: 5,
    content: "小王子的故事太感人了，每次读都会流泪，推荐大家都看看！",
    createdAt: daysAgo(4),
  },
  {
    id: "rv-2",
    bookId: "book-1",
    studentName: "阿杰",
    rating: 4,
    content: "很有哲理的一本书，插图也很美。",
    createdAt: daysAgo(2),
  },
  {
    id: "rv-3",
    bookId: "book-4",
    studentName: "小军",
    rating: 5,
    content: "孙悟空太厉害了，我最喜欢大闹天宫那段！",
    createdAt: daysAgo(1),
  },
  {
    id: "rv-4",
    bookId: "book-7",
    studentName: "小雯",
    rating: 5,
    content: "小豆豆的学校好有趣，我也好想去巴学园上学！",
    createdAt: daysAgo(8),
  },
];
