import { PrismaClient } from "../../../server/node_modules/@prisma/client";

const prisma = new PrismaClient();

export async function saveToDatabase({
  schedules,
  teamRanks,
  playerStats,
  teamTopPlayers, // ✅ 추가
}: {
  schedules: any[];
  teamRanks: any[];
  playerStats: any[];
  teamTopPlayers: {
    team: string;
    name: string;
    type: "타자" | "투수";
    game: number;
    value: number;
  }[];
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

  for (const p of teamTopPlayers) {
    await prisma.teamTopPlayer.upsert({
      where: {
        team_name_type: {
          team: p.team,
          name: p.name,
          type: p.type,
        },
      },
      update: {
        game: p.game,
        value: p.value,
      },
      create: p,
    });
  }
}
