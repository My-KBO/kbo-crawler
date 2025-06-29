import { fetchTeamRanking } from "./rankings/teamRankingCrawler";

(async () => {
  const result = await fetchTeamRanking();
  console.table(result);
})();
