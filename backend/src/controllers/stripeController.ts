import { Request, Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { z } from "zod";
import {
  createCheckoutSession,
  createBillingPortalSession,
  handleStripeWebhook,
} from "../services/stripeService";
import { getUserPlan } from "../middleware/subscriptionGuard";
import { PLAN_LIMITS } from "../config/stripe";

const CheckoutSchema = z.object({
  plan: z.enum(["pro", "team"]),
});

export const createCheckout = asyncHandler(async (req: Request, res: Response) => {
  const uid = req.user!.uid;
  const email = req.user!.email ?? "";
  const { plan } = req.body as z.infer<typeof CheckoutSchema>;
  const url = await createCheckoutSession(uid, email, plan);
  res.json({ url });
});

export const createPortal = asyncHandler(async (req: Request, res: Response) => {
  const uid = req.user!.uid;
  const url = await createBillingPortalSession(uid);
  res.json({ url });
});

export const stripeWebhook = async (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"] as string;
  if (!signature) {
    res.status(400).json({ message: "Missing stripe-signature header" });
    return;
  }

  try {
    await handleStripeWebhook(req.body as Buffer, signature);
    res.json({ received: true });
  } catch (err) {
    res.status(400).json({ message: (err as Error).message });
  }
};

export const getSubscriptionInfo = asyncHandler(async (req: Request, res: Response) => {
  const uid = req.user!.uid;
  const { plan, limits } = await getUserPlan(uid);
  res.json({ plan, limits, availablePlans: PLAN_LIMITS });
});

export { CheckoutSchema };
