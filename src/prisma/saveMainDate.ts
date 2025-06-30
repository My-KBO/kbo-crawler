import { PrismaClient } from "../../../server/node_modules/@prisma/client";

const prisma = new PrismaClient();

export async function saveToDatabase({
  schedules,
  teamRanks,
  playerStats,
}: {
  schedules: any[];
  teamRanks: any[];
  playerStats: any[];
}) {
  for (const s of schedules) {
    await prisma.schedule.upsert({
      where: {
        date_time_stadium: {
          date: s.date,
          time: s.time,
          stadium: s.stadium,
        },
      },
      update: {
        homeTeam: s.homeTeam,
        homeScore: s.homeScore,
        awayTeam: s.awayTeam,
        awayScore: s.awayScore,
        tv: s.tv,
        stadium: s.stadium,
        note: s.note,
      },
      create: s,
    });
  }

  for (const t of teamRanks) {
    await prisma.teamRank.upsert({
      where: { team: t.team },
      update: t,
      create: t,
    });
  }

  for (const p of playerStats) {
    await prisma.playerStat.upsert({
      where: {
        category_name_team: {
          category: p.category,
          name: p.name,
          team: p.team,
        },
      },
      update: { value: p.value },
      create: p,
    });
  }
}
