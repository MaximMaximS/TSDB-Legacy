import "dotenv/config";
import mongoose from "mongoose";
import app from "./modules/app";
import type { UserType } from "./modules/models/user";
import { number } from "./modules/utils";

declare module "express-serve-static-core" {
  interface Request {
    user?: UserType;
  }
}

async function main() {
  const PORT = number(process.env["PORT"], "PORT");

  if (process.env["MONGODB_URI"] === undefined) {
    throw new Error("MONGODB_URI is not defined");
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(process.env["MONGODB_URI"]);

  // Run the server
  app.listen(PORT, () => {
    console.info(`Server running on http://localhost:${PORT}`);
  });
}

void main(); // Entry point
