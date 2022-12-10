import type { Request, Response } from "express";
import User from "../models/user";
import { NotFoundError } from "../errors";

export async function registerRoute(req: Request, res: Response) {
  if (process.env["NODE_ENV"] !== "development") {
    throw new NotFoundError();
  }
  const { username, password } = req.body;
  await User.create({ username, password });
  res.sendStatus(201);
}

export function watchedRoute(req: Request, res: Response) {
  const user = req.user;
  if (user === undefined) {
    throw new NotFoundError();
  }
  res.json({ watched: user.watched.length });
}
