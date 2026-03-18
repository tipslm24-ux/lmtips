import { fetchTeamsByLeagueSeason } from '../_lib/apifootball';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const leagueId = searchParams.get('leagueId');
    const season = searchParams.get('season');

    const teamName = searchParams.get('teamName');

    if (!teamName && (!leagueId || !season)) {
      return Response.json(
        { error: 'Parâmetros leagueId/season ou teamName são obrigatórios.' },
        { status: 400 }
      );
    }

    let teams;
    if (teamName) {
      teams = await fetchTeamsByName(teamName);
    } else {
      teams = await fetchTeamsByLeagueSeason(leagueId, season);
    }

    return Response.json({ response: teams });
  } catch (error) {
    return Response.json(
      { error: error.message || 'Erro ao carregar times.' },
      { status: 500 }
    );
  }
}