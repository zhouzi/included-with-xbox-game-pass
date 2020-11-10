import { NextApiRequest, NextApiResponse } from "next";
import faunadb from "faunadb";
import { Game } from "@xgp/faunadb";
import { getGames } from "../../../../queries/games";

export default async (req: NextApiRequest, res: NextApiResponse<Game[]>) => {
  const client = new faunadb.Client({
    secret: process.env.FAUNADB_SECRET,
  });
  const { data } = await client.query<{ data: Array<{ data: Game }> }>(
    getGames()
  );

  res.status(200).json(data.map(({ data: game }) => game));
};
