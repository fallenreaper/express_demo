import db from "./db";

export type Order = {
  id: string;
  name: string;
  status: "Pending" | "Shipped";
  created_at?: string;
  updated_at?: string;
};

export const getOrders = (): Order[] => {
  const orders = db.prepare("SELECT * FROM orders").all() as Order[];
  return orders;
};

export const getOrderById = (id: string): Order | undefined => {
  const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(id) as
    | Order
    | undefined;
  return order;
};
export const createOrder = (
  obj: Order,
): [Order | undefined, Error | undefined] => {
  try {
    db.prepare("INSERT INTO orders (id, name, status) VALUES (?, ?, ?)").run(
      obj.id,
      obj.name,
      obj.status,
    );
  } catch (error) {
    return [undefined, error as Error];
  }
  return [getOrderById(obj.id), undefined];
};

export const updateOrder = (
  obj: Order,
): [Order | undefined, Error | undefined] => {
  let { id, name, status } = obj;
  try {
    let order = db.prepare("SELECT * FROM orders WHERE id = ?").get(id) as
      | Order
      | undefined;
    if (!order) {
      return [undefined, new Error("Order not found")];
    }
    if (!name) name = order.name;
    if (!status) status = order.status;
    db.prepare(
      "UPDATE orders SET name = ?, updated_at = CURRENT_TIMESTAMP, status = ? WHERE id = ?",
    ).run(name, status, id);
    order = getOrderById(id);
    return [order, undefined];
  } catch (error: any) {
    return [undefined, error];
  }
};

export const deleteOrder = (id: string): Order | undefined => {
  const order = getOrderById(id);
  if (!order) {
    return undefined;
  }
  db.prepare("DELETE FROM orders WHERE id = ?").run(id);
  return order;
};
