// File system
import axios from "axios";
import { Element, load } from "cheerio";
import fs from "node:fs";
import { URL } from "node:url";

// Create data folder ./data/pages
if (!fs.existsSync("./data")) {
  fs.mkdirSync("./data");
  fs.mkdirSync("./data/pages");
} else if (!fs.existsSync("./data/pages")) {
  fs.mkdirSync("./data/pages");
}

async function fetchSite(url: URL | string, alias: string) {
  if (typeof url === "string") {
    url = new URL(url);
  }
  const urls = url.toString();
  if (process.env["FETCH"] !== "true") {
    try {
      return fs.readFileSync(`./data/pages/${alias}.html`);
    } catch {
      console.log(`File ${alias} not found, fetching...`);
    }
  }
  const response = await axios.get(urls);
  if (response.status !== 200) {
    throw new Error(`Failed to fetch ${alias} (${urls})`);
  }
  const result = await response.data;
  if (typeof result !== "string") {
    throw new TypeError(`${alias} is not a string (${urls})`);
  }
  fs.writeFileSync(`./data/pages/${alias}.html`, result);
  return result;
}

// Convert array to map
const nameMix = new Map<string, string>();
nameMix.set("ledna", "January");
nameMix.set("února", "February");
nameMix.set("března", "March");
nameMix.set("dubna", "April");
nameMix.set("května", "May");
nameMix.set("června", "June");
nameMix.set("července", "July");
nameMix.set("srpna", "August");
nameMix.set("září", "September");
nameMix.set("října", "October");
nameMix.set("listopadu", "November");
nameMix.set("prosince", "December");

const dateRegex =
  /\d{1,2}\. (?:ledna|února|března|dubna|května|června|července|srpna|září|října|listopadu|prosince) \d{4}/gi;

function parseDate(date: string) {
  // Convert to English
  for (const [cs, en] of nameMix) {
    date = date.replace(`. ${cs} `, `-${en}-`);
  }
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

type NameType = "enName" | "csName" | "directedBy" | "writtenBy";

function nameFix(name: string) {
  return name
    .replaceAll("ová", "")
    .replaceAll(" a ", ", ")
    .replace(/(?<=.)\d\. část: /g, ", ")
    .replace(/(?<!.)\d\. část: /g, "")
    .replace(/ (?:námět|scénář): /g, ", ")
    .replace(/(?<=^)(?:námět|scénář): /g, "");
}

const channelRegex = /(?<= \()[^)]+(?=\))/g;
const nameRegex = /[^ ()][^()]+(?= \()/g;
function fixName(name: string, type: NameType): string {
  name = name
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\[[^\]]*\d]/g, "");
  switch (type) {
    case "enName":
    case "csName": {
      const channels = name.match(channelRegex);
      const names = name.match(nameRegex);
      // If not (both null or if their lengths are equal)
      if ((channels === null) !== (names === null)) {
        throw new Error(`wtf regex: ${name}`);
      }
      if (channels === null) {
        return name;
      }
      if (names === null) {
        throw new Error(`i luv js: ${name}`);
      }

      if (channels.length !== names.length) {
        throw new Error(`wtf regex: ${name}`);
      }

      if (channels.length === 1) {
        return name;
      }

      const index = channels.findIndex((channel) =>
        channel.toLowerCase().includes("prima")
      );
      if (index === -1) {
        throw new Error(`Channel not found: ${name}`);
      }
      const nm = names[index];
      if (nm === undefined) {
        throw new Error(`Name not found: ${name}`);
      }
      return nm;
    }
    case "directedBy": {
      return nameFix(name);
    }
    case "writtenBy": {
      return nameFix(name);
    }
  }
}

function convDate(date: string) {
  const match = date.match(dateRegex);
  if (match === null) {
    throw new Error(`Invalid date: ${date}`);
  }
  if (match.length === 1) {
    return parseDate(match[0]);
  }
  const parsed = match.map((m) => parseDate(m));
  // Return the earliest date
  const d = parsed.sort((a, b) => a.getTime() - b.getTime())[0];
  if (d === undefined) {
    throw new Error(`Invalid date: ${date}`);
  }
  return d;
}

interface Episode {
  _id: number;
  seasonId: number;
  inSeasonId: number;
  name: {
    en: string;
    cs: string;
  };
  directedBy: string;
  writtenBy: string;
  premiered: {
    en: Date;
    cs: Date;
  };
  plot: {
    en: string;
    cs: string;
  };
}

function fixPlot(plot: string) {
  return plot
    .trim()
    .replaceAll("[editovat | editovat zdroj]", "")
    .replace(/\s+/g, " ")
    .replace(/\[[^\]]*\d]/g, "");
}

async function getPlot(id: string, url: URL): Promise<string> {
  const site = await fetchSite(url, id);
  const $ = load(site);
  const h = $("h2:contains('Děj')");
  if (h.length === 0) {
    throw new Error(`Plot not found: ${url.toString()}`);
  }
  // Until the next h2
  const until = h.nextUntil("h2");
  let text = "";
  for (const el of until) {
    // If it's a p
    switch (el.tagName) {
      case "p": {
        text += fixPlot($(el).text());
        text += "\n";
        continue;
      }
      case "h3":
      case "h4": {
        text += "\n";
        text += fixPlot($(el).text());
        text += "\n";
        continue;
      }
      case "div":
      case "figure": {
        continue;
      }
      case "ol":
      case "ul": {
        const lis = $(el).find("li");
        for (const li of lis) {
          text += fixPlot($(li).text());
          text += "\n";
        }
        continue;
      }
    }
    console.log(url.toString());
    console.log(el.tagName);
  }
  return text.trim();
}

async function processRow(row: Element, season: number) {
  const $ = load(row);
  const txt = $.text();
  if (txt.includes("bude oznámeno")) return;
  const id = Number.parseInt($("th").text());
  if (Number.isNaN(id)) {
    throw new TypeError(`Invalid ID: ${txt}`);
  }
  const tds = $("td");
  if (tds.length !== 8 && tds.length !== 9) {
    throw new TypeError(`Invalid number of columns: ${txt}`);
  }

  const eNo = Number.parseInt(tds.eq(0).text());
  if (Number.isNaN(eNo)) {
    throw new TypeError(`Invalid episode number: ${txt}`);
  }

  const enName = fixName(tds.eq(1).text(), "enName");
  if (enName === "") {
    throw new TypeError(`Invalid English name: ${txt}`);
  }

  const csNameElem = tds.eq(2);
  const link = csNameElem.find("a").attr("href");
  if (link === undefined) {
    throw new Error(`Invalid link: ${txt}`);
  }
  const url = new URL(link, "https://cs.wikipedia.org/");
  const csName = fixName(csNameElem.text(), "csName");
  if (csName === "") {
    throw new TypeError(`Invalid Czech name: ${txt}`);
  }

  const directedBy = fixName(tds.eq(3).text(), "directedBy");
  if (directedBy === "") {
    throw new TypeError(`Invalid directed by: ${txt}`);
  }

  const writtenBy = fixName(tds.eq(4).text(), "writtenBy");
  if (writtenBy === "") {
    throw new TypeError(`Invalid written by: ${txt}`);
  }

  const enPremiereStr = tds.eq(5).text().trim();
  const enPremiere = convDate(enPremiereStr);
  if (enPremiere.toString() === "Invalid Date") {
    throw new TypeError(`Invalid English premiere: ${txt}`);
  }

  const csPremiereStr = tds.eq(6).text().trim();
  const csPremiere = convDate(csPremiereStr);
  if (csPremiere.toString() === "Invalid Date") {
    console.log(csPremiereStr);
    throw new TypeError(`Invalid Czech premiere: ${txt}`);
  }

  const plot = await getPlot(id.toString(), url);

  const episode: Episode = {
    _id: id,
    seasonId: season,
    inSeasonId: eNo,
    name: {
      en: enName,
      cs: csName,
    },
    directedBy: directedBy,
    writtenBy: writtenBy,
    premiered: {
      en: enPremiere,
      cs: csPremiere,
    },
    plot: {
      en: "N/A",
      cs: plot,
    },
  };
  return episode;
}

function processTable(table: Element, season: number) {
  const $ = load(table);
  // Class = "se-dil bezsouhrnu"
  const rows = $("tr").filter((_index, element) => {
    return element.attribs["class"] === "se-dil bezsouhrnu";
  });
  return rows.toArray().map((element) => processRow(element, season));
}

async function main() {
  console.log("Starting...");
  const root = await fetchSite(
    "https://cs.wikipedia.org/wiki/Seznam_d%C3%ADl%C5%AF_seri%C3%A1lu_Simpsonovi",
    "rootcs"
  ); // Fetch episode list
  const $ = load(root);
  // table class wikitable
  const tables = $("table.wikitable").filter((_index, element) => {
    const id = element.attribs["id"];
    if (id === undefined || !id.startsWith("se-rada")) {
      return false;
    }
    // Remove prefix
    const season = Number.parseInt(id.slice(7));
    return !Number.isNaN(season);
  });
  const tasks = tables
    .toArray()
    .flatMap((table, index) => processTable(table, index + 1));
  console.log(tasks.length);
  const results = await Promise.all(tasks);
  const episodes = results.filter((result) => result !== undefined);
  fs.writeFileSync("./data/list.json", JSON.stringify(episodes, undefined, 2));
}

void main();
