export interface Game {
  slug: string;
  name: string;

  // @deprecated use availability instead
  url: string;

  availability: {
    console: string | null;
    pc: string | null;
    steam: string | null;
  };
  updatedAt: string;
}
