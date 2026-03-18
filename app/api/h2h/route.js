import { fetchH2HFixtures } from '../_lib/apifootball';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const homeId = searchParams.get('homeId');
    const awayId = searchParams.get('awayId');

    if (!homeId || !awayId) {
      return Response.json(
        { error: 'Parâmetros homeId e awayId são obrigatórios.' },
        { status: 400 }
      );
    }

    const fixtures = await fetchH2HFixtures(homeId, awayId, 20);

    return Response.json({ response: fixtures });
  } catch (error) {
    return Response.json(
      { error: error.message || 'Erro ao carregar H2H.' },
      { status: 500 }
    );
  }
}