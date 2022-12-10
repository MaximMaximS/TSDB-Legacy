import * as dotenv from "dotenv";
import mongoose from "mongoose";
import { readFileSync, writeFileSync } from "node:fs";
import Episode from "../src/modules/models/episode";

dotenv.config({ path: "../.env" });

const list = readFileSync("./data/list.json", "utf8");
const episodes = JSON.parse(list);

async function main() {
  if (process.env["MONGODB_URI"] === undefined) {
    throw new Error("MONGODB_URI is not defined");
  }
  mongoose.set("strictQuery", true);
  await mongoose.connect(process.env["MONGODB_URI"]);
  console.log("Connection Successful!");

  // Export all episodes to JSON
  const backup = await Episode.find();
  writeFileSync("./data/backup.json", JSON.stringify(backup, undefined, 2));

  // Delete all episodes
  await Episode.deleteMany({});
  console.log("Deleted all episodes");

  // Import all episodes
  await Episode.insertMany(episodes);
  console.log("Imported all episodes");

  await mongoose.disconnect();
}

void main();
