import Database from "better-sqlite3";

// Create an in-memory database for testing
const testDb = new Database(":memory:");

// Initialize test database schema
testDb.exec(`
  CREATE TABLE orders (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Mock the db import before importing the module
jest.mock("../src/db.js", () => ({ __esModule: true, default: testDb }));

import {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  type Order,
} from "../src/order";

// Clean up after each test
afterEach(() => {
  testDb.prepare("DELETE FROM orders").run();
});

// Close database after all tests
afterAll(() => {
  testDb.close();
});

describe("Order Module", () => {
  describe("getOrders", () => {
    it("should return empty array when no orders exist", () => {
      const orders = getOrders();
      expect(orders).toEqual([]);
    });

    it("should return all orders", () => {
      // Insert test data
      testDb
        .prepare("INSERT INTO orders (id, name, status) VALUES (?, ?, ?)")
        .run("order1", "Test Order 1", "Pending");
      testDb
        .prepare("INSERT INTO orders (id, name, status) VALUES (?, ?, ?)")
        .run("order2", "Test Order 2", "Shipped");

      const orders = getOrders();
      expect(orders).toHaveLength(2);
      expect(orders[0]).toHaveProperty("id", "order1");
      expect(orders[0]).toHaveProperty("name", "Test Order 1");
      expect(orders[0]).toHaveProperty("status", "Pending");
      expect(orders[1]).toHaveProperty("id", "order2");
      expect(orders[1]).toHaveProperty("name", "Test Order 2");
      expect(orders[1]).toHaveProperty("status", "Shipped");
    });
  });

  describe("getOrderById", () => {
    it("should return undefined for non-existent order", () => {
      const order = getOrderById("nonexistent");
      expect(order).toBeUndefined();
    });

    it("should return the order when it exists", () => {
      // Insert test data
      testDb
        .prepare("INSERT INTO orders (id, name, status) VALUES (?, ?, ?)")
        .run("order1", "Test Order", "Pending");

      const order = getOrderById("order1");
      expect(order).toHaveProperty("id", "order1");
      expect(order).toHaveProperty("name", "Test Order");
      expect(order).toHaveProperty("status", "Pending");
    });
  });

  describe("createOrder", () => {
    it("should create a new order successfully", () => {
      const newOrder: Order = {
        id: "order1",
        name: "New Order",
        status: "Pending",
      };
      const [order, error] = createOrder(newOrder);

      expect(error).toBeUndefined();
      expect(order).toHaveProperty("id", "order1");
      expect(order).toHaveProperty("name", "New Order");
      expect(order).toHaveProperty("status", "Pending");
    });

    it("should return error for duplicate id", () => {
      // Insert existing order
      testDb
        .prepare("INSERT INTO orders (id, name, status) VALUES (?, ?, ?)")
        .run("order1", "Existing Order", "Pending");

      const newOrder: Order = {
        id: "order1",
        name: "New Order",
        status: "Pending",
      };
      const [order, error] = createOrder(newOrder);

      expect(order).toBeUndefined();
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe("updateOrder", () => {
    it("should update an existing order successfully", () => {
      // Insert test data
      testDb
        .prepare("INSERT INTO orders (id, name, status) VALUES (?, ?, ?)")
        .run("order1", "Old Name", "Pending");

      const updatedOrder: Order = {
        id: "order1",
        name: "Updated Name",
        status: "Shipped",
      };
      const [order, error] = updateOrder(updatedOrder);

      expect(error).toBeUndefined();
      expect(order).toHaveProperty("id", "order1");
      expect(order).toHaveProperty("name", "Updated Name");
      expect(order).toHaveProperty("status", "Shipped");
    });

    it("should return error for non-existent order", () => {
      const updatedOrder: Order = {
        id: "nonexistent",
        name: "Updated Name",
        status: "Shipped",
      };
      const [order, error] = updateOrder(updatedOrder);

      expect(order).toBeUndefined();
      expect(error).toBeInstanceOf(Error);
      expect(error?.message).toBe("Order not found");
    });

    it("should preserve existing values when not provided", () => {
      // Insert test data
      testDb
        .prepare("INSERT INTO orders (id, name, status) VALUES (?, ?, ?)")
        .run("order1", "Original Name", "Pending");

      const updatedOrder: Order = { id: "order1", name: "", status: "Pending" };
      const [order, error] = updateOrder(updatedOrder);

      expect(error).toBeUndefined();
      expect(order).toHaveProperty("id", "order1");
      expect(order).toHaveProperty("name", "Original Name");
      expect(order).toHaveProperty("status", "Pending");
    });
  });

  describe("deleteOrder", () => {
    it("should return undefined for non-existent order", () => {
      const order = deleteOrder("nonexistent");
      expect(order).toBeUndefined();
    });

    it("should delete and return the order when it exists", () => {
      // Insert test data
      testDb
        .prepare("INSERT INTO orders (id, name, status) VALUES (?, ?, ?)")
        .run("order1", "Test Order", "Pending");

      const order = deleteOrder("order1");
      expect(order).toHaveProperty("id", "order1");
      expect(order).toHaveProperty("name", "Test Order");
      expect(order).toHaveProperty("status", "Pending");

      // Verify it's deleted
      const checkOrder = getOrderById("order1");
      expect(checkOrder).toBeUndefined();
    });
  });
});
