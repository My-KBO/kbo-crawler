import { fetchTopPlayers } from "./rankings/playerRankingCrawler";
import { fetchTeamRanking } from "./rankings/teamRankingCrawler";
import { fetchMonthlySchedule } from "./schedules/fetchYearlySchedule";

(async () => {
  // const teamresult = await fetchTeamRanking();
  // const playerresult = await fetchTopPlayers().then();
  // console.table(teamresult);
  // console.table(playerresult);
  const year = 2025;

  const data = await fetchMonthlySchedule(year, 7);
  console.table(data.slice(0, 10));
})();
