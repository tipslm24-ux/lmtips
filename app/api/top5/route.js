import {
  apiFootball,
  fetchLastFixturesByTeam,
  calculateTeamStats,
} from '../_lib/apifootball';

function formatPercent(value) {
  return Math.max(0, Math.min(100, value));
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const leagueId = searchParams.get('leagueId');
    const season = searchParams.get('season');

    if (!leagueId || !season) {
      return Response.json(
        { error: 'Parâmetros leagueId e season são obrigatórios.' },
        { status: 400 }
      );
    }

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const date = `${yyyy}-${mm}-${dd}`;

    const fixturesData = await apiFootball(
      `/fixtures?league=${leagueId}&season=${season}&date=${date}`
    );

    const fixtures = fixturesData.response || [];

    const results = [];

    for (const item of fixtures) {
      const home = item.teams?.home;
      const away = item.teams?.away;

      if (!home?.id || !away?.id) continue;

      const [homeMatches, awayMatches] = await Promise.all([
        fetchLastFixturesByTeam(home.id, 20),
        fetchLastFixturesByTeam(away.id, 20),
      ]);

      const homeStats = calculateTeamStats(homeMatches, home.id);
      const awayStats = calculateTeamStats(awayMatches, away.id);

      if (!homeStats || !awayStats) continue;

      const probGolHT = formatPercent((homeStats.over05HT + awayStats.over05HT) / 2);
      const mediaCantoFT = (homeStats.mediaCantosTotal + awayStats.mediaCantosTotal) / 2;
      const mediaCantoHT = mediaCantoFT * 0.42;
      const mediaCartoes =
        (homeStats.mediaCartoes + awayStats.mediaCartoes) / 2;
      const mediaChutesAlvo =
        (homeStats.mediaChutesNoAlvo + awayStats.mediaChutesNoAlvo) / 2;
      const probOver15 = formatPercent((homeStats.over15 + awayStats.over15) / 2);

      const rawProbBtts = (homeStats.btts + awayStats.btts) / 2;
      const probBtts = rawProbBtts > 0 ? formatPercent(rawProbBtts) : null;

      const rawProbOver25 = (homeStats.over25 + awayStats.over25) / 2;
      const probOver25 = rawProbOver25 > 0 ? formatPercent(rawProbOver25) : null;

      const scoreBase = probOver15 * 0.35 + probGolHT * 0.25 + mediaCantoFT * 4 + probBtts * 0.1;

      results.push({
        fixtureId: item.fixture?.id,
        leagueName: item.league?.name || '-',
        homeTeam: home.name,
        awayTeam: away.name,
        kickoff: item.fixture?.date || null,
        probGolHT,
        mediaCantoHT,
        mediaCantoFT,
        mediaCartoes,
        mediaChutesAlvo,
        probOver15,
        probBtts,
        probOver25,
        scoreBase,
      });
    }

    const top5 = results
      .sort((a, b) => b.scoreBase - a.scoreBase)
      .slice(0, 5);

    return Response.json({ response: top5 });
  } catch (error) {
    return Response.json(
      { error: error.message || 'Erro ao carregar Top 5.' },
      { status: 500 }
    );
  }
}