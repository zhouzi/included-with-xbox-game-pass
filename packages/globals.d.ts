declare namespace JSX {
  interface Element extends HTMLElement {}
  type BaseIntrinsicElement = IntrinsicElements["div"];
  interface IntrinsicAttributes extends BaseIntrinsicElement {}
}

interface APIGame {
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
