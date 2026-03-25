import { Router } from "express";
import db from "../db.js";
import { z } from "zod";

const orderRouter = Router();

type Order = {
  id: string;
  name: string;
  status: "Pending" | "Shipped";
  created_at?: string;
  updated_at?: string;
};

const OrderSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.enum(["Pending", "Shipped"]).optional(),
  created_at: z.iso.datetime().optional(),
  updated_at: z.iso.datetime().optional(),
});

const validateOrder = (obj: Order) => {
  return OrderSchema.safeParse(obj);
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
  const orders = db.prepare("SELECT * FROM orders").all() as Order[];
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
  const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(id) as
    | Order
    | undefined;
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
 *                 required: true
 *               status:
 *                 type: string
 *                 required: false
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Error creating order
 */
orderRouter.post("/orders/:id", async (req, res) => {
  const { id } = req.params;
  const _validate = validateOrder({ id, ...req.body });
  if (!_validate.success) {
    res.status(400).json({ error: _validate.error.issues[0].message });
    return;
  }
  let { name, status } = req.body as Order;
  if (!status) {
    status = "Pending";
  }
  await new Promise((res) => {
    setTimeout(res, 3000);
  });

  try {
    // Can error
    db.prepare("INSERT INTO orders (id, name, status) VALUES (?, ?, ?)").run(
      id,
      name,
      status,
    );
    const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(id) as
      | Order
      | undefined;
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
 *                 required: false
 *               status:
 *                 type: string
 *                 required: false
 *     responses:
 *       200:
 *         description: Order updated successfully
 *       400:
 *         description: Error updating order
 */
orderRouter.patch("/orders/:id", (req, res) => {
  const { id } = req.params;
  const _validate = validateOrder({ id, ...req.body });
  if (!_validate.success) {
    res.status(400).json({ error: _validate.error.issues[0].message });
    return;
  }
  let { name, status } = req.body;
  try {
    let order = db.prepare("SELECT * FROM orders WHERE id = ?").get(id) as
      | Order
      | undefined;
    if (!name) name = order?.name;
    if (!status) status = order?.status;
    db.prepare(
      "UPDATE orders SET name = ?, updated_at = CURRENT_TIMESTAMP, status = ? WHERE id = ?",
    ).run(name, status, id);
    order = db.prepare("SELECT * FROM orders WHERE id = ?").get(id) as
      | Order
      | undefined;
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
  const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(id) as
    | Order
    | undefined;
  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }
  db.prepare("DELETE FROM orders WHERE id = ?").run(id);
  res.json(order);
});

export default orderRouter;
