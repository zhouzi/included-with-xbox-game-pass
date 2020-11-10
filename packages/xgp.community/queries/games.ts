import faunadb from "faunadb";
import { Game } from "@xgp/faunadb";

const q = faunadb.query;

export function getGames() {
  return q.Map(q.Paginate(q.Match(q.Index("all_games"))), (ref) => q.Get(ref));
}

export function getGameByID(id: string) {
  return q.Get(q.Match(q.Index("unique_game_id"), id));
}

export function createGame(game: Game) {
  return q.Create(q.Collection("games"), {
    data: game,
  });
}

export function updateGame(id: string, game: Partial<Game>) {
  return q.Update(
    q.Select(["ref"], q.Get(q.Match(q.Index("unique_game_id"), id))),
    {
      data: game,
    }
  );
}
