import { getBreakingNews } from "./getBreakingNews";

(async () => {
  const news = await getBreakingNews();
  console.log(news);
})();
