import { Router } from "express";
const orderRouter = Router();

type Order = {
  id: number;
  name: string;
};

const IN_MEMORY_OBJECT: Order[] = [];

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
  res.json(IN_MEMORY_OBJECT);
});

export default orderRouter;
