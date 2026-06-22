import express from "express";
import { createCheckout, createPortal, getSubscriptionInfo, CheckoutSchema } from "../controllers/stripeController";
import { validate } from "../middleware/validate";

const router = express.Router();

router.get("/subscription", getSubscriptionInfo);
router.post("/checkout", validate(CheckoutSchema, "body"), createCheckout);
router.post("/portal", createPortal);

export default router;
