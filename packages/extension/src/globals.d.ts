declare namespace JSX {
  interface Element extends HTMLElement {}
  type BaseIntrinsicElement = IntrinsicElements["div"];
  interface IntrinsicAttributes extends BaseIntrinsicElement {}
}
