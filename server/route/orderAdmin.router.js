import { Router } from "express";
import {
  getUnacceptedOrdersController,
  acceptAndDispatchOrderController,
  markOrderReadyForDispatchController,
  getAcceptedOrdersController,
} from "../controllers/employee.controller.js";

const orderAdminRouter = Router();

// ✅ Get all unaccepted (Pending) orders
orderAdminRouter.get("/unaccepted-orders", getUnacceptedOrdersController);

// ✅ Accept + Immediately Dispatch orders (Normal + Return)
orderAdminRouter.post("/accept-order", acceptAndDispatchOrderController);

// ✅ Mark orders as Ready for Dispatch (for already-accepted orders)
orderAdminRouter.post("/ready-for-dispatch", markOrderReadyForDispatchController);

// ✅ Get all accepted orders
orderAdminRouter.get("/accepted-orders", getAcceptedOrdersController);

export default orderAdminRouter;