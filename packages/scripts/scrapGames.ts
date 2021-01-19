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

const OUTPUT_DIR = path.join(__dirname, "..", "xgp.community", "static");
const NOW = new Date().toISOString();

(async function updateGamesList() {
  const scrappedGames = await getScrappedGames();
  const games = sortGames(scrappedGames).reduce<Record<string, Game>>(
    (acc, scrappedGame) => {
      const name = cleanName(scrappedGame.name);
      const slug = slugify(name, {
        decamelize: false,
      });
      const currentGame = currentGames.find((game) => game.slug === slug);

      if (acc[slug] == null) {
        acc[slug] = {
          slug,
          name,
          availability: {
            console: null,
            pc: null,
            steam: currentGame?.availability.steam ?? null,
          },
          steam: currentGame?.steam ?? null,
          updatedAt: NOW,
        };
      }

      const game = acc[slug];

      if (scrappedGame.availability.console) {
        game.availability.console = scrappedGame.url;
      }

      if (scrappedGame.availability.pc) {
        game.availability.pc = scrappedGame.url;
      }

      if (currentGame && !hasNewAvailability(currentGame, game)) {
        game.updatedAt = currentGame.updatedAt;
      }

      return acc;
    },
    {}
  );

  await updateSteamRelation(games);
  await updateSteamReviews(games);

  await fse.writeJSON(
    path.join(OUTPUT_DIR, "games.json"),
    sortGames(Object.values(games)),
    {
      spaces: 2,
    }
  );
})();

async function updateSteamRelation(games: Record<string, Game>) {
  const {
    applist: { apps },
  } = await got("https://api.steampowered.com/ISteamApps/GetAppList/v2/").json<{
    applist: { apps: Array<{ appid: number; name: string }> };
  }>();
  apps.forEach((app) => {
    const slug = slugify(app.name, {
      decamelize: false,
    });

    if (!games.hasOwnProperty(slug)) {
      return;
    }

    if (games[slug].steam == null) {
      games[slug].steam = {
        appid: app.appid,
        reviews: games[slug].steam?.reviews ?? null,
      };

      // this property is deprecated and will be removed in the future
      // until then let's keep it updated
      games[
        slug
      ].availability.steam = `https://store.steampowered.com/app/${app.appid}/`;
    }
  });
}

async function updateSteamReviews(games: Record<string, Game>) {
  const priorizedSlugs = Object.values(games)
    .filter((game) => game.steam != null)
    // prioritize games without reviews data, then the oldest ones
    .sort((a, b) => {
      if (a.steam!.reviews == null && b.steam!.reviews != null) {
        return -1;
      }
      if (a.steam!.reviews != null && b.steam!.reviews == null) {
        return 1;
      }
      if (a.steam!.reviews == null && b.steam!.reviews == null) {
        return 0;
      }
      return (
        new Date(a.steam!.reviews!.updatedAt).getTime() -
        new Date(b.steam!.reviews!.updatedAt).getTime()
      );
    })
    // up to 100 requests are made to steam's api to avoid quota limit
    .slice(0, 100)
    .map((game) => game.slug);

  for (const slug of priorizedSlugs) {
    const { appid } = games[slug].steam!;
    const {
      query_summary: {
        review_score,
        review_score_desc,
        total_positive,
        total_negative,
      },
    } = await got(
      `https://store.steampowered.com/appreviews/${appid}?json=1`
    ).json<{
      query_summary: {
        review_score: number;
        review_score_desc: string;
        total_positive: number;
        total_negative: number;
      };
    }>();
    games[slug].steam!.reviews = {
      reviewScore: review_score,
      reviewScoreDesc: review_score_desc,
      totalPositive: total_positive,
      totalNegative: total_negative,
      updatedAt: NOW,
    };
  }
}

// Represents a game as scrapped from the Xbox Game Pass website
// It doesn't have all the final data and structure yet
interface ScrappedGame {
  name: string;
  url: string;
  availability: {
    console: boolean;
    pc: boolean;
  };
}

async function getScrappedGames(): Promise<ScrappedGame[]> {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const scrappedGames: ScrappedGame[] = [];

  await page.goto("https://www.xbox.com/en-US/xbox-game-pass/games");

  await (async function scrapCurrentPageAndGoNext(): Promise<void> {
    await page.waitForSelector(
      `.gameList [itemtype="http://schema.org/Product"]`
    );

    scrappedGames.push(
      ...(await page.$$eval(
        `.gameList [itemtype="http://schema.org/Product"]`,
        (elements) =>
          elements.map(
            (element): ScrappedGame => ({
              name: element.querySelector("h3")!.textContent!,
              url: element.querySelector("a")!.href,
              availability: {
                console: Boolean(
                  element.querySelector(`[aria-label="Console"]`)
                ),
                pc: Boolean(element.querySelector(`[aria-label="PC"]`)),
              },
            })
          )
      ))
    );

    try {
      await page.waitForTimeout(random(500, 2000));
      await page.click(".paginatenext:not(.pag-disabled) a");
      return scrapCurrentPageAndGoNext();
    } catch (err) {}
  })();

  browser.close();

  return scrappedGames;
}

function sortGames<T extends Array<{ name: string }>>(games: T): T {
  const compareNames = alphaSort({
    caseInsensitive: true,
  });
  return games.sort((a, b) => compareNames(a.name, b.name));
}

function hasNewAvailability(oldGame: Game, newGame: Game): boolean {
  return (
    (Boolean(newGame.availability.console) && !oldGame.availability.console) ||
    (Boolean(newGame.availability.pc) && !oldGame.availability.pc)
  );
}

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
