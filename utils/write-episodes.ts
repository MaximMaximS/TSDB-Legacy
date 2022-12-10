import mongoose from "mongoose";

/*
import { readFileSync } from "node:fs";

const list = readFileSync("./list.json", "utf8");
const episodes = JSON.parse(list);
*/

async function main() {
  if (process.env["MONGODB_URI"] === undefined) {
    throw new Error("MONGODB_URI is not defined");
  }
  await mongoose.connect(process.env["MONGODB_URI"]);
  console.log("Connection Successful!");
}

void main();
