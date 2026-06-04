import type { Database } from '@/types';

const employeeSql = `
CREATE TABLE departments (
  dept_no CHAR(4) PRIMARY KEY,
  dept_name VARCHAR(40) NOT NULL UNIQUE
);

CREATE TABLE employees (
  emp_no INTEGER PRIMARY KEY,
  birth_date TEXT NOT NULL,
  first_name VARCHAR(14) NOT NULL,
  last_name VARCHAR(16) NOT NULL,
  gender CHAR(1) NOT NULL,
  hire_date TEXT NOT NULL
);

CREATE TABLE dept_emp (
  emp_no INTEGER,
  dept_no CHAR(4),
  from_date TEXT NOT NULL,
  to_date TEXT NOT NULL,
  PRIMARY KEY (emp_no, dept_no),
  FOREIGN KEY (emp_no) REFERENCES employees(emp_no),
  FOREIGN KEY (dept_no) REFERENCES departments(dept_no)
);

CREATE TABLE dept_manager (
  dept_no CHAR(4),
  emp_no INTEGER,
  from_date TEXT NOT NULL,
  to_date TEXT NOT NULL,
  PRIMARY KEY (dept_no, emp_no),
  FOREIGN KEY (dept_no) REFERENCES departments(dept_no),
  FOREIGN KEY (emp_no) REFERENCES employees(emp_no)
);

CREATE TABLE salaries (
  emp_no INTEGER,
  salary INTEGER NOT NULL,
  from_date TEXT,
  to_date TEXT,
  PRIMARY KEY (emp_no, from_date),
  FOREIGN KEY (emp_no) REFERENCES employees(emp_no)
);

CREATE TABLE titles (
  emp_no INTEGER,
  title VARCHAR(50),
  from_date TEXT,
  to_date TEXT,
  PRIMARY KEY (emp_no, title, from_date),
  FOREIGN KEY (emp_no) REFERENCES employees(emp_no)
);

CREATE TABLE projects (
  project_id INTEGER PRIMARY KEY,
  project_name VARCHAR(100) NOT NULL,
  dept_no CHAR(4),
  start_date TEXT,
  end_date TEXT,
  budget REAL,
  FOREIGN KEY (dept_no) REFERENCES departments(dept_no)
);

CREATE TABLE project_assignments (
  emp_no INTEGER,
  project_id INTEGER,
  role VARCHAR(50),
  hours_per_week INTEGER,
  start_date TEXT,
  end_date TEXT,
  PRIMARY KEY (emp_no, project_id),
  FOREIGN KEY (emp_no) REFERENCES employees(emp_no),
  FOREIGN KEY (project_id) REFERENCES projects(project_id)
);

CREATE TABLE leave_records (
  leave_id INTEGER PRIMARY KEY,
  emp_no INTEGER,
  leave_type VARCHAR(20),
  start_date TEXT,
  end_date TEXT,
  days_count INTEGER,
  status VARCHAR(20),
  FOREIGN KEY (emp_no) REFERENCES employees(emp_no)
);

CREATE TABLE performance (
  performance_id INTEGER PRIMARY KEY,
  emp_no INTEGER,
  review_year INTEGER,
  review_quarter INTEGER,
  score INTEGER,
  comments TEXT,
  reviewer_id INTEGER,
  FOREIGN KEY (emp_no) REFERENCES employees(emp_no),
  FOREIGN KEY (reviewer_id) REFERENCES employees(emp_no)
);

INSERT INTO departments (dept_no, dept_name) VALUES
('d001', 'Marketing'),
('d002', 'Finance'),
('d003', 'Human Resources'),
('d004', 'Production'),
('d005', 'Development'),
('d006', 'Quality Management'),
('d007', 'Sales'),
('d008', 'Research'),
('d009', 'Customer Service');

INSERT INTO employees (emp_no, birth_date, first_name, last_name, gender, hire_date) VALUES
(10001, '1953-09-02', 'Georgi', 'Facello', 'M', '1986-06-26'),
(10002, '1964-06-02', 'Bezalel', 'Simmel', 'F', '1985-11-21'),
(10003, '1959-12-03', 'Parto', 'Bamford', 'M', '1986-08-28'),
(10004, '1954-05-01', 'Chirstian', 'Koblick', 'M', '1986-12-01'),
(10005, '1955-01-21', 'Kyoichi', 'Maliniak', 'M', '1989-09-12'),
(10006, '1953-04-20', 'Anneke', 'Preusig', 'F', '1989-06-02'),
(10007, '1957-05-23', 'Tzvetan', 'Zielinski', 'F', '1989-02-10'),
(10008, '1958-02-19', 'Saniya', 'Kalloufi', 'M', '1994-09-15'),
(10009, '1952-04-19', 'Sumant', 'Peac', 'F', '1985-02-18'),
(10010, '1963-06-01', 'Palker', 'Alpay', 'F', '1990-04-28'),
(10011, '1953-11-07', 'Mary', 'Sluis', 'F', '1990-01-22'),
(10012, '1960-10-04', 'Patricio', 'Bridgland', 'M', '1992-12-18'),
(10013, '1963-06-07', 'Eberhardt', 'Terkki', 'M', '1985-10-20'),
(10014, '1956-02-12', 'Berni', 'Genin', 'M', '1987-03-11'),
(10015, '1959-08-19', 'Guoxiang', 'Nooteboom', 'M', '1987-07-02');

INSERT INTO dept_emp (emp_no, dept_no, from_date, to_date) VALUES
(10001, 'd005', '1986-06-26', '9999-01-01'),
(10002, 'd007', '1996-08-03', '9999-01-01'),
(10003, 'd004', '1995-12-03', '9999-01-01'),
(10004, 'd004', '1986-12-01', '9999-01-01'),
(10005, 'd003', '1989-09-12', '9999-01-01'),
(10006, 'd005', '1990-08-05', '9999-01-01'),
(10007, 'd008', '1989-02-10', '9999-01-01'),
(10008, 'd005', '1998-03-11', '9999-01-01'),
(10009, 'd006', '1996-02-11', '9999-01-01'),
(10010, 'd004', '1996-11-24', '9999-01-01');

INSERT INTO dept_manager (dept_no, emp_no, from_date, to_date) VALUES
('d001', 10002, '1985-01-01', '1991-10-01'),
('d002', 10004, '1985-01-01', '1989-12-17'),
('d003', 10005, '1985-01-01', '1992-03-21'),
('d004', 10003, '1985-01-01', '1988-09-09'),
('d005', 10001, '1985-01-01', '1991-04-08'),
('d006', 10009, '1985-01-01', '1989-05-06'),
('d007', 10010, '1985-01-01', '1991-03-07'),
('d008', 10007, '1985-01-01', '1988-10-17'),
('d009', 10011, '1985-01-01', '1988-09-20');

INSERT INTO salaries (emp_no, salary, from_date, to_date) VALUES
(10001, 60117, '1986-06-26', '1987-06-26'),
(10001, 62102, '1987-06-26', '1988-06-25'),
(10001, 66074, '1988-06-25', '1989-06-25'),
(10001, 88958, '1989-06-25', '1990-06-25'),
(10001, 94692, '1990-06-25', '9999-01-01'),
(10002, 72527, '1996-08-03', '1997-08-03'),
(10002, 72527, '1997-08-03', '1998-08-03'),
(10002, 72527, '1998-08-03', '1999-08-03'),
(10002, 72527, '1999-08-03', '2000-08-02'),
(10002, 72527, '2000-08-02', '9999-01-01'),
(10003, 40000, '1995-12-03', '1996-12-02'),
(10003, 43616, '1996-12-02', '1997-12-02'),
(10003, 43616, '1997-12-02', '1998-12-02'),
(10003, 43616, '1998-12-02', '1999-12-02'),
(10003, 43478, '1999-12-02', '9999-01-01');

INSERT INTO titles (emp_no, title, from_date, to_date) VALUES
(10001, 'Senior Engineer', '1986-06-26', '9999-01-01'),
(10002, 'Staff', '1996-08-03', '9999-01-01'),
(10003, 'Senior Engineer', '1995-12-03', '9999-01-01'),
(10004, 'Engineer', '1986-12-01', '1995-12-01'),
(10004, 'Senior Engineer', '1995-12-01', '9999-01-01'),
(10005, 'Senior Staff', '1989-09-12', '9999-01-01'),
(10006, 'Senior Engineer', '1990-08-05', '9999-01-01'),
(10007, 'Senior Staff', '1989-02-10', '9999-01-01'),
(10008, 'Assistant Engineer', '1998-03-11', '9999-01-01'),
(10009, 'Engineer', '1996-02-11', '9999-01-01'),
(10010, 'Engineer', '1996-11-24', '9999-01-01');

INSERT INTO projects (project_id, project_name, dept_no, start_date, end_date, budget) VALUES
(1, 'Project Alpha', 'd005', '2023-01-01', '2023-12-31', 500000),
(2, 'Project Beta', 'd005', '2023-03-01', '2023-09-30', 250000),
(3, 'Project Gamma', 'd007', '2023-02-01', '2024-01-31', 800000),
(4, 'Project Delta', 'd008', '2023-04-01', '2023-10-31', 350000),
(5, 'Project Epsilon', 'd004', '2023-05-01', '2024-04-30', 600000);

INSERT INTO project_assignments (emp_no, project_id, role, hours_per_week, start_date, end_date) VALUES
(10001, 1, 'Lead Engineer', 40, '2023-01-01', '2023-12-31'),
(10003, 1, 'Developer', 35, '2023-01-15', '2023-12-31'),
(10006, 2, 'Lead Engineer', 40, '2023-03-01', '2023-09-30'),
(10008, 2, 'Developer', 30, '2023-03-15', '2023-09-30'),
(10007, 4, 'Research Lead', 35, '2023-04-01', '2023-10-31'),
(10004, 5, 'Production Lead', 40, '2023-05-01', '2024-04-30');

INSERT INTO leave_records (leave_id, emp_no, leave_type, start_date, end_date, days_count, status) VALUES
(1, 10001, 'Annual', '2023-07-01', '2023-07-05', 5, 'Approved'),
(2, 10002, 'Sick', '2023-03-15', '2023-03-17', 3, 'Approved'),
(3, 10003, 'Annual', '2023-08-20', '2023-08-25', 6, 'Approved'),
(4, 10005, 'Personal', '2023-09-10', '2023-09-10', 1, 'Approved'),
(5, 10007, 'Maternity', '2023-06-01', '2023-11-30', 183, 'Approved');

INSERT INTO performance (performance_id, emp_no, review_year, review_quarter, score, comments, reviewer_id) VALUES
(1, 10001, 2023, 1, 85, 'Excellent technical skills', 10002),
(2, 10001, 2023, 2, 88, 'Consistently meets deadlines', 10002),
(3, 10002, 2023, 1, 90, 'Strong leadership abilities', 10003),
(4, 10003, 2023, 1, 78, 'Good team player', 10001),
(5, 10004, 2023, 1, 82, 'Reliable and hardworking', 10005),
(6, 10005, 2023, 1, 92, 'Outstanding management skills', 10002),
(7, 10006, 2023, 1, 80, 'Needs improvement in communication', 10001),
(8, 10007, 2023, 1, 87, 'Creative problem solver', 10008);
`;

export const employeeDatabase: Database = {
  id: 'employee',
  name: '员工管理',
  description: '员工信息管理系统，包含薪资、职位、部门等数据',
  sql: employeeSql,
  tables: [
    {
      name: 'departments',
      columns: [
        { name: 'dept_no', type: 'CHAR(4)', isPrimaryKey: true, isForeignKey: false, isNullable: false, hasIndex: true },
        { name: 'dept_name', type: 'VARCHAR(40)', isPrimaryKey: false, isForeignKey: false, isNullable: false, hasIndex: true },
      ],
      foreignKeys: [],
    },
    {
      name: 'employees',
      columns: [
        { name: 'emp_no', type: 'INTEGER', isPrimaryKey: true, isForeignKey: false, isNullable: false, hasIndex: true },
        { name: 'birth_date', type: 'TEXT', isPrimaryKey: false, isForeignKey: false, isNullable: false, hasIndex: false },
        { name: 'first_name', type: 'VARCHAR(14)', isPrimaryKey: false, isForeignKey: false, isNullable: false, hasIndex: false },
        { name: 'last_name', type: 'VARCHAR(16)', isPrimaryKey: false, isForeignKey: false, isNullable: false, hasIndex: false },
        { name: 'gender', type: 'CHAR(1)', isPrimaryKey: false, isForeignKey: false, isNullable: false, hasIndex: false },
        { name: 'hire_date', type: 'TEXT', isPrimaryKey: false, isForeignKey: false, isNullable: false, hasIndex: false },
      ],
      foreignKeys: [],
    },
    {
      name: 'dept_emp',
      columns: [
        { name: 'emp_no', type: 'INTEGER', isPrimaryKey: true, isForeignKey: true, isNullable: false, hasIndex: true, foreignKeyRef: 'employees.emp_no' },
        { name: 'dept_no', type: 'CHAR(4)', isPrimaryKey: true, isForeignKey: true, isNullable: false, hasIndex: true, foreignKeyRef: 'departments.dept_no' },
        { name: 'from_date', type: 'TEXT', isPrimaryKey: false, isForeignKey: false, isNullable: false, hasIndex: false },
        { name: 'to_date', type: 'TEXT', isPrimaryKey: false, isForeignKey: false, isNullable: false, hasIndex: false },
      ],
      foreignKeys: [
        { column: 'emp_no', refTable: 'employees', refColumn: 'emp_no' },
        { column: 'dept_no', refTable: 'departments', refColumn: 'dept_no' },
      ],
    },
    {
      name: 'dept_manager',
      columns: [
        { name: 'dept_no', type: 'CHAR(4)', isPrimaryKey: true, isForeignKey: true, isNullable: false, hasIndex: true, foreignKeyRef: 'departments.dept_no' },
        { name: 'emp_no', type: 'INTEGER', isPrimaryKey: true, isForeignKey: true, isNullable: false, hasIndex: true, foreignKeyRef: 'employees.emp_no' },
        { name: 'from_date', type: 'TEXT', isPrimaryKey: false, isForeignKey: false, isNullable: false, hasIndex: false },
        { name: 'to_date', type: 'TEXT', isPrimaryKey: false, isForeignKey: false, isNullable: false, hasIndex: false },
      ],
      foreignKeys: [
        { column: 'dept_no', refTable: 'departments', refColumn: 'dept_no' },
        { column: 'emp_no', refTable: 'employees', refColumn: 'emp_no' },
      ],
    },
    {
      name: 'salaries',
      columns: [
        { name: 'emp_no', type: 'INTEGER', isPrimaryKey: true, isForeignKey: true, isNullable: false, hasIndex: true, foreignKeyRef: 'employees.emp_no' },
        { name: 'salary', type: 'INTEGER', isPrimaryKey: false, isForeignKey: false, isNullable: false, hasIndex: false },
        { name: 'from_date', type: 'TEXT', isPrimaryKey: true, isForeignKey: false, isNullable: true, hasIndex: false },
        { name: 'to_date', type: 'TEXT', isPrimaryKey: false, isForeignKey: false, isNullable: true, hasIndex: false },
      ],
      foreignKeys: [{ column: 'emp_no', refTable: 'employees', refColumn: 'emp_no' }],
    },
    {
      name: 'titles',
      columns: [
        { name: 'emp_no', type: 'INTEGER', isPrimaryKey: true, isForeignKey: true, isNullable: false, hasIndex: true, foreignKeyRef: 'employees.emp_no' },
        { name: 'title', type: 'VARCHAR(50)', isPrimaryKey: true, isForeignKey: false, isNullable: true, hasIndex: false },
        { name: 'from_date', type: 'TEXT', isPrimaryKey: true, isForeignKey: false, isNullable: true, hasIndex: false },
        { name: 'to_date', type: 'TEXT', isPrimaryKey: false, isForeignKey: false, isNullable: true, hasIndex: false },
      ],
      foreignKeys: [{ column: 'emp_no', refTable: 'employees', refColumn: 'emp_no' }],
    },
    {
      name: 'projects',
      columns: [
        { name: 'project_id', type: 'INTEGER', isPrimaryKey: true, isForeignKey: false, isNullable: false, hasIndex: true },
        { name: 'project_name', type: 'VARCHAR(100)', isPrimaryKey: false, isForeignKey: false, isNullable: false, hasIndex: false },
        { name: 'dept_no', type: 'CHAR(4)', isPrimaryKey: false, isForeignKey: true, isNullable: true, hasIndex: true, foreignKeyRef: 'departments.dept_no' },
        { name: 'budget', type: 'REAL', isPrimaryKey: false, isForeignKey: false, isNullable: true, hasIndex: false },
      ],
      foreignKeys: [{ column: 'dept_no', refTable: 'departments', refColumn: 'dept_no' }],
    },
    {
      name: 'project_assignments',
      columns: [
        { name: 'emp_no', type: 'INTEGER', isPrimaryKey: true, isForeignKey: true, isNullable: false, hasIndex: true, foreignKeyRef: 'employees.emp_no' },
        { name: 'project_id', type: 'INTEGER', isPrimaryKey: true, isForeignKey: true, isNullable: false, hasIndex: true, foreignKeyRef: 'projects.project_id' },
        { name: 'role', type: 'VARCHAR(50)', isPrimaryKey: false, isForeignKey: false, isNullable: true, hasIndex: false },
        { name: 'hours_per_week', type: 'INTEGER', isPrimaryKey: false, isForeignKey: false, isNullable: true, hasIndex: false },
      ],
      foreignKeys: [
        { column: 'emp_no', refTable: 'employees', refColumn: 'emp_no' },
        { column: 'project_id', refTable: 'projects', refColumn: 'project_id' },
      ],
    },
  ],
};
