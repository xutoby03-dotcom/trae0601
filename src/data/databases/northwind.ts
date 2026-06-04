import type { Database } from '@/types';

const northwindSql = `
CREATE TABLE Categories (
  CategoryID INTEGER PRIMARY KEY,
  CategoryName TEXT NOT NULL,
  Description TEXT
);

CREATE TABLE Suppliers (
  SupplierID INTEGER PRIMARY KEY,
  CompanyName TEXT NOT NULL,
  ContactName TEXT,
  ContactTitle TEXT,
  Address TEXT,
  City TEXT,
  Region TEXT,
  PostalCode TEXT,
  Country TEXT,
  Phone TEXT
);

CREATE TABLE Products (
  ProductID INTEGER PRIMARY KEY,
  ProductName TEXT NOT NULL,
  SupplierID INTEGER,
  CategoryID INTEGER,
  QuantityPerUnit TEXT,
  UnitPrice REAL DEFAULT 0,
  UnitsInStock INTEGER DEFAULT 0,
  UnitsOnOrder INTEGER DEFAULT 0,
  ReorderLevel INTEGER DEFAULT 0,
  Discontinued INTEGER DEFAULT 0,
  FOREIGN KEY (SupplierID) REFERENCES Suppliers(SupplierID),
  FOREIGN KEY (CategoryID) REFERENCES Categories(CategoryID)
);

CREATE TABLE Employees (
  EmployeeID INTEGER PRIMARY KEY,
  LastName TEXT NOT NULL,
  FirstName TEXT NOT NULL,
  Title TEXT,
  TitleOfCourtesy TEXT,
  BirthDate TEXT,
  HireDate TEXT,
  Address TEXT,
  City TEXT,
  Region TEXT,
  PostalCode TEXT,
  Country TEXT,
  HomePhone TEXT,
  Extension TEXT,
  ReportsTo INTEGER,
  FOREIGN KEY (ReportsTo) REFERENCES Employees(EmployeeID)
);

CREATE TABLE Customers (
  CustomerID TEXT PRIMARY KEY,
  CompanyName TEXT NOT NULL,
  ContactName TEXT,
  ContactTitle TEXT,
  Address TEXT,
  City TEXT,
  Region TEXT,
  PostalCode TEXT,
  Country TEXT,
  Phone TEXT
);

CREATE TABLE Shippers (
  ShipperID INTEGER PRIMARY KEY,
  CompanyName TEXT NOT NULL,
  Phone TEXT
);

CREATE TABLE Orders (
  OrderID INTEGER PRIMARY KEY,
  CustomerID TEXT,
  EmployeeID INTEGER,
  OrderDate TEXT,
  RequiredDate TEXT,
  ShippedDate TEXT,
  ShipVia INTEGER,
  Freight REAL DEFAULT 0,
  ShipName TEXT,
  ShipAddress TEXT,
  ShipCity TEXT,
  ShipRegion TEXT,
  ShipPostalCode TEXT,
  ShipCountry TEXT,
  FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID),
  FOREIGN KEY (EmployeeID) REFERENCES Employees(EmployeeID),
  FOREIGN KEY (ShipVia) REFERENCES Shippers(ShipperID)
);

CREATE TABLE OrderDetails (
  OrderID INTEGER,
  ProductID INTEGER,
  UnitPrice REAL NOT NULL DEFAULT 0,
  Quantity INTEGER NOT NULL DEFAULT 1,
  Discount REAL NOT NULL DEFAULT 0,
  PRIMARY KEY (OrderID, ProductID),
  FOREIGN KEY (OrderID) REFERENCES Orders(OrderID),
  FOREIGN KEY (ProductID) REFERENCES Products(ProductID)
);

CREATE TABLE Regions (
  RegionID INTEGER PRIMARY KEY,
  RegionDescription TEXT NOT NULL
);

CREATE TABLE Territories (
  TerritoryID TEXT PRIMARY KEY,
  TerritoryDescription TEXT NOT NULL,
  RegionID INTEGER NOT NULL,
  FOREIGN KEY (RegionID) REFERENCES Regions(RegionID)
);

CREATE TABLE EmployeeTerritories (
  EmployeeID INTEGER,
  TerritoryID TEXT,
  PRIMARY KEY (EmployeeID, TerritoryID),
  FOREIGN KEY (EmployeeID) REFERENCES Employees(EmployeeID),
  FOREIGN KEY (TerritoryID) REFERENCES Territories(TerritoryID)
);

INSERT INTO Categories (CategoryID, CategoryName, Description) VALUES
(1, 'Beverages', 'Soft drinks, coffees, teas, beers, and ales'),
(2, 'Condiments', 'Sweet and savory sauces, relishes, spreads, and seasonings'),
(3, 'Confections', 'Desserts, candies, and sweet breads'),
(4, 'Dairy Products', 'Cheeses'),
(5, 'Grains/Cereals', 'Breads, crackers, pasta, and cereal'),
(6, 'Meat/Poultry', 'Prepared meats'),
(7, 'Produce', 'Dried fruit and bean curd'),
(8, 'Seafood', 'Seaweed and fish');

INSERT INTO Suppliers (SupplierID, CompanyName, ContactName, Country) VALUES
(1, 'Exotic Liquids', 'Charlotte Cooper', 'UK'),
(2, 'New Orleans Cajun Delights', 'Shelley Burke', 'USA'),
(3, 'Grandma Kelly''s Homestead', 'Regina Murphy', 'USA'),
(4, 'Tokyo Traders', 'Yoshi Nagase', 'Japan'),
(5, 'Cooperativa de Quesos', 'Antonio del Valle', 'Spain');

INSERT INTO Products (ProductID, ProductName, SupplierID, CategoryID, UnitPrice, UnitsInStock) VALUES
(1, 'Chai', 1, 1, 18.00, 39),
(2, 'Chang', 1, 1, 19.00, 17),
(3, 'Aniseed Syrup', 1, 2, 10.00, 13),
(4, 'Chef Anton''s Cajun Seasoning', 2, 2, 22.00, 53),
(5, 'Chef Anton''s Gumbo Mix', 2, 2, 21.35, 0),
(6, 'Grandma''s Boysenberry Spread', 3, 2, 25.00, 120),
(7, 'Uncle Bob''s Organic Dried Pears', 3, 7, 30.00, 15),
(8, 'Northwoods Cranberry Sauce', 3, 2, 40.00, 6),
(9, 'Mishi Kobe Niku', 4, 6, 97.00, 29),
(10, 'Ikura', 4, 8, 31.00, 31);

INSERT INTO Employees (EmployeeID, LastName, FirstName, Title, City, Country) VALUES
(1, 'Davolio', 'Nancy', 'Sales Representative', 'Seattle', 'USA'),
(2, 'Fuller', 'Andrew', 'Vice President, Sales', 'Tacoma', 'USA'),
(3, 'Leverling', 'Janet', 'Sales Representative', 'Kirkland', 'USA'),
(4, 'Peacock', 'Margaret', 'Sales Representative', 'Redmond', 'USA'),
(5, 'Buchanan', 'Steven', 'Sales Manager', 'London', 'UK'),
(6, 'Suyama', 'Michael', 'Sales Representative', 'London', 'UK'),
(7, 'King', 'Robert', 'Sales Representative', 'London', 'UK'),
(8, 'Callahan', 'Laura', 'Inside Sales Coordinator', 'Seattle', 'USA'),
(9, 'Dodsworth', 'Anne', 'Sales Representative', 'London', 'UK');

INSERT INTO Customers (CustomerID, CompanyName, ContactName, Country) VALUES
('ALFKI', 'Alfreds Futterkiste', 'Maria Anders', 'Germany'),
('ANATR', 'Ana Trujillo Emparedados', 'Ana Trujillo', 'Mexico'),
('ANTON', 'Antonio Moreno Taquería', 'Antonio Moreno', 'Mexico'),
('AROUT', 'Around the Horn', 'Thomas Hardy', 'UK'),
('BERGS', 'Berglunds snabbköp', 'Christina Berglund', 'Sweden'),
('BLAUS', 'Blauer See Delikatessen', 'Hanna Moos', 'Germany'),
('BLONP', 'Blondesddsl père et fils', 'Frédérique Citeaux', 'France'),
('BOLID', 'Bólido Comidas preparadas', 'Martín Sommer', 'Spain'),
('BONAP', 'Bon app''', 'Laurence Lebihan', 'France'),
('BOTTM', 'Bottom-Dollar Markets', 'Elizabeth Lincoln', 'Canada');

INSERT INTO Shippers (ShipperID, CompanyName, Phone) VALUES
(1, 'Speedy Express', '(503) 555-9831'),
(2, 'United Package', '(503) 555-3199'),
(3, 'Federal Shipping', '(503) 555-9931');

INSERT INTO Orders (OrderID, CustomerID, EmployeeID, OrderDate, ShipCountry) VALUES
(10248, 'ALFKI', 5, '1996-07-04', 'France'),
(10249, 'ANATR', 6, '1996-07-05', 'Germany'),
(10250, 'ANTON', 4, '1996-07-08', 'Brazil'),
(10251, 'AROUT', 3, '1996-07-08', 'France'),
(10252, 'BERGS', 4, '1996-07-09', 'Belgium'),
(10253, 'BLAUS', 3, '1996-07-10', 'Switzerland'),
(10254, 'BLONP', 5, '1996-07-11', 'Mexico'),
(10255, 'BOLID', 9, '1996-07-12', 'Germany'),
(10256, 'BONAP', 3, '1996-07-15', 'Brazil'),
(10257, 'BOTTM', 4, '1996-07-16', 'Austria');

INSERT INTO OrderDetails (OrderID, ProductID, UnitPrice, Quantity, Discount) VALUES
(10248, 1, 14.00, 12, 0),
(10248, 2, 9.80, 10, 0),
(10248, 3, 34.80, 5, 0),
(10249, 1, 18.60, 9, 0),
(10249, 2, 42.40, 40, 0),
(10250, 1, 7.70, 10, 0),
(10250, 2, 42.40, 35, 0.15),
(10250, 3, 16.80, 15, 0.15),
(10251, 1, 16.80, 6, 0.05),
(10251, 2, 15.60, 15, 0.05);

INSERT INTO Regions (RegionID, RegionDescription) VALUES
(1, 'Eastern'),
(2, 'Western'),
(3, 'Northern'),
(4, 'Southern');

INSERT INTO Territories (TerritoryID, TerritoryDescription, RegionID) VALUES
('01581', 'Westboro', 1),
('01730', 'Bedford', 1),
('01833', 'Georgetow', 1),
('02116', 'Boston', 1),
('02139', 'Cambridge', 1);

INSERT INTO EmployeeTerritories (EmployeeID, TerritoryID) VALUES
(1, '01581'),
(1, '01730'),
(2, '01833'),
(2, '02116'),
(3, '02139');
`;

export const northwindDatabase: Database = {
  id: 'northwind',
  name: '北风订单',
  description: '经典的销售订单数据库，包含客户、订单、产品等表',
  sql: northwindSql,
  tables: [
    {
      name: 'Categories',
      columns: [
        { name: 'CategoryID', type: 'INTEGER', isPrimaryKey: true, isForeignKey: false, isNullable: false, hasIndex: true },
        { name: 'CategoryName', type: 'TEXT', isPrimaryKey: false, isForeignKey: false, isNullable: false, hasIndex: false },
        { name: 'Description', type: 'TEXT', isPrimaryKey: false, isForeignKey: false, isNullable: true, hasIndex: false },
      ],
      foreignKeys: [],
    },
    {
      name: 'Suppliers',
      columns: [
        { name: 'SupplierID', type: 'INTEGER', isPrimaryKey: true, isForeignKey: false, isNullable: false, hasIndex: true },
        { name: 'CompanyName', type: 'TEXT', isPrimaryKey: false, isForeignKey: false, isNullable: false, hasIndex: false },
        { name: 'ContactName', type: 'TEXT', isPrimaryKey: false, isForeignKey: false, isNullable: true, hasIndex: false },
        { name: 'Country', type: 'TEXT', isPrimaryKey: false, isForeignKey: false, isNullable: true, hasIndex: false },
      ],
      foreignKeys: [],
    },
    {
      name: 'Products',
      columns: [
        { name: 'ProductID', type: 'INTEGER', isPrimaryKey: true, isForeignKey: false, isNullable: false, hasIndex: true },
        { name: 'ProductName', type: 'TEXT', isPrimaryKey: false, isForeignKey: false, isNullable: false, hasIndex: false },
        { name: 'SupplierID', type: 'INTEGER', isPrimaryKey: false, isForeignKey: true, isNullable: true, hasIndex: true, foreignKeyRef: 'Suppliers.SupplierID' },
        { name: 'CategoryID', type: 'INTEGER', isPrimaryKey: false, isForeignKey: true, isNullable: true, hasIndex: true, foreignKeyRef: 'Categories.CategoryID' },
        { name: 'UnitPrice', type: 'REAL', isPrimaryKey: false, isForeignKey: false, isNullable: true, hasIndex: false },
        { name: 'UnitsInStock', type: 'INTEGER', isPrimaryKey: false, isForeignKey: false, isNullable: true, hasIndex: false },
      ],
      foreignKeys: [
        { column: 'SupplierID', refTable: 'Suppliers', refColumn: 'SupplierID' },
        { column: 'CategoryID', refTable: 'Categories', refColumn: 'CategoryID' },
      ],
    },
    {
      name: 'Employees',
      columns: [
        { name: 'EmployeeID', type: 'INTEGER', isPrimaryKey: true, isForeignKey: false, isNullable: false, hasIndex: true },
        { name: 'LastName', type: 'TEXT', isPrimaryKey: false, isForeignKey: false, isNullable: false, hasIndex: false },
        { name: 'FirstName', type: 'TEXT', isPrimaryKey: false, isForeignKey: false, isNullable: false, hasIndex: false },
        { name: 'Title', type: 'TEXT', isPrimaryKey: false, isForeignKey: false, isNullable: true, hasIndex: false },
        { name: 'ReportsTo', type: 'INTEGER', isPrimaryKey: false, isForeignKey: true, isNullable: true, hasIndex: true, foreignKeyRef: 'Employees.EmployeeID' },
      ],
      foreignKeys: [{ column: 'ReportsTo', refTable: 'Employees', refColumn: 'EmployeeID' }],
    },
    {
      name: 'Customers',
      columns: [
        { name: 'CustomerID', type: 'TEXT', isPrimaryKey: true, isForeignKey: false, isNullable: false, hasIndex: true },
        { name: 'CompanyName', type: 'TEXT', isPrimaryKey: false, isForeignKey: false, isNullable: false, hasIndex: false },
        { name: 'ContactName', type: 'TEXT', isPrimaryKey: false, isForeignKey: false, isNullable: true, hasIndex: false },
        { name: 'Country', type: 'TEXT', isPrimaryKey: false, isForeignKey: false, isNullable: true, hasIndex: false },
      ],
      foreignKeys: [],
    },
    {
      name: 'Orders',
      columns: [
        { name: 'OrderID', type: 'INTEGER', isPrimaryKey: true, isForeignKey: false, isNullable: false, hasIndex: true },
        { name: 'CustomerID', type: 'TEXT', isPrimaryKey: false, isForeignKey: true, isNullable: true, hasIndex: true, foreignKeyRef: 'Customers.CustomerID' },
        { name: 'EmployeeID', type: 'INTEGER', isPrimaryKey: false, isForeignKey: true, isNullable: true, hasIndex: true, foreignKeyRef: 'Employees.EmployeeID' },
        { name: 'OrderDate', type: 'TEXT', isPrimaryKey: false, isForeignKey: false, isNullable: true, hasIndex: false },
        { name: 'ShipCountry', type: 'TEXT', isPrimaryKey: false, isForeignKey: false, isNullable: true, hasIndex: false },
      ],
      foreignKeys: [
        { column: 'CustomerID', refTable: 'Customers', refColumn: 'CustomerID' },
        { column: 'EmployeeID', refTable: 'Employees', refColumn: 'EmployeeID' },
      ],
    },
    {
      name: 'OrderDetails',
      columns: [
        { name: 'OrderID', type: 'INTEGER', isPrimaryKey: true, isForeignKey: true, isNullable: false, hasIndex: true, foreignKeyRef: 'Orders.OrderID' },
        { name: 'ProductID', type: 'INTEGER', isPrimaryKey: true, isForeignKey: true, isNullable: false, hasIndex: true, foreignKeyRef: 'Products.ProductID' },
        { name: 'UnitPrice', type: 'REAL', isPrimaryKey: false, isForeignKey: false, isNullable: false, hasIndex: false },
        { name: 'Quantity', type: 'INTEGER', isPrimaryKey: false, isForeignKey: false, isNullable: false, hasIndex: false },
        { name: 'Discount', type: 'REAL', isPrimaryKey: false, isForeignKey: false, isNullable: false, hasIndex: false },
      ],
      foreignKeys: [
        { column: 'OrderID', refTable: 'Orders', refColumn: 'OrderID' },
        { column: 'ProductID', refTable: 'Products', refColumn: 'ProductID' },
      ],
    },
  ],
};
