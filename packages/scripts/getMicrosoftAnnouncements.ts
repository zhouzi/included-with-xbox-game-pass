import puppeteer from "puppeteer";

export async function getMicrosoftAnnouncements(since: Date) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const microsoftAnnoucements = [];

  await page.goto("https://news.xbox.com/en-US/xbox-game-pass/");

  microsoftAnnoucements.push(
    ...(await page.$$eval(".media.feed", (elements) =>
      elements.map((element) => ({
        url: element.querySelector(".feed__title a")!.getAttribute("href"),
        title: element.querySelector(".feed__title")!.textContent!.trim(),
        publishedAt: element
          .querySelector(".feed__date time")!
          .getAttribute("datetime")!,
      }))
    ))
  );

  browser.close();

  return microsoftAnnoucements.filter(
    (announcement) =>
      new Date(announcement.publishedAt).getTime() >= since.getTime()
  );
}
