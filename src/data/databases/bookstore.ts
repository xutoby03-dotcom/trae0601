import type { Database } from '@/types';

const bookstoreSql = `
CREATE TABLE publishers (
  publisher_id INTEGER PRIMARY KEY,
  publisher_name TEXT NOT NULL,
  country TEXT,
  founded_year INTEGER
);

CREATE TABLE categories (
  category_id INTEGER PRIMARY KEY,
  category_name TEXT NOT NULL,
  parent_category_id INTEGER,
  FOREIGN KEY (parent_category_id) REFERENCES categories(category_id)
);

CREATE TABLE authors (
  author_id INTEGER PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  birth_date TEXT,
  country TEXT,
  biography TEXT
);

CREATE TABLE books (
  book_id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  isbn TEXT UNIQUE,
  publisher_id INTEGER,
  publication_date TEXT,
  price REAL NOT NULL DEFAULT 0,
  language TEXT,
  pages INTEGER,
  description TEXT,
  category_id INTEGER,
  FOREIGN KEY (publisher_id) REFERENCES publishers(publisher_id),
  FOREIGN KEY (category_id) REFERENCES categories(category_id)
);

CREATE TABLE book_authors (
  book_id INTEGER,
  author_id INTEGER,
  author_order INTEGER DEFAULT 1,
  PRIMARY KEY (book_id, author_id),
  FOREIGN KEY (book_id) REFERENCES books(book_id),
  FOREIGN KEY (author_id) REFERENCES authors(author_id)
);

CREATE TABLE customers (
  customer_id INTEGER PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  registration_date TEXT NOT NULL
);

CREATE TABLE orders (
  order_id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  order_date TEXT NOT NULL,
  total_amount REAL NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'pending',
  shipping_address TEXT,
  FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

CREATE TABLE order_items (
  order_item_id INTEGER PRIMARY KEY,
  order_id INTEGER NOT NULL,
  book_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price REAL NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(order_id),
  FOREIGN KEY (book_id) REFERENCES books(book_id)
);

CREATE TABLE reviews (
  review_id INTEGER PRIMARY KEY,
  book_id INTEGER NOT NULL,
  customer_id INTEGER NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  review_date TEXT NOT NULL,
  FOREIGN KEY (book_id) REFERENCES books(book_id),
  FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

CREATE TABLE inventory (
  inventory_id INTEGER PRIMARY KEY,
  book_id INTEGER NOT NULL UNIQUE,
  quantity_in_stock INTEGER NOT NULL DEFAULT 0,
  reorder_level INTEGER DEFAULT 10,
  last_restocked_date TEXT,
  FOREIGN KEY (book_id) REFERENCES books(book_id)
);

INSERT INTO publishers (publisher_id, publisher_name, country, founded_year) VALUES
(1, 'Penguin Random House', 'USA', 2013),
(2, 'HarperCollins', 'USA', 1989),
(3, 'Simon & Schuster', 'USA', 1924),
(4, 'Macmillan Publishers', 'UK', 1843),
(5, 'Hachette Book Group', 'France', 2004);

INSERT INTO categories (category_id, category_name, parent_category_id) VALUES
(1, 'Fiction', NULL),
(2, 'Non-Fiction', NULL),
(3, 'Mystery', 1),
(4, 'Science Fiction', 1),
(5, 'Romance', 1),
(6, 'Biography', 2),
(7, 'Business', 2),
(8, 'Technology', 2);

INSERT INTO authors (author_id, first_name, last_name, country) VALUES
(1, 'Stephen', 'King', 'USA'),
(2, 'J.K.', 'Rowling', 'UK'),
(3, 'George', 'Orwell', 'UK'),
(4, 'Jane', 'Austen', 'UK'),
(5, 'Isaac', 'Asimov', 'USA'),
(6, 'Agatha', 'Christie', 'UK'),
(7, 'Ernest', 'Hemingway', 'USA'),
(8, 'Leo', 'Tolstoy', 'Russia'),
(9, 'Mark', 'Twain', 'USA'),
(10, 'Charles', 'Dickens', 'UK');

INSERT INTO books (book_id, title, isbn, publisher_id, price, category_id, pages) VALUES
(1, '1984', '978-0451524935', 1, 9.99, 4, 328),
(2, 'Pride and Prejudice', '978-0141439518', 2, 7.99, 5, 432),
(3, 'The Hobbit', '978-0547928227', 1, 14.99, 4, 366),
(4, 'Murder on the Orient Express', '978-0062073501', 2, 12.99, 3, 265),
(5, 'Foundation', '978-0553293357', 3, 10.99, 4, 296),
(6, 'The Old Man and the Sea', '978-0684801223', 4, 8.99, 1, 128),
(7, 'War and Peace', '978-1400079987', 1, 19.99, 1, 1225),
(8, 'Adventures of Huckleberry Finn', '978-0486280615', 5, 5.99, 1, 366),
(9, 'Great Expectations', '978-0141439563', 2, 9.99, 1, 544),
(10, 'Animal Farm', '978-0451526342', 1, 6.99, 4, 112);

INSERT INTO book_authors (book_id, author_id, author_order) VALUES
(1, 3, 1),
(2, 4, 1),
(4, 6, 1),
(5, 5, 1),
(6, 7, 1),
(7, 8, 1),
(8, 9, 1),
(9, 10, 1),
(10, 3, 1);

INSERT INTO customers (customer_id, email, first_name, last_name, country, registration_date) VALUES
(1, 'john.doe@email.com', 'John', 'Doe', 'USA', '2023-01-15'),
(2, 'jane.smith@email.com', 'Jane', 'Smith', 'UK', '2023-02-20'),
(3, 'bob.wilson@email.com', 'Bob', 'Wilson', 'Canada', '2023-03-10'),
(4, 'alice.brown@email.com', 'Alice', 'Brown', 'Australia', '2023-04-05'),
(5, 'charlie.davis@email.com', 'Charlie', 'Davis', 'USA', '2023-05-12'),
(6, 'diana.miller@email.com', 'Diana', 'Miller', 'Germany', '2023-06-18'),
(7, 'frank.moore@email.com', 'Frank', 'Moore', 'France', '2023-07-22'),
(8, 'grace.taylor@email.com', 'Grace', 'Taylor', 'USA', '2023-08-30');

INSERT INTO orders (order_id, customer_id, order_date, total_amount, status) VALUES
(1, 1, '2023-02-01', 27.97, 'shipped'),
(2, 2, '2023-03-05', 12.99, 'delivered'),
(3, 3, '2023-03-15', 35.97, 'processing'),
(4, 1, '2023-04-10', 19.99, 'delivered'),
(5, 4, '2023-04-20', 16.98, 'shipped'),
(6, 5, '2023-05-05', 44.95, 'delivered'),
(7, 6, '2023-06-10', 8.99, 'processing'),
(8, 7, '2023-07-01', 26.97, 'delivered'),
(9, 8, '2023-07-15', 12.99, 'shipped'),
(10, 2, '2023-08-01', 54.94, 'delivered');

INSERT INTO order_items (order_item_id, order_id, book_id, quantity, unit_price) VALUES
(1, 1, 1, 1, 9.99),
(2, 1, 2, 1, 7.99),
(3, 1, 10, 1, 9.99),
(4, 2, 4, 1, 12.99),
(5, 3, 3, 1, 14.99),
(6, 3, 5, 1, 10.99),
(7, 3, 6, 1, 9.99),
(8, 4, 7, 1, 19.99),
(9, 5, 8, 2, 5.99),
(10, 5, 9, 1, 9.99),
(11, 6, 3, 1, 14.99),
(12, 6, 7, 1, 19.99),
(13, 6, 2, 1, 9.97),
(14, 7, 6, 1, 8.99),
(15, 8, 1, 1, 9.99),
(16, 8, 4, 1, 12.99),
(17, 8, 10, 1, 3.99),
(18, 9, 5, 1, 12.99),
(19, 10, 7, 2, 19.99),
(20, 10, 3, 1, 14.96);

INSERT INTO reviews (review_id, book_id, customer_id, rating, review_text, review_date) VALUES
(1, 1, 1, 5, 'A timeless classic that remains relevant today.', '2023-02-10'),
(2, 2, 2, 4, 'Beautifully written romance with sharp social commentary.', '2023-03-08'),
(3, 3, 3, 5, 'An epic fantasy adventure that captivates all ages.', '2023-03-20'),
(4, 4, 4, 5, 'Classic Christie - the twist still surprises!', '2023-04-15'),
(5, 5, 5, 4, 'Thought-provoking science fiction at its best.', '2023-05-10'),
(6, 1, 2, 4, 'Dark but brilliant commentary on totalitarianism.', '2023-05-20'),
(7, 6, 6, 5, 'Hemingway''s masterpiece on perseverance.', '2023-06-15'),
(8, 7, 7, 5, 'A monumental work of literature.', '2023-07-08'),
(9, 8, 8, 4, 'Adventure and satire in classic American style.', '2023-08-02'),
(10, 9, 1, 4, 'Dickens at his finest - a must-read.', '2023-08-15');

INSERT INTO inventory (inventory_id, book_id, quantity_in_stock, reorder_level) VALUES
(1, 1, 150, 20),
(2, 2, 120, 15),
(3, 3, 200, 25),
(4, 4, 85, 10),
(5, 5, 95, 12),
(6, 6, 110, 15),
(7, 7, 75, 10),
(8, 8, 180, 20),
(9, 9, 130, 18),
(10, 10, 160, 22);
`;

export const bookstoreDatabase: Database = {
  id: 'bookstore',
  name: '在线书店',
  description: '完整的书店数据库，包含书籍、作者、订单、评论等表',
  sql: bookstoreSql,
  tables: [
    {
      name: 'publishers',
      columns: [
        { name: 'publisher_id', type: 'INTEGER', isPrimaryKey: true, isForeignKey: false, isNullable: false, hasIndex: true },
        { name: 'publisher_name', type: 'TEXT', isPrimaryKey: false, isForeignKey: false, isNullable: false, hasIndex: false },
        { name: 'country', type: 'TEXT', isPrimaryKey: false, isForeignKey: false, isNullable: true, hasIndex: false },
      ],
      foreignKeys: [],
    },
    {
      name: 'categories',
      columns: [
        { name: 'category_id', type: 'INTEGER', isPrimaryKey: true, isForeignKey: false, isNullable: false, hasIndex: true },
        { name: 'category_name', type: 'TEXT', isPrimaryKey: false, isForeignKey: false, isNullable: false, hasIndex: false },
        { name: 'parent_category_id', type: 'INTEGER', isPrimaryKey: false, isForeignKey: true, isNullable: true, hasIndex: true, foreignKeyRef: 'categories.category_id' },
      ],
      foreignKeys: [{ column: 'parent_category_id', refTable: 'categories', refColumn: 'category_id' }],
    },
    {
      name: 'authors',
      columns: [
        { name: 'author_id', type: 'INTEGER', isPrimaryKey: true, isForeignKey: false, isNullable: false, hasIndex: true },
        { name: 'first_name', type: 'TEXT', isPrimaryKey: false, isForeignKey: false, isNullable: false, hasIndex: false },
        { name: 'last_name', type: 'TEXT', isPrimaryKey: false, isForeignKey: false, isNullable: false, hasIndex: false },
        { name: 'country', type: 'TEXT', isPrimaryKey: false, isForeignKey: false, isNullable: true, hasIndex: false },
      ],
      foreignKeys: [],
    },
    {
      name: 'books',
      columns: [
        { name: 'book_id', type: 'INTEGER', isPrimaryKey: true, isForeignKey: false, isNullable: false, hasIndex: true },
        { name: 'title', type: 'TEXT', isPrimaryKey: false, isForeignKey: false, isNullable: false, hasIndex: false },
        { name: 'isbn', type: 'TEXT', isPrimaryKey: false, isForeignKey: false, isNullable: true, hasIndex: true },
        { name: 'publisher_id', type: 'INTEGER', isPrimaryKey: false, isForeignKey: true, isNullable: true, hasIndex: true, foreignKeyRef: 'publishers.publisher_id' },
        { name: 'price', type: 'REAL', isPrimaryKey: false, isForeignKey: false, isNullable: false, hasIndex: false },
        { name: 'category_id', type: 'INTEGER', isPrimaryKey: false, isForeignKey: true, isNullable: true, hasIndex: true, foreignKeyRef: 'categories.category_id' },
      ],
      foreignKeys: [
        { column: 'publisher_id', refTable: 'publishers', refColumn: 'publisher_id' },
        { column: 'category_id', refTable: 'categories', refColumn: 'category_id' },
      ],
    },
    {
      name: 'book_authors',
      columns: [
        { name: 'book_id', type: 'INTEGER', isPrimaryKey: true, isForeignKey: true, isNullable: false, hasIndex: true, foreignKeyRef: 'books.book_id' },
        { name: 'author_id', type: 'INTEGER', isPrimaryKey: true, isForeignKey: true, isNullable: false, hasIndex: true, foreignKeyRef: 'authors.author_id' },
      ],
      foreignKeys: [
        { column: 'book_id', refTable: 'books', refColumn: 'book_id' },
        { column: 'author_id', refTable: 'authors', refColumn: 'author_id' },
      ],
    },
    {
      name: 'customers',
      columns: [
        { name: 'customer_id', type: 'INTEGER', isPrimaryKey: true, isForeignKey: false, isNullable: false, hasIndex: true },
        { name: 'email', type: 'TEXT', isPrimaryKey: false, isForeignKey: false, isNullable: false, hasIndex: true },
        { name: 'first_name', type: 'TEXT', isPrimaryKey: false, isForeignKey: false, isNullable: true, hasIndex: false },
        { name: 'country', type: 'TEXT', isPrimaryKey: false, isForeignKey: false, isNullable: true, hasIndex: false },
      ],
      foreignKeys: [],
    },
    {
      name: 'orders',
      columns: [
        { name: 'order_id', type: 'INTEGER', isPrimaryKey: true, isForeignKey: false, isNullable: false, hasIndex: true },
        { name: 'customer_id', type: 'INTEGER', isPrimaryKey: false, isForeignKey: true, isNullable: false, hasIndex: true, foreignKeyRef: 'customers.customer_id' },
        { name: 'order_date', type: 'TEXT', isPrimaryKey: false, isForeignKey: false, isNullable: false, hasIndex: false },
        { name: 'total_amount', type: 'REAL', isPrimaryKey: false, isForeignKey: false, isNullable: false, hasIndex: false },
        { name: 'status', type: 'TEXT', isPrimaryKey: false, isForeignKey: false, isNullable: true, hasIndex: false },
      ],
      foreignKeys: [{ column: 'customer_id', refTable: 'customers', refColumn: 'customer_id' }],
    },
    {
      name: 'order_items',
      columns: [
        { name: 'order_item_id', type: 'INTEGER', isPrimaryKey: true, isForeignKey: false, isNullable: false, hasIndex: true },
        { name: 'order_id', type: 'INTEGER', isPrimaryKey: false, isForeignKey: true, isNullable: false, hasIndex: true, foreignKeyRef: 'orders.order_id' },
        { name: 'book_id', type: 'INTEGER', isPrimaryKey: false, isForeignKey: true, isNullable: false, hasIndex: true, foreignKeyRef: 'books.book_id' },
        { name: 'quantity', type: 'INTEGER', isPrimaryKey: false, isForeignKey: false, isNullable: false, hasIndex: false },
        { name: 'unit_price', type: 'REAL', isPrimaryKey: false, isForeignKey: false, isNullable: false, hasIndex: false },
      ],
      foreignKeys: [
        { column: 'order_id', refTable: 'orders', refColumn: 'order_id' },
        { column: 'book_id', refTable: 'books', refColumn: 'book_id' },
      ],
    },
    {
      name: 'reviews',
      columns: [
        { name: 'review_id', type: 'INTEGER', isPrimaryKey: true, isForeignKey: false, isNullable: false, hasIndex: true },
        { name: 'book_id', type: 'INTEGER', isPrimaryKey: false, isForeignKey: true, isNullable: false, hasIndex: true, foreignKeyRef: 'books.book_id' },
        { name: 'customer_id', type: 'INTEGER', isPrimaryKey: false, isForeignKey: true, isNullable: false, hasIndex: true, foreignKeyRef: 'customers.customer_id' },
        { name: 'rating', type: 'INTEGER', isPrimaryKey: false, isForeignKey: false, isNullable: false, hasIndex: false },
      ],
      foreignKeys: [
        { column: 'book_id', refTable: 'books', refColumn: 'book_id' },
        { column: 'customer_id', refTable: 'customers', refColumn: 'customer_id' },
      ],
    },
    {
      name: 'inventory',
      columns: [
        { name: 'inventory_id', type: 'INTEGER', isPrimaryKey: true, isForeignKey: false, isNullable: false, hasIndex: true },
        { name: 'book_id', type: 'INTEGER', isPrimaryKey: false, isForeignKey: true, isNullable: false, hasIndex: true, foreignKeyRef: 'books.book_id' },
        { name: 'quantity_in_stock', type: 'INTEGER', isPrimaryKey: false, isForeignKey: false, isNullable: false, hasIndex: false },
      ],
      foreignKeys: [{ column: 'book_id', refTable: 'books', refColumn: 'book_id' }],
    },
  ],
};
