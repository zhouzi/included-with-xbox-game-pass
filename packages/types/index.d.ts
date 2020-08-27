export interface APIGame {
  id: string;
  name: string;
  url: string;
  availability: {
    console: boolean;
    pc: boolean;
  };
}
