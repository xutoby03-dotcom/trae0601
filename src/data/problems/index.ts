import type { Problem } from '@/types';

export const problems: Problem[] = [
  {
    id: 1,
    title: '查询所有员工',
    description: '从 employees 表中查询所有员工的姓名（first_name 和 last_name）和雇佣日期。',
    databaseId: 'employee',
    difficulty: 'easy',
    category: '单表查询',
    expectedQuery: "SELECT first_name, last_name, hire_date FROM employees;",
    hint: '使用 SELECT 语句选择需要的列，FROM 指定表名。',
  },
  {
    id: 2,
    title: '按工资排序',
    description: '查询薪资表中工资大于 60000 的记录，按工资降序排列。',
    databaseId: 'employee',
    difficulty: 'easy',
    category: '单表查询',
    expectedQuery: "SELECT * FROM salaries WHERE salary > 60000 ORDER BY salary DESC;",
    hint: '使用 WHERE 子句过滤条件，ORDER BY DESC 降序排列。',
  },
  {
    id: 3,
    title: '限制结果条数',
    description: '查询产品表中单价最高的前 5 个产品的名称和单价。',
    databaseId: 'northwind',
    difficulty: 'easy',
    category: '单表查询',
    expectedQuery: "SELECT ProductName, UnitPrice FROM Products ORDER BY UnitPrice DESC LIMIT 5;",
    hint: '使用 ORDER BY DESC 排序，LIMIT 限制结果数量。',
  },
  {
    id: 4,
    title: '模糊查询',
    description: '查询所有姓以 "D" 开头的员工。',
    databaseId: 'employee',
    difficulty: 'easy',
    category: '单表查询',
    expectedQuery: "SELECT * FROM employees WHERE last_name LIKE 'D%';",
    hint: '使用 LIKE 操作符进行模糊匹配，% 表示任意字符。',
  },
  {
    id: 5,
    title: 'IN 条件查询',
    description: '查询位于 USA、UK、France 的客户信息。',
    databaseId: 'northwind',
    difficulty: 'easy',
    category: '单表查询',
    expectedQuery: "SELECT * FROM Customers WHERE Country IN ('USA', 'UK', 'France');",
    hint: '使用 IN 操作符匹配多个值。',
  },
  {
    id: 6,
    title: '统计员工总数',
    description: '统计员工表中总共有多少名员工。',
    databaseId: 'employee',
    difficulty: 'easy',
    category: '聚合函数',
    expectedQuery: "SELECT COUNT(*) AS total_employees FROM employees;",
    hint: '使用 COUNT() 聚合函数统计行数。',
  },
  {
    id: 7,
    title: '计算平均工资',
    description: '计算所有员工的平均工资。',
    databaseId: 'employee',
    difficulty: 'easy',
    category: '聚合函数',
    expectedQuery: "SELECT AVG(salary) AS average_salary FROM salaries;",
    hint: '使用 AVG() 函数计算平均值。',
  },
  {
    id: 8,
    title: '按部门统计人数',
    description: '统计每个部门有多少名员工，显示部门名称和人数。',
    databaseId: 'employee',
    difficulty: 'medium',
    category: '分组聚合',
    expectedQuery: `
SELECT d.dept_name, COUNT(de.emp_no) AS employee_count
FROM departments d
JOIN dept_emp de ON d.dept_no = de.dept_no
GROUP BY d.dept_name;`,
    hint: '使用 JOIN 连接表，GROUP BY 分组，COUNT() 统计。',
  },
  {
    id: 9,
    title: '员工及其部门',
    description: '查询每位员工及其所属的部门名称，显示员工姓名和部门名。',
    databaseId: 'employee',
    difficulty: 'medium',
    category: '多表连接',
    expectedQuery: `
SELECT e.first_name, e.last_name, d.dept_name
FROM employees e
JOIN dept_emp de ON e.emp_no = de.emp_no
JOIN departments d ON de.dept_no = d.dept_no;`,
    hint: '需要连接 employees、dept_emp、departments 三张表。',
  },
  {
    id: 10,
    title: '订单详情',
    description: '查询订单信息，包括订单ID、客户公司名称、订单日期。',
    databaseId: 'northwind',
    difficulty: 'medium',
    category: '多表连接',
    expectedQuery: `
SELECT o.OrderID, c.CompanyName, o.OrderDate
FROM Orders o
JOIN Customers c ON o.CustomerID = c.CustomerID;`,
    hint: '使用 INNER JOIN 连接 Orders 和 Customers 表。',
  },
  {
    id: 11,
    title: '左连接查询',
    description: '查询所有产品及其分类名称，包括没有分类的产品。',
    databaseId: 'northwind',
    difficulty: 'medium',
    category: '多表连接',
    expectedQuery: `
SELECT p.ProductName, c.CategoryName
FROM Products p
LEFT JOIN Categories c ON p.CategoryID = c.CategoryID;`,
    hint: '使用 LEFT JOIN 确保左表的所有记录都显示。',
  },
  {
    id: 12,
    title: '自连接员工经理',
    description: '查询员工及其经理的姓名，使用自连接。',
    databaseId: 'northwind',
    difficulty: 'medium',
    category: '多表连接',
    expectedQuery: `
SELECT e.FirstName AS EmployeeFirstName, e.LastName AS EmployeeLastName,
       m.FirstName AS ManagerFirstName, m.LastName AS ManagerLastName
FROM Employees e
LEFT JOIN Employees m ON e.ReportsTo = m.EmployeeID;`,
    hint: '同一张表使用不同别名进行自连接。',
  },
  {
    id: 13,
    title: '子查询找高工资',
    description: '找出工资高于平均工资的员工。',
    databaseId: 'employee',
    difficulty: 'medium',
    category: '子查询',
    expectedQuery: `
SELECT e.first_name, e.last_name, s.salary
FROM employees e
JOIN salaries s ON e.emp_no = s.emp_no
WHERE s.salary > (SELECT AVG(salary) FROM salaries);`,
    hint: '在 WHERE 子句中使用子查询获取平均工资。',
  },
  {
    id: 14,
    title: 'EXISTS 查询有订单的客户',
    description: '找出至少下过一次订单的客户。',
    databaseId: 'northwind',
    difficulty: 'medium',
    category: '子查询',
    expectedQuery: `
SELECT c.CustomerID, c.CompanyName
FROM Customers c
WHERE EXISTS (
    SELECT 1 FROM Orders o WHERE o.CustomerID = c.CustomerID
);`,
    hint: '使用 EXISTS 子查询检查相关记录是否存在。',
  },
  {
    id: 15,
    title: 'IN 子查询畅销产品',
    description: '找出已被订购的产品名称。',
    databaseId: 'northwind',
    difficulty: 'medium',
    category: '子查询',
    expectedQuery: `
SELECT ProductName
FROM Products
WHERE ProductID IN (SELECT DISTINCT ProductID FROM OrderDetails);`,
    hint: '使用 IN 配合子查询获取产品ID列表。',
  },
  {
    id: 16,
    title: '行号排名',
    description: '按部门对员工进行编号，每个部门内按姓名排序。',
    databaseId: 'employee',
    difficulty: 'hard',
    category: '窗口函数',
    expectedQuery: `
SELECT d.dept_name, e.first_name, e.last_name,
       ROW_NUMBER() OVER (PARTITION BY de.dept_no ORDER BY e.last_name) AS row_num
FROM employees e
JOIN dept_emp de ON e.emp_no = de.emp_no
JOIN departments d ON de.dept_no = d.dept_no;`,
    hint: '使用 ROW_NUMBER() 窗口函数，PARTITION BY 分组。',
  },
  {
    id: 17,
    title: '工资排名',
    description: '计算每位员工的工资排名，允许并列排名。',
    databaseId: 'employee',
    difficulty: 'hard',
    category: '窗口函数',
    expectedQuery: `
SELECT e.first_name, e.last_name, s.salary,
       RANK() OVER (ORDER BY s.salary DESC) AS salary_rank
FROM employees e
JOIN salaries s ON e.emp_no = s.emp_no;`,
    hint: '使用 RANK() 函数，注意与 DENSE_RANK 的区别。',
  },
  {
    id: 18,
    title: '累计求和',
    description: '计算订单金额的累计总和，按订单日期排序。',
    databaseId: 'bookstore',
    difficulty: 'hard',
    category: '窗口函数',
    expectedQuery: `
SELECT order_id, order_date, total_amount,
       SUM(total_amount) OVER (ORDER BY order_date) AS cumulative_total
FROM orders;`,
    hint: '使用 SUM() OVER (ORDER BY ...) 计算累计和。',
  },
  {
    id: 19,
    title: 'CTE 层次查询',
    description: '使用 WITH 子句查询书籍分类及其子分类。',
    databaseId: 'bookstore',
    difficulty: 'hard',
    category: 'CTE高级',
    expectedQuery: `
WITH CategoryHierarchy AS (
    SELECT category_id, category_name, parent_category_id, 1 AS level
    FROM categories
    WHERE parent_category_id IS NULL
    UNION ALL
    SELECT c.category_id, c.category_name, c.parent_category_id, ch.level + 1
    FROM categories c
    JOIN CategoryHierarchy ch ON c.parent_category_id = ch.category_id
)
SELECT * FROM CategoryHierarchy ORDER BY level, category_name;`,
    hint: '使用 WITH 递归CTE实现层次查询。',
  },
  {
    id: 20,
    title: '综合分析',
    description: '查询每本书的总销量和平均评分，按总销量降序排列。',
    databaseId: 'bookstore',
    difficulty: 'hard',
    category: 'CTE高级',
    expectedQuery: `
WITH BookSales AS (
    SELECT book_id, SUM(quantity) AS total_sold
    FROM order_items
    GROUP BY book_id
),
BookRatings AS (
    SELECT book_id, AVG(rating) AS avg_rating
    FROM reviews
    GROUP BY book_id
)
SELECT b.title, bs.total_sold, br.avg_rating
FROM books b
LEFT JOIN BookSales bs ON b.book_id = bs.book_id
LEFT JOIN BookRatings br ON b.book_id = br.book_id
ORDER BY bs.total_sold DESC;`,
    hint: '使用多个CTE分别计算销量和评分，再连接主表。',
  },
];

export const getProblemById = (id: number): Problem | undefined => {
  return problems.find((p) => p.id === id);
};

export const getProblemsByDatabase = (databaseId: string): Problem[] => {
  return problems.filter((p) => p.databaseId === databaseId);
};
