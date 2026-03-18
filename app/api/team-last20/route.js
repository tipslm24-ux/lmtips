import { fetchLastFixturesByTeam } from '../_lib/apifootball';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const teamId =
      searchParams.get('teamId') ||
      searchParams.get('teamid') ||
      searchParams.get('id') ||
      '';

    if (!teamId || String(teamId).trim() === '') {
      return Response.json(
        { error: 'Parâmetro teamId é obrigatório.' },
        { status: 400 }
      );
    }

    const fixtures = await fetchLastFixturesByTeam(String(teamId).trim(), 20);

    return Response.json({ response: fixtures });
  } catch (error) {
    return Response.json(
      { error: error.message || 'Erro ao carregar últimos jogos.' },
      { status: 500 }
    );
  }
}