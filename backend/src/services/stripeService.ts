import Stripe from "stripe";
import User from "../models/User";
import { stripe, STRIPE_PRICE_IDS } from "../config/stripe";
import logger from "../config/logger";

export const createCheckoutSession = async (
  userId: string,
  email: string,
  plan: "pro" | "team"
): Promise<string> => {
  if (!stripe) throw new Error("Stripe not configured");

  let user = await User.findOne({ firebaseUid: userId });
  if (!user) {
    user = await User.create({ firebaseUid: userId, email });
  }

  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({ email, metadata: { firebaseUid: userId } });
    customerId = customer.id;
    await User.findOneAndUpdate({ firebaseUid: userId }, { stripeCustomerId: customerId });
  }

  const priceId = STRIPE_PRICE_IDS[plan];
  if (!priceId) throw new Error(`Stripe price ID not configured for ${plan} plan`);

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.FRONTEND_URL ?? "http://localhost:5173"}/settings?billing=success`,
    cancel_url: `${process.env.FRONTEND_URL ?? "http://localhost:5173"}/pricing?billing=canceled`,
    metadata: { firebaseUid: userId, plan },
  });

  if (!session.url) throw new Error("Failed to create checkout session");
  return session.url;
};

export const createBillingPortalSession = async (userId: string): Promise<string> => {
  if (!stripe) throw new Error("Stripe not configured");

  const user = await User.findOne({ firebaseUid: userId });
  if (!user?.stripeCustomerId) throw new Error("No billing account found");

  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${process.env.FRONTEND_URL ?? "http://localhost:5173"}/settings`,
  });

  return session.url;
};

export const handleStripeWebhook = async (payload: Buffer, signature: string): Promise<void> => {
  if (!stripe) throw new Error("Stripe not configured");

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) throw new Error("Stripe webhook secret not configured");

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    throw new Error(`Webhook signature verification failed: ${err}`);
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const uid = session.metadata?.firebaseUid;
      const plan = session.metadata?.plan as "pro" | "team" | undefined;
      if (uid && plan) {
        await User.findOneAndUpdate(
          { firebaseUid: uid },
          {
            subscriptionPlan: plan,
            subscriptionStatus: "active",
            stripeSubscriptionId: session.subscription as string,
          }
        );
        logger.info({ message: "Subscription activated", uid, plan });
      }
      break;
    }
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      const user = await User.findOne({ stripeCustomerId: customerId });
      if (user) {
        const status = subscription.status;
        await User.findOneAndUpdate(
          { firebaseUid: user.firebaseUid },
          {
            subscriptionStatus: status === "active" ? "active" : status === "trialing" ? "trialing" : "past_due",
          }
        );
      }
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      await User.findOneAndUpdate(
        { stripeCustomerId: customerId },
        { subscriptionPlan: "free", subscriptionStatus: "canceled", stripeSubscriptionId: undefined }
      );
      break;
    }
    default:
      logger.info({ message: "Unhandled Stripe event", type: event.type });
  }
};
