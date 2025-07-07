import { getBreakingNews } from "./getBreakingNews";

(async () => {
  const news = await getBreakingNews();
  console.dir(news, { depth: null });
})();
