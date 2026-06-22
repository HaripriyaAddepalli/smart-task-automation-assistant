import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";

export type ValidationTarget = "body" | "query" | "params";

export const validate = (schema: ZodSchema, target: ValidationTarget = "body") => {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse((req as any)[target]);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        issues: parsed.error.issues,
      });
    }

    (req as any)[target] = parsed.data;
    next();
  };
};

