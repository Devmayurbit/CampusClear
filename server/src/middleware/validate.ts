import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";
import { ApiError } from "./errorHandler";

/**
 * Middleware to validate request data against Zod schemas
 */
export function validateRequest(schema: AnyZodObject) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate body, query, and params
      const validated = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Replace request objects with validated data
      req.body = validated.body || req.body;
      req.query = validated.query || req.query;
      req.params = validated.params || req.params;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors.map((err) => `${err.path.join(".")}: ${err.message}`);
        return res.status(400).json({
          success: false,
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          errors: messages,
        });
      }
      next(error);
    }
  };
}

/**
 * Simplified validation for body only
 */
export function validateBody(schema: AnyZodObject) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = await schema.parseAsync(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors.map((err) => `${err.path.join(".")}: ${err.message}`);
        return res.status(400).json({
          success: false,
          code: "VALIDATION_ERROR",
          message: "Invalid request data",
          errors: messages,
        });
      }
      next(error);
    }
  };
}

/**
 * Simplified validation for params only
 */
export function validateParams(schema: AnyZodObject) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = await schema.parseAsync(req.params);
      req.params = validated;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors.map((err) => `${err.path.join(".")}: ${err.message}`);
        return res.status(400).json({
          success: false,
          code: "VALIDATION_ERROR",
          message: "Invalid request parameters",
          errors: messages,
        });
      }
      next(error);
    }
  };
}
