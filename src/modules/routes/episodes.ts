import type { Request, Response } from "express";
import Episode from "../models/episode";
import { NotFoundError, ServerError, ValidatorError } from "../errors";
import { escapeRegExp, number, string } from "../utils";

export async function searchRoute(req: Request, res: Response) {
  const title = string(req.query["title"], "title");
  const lang = string(req.query["lang"], "lang");
  if (title.length < 3) {
    throw new ValidatorError("title", "minlength");
  }
  if (lang !== "en" && lang !== "cs") {
    throw new ValidatorError("lang", "enum");
  }

  const episodes = await Episode.find({
    [`title.${lang}`]: new RegExp(escapeRegExp(title), "i"),
  });
  res.json(
    episodes.map((episode) => {
      return { title: episode.title[lang], id: episode._id };
    })
  );
}

export async function seRoute(req: Request, res: Response) {
  const season = number(req.params["s"], "s");
  const episode = number(req.params["e"], "e");

  const ep = await Episode.findOne({
    season,
    episode,
  });
  if (ep === null) {
    throw new NotFoundError();
  }
  res.json({ id: ep._id });
}

export async function getRoute(req: Request, res: Response) {
  const id = string(req.params["id"], "id");
  const lang = string(req.query["lang"], "lang");
  if (lang !== "en" && lang !== "cs") {
    throw new ValidatorError("lang", "enum");
  }

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
    title: episode.title[lang],
    id: episode._id,
    season: episode.season,
    episode: episode.episode,
    premiere: episode.premiere[lang].toISOString(),
    directedBy: episode.directedBy,
    writtenBy: episode.writtenBy,
    plot: episode.plot[lang],
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
