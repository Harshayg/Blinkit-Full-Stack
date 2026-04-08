import { Router } from 'express';
import auth from '../middleware/auth.js';
import { CashOnDeliveryOrderController, getOrderDetailsController, paymentController,  UPIPaymentOrderController, getLiveOrderStatusController, cancelOrderController, returnProductOrOrderController, cancelReturnController} from '../controllers/order.controller.js'; // Add your controller here

const orderRouter = Router();

// Existing routes
orderRouter.post("/cash-on-delivery", auth, CashOnDeliveryOrderController);
orderRouter.post("/payment", auth, paymentController);
orderRouter.get("/order-list", auth, getOrderDetailsController);
orderRouter.post("/upi-payment", auth, UPIPaymentOrderController);
orderRouter.get("/live-order", auth, getLiveOrderStatusController); // ✅ New live tracking route
orderRouter.post("/cancel", auth, cancelOrderController);
orderRouter.post("/return", auth, returnProductOrOrderController);
orderRouter.patch("/cancel-return", auth, cancelReturnController);


export default orderRouter;
