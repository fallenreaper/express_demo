import request from "supertest";
import express from "express";
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

// Mock the db import before importing the router
jest.mock("../src/db.js", () => ({ __esModule: true, default: testDb }));

import * as orderService from "../src/order";
import orderRouter from "../src/routes/orders.routes";

// Create a test app
const app = express();
app.use(express.json());
app.use("/api", orderRouter);

// Clean up after each test
afterEach(() => {
  testDb.prepare("DELETE FROM orders").run();
});

// Close database after all tests
afterAll(() => {
  testDb.close();
});

describe("Orders API", () => {
  describe("GET /api/orders", () => {
    it("should return empty array when no orders exist", async () => {
      const response = await request(app).get("/api/orders").expect(200);

      expect(response.body).toEqual([]);
    });

    it("should return all orders", async () => {
      // First create some test orders
      await request(app)
        .post("/api/orders/order1")
        .send({ name: "Test Order 1", status: "Pending" })
        .expect(201);

      await request(app)
        .post("/api/orders/order2")
        .send({ name: "Test Order 2", status: "Shipped" })
        .expect(201);

      const response = await request(app).get("/api/orders").expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty("id", "order1");
      expect(response.body[0]).toHaveProperty("name", "Test Order 1");
      expect(response.body[0]).toHaveProperty("status", "Pending");
      expect(response.body[1]).toHaveProperty("id", "order2");
      expect(response.body[1]).toHaveProperty("name", "Test Order 2");
      expect(response.body[1]).toHaveProperty("status", "Shipped");
    });
  });

  describe("GET /api/orders/:id", () => {
    it("should return 404 for non-existent order", async () => {
      const response = await request(app)
        .get("/api/orders/nonexistent")
        .expect(404);

      expect(response.body).toHaveProperty("message", "Order not found");
    });

    it("should return the order when it exists", async () => {
      // Create a test order
      await request(app)
        .post("/api/orders/order1")
        .send({ name: "Test Order", status: "Pending" })
        .expect(201);

      const response = await request(app).get("/api/orders/order1").expect(200);

      expect(response.body).toHaveProperty("id", "order1");
      expect(response.body).toHaveProperty("name", "Test Order");
      expect(response.body).toHaveProperty("status", "Pending");
      expect(response.body).toHaveProperty("created_at");
      expect(response.body).toHaveProperty("updated_at");
    });
  });

  describe("POST /api/orders/:id", () => {
    it("should create a new order with valid data", async () => {
      const response = await request(app)
        .post("/api/orders/order1")
        .send({ name: "New Order", status: "Pending" })
        .expect(201);

      expect(response.body).toHaveProperty("id", "order1");
      expect(response.body).toHaveProperty("name", "New Order");
      expect(response.body).toHaveProperty("status", "Pending");
      expect(response.body).toHaveProperty("created_at");
      expect(response.body).toHaveProperty("updated_at");
    });

    it("should default status to Pending when not provided", async () => {
      const response = await request(app)
        .post("/api/orders/order2")
        .send({ name: "Order without status" })
        .expect(201);

      expect(response.body).toHaveProperty("status", "Pending");
    });

    it("should return 400 when createOrder fails", async () => {
      const createSpy = jest
        .spyOn(orderService, "createOrder")
        .mockReturnValue([undefined, new Error("Route create failed")]);

      try {
        const response = await request(app)
          .post("/api/orders/order500")
          .send({ name: "Name", status: "Pending" })
          .expect(400);

        expect(response.body).toHaveProperty("error", "Route create failed");
      } finally {
        createSpy.mockRestore();
      }
    });

    it("should return default error when createOrder returns no error", async () => {
      const createSpy = jest
        .spyOn(orderService, "createOrder")
        .mockReturnValue([undefined, undefined]);

      try {
        const response = await request(app)
          .post("/api/orders/order501")
          .send({ name: "Name", status: "Pending" })
          .expect(400);

        expect(response.body).toHaveProperty(
          "error",
          "Error creating order",
        );
      } finally {
        createSpy.mockRestore();
      }
    });

    it("should return 400 for invalid data", async () => {
      const response = await request(app)
        .post("/api/orders/order3")
        .send({ name: "" }) // Invalid: empty name
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });

    it("should return 400 when trying to create duplicate order", async () => {
      // Create first order
      await request(app)
        .post("/api/orders/order4")
        .send({ name: "First Order" })
        .expect(201);

      // Try to create duplicate
      const response = await request(app)
        .post("/api/orders/order4")
        .send({ name: "Duplicate Order" })
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });
  });

  describe("PATCH /api/orders/:id", () => {
    beforeEach(async () => {
      // Create a test order for each test
      await request(app)
        .post("/api/orders/order1")
        .send({ name: "Original Order", status: "Pending" })
        .expect(201);
    });

    it("should update order name", async () => {
      const response = await request(app)
        .patch("/api/orders/order1")
        .send({ name: "Updated Order" })
        .expect(200);

      expect(response.body).toHaveProperty("id", "order1");
      expect(response.body).toHaveProperty("name", "Updated Order");
      expect(response.body).toHaveProperty("status", "Pending");
    });

    it("should update order status", async () => {
      const response = await request(app)
        .patch("/api/orders/order1")
        .send({ status: "Shipped" })
        .expect(200);

      expect(response.body).toHaveProperty("status", "Shipped");
      expect(response.body).toHaveProperty("name", "Original Order");
    });

    it("should update both name and status", async () => {
      const response = await request(app)
        .patch("/api/orders/order1")
        .send({ name: "Updated Name", status: "Shipped" })
        .expect(200);

      expect(response.body).toHaveProperty("name", "Updated Name");
      expect(response.body).toHaveProperty("status", "Shipped");
    });

    it("should return 400 for invalid data", async () => {
      const response = await request(app)
        .patch("/api/orders/order1")
        .send({ name: "" }) // Invalid: empty name
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });

    it("should return 400 when updateOrder fails", async () => {
      const updateSpy = jest
        .spyOn(orderService, "updateOrder")
        .mockReturnValue([undefined, new Error("Route update failed")]);

      try {
        const response = await request(app)
          .patch("/api/orders/order500")
          .send({ name: "Name" })
          .expect(400);

        expect(response.body).toHaveProperty("error", "Route update failed");
      } finally {
        updateSpy.mockRestore();
      }
    });

    it("should return default error when updateOrder returns no error", async () => {
      const updateSpy = jest
        .spyOn(orderService, "updateOrder")
        .mockReturnValue([undefined, undefined]);

      try {
        const response = await request(app)
          .patch("/api/orders/order501")
          .send({ name: "Name" })
          .expect(400);

        expect(response.body).toHaveProperty(
          "error",
          "Error updating order",
        );
      } finally {
        updateSpy.mockRestore();
      }
    });

    it("should return 400 for non-existent order", async () => {
      const response = await request(app)
        .patch("/api/orders/nonexistent")
        .send({ name: "New Name" })
        .expect(400);

      expect(response.body).toHaveProperty("error", "Order not found");
    });
  });

  describe("DELETE /api/orders/:id", () => {
    it("should return 404 for non-existent order", async () => {
      const response = await request(app)
        .delete("/api/orders/nonexistent")
        .expect(404);

      expect(response.body).toHaveProperty("error", "Order not found");
    });

    it("should delete existing order and return it", async () => {
      // Create a test order
      await request(app)
        .post("/api/orders/order1")
        .send({ name: "Order to Delete", status: "Pending" })
        .expect(201);

      // Delete the order
      const deleteResponse = await request(app)
        .delete("/api/orders/order1")
        .expect(200);

      expect(deleteResponse.body).toHaveProperty("id", "order1");
      expect(deleteResponse.body).toHaveProperty("name", "Order to Delete");

      // Verify order is deleted
      await request(app).get("/api/orders/order1").expect(404);
    });
  });
});

describe("MODULE 11 Tests", () => {
  describe("CREATION", () => {
    it("create_emptyObject should return 400", async () => {
      const response = await request(app)
        .post("/api/orders/666")
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).not.toEqual("");
    });

    it("create_nonObjectPayload should return 400", async () => {
      const response = await request(app)
        .post("/api/orders/666")
        .set("Content-Type", "application/json")
        .send('""');

      expect([400, 415]).toContain(response.status);
      expect(response.body).toBeDefined();
    });

    it("create_partialObject_idOnly should return 400", async () => {
      const response = await request(app)
        .post("/api/orders/fooo")
        .send({ id: "fooo" })
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });

    it("create_partialObject_nameOnly should create order with default status", async () => {
      const response = await request(app)
        .post("/api/orders/666")
        .send({ name: "foo" })
        .expect(201);

      expect(response.body).toHaveProperty("id", "666");
      expect(response.body).toHaveProperty("name", "foo");
      expect(response.body).toHaveProperty("status", "Pending");
    });

    it("create_partialObject_invalidState should return 400", async () => {
      const response = await request(app)
        .post("/api/orders/666")
        .send({ name: "Sample Name", status: "notreal" })
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });

    it("create_partialObject_validState should create order when state is provided", async () => {
      const response = await request(app)
        .post("/api/orders/666")
        .send({ name: "Sample Name", state: "Pending" })
        .expect(201);

      expect(response.body).toHaveProperty("id", "666");
      expect(response.body).toHaveProperty("name", "Sample Name");
    });

    it("create_fullObject should create order using path id", async () => {
      const response = await request(app)
        .post("/api/orders/666")
        .send({ id: "foo", name: "sample", status: "Pending" })
        .expect(201);

      expect(response.body).toHaveProperty("id", "666");
      expect(response.body).toHaveProperty("name", "sample");
      expect(response.body).toHaveProperty("status", "Pending");
    });

    it("create_fullObject_idExistsAlready should return 400 for duplicate path id", async () => {
      // Pre-create the id to match the expected API behavior
      await request(app)
        .post("/api/orders/666")
        .send({ name: "sample", status: "Pending" })
        .expect(201);

      const response = await request(app)
        .post("/api/orders/666")
        .send({ id: "foo", name: "sample", status: "Pending" })
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });
  });

  describe("GETTERS", () => {
    it("get_allOrders_noPayload should return 200 and array", async () => {
      const response = await request(app).get("/api/orders").expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it("get_allOrders_payload should return 200 with empty body", async () => {
      const response = await request(app)
        .get("/api/orders")
        .send({})
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it("get_singleOrder_noId should treat trailing slash as normal get", async () => {
      const response = await request(app).get("/api/orders/").expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it("get_singleOrder_invalidId should return 404", async () => {
      const response = await request(app).get("/api/orders/777").expect(404);

      expect(response.body).toHaveProperty("message");
    });

    it("get_singleOrder_validId should return the seeded order", async () => {
      await request(app)
        .post("/api/orders/666")
        .send({ name: "sample", status: "Pending" })
        .expect(201);

      const response = await request(app).get("/api/orders/666").expect(200);

      expect(response.body).toHaveProperty("id", "666");
      expect(response.body).toHaveProperty("status", "Pending");
    });
  });

  describe("MUTATIONS", () => {
    beforeEach(async () => {
      await request(app)
        .post("/api/orders/666")
        .send({ name: "sample", status: "Pending" })
        .expect(201);
    });

    it("mutate_invalidId should return 400", async () => {
      const response = await request(app)
        .patch("/api/orders/doesntexist")
        .send({ id: "doesntexist", name: "changed" })
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });

    it("mutate_validId should accept empty body", async () => {
      const response = await request(app)
        .patch("/api/orders/666")
        .send({})
        .expect(200);

      expect(response.body).toHaveProperty("id", "666");
    });

    it("mutate_validId_invalidProps_Name should return 400", async () => {
      const response = await request(app)
        .patch("/api/orders/666")
        .send({ name: 6 })
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });

    it("mutate_validId_invalidProps_State should return 400", async () => {
      const response = await request(app)
        .patch("/api/orders/666")
        .send({ status: "Not Valid Status" })
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });

    it("mutate_validId_validProps should update the order", async () => {
      const response = await request(app)
        .patch("/api/orders/666")
        .send({ name: "New Name", status: "Shipped" })
        .expect(200);

      expect(response.body).toHaveProperty("id", "666");
      expect(response.body).toHaveProperty("name", "New Name");
      expect(response.body).toHaveProperty("status", "Shipped");
    });
  });

  describe("DELETE", () => {
    it("delete_invalidId should return 404", async () => {
      const response = await request(app).delete("/api/orders/777").expect(404);

      expect(response.body).toHaveProperty("error");
    });

    it("delete_invalidId_withBody should return 404", async () => {
      const response = await request(app)
        .delete("/api/orders/777")
        .send({})
        .expect(404);

      expect(response.body).toHaveProperty("error");
    });

    it("delete_validId should delete the seeded order", async () => {
      await request(app)
        .post("/api/orders/666")
        .send({ name: "sample", status: "Pending" })
        .expect(201);

      const response = await request(app).delete("/api/orders/666").expect(200);

      expect(response.body).toHaveProperty("id", "666");
    });
  });
});
