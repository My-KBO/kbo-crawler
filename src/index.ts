import { fetchTopPlayers } from "./rankings/playerRankingCrawler";
import { fetchTeamRanking } from "./rankings/teamRankingCrawler";
import { fetchMonthlySchedule } from "./schedules/fetchYearlySchedule";
import { saveToDatabase } from "./prisma/saveMainDate";
import { getUnifiedTopStats } from "./team/weeklyTopPlayerCrawler";

(async () => {
  const year = 2025;

  const teamresult = await fetchTeamRanking();
  const playerresult = await fetchTopPlayers();
  const teamTopPlayers = await getUnifiedTopStats();
  console.table(teamTopPlayers);
  console.table(teamresult);
  console.table(playerresult);

  let allSchedules: any[] = [];
  for (let month = 3; month <= 12; month++) {
    const monthly = await fetchMonthlySchedule(year, month);
    console.log(`${month}월 일정 ${monthly.length}건`);
    allSchedules.push(...monthly);
  }

  console.table(allSchedules.slice(0, 10));

  await saveToDatabase({
    schedules: allSchedules,
    teamRanks: teamresult,
    playerStats: playerresult,
    teamTopPlayers: teamTopPlayers,
  });
})();
