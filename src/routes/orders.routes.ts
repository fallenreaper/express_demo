import { Router } from "express";
import { z } from "zod";
import {
  createOrder,
  deleteOrder,
  getOrderById,
  getOrders,
  Order,
  updateOrder,
} from "../order";

const orderRouter = Router();

const OrderSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  status: z.enum(["Pending", "Shipped"]).optional(),
  created_at: z.iso.datetime().optional(),
  updated_at: z.iso.datetime().optional(),
});

const PatchOrderSchema = z.object({
  id: z.string(),
  name: z.string().min(1).optional(),
  status: z.enum(["Pending", "Shipped"]).optional(),
  created_at: z.iso.datetime().optional(),
  updated_at: z.iso.datetime().optional(),
});

const validateOrder = (obj: Order) => {
  return OrderSchema.safeParse(obj);
};

const validatePatchOrder = (obj: Partial<Order> & { id: string }) => {
  return PatchOrderSchema.safeParse(obj);
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
  res.json(getOrders());
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
  const order = getOrderById(id);
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
    const msg =
      `(${_validate.error.issues[0].path.join(" ")}): ` +
      _validate.error.issues[0].message;
    res.status(400).json({ error: msg });
    return;
  }
  let { name, status } = req.body as Order;
  if (!status) {
    status = "Pending";
  }

  const [order, error] = createOrder({ id, name, status });
  if (!order) {
    res.status(400).json({ error: error?.message || "Error creating order" });
  }
  res.status(201).json(order);
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
  const _validate = validatePatchOrder({ id, ...req.body });
  if (!_validate.success) {
    const msg =
      `(${_validate.error.issues[0].path.join(" ")}): ` +
      _validate.error.issues[0].message;
    res.status(400).json({ error: msg });
    return;
  }
  let { name, status } = req.body;
  const [order, error] = updateOrder({ id, name, status });
  if (!order) {
    res.status(400).json({ error: error?.message || "Error updating order" });
  }
  res.json(order);
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
  const order = deleteOrder(id);
  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }
  res.json(order);
});

export default orderRouter;
