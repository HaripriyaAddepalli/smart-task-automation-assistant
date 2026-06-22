import rateLimit from "express-rate-limit";

// 200 requests per 15 minutes per IP (tuned for demo; adjust for production)
export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: true,
  legacyHeaders: false,
});


