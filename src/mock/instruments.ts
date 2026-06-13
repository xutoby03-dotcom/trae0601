import type { Instrument } from "@/types";

export const mockInstruments: Instrument[] = [
  {
    id: "INS-001",
    type: "小提琴",
    brand: "斯特拉迪瓦里",
    classroom: "音乐教室A101",
    teacherId: "T001",
    photo:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=classic%20violin%20instrument%20on%20wooden%20table%20professional%20photo&image_size=square_hd",
    createdAt: "2024-03-15T10:00:00Z",
  },
  {
    id: "INS-002",
    type: "小提琴",
    brand: "瓜奈里",
    classroom: "音乐教室A101",
    teacherId: "T001",
    photo:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=vintage%20guarneri%20violin%20professional%20photography&image_size=square_hd",
    createdAt: "2024-03-15T10:05:00Z",
  },
  {
    id: "INS-003",
    type: "小提琴",
    brand: "阿玛蒂",
    classroom: "管弦乐排练厅",
    teacherId: "T001",
    photo:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=amati%20violin%20with%20bow%20music%20room%20background&image_size=square_hd",
    createdAt: "2024-03-20T09:00:00Z",
  },
  {
    id: "INS-004",
    type: "大提琴",
    brand: "斯特拉迪瓦里",
    classroom: "音乐教室A102",
    teacherId: "T002",
    photo:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=beautiful%20cello%20instrument%20music%20classroom%20professional%20photo&image_size=square_hd",
    createdAt: "2024-02-10T14:00:00Z",
  },
  {
    id: "INS-005",
    type: "大提琴",
    brand: "蒙塔尼亚纳",
    classroom: "管弦乐排练厅",
    teacherId: "T002",
    photo:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=montagnana%20cello%20concert%20hall%20background&image_size=square_hd",
    createdAt: "2024-02-10T14:10:00Z",
  },
  {
    id: "INS-006",
    type: "中提琴",
    brand: "布雷西亚",
    classroom: "音乐教室A102",
    teacherId: "T002",
    photo:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=viola%20instrument%20on%20music%20stand%20professional%20shot&image_size=square_hd",
    createdAt: "2024-04-01T11:00:00Z",
  },
  {
    id: "INS-007",
    type: "长笛",
    brand: "雅马哈",
    classroom: "音乐教室A103",
    teacherId: "T003",
    photo:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=silver%20flute%20instrument%20professional%20photography%20dark%20background&image_size=square_hd",
    createdAt: "2024-01-20T08:30:00Z",
  },
  {
    id: "INS-008",
    type: "长笛",
    brand: "鲍威尔",
    classroom: "管弦乐排练厅",
    teacherId: "T003",
    photo:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?hint=professional%20powell%20flute%20gold%20plated%20orchestra%20background&image_size=square_hd",
    createdAt: "2024-01-20T08:35:00Z",
  },
  {
    id: "INS-009",
    type: "单簧管",
    brand: "布菲",
    classroom: "音乐教室A103",
    teacherId: "T003",
    photo:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=buffet%20clarinet%20woodwind%20instrument%20professional%20photo&image_size=square_hd",
    createdAt: "2024-03-05T16:00:00Z",
  },
  {
    id: "INS-010",
    type: "萨克斯",
    brand: "塞尔玛",
    classroom: "音乐教室B201",
    teacherId: "T003",
    photo:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=selmer%20saxophone%20golden%20brass%20instrument%20professional%20shot&image_size=square_hd",
    createdAt: "2024-03-10T13:00:00Z",
  },
  {
    id: "INS-011",
    type: "架子鼓",
    brand: "珍珠",
    classroom: "打击乐专用室",
    teacherId: "T004",
    photo:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pearl%20drum%20kit%20professional%20drum%20room%20photography&image_size=square_hd",
    createdAt: "2023-12-01T10:00:00Z",
  },
  {
    id: "INS-012",
    type: "架子鼓",
    brand: "雅马哈",
    classroom: "打击乐专用室",
    teacherId: "T004",
    photo:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=yamaha%20drum%20set%20stage%20ready%20professional%20photo&image_size=square_hd",
    createdAt: "2023-12-01T10:10:00Z",
  },
  {
    id: "INS-013",
    type: "定音鼓",
    brand: "路德维希",
    classroom: "管弦乐排练厅",
    teacherId: "T004",
    photo:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=timpani%20kettledrums%20orchestra%20percussion%20professional%20photo&image_size=square_hd",
    createdAt: "2024-02-28T15:00:00Z",
  },
  {
    id: "INS-014",
    type: "钢琴",
    brand: "施坦威",
    classroom: "钢琴练习室1",
    teacherId: "T005",
    photo:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=steinway%20grand%20piano%20music%20room%20elegant%20professional%20photo&image_size=square_hd",
    createdAt: "2023-09-10T09:00:00Z",
  },
  {
    id: "INS-015",
    type: "钢琴",
    brand: "贝森朵夫",
    classroom: "钢琴练习室2",
    teacherId: "T005",
    photo:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=bosendorfer%20grand%20piano%20concert%20hall%20professional%20photography&image_size=square_hd",
    createdAt: "2023-09-10T09:10:00Z",
  },
  {
    id: "INS-016",
    type: "钢琴",
    brand: "雅马哈",
    classroom: "音乐教室B202",
    teacherId: "T007",
    photo:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=yamaha%20upright%20piano%20classroom%20setting%20professional%20photo&image_size=square_hd",
    createdAt: "2023-11-15T11:00:00Z",
  },
  {
    id: "INS-017",
    type: "钢琴",
    brand: "卡瓦依",
    classroom: "音乐教室B203",
    teacherId: "T007",
    photo:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=kawai%20grand%20piano%20music%20studio%20professional%20photo&image_size=square_hd",
    createdAt: "2023-11-15T11:10:00Z",
  },
  {
    id: "INS-018",
    type: "电子琴",
    brand: "罗兰",
    classroom: "音乐教室B202",
    teacherId: "T007",
    photo:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=roland%20digital%20piano%20keyboard%20music%20classroom&image_size=square_hd",
    createdAt: "2024-01-05T14:00:00Z",
  },
  {
    id: "INS-019",
    type: "古筝",
    brand: "敦煌",
    classroom: "民乐排练厅",
    teacherId: "T006",
    photo:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20guzheng%20instrument%20traditional%20music%20room%20professional%20photo&image_size=square_hd",
    createdAt: "2024-02-20T10:00:00Z",
  },
  {
    id: "INS-020",
    type: "古筝",
    brand: "朱雀",
    classroom: "音乐教室A101",
    teacherId: "T006",
    photo:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=rosewood%20guzheng%20chinese%20zither%20elegant%20display%20photo&image_size=square_hd",
    createdAt: "2024-02-20T10:10:00Z",
  },
  {
    id: "INS-021",
    type: "二胡",
    brand: "虎丘",
    classroom: "民乐排练厅",
    teacherId: "T008",
    photo:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20erhu%20instrument%20traditional%20two%20string%20fiddle%20professional%20photo&image_size=square_hd",
    createdAt: "2024-03-01T13:00:00Z",
  },
  {
    id: "INS-022",
    type: "琵琶",
    brand: "敦煌",
    classroom: "民乐排练厅",
    teacherId: "T008",
    photo:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20pipa%20lute%20instrument%20traditional%20music%20professional%20photo&image_size=square_hd",
    createdAt: "2024-03-01T13:10:00Z",
  },
  {
    id: "INS-023",
    type: "扬琴",
    brand: "星海",
    classroom: "音乐教室A103",
    teacherId: "T006",
    photo:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20yangqin%20dulcimer%20instrument%20traditional%20music%20room&image_size=square_hd",
    createdAt: "2024-04-10T09:00:00Z",
  },
  {
    id: "INS-024",
    type: "笛子",
    brand: "西湖",
    classroom: "民乐排练厅",
    teacherId: "T008",
    photo:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20bamboo%20flute%20dizi%20traditional%20instrument%20professional%20photo&image_size=square_hd",
    createdAt: "2024-04-15T15:00:00Z",
  },
  {
    id: "INS-025",
    type: "吉他",
    brand: "马丁",
    classroom: "音乐教室B201",
    teacherId: "T004",
    photo:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=martin%20acoustic%20guitar%20wooden%20professional%20photography&image_size=square_hd",
    createdAt: "2024-05-01T10:00:00Z",
  },
];

export const getInstrumentById = (id: string) =>
  mockInstruments.find((i) => i.id === id);

export const getInstrumentsByTeacher = (teacherId: string) =>
  mockInstruments.filter((i) => i.teacherId === teacherId);

export const getInstrumentsByClassroom = (classroom: string) =>
  mockInstruments.filter((i) => i.classroom === classroom);
