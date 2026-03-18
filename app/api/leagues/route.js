import { fetchLeaguesCurrent } from '../_lib/apifootball';

export async function GET() {
  try {
    const leagues = await fetchLeaguesCurrent();
    return Response.json({ response: leagues });
  } catch (error) {
    return Response.json(
      { error: error.message || 'Erro ao carregar ligas.' },
      { status: 500 }
    );
  }
}