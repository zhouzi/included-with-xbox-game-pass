export interface Game {
  slug: string;
  name: string;

  // @deprecated use availability instead
  url: string;

  image: string;
  availability: {
    console: string | null;
    pc: string | null;
  };
  updatedAt: string;
}
