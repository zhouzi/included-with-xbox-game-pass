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
      reviewScore: number;
      reviewScoreDesc: string;
      totalPositive: number;
      totalNegative: number;
      updatedAt: string;
    } | null;
  } | null;

  // last time the game's availability changed
  updatedAt: string;
}
