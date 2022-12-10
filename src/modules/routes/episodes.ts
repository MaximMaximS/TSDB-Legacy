import type { Request, Response } from "express";
import Episode from "../models/episode";
import { ValidatorError } from "../errors";
import { escapeRegExp } from "../utils";

export async function searchRoute(req: Request, res: Response) {
  const name = req.query["name"];
  const lang = req.query["lang"];
  if (name === undefined) {
    throw new ValidatorError("name", "required");
  }
  if (typeof name !== "string") {
    throw new ValidatorError("name", "string");
  }
  if (name.length < 3) {
    throw new ValidatorError("name", "minlength");
  }

  if (lang === undefined) {
    throw new ValidatorError("lang", "required");
  }
  if (typeof lang !== "string") {
    throw new ValidatorError("lang", "string");
  }

  const episodes = await Episode.find({
    [`name.${lang}`]: new RegExp(escapeRegExp(name), "i"),
  });
  res.json(episodes);
}
