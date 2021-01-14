import path from "path";
import fse from "fs-extra";
import puppeteer from "puppeteer";
import alphaSort from "alpha-sort";
import random from "random-int";
import escapeRegexp from "escape-string-regexp";
import slugify from "@sindresorhus/slugify";
import got from "got";
import { Game } from "@xgp/types";

import currentGames from "../xgp.community/static/games.json";

interface ScrappedGame {
  name: string;
  url: string;
  availability: {
    console: boolean;
    pc: boolean;
  };
}

const OUTPUT_DIR = path.join(__dirname, "..", "xgp.community", "static");

(async function scrapGames() {
  const updatedAt = new Date().toISOString();
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const games: Record<string, Game> = {};

  await page.goto("https://www.xbox.com/en-US/xbox-game-pass/games");

  await (async function scrapCurrentPageAndGoNext(): Promise<void> {
    await page.waitForSelector(
      `.gameList [itemtype="http://schema.org/Product"]`
    );

    const rawGames = await page.$$eval(
      `.gameList [itemtype="http://schema.org/Product"]`,
      (elements) =>
        elements.map(
          (element): ScrappedGame => ({
            name: element.querySelector("h3")!.textContent!,
            url: element.querySelector("a")!.href,
            availability: {
              console: Boolean(element.querySelector(`[aria-label="Console"]`)),
              pc: Boolean(element.querySelector(`[aria-label="PC"]`)),
            },
          })
        )
    );

    rawGames.forEach((rawGame) => {
      const name = cleanName(rawGame.name);
      const slug = slugify(name, {
        decamelize: false,
      });
      const currentGame = currentGames.find((game) => game.slug === slug);

      if (games[slug] == null) {
        games[slug] = {
          slug,
          name,
          availability: {
            console: null,
            pc: null,
            steam: currentGame?.availability.steam ?? null,
          },
          updatedAt,
        };
      }

      (Object.entries(rawGame.availability) as Array<
        [keyof typeof rawGame.availability, boolean]
      >).forEach(([platform, isAvailable]) => {
        if (isAvailable) {
          games[slug].availability[platform] = rawGame.url;
        }
      });
    });

    try {
      await page.waitForTimeout(random(500, 2000));
      await page.click(".paginatenext:not(.pag-disabled) a");
      return scrapCurrentPageAndGoNext();
    } catch (err) {}
  })();

  browser.close();

  Object.values(games).forEach((game) => {
    const currentGame = currentGames.find(
      (currentGame) => currentGame.slug === game.slug
    );
    if (
      // if the game was already included
      currentGame &&
      // with the same availability
      ["console" as const, "pc" as const].every(
        (platform) =>
          currentGame.availability[platform] && game.availability[platform]
      )
    ) {
      // then keep its old updatedAt date
      game.updatedAt = currentGame.updatedAt;
    }
  });

  const {
    applist: { apps },
  } = await got("https://api.steampowered.com/ISteamApps/GetAppList/v2/").json<{
    applist: { apps: Array<{ appid: number; name: string }> };
  }>();
  apps.forEach((app) => {
    const slug = slugify(app.name, {
      decamelize: false,
    });

    if (games.hasOwnProperty(slug)) {
      games[
        slug
      ].availability.steam = `https://store.steampowered.com/app/${app.appid}/`;
    }
  });

  await fse.writeJSON(
    path.join(OUTPUT_DIR, "games.json"),
    Object.values(games).sort((a, b) =>
      alphaSort.caseInsensitiveAscending(a.name, b.name)
    ),
    {
      spaces: 2,
    }
  );
})();

function cleanName(name: string): string {
  // games tend to add a suffix to their name on the Microsoft store
  // which makes it harder to match them with the actual game
  // below is a list of known suffixes that should be removed
  const suffixes = [
    "Windows",
    "Windows 10",
    "Windows 10 Edition",
    "Xbox One Edition",
    "(PC)",
    "PC",
    "Microsoft Store Edition",
    "WINDOWS EDITION",
    "Console Edition",
    "XB1",
    "Win10",
    "(Xbox One)",
    "Game Preview",
    "(Game Preview)",
  ].map((suffix) => new RegExp(`[-:\\s]*${escapeRegexp(suffix)}$`, "i"));
  return suffixes.reduce((acc, regexp) => acc.replace(regexp, ""), name).trim();
}
