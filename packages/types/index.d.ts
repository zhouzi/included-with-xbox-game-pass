export interface Game {
  slug: string;
  name: string;
  availability: {
    console: string | null;
    pc: string | null;

    // deprecated: use Game.steam.url
    steam: string | null;
  };
  steam: {
    appid: number;
    reviews: {
      reviewScoreDesc: string;
      updatedAt: string;
    } | null;
  } | null;

  // last time the game's availability changed
  updatedAt: string;
}
