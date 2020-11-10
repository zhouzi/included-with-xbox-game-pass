import { NextApiRequest, NextApiResponse } from "next";
import puppeteer from "puppeteer";
import { Game } from "@xgp/faunadb";
import faunadb from "faunadb";
import {
  getGameByID,
  createGame,
  updateGame,
  getGames,
} from "../../../../queries/games";

const XBOX_GAME_PASS_URL = "https://www.xbox.com/en-US/xbox-game-pass/games";
const SELECTORS = {
  games: `.gameList [itemtype="http://schema.org/Product"]`,
  game: {
    name: "h3",
    url: "a",
    image: "img",
    availability: {
      console: `[aria-label="Console"]`,
      pc: `[aria-label="PC"]`,
    },
  },
  currentPage: ".paginatenum.f-active",
  next: ".paginatenext:not(.pag-disabled) a",
  totalGames: ".resultsText",
  pages: ".paginatenum",
};

export default async (req: NextApiRequest, res: NextApiResponse<Game[]>) => {
  const token = req.headers.authorization?.match(/Bearer (.+)/)?.[1];

  if (token !== process.env.CRON_SECRET) {
    res.status(401).end();
    return;
  }

  const addedAt = new Date().toISOString();
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const games: Record<string, Game> = {};
  const expectations: { games: number | null; pages: number | null } = {
    games: null,
    pages: null,
  };

  await page.goto(XBOX_GAME_PASS_URL);

  await (async function extractCurrentPage(): Promise<void> {
    await page.waitForSelector(SELECTORS.games);

    if (expectations.games == null || expectations.pages == null) {
      expectations.games = await page.$eval(SELECTORS.totalGames, (element) =>
        Number(element.textContent!.match(/([0-9]+) result/)![1])
      );
      expectations.pages = await page.$$eval(SELECTORS.pages, (elements) =>
        Number(elements[elements.length - 1].getAttribute("data-topage"))
      );
    }

    (
      await page.$$eval(
        SELECTORS.games,
        (elements, selectors, addedAt) =>
          elements.map(
            (element): Game => ({
              id: element.getAttribute("data-bigid")!,
              name: element.querySelector(selectors.game.name)!.textContent!,
              url: (element.querySelector(
                selectors.game.url
              ) as HTMLAnchorElement).href,
              image: element
                .querySelector(selectors.game.image)!
                .getAttribute("src")!,
              availability: {
                console: Boolean(
                  element.querySelector(selectors.game.availability.console)
                ),
                pc: Boolean(
                  element.querySelector(selectors.game.availability.pc)
                ),
              },
              releaseDate: element.getAttribute("data-releasedate")!,
              addedAt: addedAt,
            })
          ),
        SELECTORS,
        addedAt
      )
    ).forEach((game) => {
      games[game.id] = game;
    });

    try {
      const min = 500;
      const max = 2000;
      const timeout = Math.round(Math.random() * (max - min) + min);
      await page.waitForTimeout(timeout);

      await page.click(SELECTORS.next);
      return extractCurrentPage();
    } catch (err) {
      const currentPage = await page.$eval(SELECTORS.currentPage, (element) =>
        Number(element.getAttribute("data-topage")!)
      );
      if (
        currentPage !== expectations.pages ||
        Object.keys(games).length !== expectations.games
      ) {
        throw new Error(
          `The script ended without meeting the expectations of ${
            expectations.pages
          } pages (${currentPage}) and ${expectations.games} games (${
            Object.keys(games).length
          }).`
        );
      }

      console.log(`Scrapped ${Object.keys(games).length} games.`);

      const client = new faunadb.Client({
        secret: process.env.FAUNADB_SECRET,
      });

      for (const id of Object.keys(games)) {
        const game = games[id];

        try {
          const { id, addedAt, removedAt, ...properties } = game;
          const { data: currentGame } = await client.query<{ data: Game }>(
            getGameByID(game.id)
          );

          if (currentGame.removedAt) {
            console.log(`${game.name} was added back.`);
            await client.query(
              updateGame(game.id, { ...properties, addedAt, removedAt: null })
            );
          } else {
            console.log(`${game.name} was updated.`);
            await client.query(updateGame(game.id, properties));
          }
        } catch (err) {
          console.log(`${game.name} was added.`);
          await client.query(createGame(game));
        }
      }

      const { data: currentGames } = await client.query<{
        data: Array<{ data: Game }>;
      }>(getGames());
      for (const currentGame of currentGames) {
        if (games[currentGame.data.id] == null) {
          console.log(`${currentGame.data.name} was removed.`);
          await client.query(
            updateGame(currentGame.data.id, {
              removedAt: addedAt,
            })
          );
        }
      }
    }
  })();

  browser.close();

  res.status(200).json([]);
};
