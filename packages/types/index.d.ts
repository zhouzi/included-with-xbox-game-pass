export interface Game {
  id: string;
  name: string;
  url: string;
  image: string;
  availability: {
    console: boolean;
    pc: boolean;
  };
  releaseDate: string;
  addedAt: string;
}

export interface Post {
  url: string;
  title: string;
  image: string;
  publishedAt: string;
}
