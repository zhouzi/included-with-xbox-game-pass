import routes from "./routes";
import badge from "./features/badge";
import playButton from "./features/playButton";
import wishList from "./features/wishList";

(async () => {
  const currentRoute = routes.find((route) => route.match(window.location.href))
    ?.name;

  if (currentRoute == null) {
    return;
  }

  await badge(currentRoute);
  await playButton(currentRoute);
  await wishList(currentRoute);
})();
