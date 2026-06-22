import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey)
  : null;

export const PLAN_LIMITS = {
  free: {
    maxTasks: 50,
    maxWorkspaces: 1,
    maxMembers: 3,
    aiRequestsPerDay: 10,
    integrations: false,
  },
  pro: {
    maxTasks: 500,
    maxWorkspaces: 5,
    maxMembers: 10,
    aiRequestsPerDay: 100,
    integrations: true,
  },
  team: {
    maxTasks: 5000,
    maxWorkspaces: 50,
    maxMembers: 100,
    aiRequestsPerDay: 1000,
    integrations: true,
  },
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;

export const STRIPE_PRICE_IDS = {
  pro: process.env.STRIPE_PRICE_PRO ?? "",
  team: process.env.STRIPE_PRICE_TEAM ?? "",
};
