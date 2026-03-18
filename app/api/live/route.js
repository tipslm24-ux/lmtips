import { apiFootball, normalizeFixture, fetchFixtureStatisticsMap } from '../_lib/apifootball';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const leagueId = searchParams.get('leagueId');

    const query = leagueId
      ? `/fixtures?league=${encodeURIComponent(leagueId)}&status=LIVE`
      : '/fixtures?live=all';

    const data = await apiFootball(query);
    const fixtures = data.response || [];

    const normalized = await Promise.all(
      fixtures.map(async (item) => {
        const statsMap = await fetchFixtureStatisticsMap(item.fixture?.id);
        return normalizeFixture(item, statsMap);
      })
    );

    return Response.json({ response: normalized });
  } catch (error) {
    return Response.json(
      { error: error.message || 'Erro ao carregar jogos ao vivo.' },
      { status: 500 }
    );
  }
}
