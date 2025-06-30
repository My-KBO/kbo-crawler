import { fetchTopPlayers } from "./rankings/playerRankingCrawler";
import { fetchTeamRanking } from "./rankings/teamRankingCrawler";

(async () => {
  const teamresult = await fetchTeamRanking();
  const playerresult = await fetchTopPlayers().then();
  console.table(teamresult);
  console.table(playerresult);
})();
