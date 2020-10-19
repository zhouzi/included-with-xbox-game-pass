export enum RouteName {
  wishlist = "wishlist",
  storePage = "storePage",
}

interface Route {
  name: RouteName;
  match: (href: string) => boolean;
}

export default [
  {
    name: RouteName.wishlist,
    match: (href: string) =>
      href.startsWith("https://store.steampowered.com/wishlist/profiles/"),
  },
  {
    name: RouteName.storePage,
    match: (href: string) =>
      href.startsWith("https://store.steampowered.com/app/"),
  },
] as Route[];
