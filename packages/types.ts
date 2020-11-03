export interface APIGame {
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

export interface APINews {
  title: string;
  publishedAt: string;
  url: string;
}
