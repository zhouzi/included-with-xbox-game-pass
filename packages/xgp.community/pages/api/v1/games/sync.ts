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
  const finalGames: Game[] = [];

  await page.goto(XBOX_GAME_PASS_URL);

  await (async function extractCurrentPage(): Promise<void> {
    await page.waitForSelector(SELECTORS.games);

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
      await page.click(SELECTORS.next);
      return extractCurrentPage();
    } catch (err) {
      const client = new faunadb.Client({
        secret: process.env.FAUNADB_SECRET,
      });

      for (const id of Object.keys(games)) {
        const game = games[id];

        try {
          await client.query(getGameByID(game.id));

          const { id, addedAt, removedAt, ...properties } = game;
          await client.query(updateGame(game.id, properties));
        } catch (err) {
          await client.query(createGame(game));
        }
      }

      const { data: currentGames } = await client.query<{
        data: Array<{ data: Game }>;
      }>(getGames());
      for (const currentGame of currentGames) {
        if (games[currentGame.data.id] == null) {
          await client.query(
            updateGame(currentGame.data.id, {
              removedAt: addedAt,
            })
          );
        } else {
          finalGames.push(currentGame.data);
        }
      }
    }
  })();

  browser.close();

  res.status(200).json(finalGames);
};
