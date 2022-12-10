import type {
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response,
} from "express";
import asyncMiddleware from "middleware-async";
import { Error } from "mongoose";
import User from "./models/user";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidatorError,
  genValidatorMessage,
} from "./errors";

export const login = asyncMiddleware(
  async (req: Request, _res: Response, next: NextFunction) => {
    const payload = req.headers.authorization;
    if (payload === undefined) {
      throw new UnauthorizedError();
    }
    const encoded = payload.split(" ")[1];
    if (encoded === undefined) {
      throw new UnauthorizedError();
    }
    const decoded = Buffer.from(encoded, "base64").toString("utf8");
    const user = await User.findOne({ username: decoded.split(":")[0] });
    if (user === null) {
      throw new UnauthorizedError();
    }
    if (!user.isValidPassword(decoded.split(":")[1] ?? "")) {
      throw new UnauthorizedError();
    }
    req.user = user;
    next();
  }
);

export const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  // Database Errors
  if (err instanceof ValidatorError) {
    // Validator Error
    res.status(400).json({
      message: err.message,
      path: err.path,
      kind: err.kind,
    });
  } else if (err instanceof Error.ValidationError) {
    // Extract first, possible TODO to send all of them
    const name = Object.keys(err.errors)[0];
    if (name === undefined) {
      res.status(500).json({
        message: "Error returning broken in validation",
      });
    } else {
      const first = err.errors[name];
      if (first === undefined) {
        res.status(500).json({
          message: "Error returning broken in validation",
        });
      } else {
        res.status(400).json({
          message: genValidatorMessage(first.path, first.kind),
          path: first.path,
          kind: first.kind,
        });
      }
    }
  } else if (err instanceof UnauthorizedError) {
    res.sendStatus(401);
  } else if (err instanceof NotFoundError) {
    next();
  } else if (err instanceof ForbiddenError) {
    res.sendStatus(403);
  } else if (err instanceof ConflictError) {
    res.sendStatus(409);
  } else {
    // Unhandled error
    console.error(err);
    res.sendStatus(500);
  }
};

export function notFound(_req: Request, res: Response) {
  res.sendStatus(404);
}

export function methodNotAllowed(_req: Request, res: Response) {
  res.sendStatus(405);
}
