import { NextFunction, Request, Response } from "express";
import logger from "../config/logger";

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const error = err as Error & { statusCode?: number };
  const statusCode = error.statusCode ?? 500;

  logger.error({
    message: error.message ?? "Unhandled error",
    path: req.path,
    stack: error.stack,
    statusCode,
  });

  if (statusCode !== 500) {
    res.status(statusCode).json({ message: error.message });
    return;
  }

  res.status(500).json({ message: "Internal server error" });
};
