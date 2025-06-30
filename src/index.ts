import { fetchTopPlayers } from "./rankings/playerRankingCrawler";
import { fetchTeamRanking } from "./rankings/teamRankingCrawler";
import { fetchMonthlySchedule } from "./schedules/fetchYearlySchedule";

(async () => {
  // const teamresult = await fetchTeamRanking();
  // const playerresult = await fetchTopPlayers().then();
  // console.table(teamresult);
  // console.table(playerresult);
  const year = 2025;

  for (let month = 3; month <= 12; month++) {
    const data = await fetchMonthlySchedule(year, month);
    console.log(`[${year}-${month}] 경기 수: ${data.length}`);
    console.table(data.slice(0, 3)); // 샘플 출력
  }
})();
