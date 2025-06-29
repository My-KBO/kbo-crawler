import axios from 'axios';
import * as cheerio from 'cheerio';

export interface PlayerInfo {
  name: string;
  team: string;
  stat: string;
}

export interface TopPlayers {
  battingAvg: PlayerInfo | null;
  homeRun: PlayerInfo | null;
  era: PlayerInfo | null;
  win: PlayerInfo | null;
}

export async function fetchTopPlayersCheerio(): Promise<TopPlayers> {
  const url = 'https://www.koreabaseball.com/Record/Ranking/Top5.aspx';
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);

  const extract = (box: cheerio.Cheerio): PlayerInfo | null => {
    if (!box || !box.length) return null;
    const name = box.find('.player').text().trim();
    const team = box.find('.team').text().trim();
    const stat = box.find('.record').text().trim();
    return { name, team, stat };
  };

  const hitterBoxes = $('.hitter_ranking .top5');
  const pitcherBoxes = $('.pitcher_ranking .top5');

  return {
    battingAvg: extract(hitterBoxes.eq(0)),
    homeRun: extract(hitterBoxes.eq(1)),
    era: extract(pitcherBoxes.eq(0)),
    win: extract(pitcherBoxes.eq(1)),
  };
}
