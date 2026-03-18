export async function GET() {
  try {
    const apiKey = process.env.API_FOOTBALL_KEY;

    if (!apiKey) {
      return Response.json(
        { error: 'API_FOOTBALL_KEY não encontrada no .env.local' },
        { status: 500 }
      );
    }

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const date = `${yyyy}-${mm}-${dd}`;

    const response = await fetch(
      `https://v3.football.api-sports.io/fixtures?date=${date}`,
      {
        headers: {
          'x-apisports-key': apiKey,
        },
        cache: 'no-store',
      }
    );

    const data = await response.json();

    return Response.json(data);
  } catch (error) {
    return Response.json(
      { error: error.message || 'Erro ao buscar jogos na API.' },
      { status: 500 }
    );
  }
}