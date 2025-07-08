import { fetchTopPlayers } from "./rankings/playerRankingCrawler";
import { fetchTeamRanking } from "./rankings/teamRankingCrawler";
import { fetchMonthlySchedule } from "./schedules/fetchYearlySchedule";
import { saveToDatabase } from "./prisma/saveMainDate";
import { getUnifiedTopStats } from "./team/weeklyTopPlayerCrawler";
import { getBreakingNews } from "./news/getBreakingNews";

(async () => {
  const year = new Date().getFullYear();
  const month = new Date().getMonth() + 1;

  const schedule = await fetchMonthlySchedule(year, month);
  const teamRanks = await fetchTeamRanking();
  const playerStats = await fetchTopPlayers();
  const teamTopPlayers = await getUnifiedTopStats();
  const newsItems = await getBreakingNews();

  await saveToDatabase({
    schedules: schedule,
    teamRanks,
    playerStats,
    teamTopPlayers,
    newsItems,
  });
})();
