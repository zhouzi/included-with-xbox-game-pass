export interface APIGame {
  id: string;
  name: string;
  url: string;
  image: string;
  availability: {
    console: boolean;
    pc: boolean;
  };
}

export interface Patch {
  [gameID: string]: {
    before: APIGame | null;
    after: APIGame | null;
  };
}
