import fs from "fs";

export function saveOrder(order) {
  const line = `${new Date().toISOString()},${order.product},${order.size},${order.color},${order.quantity},${order.city},${order.phone}\n`;

  fs.appendFileSync("orders.csv", line);
}