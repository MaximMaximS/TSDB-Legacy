import type { Request, Response } from "express";
import Episode from "../models/episode";
import { NotFoundError, ServerError, ValidatorError } from "../errors";
import { escapeRegExp, string } from "../utils";

export async function searchRoute(req: Request, res: Response) {
  const name = string(req.query["name"], "name");
  const lang = string(req.query["lang"], "lang");
  if (name.length < 3) {
    throw new ValidatorError("name", "minlength");
  }
  if (lang !== "en" && lang !== "cs") {
    throw new ValidatorError("lang", "enum");
  }

  const episodes = await Episode.find({
    [`name.${lang}`]: new RegExp(escapeRegExp(name), "i"),
  });
  res.json(
    episodes.map((episode) => {
      return { name: episode.name[lang], id: episode._id };
    })
  );
}

export async function getRoute(req: Request, res: Response) {
  const id = string(req.params["id"], "id");

  const episode = await Episode.findById(Number.parseInt(id));
  if (episode === null) {
    throw new NotFoundError();
  }
  const watched = req.user?.watched.includes(episode._id);
  if (watched === undefined) {
    throw new ServerError(
      "Cannot get watched status of user " + (req.user?.username ?? "undefined")
    );
  }

  res.json({
    episode,
    watched,
  });
}

export async function watchRoute(req: Request, res: Response) {
  const id = string(req.params["id"], "id");
  const state = string(req.body.state, "state");

  const episode = await Episode.findById(Number.parseInt(id));
  if (episode === null) {
    throw new NotFoundError();
  }
  const user = req.user;
  if (user === undefined) {
    throw new ServerError("Cannot get user");
  }
  if (state === "true") {
    if (!user.watched.includes(episode._id)) {
      user.watched.push(episode._id);
    }
  } else if (state === "false") {
    if (user.watched.includes(episode._id)) {
      user.watched = user.watched.filter((id) => id !== episode._id);
    }
  } else {
    throw new ValidatorError("state", "enum");
  }
  await user.save();
  res.sendStatus(204);
}
