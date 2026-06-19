import db, { initDatabase } from "./index.js";
import type {
  Student,
  Product,
  Order,
  Purchase,
  ProductCategory,
  Size,
  OriginalCondition,
  PaymentStatus,
  OrderStatus,
  PurchaseStatus,
} from "../../shared/types.js";

const now = Date.now();
const day = 24 * 60 * 60 * 1000;

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function buildSizeChart(): Record<Size, { height: string; weight: string }> {
  return {
    S: { height: "110-120cm", weight: "18-25kg" },
    M: { height: "120-130cm", weight: "22-30kg" },
    L: { height: "130-140cm", weight: "28-38kg" },
    XL: { height: "140-150cm", weight: "35-45kg" },
    XXL: { height: "150-160cm", weight: "42-55kg" },
  };
}

const studentNames = [
  "张伟", "王芳", "李娜", "刘洋", "陈静",
  "杨帆", "赵磊", "黄敏", "周杰", "吴婷",
  "徐浩", "孙悦", "马超", "朱琳", "胡军",
  "郭涛", "林雪", "何强", "高翔", "罗敏",
  "郑凯", "梁红", "谢鹏", "宋佳", "唐亮",
  "韩梅", "冯刚", "董洁", "萧然", "程琳",
];

const classes = ["一年级1班", "一年级2班", "一年级3班", "二年级1班", "二年级2班"];
const sizes: Size[] = ["S", "M", "L", "XL", "XXL"];

const students: Omit<Student, "id" | "createdAt">[] = studentNames.map((name, idx) => ({
  className: classes[idx % 5],
  name,
  height: 110 + Math.floor(Math.random() * 40),
  weight: 18 + Math.floor(Math.random() * 20),
  originalSize: sizes[idx % 5],
  phone: `138${String(10000000 + idx).slice(-8)}`,
  remark: idx % 7 === 0 ? "过敏体质，请注意面料" : "",
}));

const productsData: Array<{
  category: ProductCategory;
  name: string;
  stock: Record<Size, number>;
  price: number;
  supplier: string;
}> = [
  {
    category: "summer",
    name: "夏季校服套装",
    stock: { S: 15, M: 20, L: 8, XL: 3, XXL: 0 },
    price: 128,
    supplier: "华盛服饰有限公司",
  },
  {
    category: "autumn",
    name: "秋季校服套装",
    stock: { S: 12, M: 18, L: 5, XL: 2, XXL: 1 },
    price: 198,
    supplier: "华盛服饰有限公司",
  },
  {
    category: "sports",
    name: "运动服套装",
    stock: { S: 10, M: 15, L: 6, XL: 1, XXL: 0 },
    price: 168,
    supplier: "飞跃运动用品厂",
  },
  {
    category: "vest",
    name: "保暖马甲",
    stock: { S: 8, M: 12, L: 4, XL: 0, XXL: 0 },
    price: 88,
    supplier: "华盛服饰有限公司",
  },
  {
    category: "pants",
    name: "校服长裤",
    stock: { S: 20, M: 25, L: 10, XL: 5, XXL: 2 },
    price: 68,
    supplier: "飞跃运动用品厂",
  },
];

initDatabase();

const insertStudent = db.prepare(`
  INSERT INTO students (id, className, name, height, weight, originalSize, phone, remark, createdAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertProduct = db.prepare(`
  INSERT INTO products (id, category, name, sizeChart, stock, price, supplier, createdAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertOrder = db.prepare(`
  INSERT INTO orders (id, studentId, productId, size, quantity, isExchange, originalSize, originalCondition, paymentStatus, orderStatus, remark, createdAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertPurchase = db.prepare(`
  INSERT INTO purchases (id, productId, size, quantity, supplier, status, createdAt, completedAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

db.exec("DELETE FROM purchases; DELETE FROM orders; DELETE FROM products; DELETE FROM students;");

const studentIds: string[] = [];
const productIds: Record<string, string> = {};

const tx = db.transaction(() => {
  students.forEach((s) => {
    const id = `stu-${studentIds.length + 1}`;
    studentIds.push(id);
    insertStudent.run(
      id,
      s.className,
      s.name,
      s.height,
      s.weight,
      s.originalSize,
      s.phone,
      s.remark,
      new Date(now - (studentIds.length + 1) * day).toISOString()
    );
  });

  productsData.forEach((p) => {
    const id = `prod-${p.category}`;
    productIds[p.category] = id;
    insertProduct.run(
      id,
      p.category,
      p.name,
      JSON.stringify(buildSizeChart()),
      JSON.stringify(p.stock),
      p.price,
      p.supplier,
      new Date(now - 30 * day).toISOString()
    );
  });

  const orders: Array<Omit<Order, "id" | "createdAt">> = [
    {
      studentId: studentIds[0],
      productId: productIds["summer"],
      size: "M",
      quantity: 1,
      isExchange: true,
      originalSize: "S",
      originalCondition: "good" as OriginalCondition,
      paymentStatus: "paid" as PaymentStatus,
      orderStatus: "ready" as OrderStatus,
      remark: "学生长高了需要换大一号",
    },
    {
      studentId: studentIds[2],
      productId: productIds["autumn"],
      size: "L",
      quantity: 1,
      isExchange: false,
      paymentStatus: "unpaid" as PaymentStatus,
      orderStatus: "pending" as OrderStatus,
      remark: "",
    },
    {
      studentId: studentIds[4],
      productId: productIds["sports"],
      size: "XL",
      quantity: 2,
      isExchange: true,
      originalSize: "L",
      originalCondition: "damaged" as OriginalCondition,
      paymentStatus: "paid" as PaymentStatus,
      orderStatus: "purchasing" as OrderStatus,
      remark: "原运动服肘部破损",
    },
    {
      studentId: studentIds[6],
      productId: productIds["vest"],
      size: "XXL",
      quantity: 1,
      isExchange: false,
      paymentStatus: "paid" as PaymentStatus,
      orderStatus: "purchasing" as OrderStatus,
      remark: "体型较胖需要加大码",
    },
    {
      studentId: studentIds[8],
      productId: productIds["pants"],
      size: "M",
      quantity: 1,
      isExchange: true,
      originalSize: "S",
      originalCondition: "lost" as OriginalCondition,
      paymentStatus: "paid" as PaymentStatus,
      orderStatus: "completed" as OrderStatus,
      remark: "校裤丢失需重新购买",
    },
    {
      studentId: studentIds[10],
      productId: productIds["summer"],
      size: "L",
      quantity: 1,
      isExchange: false,
      paymentStatus: "paid" as PaymentStatus,
      orderStatus: "completed" as OrderStatus,
      remark: "",
    },
    {
      studentId: studentIds[12],
      productId: productIds["autumn"],
      size: "XL",
      quantity: 1,
      isExchange: true,
      originalSize: "M",
      originalCondition: "good" as OriginalCondition,
      paymentStatus: "unpaid" as PaymentStatus,
      orderStatus: "pending" as OrderStatus,
      remark: "身高增长较快",
    },
    {
      studentId: studentIds[14],
      productId: productIds["sports"],
      size: "S",
      quantity: 1,
      isExchange: false,
      paymentStatus: "paid" as PaymentStatus,
      orderStatus: "ready" as OrderStatus,
      remark: "",
    },
    {
      studentId: studentIds[16],
      productId: productIds["summer"],
      size: "XXL",
      quantity: 1,
      isExchange: false,
      paymentStatus: "unpaid" as PaymentStatus,
      orderStatus: "purchasing" as OrderStatus,
      remark: "",
    },
    {
      studentId: studentIds[18],
      productId: productIds["pants"],
      size: "L",
      quantity: 2,
      isExchange: true,
      originalSize: "M",
      originalCondition: "damaged" as OriginalCondition,
      paymentStatus: "paid" as PaymentStatus,
      orderStatus: "ready" as OrderStatus,
      remark: "膝盖处磨破",
    },
    {
      studentId: studentIds[20],
      productId: productIds["vest"],
      size: "M",
      quantity: 1,
      isExchange: false,
      paymentStatus: "paid" as PaymentStatus,
      orderStatus: "completed" as OrderStatus,
      remark: "",
    },
    {
      studentId: studentIds[22],
      productId: productIds["autumn"],
      size: "S",
      quantity: 1,
      isExchange: false,
      paymentStatus: "unpaid" as PaymentStatus,
      orderStatus: "pending" as OrderStatus,
      remark: "新转入学生",
    },
    {
      studentId: studentIds[24],
      productId: productIds["sports"],
      size: "M",
      quantity: 1,
      isExchange: true,
      originalSize: "S",
      originalCondition: "good" as OriginalCondition,
      paymentStatus: "paid" as PaymentStatus,
      orderStatus: "ready" as OrderStatus,
      remark: "",
    },
    {
      studentId: studentIds[26],
      productId: productIds["summer"],
      size: "S",
      quantity: 2,
      isExchange: false,
      paymentStatus: "paid" as PaymentStatus,
      orderStatus: "completed" as OrderStatus,
      remark: "多备一套换洗",
    },
    {
      studentId: studentIds[28],
      productId: productIds["pants"],
      size: "XL",
      quantity: 1,
      isExchange: false,
      paymentStatus: "unpaid" as PaymentStatus,
      orderStatus: "purchasing" as OrderStatus,
      remark: "",
    },
  ];

  orders.forEach((o, idx) => {
    const id = `ord-${idx + 1}`;
    insertOrder.run(
      id,
      o.studentId,
      o.productId,
      o.size,
      o.quantity,
      o.isExchange ? 1 : 0,
      o.originalSize || null,
      o.originalCondition || null,
      o.paymentStatus,
      o.orderStatus,
      o.remark,
      new Date(now - (orders.length - idx) * day).toISOString()
    );
  });

  const purchases: Array<Omit<Purchase, "id" | "createdAt">> = [
    {
      productId: productIds["summer"],
      size: "XL",
      quantity: 10,
      supplier: "华盛服饰有限公司",
      status: "pending" as PurchaseStatus,
    },
    {
      productId: productIds["summer"],
      size: "XXL",
      quantity: 5,
      supplier: "华盛服饰有限公司",
      status: "pending" as PurchaseStatus,
    },
    {
      productId: productIds["sports"],
      size: "XL",
      quantity: 8,
      supplier: "飞跃运动用品厂",
      status: "pending" as PurchaseStatus,
    },
    {
      productId: productIds["vest"],
      size: "XL",
      quantity: 6,
      supplier: "华盛服饰有限公司",
      status: "completed" as PurchaseStatus,
      completedAt: new Date(now - 3 * day).toISOString(),
    },
    {
      productId: productIds["autumn"],
      size: "L",
      quantity: 12,
      supplier: "华盛服饰有限公司",
      status: "pending" as PurchaseStatus,
    },
  ];

  purchases.forEach((p, idx) => {
    const id = `pur-${idx + 1}`;
    insertPurchase.run(
      id,
      p.productId,
      p.size,
      p.quantity,
      p.supplier,
      p.status,
      new Date(now - (purchases.length - idx) * day).toISOString(),
      p.completedAt || null
    );
  });
});

tx();

console.log("✅ Database seeded successfully!");
console.log(`   - ${students.length} students`);
console.log(`   - ${productsData.length} products`);
console.log(`   - 15 orders`);
console.log(`   - 5 purchases`);

db.close();
