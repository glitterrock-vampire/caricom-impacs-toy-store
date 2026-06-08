import crypto from "node:crypto";
import cors from "cors";
import express from "express";
import { db, dbPath } from "./db.js";

const app = express();
const port = Number(process.env.PORT ?? 8787);

app.use(cors({ origin: true }));
app.use(express.json());

const customerFields = ["name", "email", "country", "segment"];
const productFields = ["name", "category", "unit_price", "stock", "status"];
const orderFields = ["customer_id", "product_id", "order_date", "status", "quantity", "total_amount", "region"];
const sortFields = new Set(["name", "email", "country", "segment", "category", "status", "order_date", "created_at", "updated_at"]);

function cleanRecord(input, fields) {
  const record = {};

  for (const field of fields) {
    record[field] = String(input?.[field] ?? "").trim();
  }

  const missing = fields.filter((field) => !record[field]);
  if (missing.length) {
    const error = new Error(`Missing required field${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}`);
    error.status = 400;
    throw error;
  }

  return record;
}

function cleanCustomer(input) {
  return cleanRecord(input, customerFields);
}

function cleanProduct(input) {
  const record = cleanRecord(input, productFields);
  record.unit_price = Number(record.unit_price);
  record.stock = Number(record.stock);

  if (!Number.isFinite(record.unit_price) || record.unit_price < 0) {
    const error = new Error("Unit price must be a positive number");
    error.status = 400;
    throw error;
  }

  if (!Number.isInteger(record.stock) || record.stock < 0) {
    const error = new Error("Stock must be a positive whole number");
    error.status = 400;
    throw error;
  }

  return record;
}

function cleanOrder(input) {
  const record = cleanRecord(input, orderFields);
  record.quantity = Number(record.quantity);
  record.total_amount = Number(record.total_amount);

  if (!Number.isInteger(record.quantity) || record.quantity < 1) {
    const error = new Error("Quantity must be at least 1");
    error.status = 400;
    throw error;
  }

  if (!Number.isFinite(record.total_amount) || record.total_amount < 0) {
    const error = new Error("Total amount must be a positive number");
    error.status = 400;
    throw error;
  }

  return record;
}

function toCustomer(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    country: row.country,
    segment: row.segment,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function toProduct(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    unit_price: row.unit_price,
    stock: row.stock,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function toOrder(row) {
  return {
    id: row.id,
    customer_id: row.customer_id,
    product_id: row.product_id,
    order_date: row.order_date,
    status: row.status,
    quantity: row.quantity,
    total_amount: row.total_amount,
    region: row.region,
    customer_name: row.customer_name,
    customer_segment: row.customer_segment,
    product_name: row.product_name,
    product_category: row.product_category,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function sortParts(rawSort, fallback = "name") {
  const sort = String(rawSort ?? fallback);
  const sortField = sortFields.has(sort.replace("-", "")) ? sort.replace("-", "") : fallback;
  const direction = sort.startsWith("-") ? "DESC" : "ASC";
  return { sortField, direction };
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, database: dbPath });
});

app.get("/api/customers", (req, res) => {
  const { sortField, direction } = sortParts(req.query.sort, "name");
  const limit = Math.min(Math.max(Number(req.query.limit ?? 100), 1), 500);

  const rows = db
    .prepare(`SELECT * FROM customers ORDER BY ${sortField} COLLATE NOCASE ${direction} LIMIT ?`)
    .all(limit);

  res.json(rows.map(toCustomer));
});

app.post("/api/customers", (req, res, next) => {
  try {
    const record = cleanCustomer(req.body);
    const id = crypto.randomUUID();

    db.prepare(
      `INSERT INTO customers (id, name, email, country, segment, created_at, updated_at)
       VALUES (@id, @name, @email, @country, @segment, datetime('now'), datetime('now'))`,
    ).run({ id, ...record });

    const row = db.prepare("SELECT * FROM customers WHERE id = ?").get(id);
    res.status(201).json(toCustomer(row));
  } catch (error) {
    next(error);
  }
});

app.put("/api/customers/:id", (req, res, next) => {
  try {
    const record = cleanCustomer(req.body);
    const result = db.prepare(
      `UPDATE customers
       SET name = @name,
           email = @email,
           country = @country,
           segment = @segment,
           updated_at = datetime('now')
       WHERE id = @id`,
    ).run({ id: req.params.id, ...record });

    if (result.changes === 0) {
      res.status(404).json({ error: "Customer not found" });
      return;
    }

    const row = db.prepare("SELECT * FROM customers WHERE id = ?").get(req.params.id);
    res.json(toCustomer(row));
  } catch (error) {
    next(error);
  }
});

app.delete("/api/customers/:id", (req, res) => {
  const result = db.prepare("DELETE FROM customers WHERE id = ?").run(req.params.id);

  if (result.changes === 0) {
    res.status(404).json({ error: "Customer not found" });
    return;
  }

  res.status(204).end();
});

app.get("/api/products", (req, res) => {
  const { sortField, direction } = sortParts(req.query.sort, "name");
  const limit = Math.min(Math.max(Number(req.query.limit ?? 100), 1), 500);
  const rows = db.prepare(`SELECT * FROM products ORDER BY ${sortField} COLLATE NOCASE ${direction} LIMIT ?`).all(limit);

  res.json(rows.map(toProduct));
});

app.post("/api/products", (req, res, next) => {
  try {
    const record = cleanProduct(req.body);
    const id = crypto.randomUUID();

    db.prepare(
      `INSERT INTO products (id, name, category, unit_price, stock, status, created_at, updated_at)
       VALUES (@id, @name, @category, @unit_price, @stock, @status, datetime('now'), datetime('now'))`,
    ).run({ id, ...record });

    const row = db.prepare("SELECT * FROM products WHERE id = ?").get(id);
    res.status(201).json(toProduct(row));
  } catch (error) {
    next(error);
  }
});

app.put("/api/products/:id", (req, res, next) => {
  try {
    const record = cleanProduct(req.body);
    const result = db.prepare(
      `UPDATE products
       SET name = @name,
           category = @category,
           unit_price = @unit_price,
           stock = @stock,
           status = @status,
           updated_at = datetime('now')
       WHERE id = @id`,
    ).run({ id: req.params.id, ...record });

    if (result.changes === 0) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    const row = db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id);
    res.json(toProduct(row));
  } catch (error) {
    next(error);
  }
});

app.delete("/api/products/:id", (req, res) => {
  const result = db.prepare("DELETE FROM products WHERE id = ?").run(req.params.id);

  if (result.changes === 0) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.status(204).end();
});

app.get("/api/orders", (req, res) => {
  const status = String(req.query.status ?? "all");
  const limit = Math.min(Math.max(Number(req.query.limit ?? 200), 1), 500);
  const rows = db.prepare(
    `SELECT orders.*,
            customers.name AS customer_name,
            customers.segment AS customer_segment,
            products.name AS product_name,
            products.category AS product_category
       FROM orders
       JOIN customers ON customers.id = orders.customer_id
       JOIN products ON products.id = orders.product_id
      WHERE (? = 'all' OR orders.status = ?)
      ORDER BY orders.order_date DESC
      LIMIT ?`,
  ).all(status, status, limit);

  res.json(rows.map(toOrder));
});

app.post("/api/orders", (req, res, next) => {
  try {
    const record = cleanOrder(req.body);
    const id = crypto.randomUUID();

    db.prepare(
      `INSERT INTO orders (id, customer_id, product_id, order_date, status, quantity, total_amount, region, created_at, updated_at)
       VALUES (@id, @customer_id, @product_id, @order_date, @status, @quantity, @total_amount, @region, datetime('now'), datetime('now'))`,
    ).run({ id, ...record });

    const row = db.prepare(
      `SELECT orders.*,
              customers.name AS customer_name,
              customers.segment AS customer_segment,
              products.name AS product_name,
              products.category AS product_category
         FROM orders
         JOIN customers ON customers.id = orders.customer_id
         JOIN products ON products.id = orders.product_id
        WHERE orders.id = ?`,
    ).get(id);
    res.status(201).json(toOrder(row));
  } catch (error) {
    next(error);
  }
});

app.delete("/api/orders/:id", (req, res) => {
  const result = db.prepare("DELETE FROM orders WHERE id = ?").run(req.params.id);

  if (result.changes === 0) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  res.status(204).end();
});

app.use((error, _req, res, _next) => {
  res.status(error.status ?? 500).json({ error: error.message ?? "Unexpected server error" });
});

if (!process.env.VERCEL) {
  app.listen(port, "127.0.0.1", () => {
    console.log(`API listening on http://127.0.0.1:${port}`);
    console.log(`SQLite database: ${dbPath}`);
  });
}

export default app;
