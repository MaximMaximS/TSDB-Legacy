/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from "express";
import asyncMiddleware from "middleware-async";
import { getRoute, searchRoute, watchRoute } from "./routes/episodes";
import { its5Route, susRoute } from "./routes/misc";
import { registerRoute, watchedRoute } from "./routes/users";
import { login, methodNotAllowed } from "./middleware";

const router = Router();

router
  .route("/episode/search")
  .get(asyncMiddleware(searchRoute))
  .all(methodNotAllowed);
router
  .route("/episode/:id")
  .get(login, asyncMiddleware(getRoute))
  .all(methodNotAllowed);

router
  .route("/episode/:id/watch")
  .post(login, asyncMiddleware(watchRoute))
  .all(methodNotAllowed);

router
  .route("/register")
  .post(asyncMiddleware(registerRoute))
  .all(methodNotAllowed);

router.route("/watched").get(login, watchedRoute).all(methodNotAllowed);

// It's 5!
router.route("/its5").all(its5Route);

// Nothing
router.route("/").all(susRoute);

export default router;
