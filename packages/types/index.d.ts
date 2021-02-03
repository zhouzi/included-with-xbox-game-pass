export interface Game {
  slug: string;
  name: string;
  availability: {
    console: string | null;
    pc: string | null;

    // deprecated: use Game.steam
    steam: string | null;
  };
  steam: number | null;

  // last time the game's availability changed
  updatedAt: string;
}
