import { fetchTopPlayers } from "./rankings/playerRankingCrawler";
import { fetchTeamRanking } from "./rankings/teamRankingCrawler";

(async () => {
  const teamresult = await fetchTeamRanking();
  const playerresult = await fetchTopPlayers();
  console.table(teamresult);
  console.table(playerresult);
})();
