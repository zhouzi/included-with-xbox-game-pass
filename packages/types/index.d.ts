export interface Game {
  slug: string;
  name: string;
  availability: {
    console: string | null;
    pc: string | null;
    steam: string | null;
  };
  updatedAt: string;
}
