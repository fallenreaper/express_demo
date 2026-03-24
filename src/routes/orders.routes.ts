import { Router } from "express";
import db from "../db.js";

const orderRouter = Router();

type Order = {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
};

/**
 * @openapi
 * /orders:
 *   get:
 *     summary: Retrieve a list of orders
 *     responses:
 *       200:
 *         description: A JSON array of order objects.
 */
orderRouter.get("/orders", (req, res) => {
  const orders = db.prepare("SELECT * FROM orders").all();
  res.json(orders);
});

/**
 * @openapi
 * /orders/{id}:
 *   get:
 *     summary: Retrieve a specific order by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The order object
 *       404:
 *         description: Order not found
 */
orderRouter.get("/orders/:id", (req, res) => {
  const { id } = req.params;
  const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(id);
  if (!order) {
    res.status(404).json({ message: "Order not found" });
  }
  res.json(order);
});

/**
 * @openapi
 * /orders/{id}:
 *   post:
 *     summary: Create a new order
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Error creating order
 */
orderRouter.post("/orders/:id", async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  await new Promise((res) => {
    setTimeout(res, 3000);
  });
  try {
    // Can error
    db.prepare("INSERT INTO orders (id, name) VALUES (?, ?)").run(id, name);
    const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(id);
    res.status(201).json(order);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});
/**
 * @openapi
 * /orders/{id}:
 *   patch:
 *     summary: Update an existing order
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order updated successfully
 *       400:
 *         description: Error updating order
 */
orderRouter.patch("/orders/:id", (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    // Can Error
    db.prepare(
      "UPDATE orders SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    ).run(name, id);
    const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(id);
    res.json(order);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});
/**
 * @openapi
 * /orders/{id}:
 *   delete:
 *     summary: Delete an order by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order deleted successfully
 *       404:
 *         description: Order not found
 */
orderRouter.delete("/orders/:id", (req, res) => {
  const { id } = req.params;
  const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(id);
  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }
  db.prepare("DELETE FROM orders WHERE id = ?").run(id);
  res.json(order);
});

export default orderRouter;
