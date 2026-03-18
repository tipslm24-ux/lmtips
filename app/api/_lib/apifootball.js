const API_BASE = 'https://v3.football.api-sports.io';

export async function apiFootball(path) {
  const apiKey = process.env.API_FOOTBALL_KEY;

  if (!apiKey) {
    throw new Error('API_FOOTBALL_KEY não encontrada no .env.local');
  }

  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'x-apisports-key': apiKey,
    },
    cache: 'no-store',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.errors?.message ||
        data?.message ||
        `Erro na API-Football: ${response.status}`
    );
  }

  return data;
}

export function toNumber(value) {
  if (value === null || value === undefined || value === '') return 0;

  if (typeof value === 'string') {
    const cleaned = value.replace('%', '').trim();
    const num = Number(cleaned);
    return Number.isNaN(num) ? 0 : num;
  }

  const num = Number(value);
  return Number.isNaN(num) ? 0 : num;
}

function statValue(stats = [], type) {
  const found = stats.find((s) => s.type === type);
  return toNumber(found?.value);
}

export async function fetchLeaguesCurrent() {
  const data = await apiFootball('/leagues');

  const leagues = (data.response || [])
    .map((item) => {
      const currentSeason =
        item.seasons?.find((s) => s.current)?.year ||
        item.seasons?.[item.seasons.length - 1]?.year ||
        new Date().getFullYear();

      return {
        leagueId: item.league?.id,
        name: item.league?.name || '-',
        country: item.country?.name || '-',
        logo: item.league?.logo || '',
        season: currentSeason,
        type: item.league?.type || '',
        displayName: `${item.country?.name || 'País'} - ${item.league?.name || 'Liga'}`,
      };
    })
    .filter((l) => l.leagueId && l.name)
    .sort((a, b) => a.displayName.localeCompare(b.displayName, 'pt-BR'));

  return leagues;
}

export async function fetchTeamsByLeagueSeason(leagueId, season) {
  const data = await apiFootball(`/teams?league=${leagueId}&season=${season}`);

  return (data.response || [])
    .map((item) => ({
      id: item.team?.id,
      name: item.team?.name || '-',
      logo: item.team?.logo || '',
      country: item.team?.country || '',
    }))
    .filter((t) => t.id && t.name)
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}

export async function fetchTeamsByName(teamName) {
  const data = await apiFootball(`/teams?search=${encodeURIComponent(teamName)}`);

  return (data.response || [])
    .map((item) => ({
      id: item.team?.id,
      name: item.team?.name || '-',
      logo: item.team?.logo || '',
      country: item.team?.country || '',
    }))
    .filter((t) => t.id && t.name)
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}

export async function fetchFixtureStatisticsMap(fixtureId) {
  try {
    const data = await apiFootball(`/fixtures/statistics?fixture=${fixtureId}`);
    const map = {};

    for (const teamStats of data.response || []) {
      const teamId = teamStats.team?.id;
      const stats = teamStats.statistics || [];

      map[teamId] = {
        hs: statValue(stats, 'Total Shots'),
        hst: statValue(stats, 'Shots on Goal'),
        hsOff: statValue(stats, 'Shots off Goal'),
        hc: statValue(stats, 'Corner Kicks'),
        hy: statValue(stats, 'Yellow Cards'),
        hr: statValue(stats, 'Red Cards'),
        fouls: statValue(stats, 'Fouls'),
        throwIns: statValue(stats, 'Throw-ins'),
        goalKicks: statValue(stats, 'Goal Kicks'),
      };
    }

    return map;
  } catch {
    return {};
  }
}

export function normalizeFixture(item, statsMap = {}) {
  const homeId = item.teams?.home?.id;
  const awayId = item.teams?.away?.id;

  const homeStats = statsMap[homeId] || {};
  const awayStats = statsMap[awayId] || {};

  const hthg = item.score?.halftime?.home;
  const htag = item.score?.halftime?.away;

  return {
    id: item.fixture?.id,
    dateRaw: item.fixture?.date,
    date: new Date(item.fixture?.date).toLocaleDateString('pt-BR'),
    time: new Date(item.fixture?.date).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    timestamp: new Date(item.fixture?.date).getTime(),

    leagueName: item.league?.name || '-',
    leagueRound: item.league?.round || '-',

    homeTeamId: homeId,
    awayTeamId: awayId,
    homeTeam: item.teams?.home?.name || '-',
    awayTeam: item.teams?.away?.name || '-',
    homeLogo: item.teams?.home?.logo || '',
    awayLogo: item.teams?.away?.logo || '',

    fthg: toNumber(item.goals?.home),
    ftag: toNumber(item.goals?.away),

    hthg: hthg === null || hthg === undefined ? null : toNumber(hthg),
    htag: htag === null || htag === undefined ? null : toNumber(htag),
    htTotal:
      hthg === null || hthg === undefined || htag === null || htag === undefined
        ? 0
        : toNumber(hthg) + toNumber(htag),

    hs: homeStats.hs || 0,
    as: awayStats.hs || 0,
    hst: homeStats.hst || 0,
    ast: awayStats.hst || 0,
    hsOff: homeStats.hsOff || 0,
    asOff: awayStats.hsOff || 0,

    hc: homeStats.hc || 0,
    ac: awayStats.hc || 0,

    hy: homeStats.hy || 0,
    ay: awayStats.hy || 0,
    hr: homeStats.hr || 0,
    ar: awayStats.hr || 0,

    foulsH: homeStats.fouls || 0,
    foulsA: awayStats.fouls || 0,
    throwInsH: homeStats.throwIns || 0,
    throwInsA: awayStats.throwIns || 0,
    goalKicksH: homeStats.goalKicks || 0,
    goalKicksA: awayStats.goalKicks || 0,

    statusLong: item.fixture?.status?.long || '-',
    statusShort: item.fixture?.status?.short || '-',
    elapsed: item.fixture?.status?.elapsed ?? null,
  };
}

export function getMatchHTTotal(match) {
  if (
    match.hthg !== null &&
    match.hthg !== undefined &&
    match.htag !== null &&
    match.htag !== undefined
  ) {
    return toNumber(match.hthg) + toNumber(match.htag);
  }

  return toNumber(match.htTotal);
}

export async function fetchLastFixturesByTeam(teamId, last = 20) {
  const fixturesData = await apiFootball(`/fixtures?team=${teamId}&last=${last}`);
  const fixtures = fixturesData.response || [];

  const normalized = await Promise.all(
    fixtures.map(async (item) => {
      const statsMap = await fetchFixtureStatisticsMap(item.fixture.id);
      return normalizeFixture(item, statsMap);
    })
  );

  return normalized.sort((a, b) => b.timestamp - a.timestamp);
}

export async function fetchH2HFixtures(homeId, awayId, last = 10) {
  const data = await apiFootball(`/fixtures/headtohead?h2h=${homeId}-${awayId}&last=${last}`);
  const fixtures = data.response || [];

  const normalized = await Promise.all(
    fixtures.map(async (item) => {
      const statsMap = await fetchFixtureStatisticsMap(item.fixture.id);
      return normalizeFixture(item, statsMap);
    })
  );

  return normalized.sort((a, b) => b.timestamp - a.timestamp);
}

export function calculateTeamStats(jogos, teamId) {
  if (!jogos?.length) return null;

  let goalsFor = 0;
  let goalsAgainst = 0;
  let goalsHTFor = 0;
  let goalsHTAgainst = 0;
  let cornersFor = 0;
  let cornersAgainst = 0;
  let yellowsFor = 0;
  let shotsFor = 0;
  let shotsOnTargetFor = 0;
  let shotsOffFor = 0;
  let cardsFor = 0;
  let foulsFor = 0;
  let throwInsFor = 0;
  let goalKicksFor = 0;

  let over15 = 0;
  let over25 = 0;
  let btts = 0;
  let over05HT = 0;
  let over85Corners = 0;

  jogos.forEach((match) => {
    const isHome = String(match.homeTeamId) === String(teamId);

    const teamGoals = isHome ? match.fthg : match.ftag;
    const oppGoals = isHome ? match.ftag : match.fthg;

    let teamGoalsHT = 0;
    let oppGoalsHT = 0;

    if (
      match.hthg !== null &&
      match.hthg !== undefined &&
      match.htag !== null &&
      match.htag !== undefined
    ) {
      teamGoalsHT = isHome ? match.hthg : match.htag;
      oppGoalsHT = isHome ? match.htag : match.hthg;
    } else {
      const totalHT = getMatchHTTotal(match);
      teamGoalsHT = totalHT / 2;
      oppGoalsHT = totalHT / 2;
    }

    const teamCorners = isHome ? match.hc : match.ac;
    const oppCorners = isHome ? match.ac : match.hc;
    const teamYellows = isHome ? match.hy : match.ay;
    const teamReds = isHome ? match.hr : match.ar;
    const teamShots = isHome ? match.hs : match.as;
    const teamShotsOnTarget = isHome ? match.hst : match.ast;
    const teamShotsOff = isHome ? match.hsOff : match.asOff;
    const teamFouls = isHome ? match.foulsH : match.foulsA;
    const teamThrowIns = isHome ? match.throwInsH : match.throwInsA;
    const teamGoalKicks = isHome ? match.goalKicksH : match.goalKicksA;

    goalsFor += teamGoals;
    goalsAgainst += oppGoals;
    goalsHTFor += teamGoalsHT;
    goalsHTAgainst += oppGoalsHT;
    cornersFor += teamCorners;
    cornersAgainst += oppCorners;
    yellowsFor += teamYellows;
    cardsFor += teamYellows + teamReds;
    shotsFor += teamShots;
    shotsOnTargetFor += teamShotsOnTarget;
    shotsOffFor += teamShotsOff;
    foulsFor += teamFouls;
    throwInsFor += teamThrowIns;
    goalKicksFor += teamGoalKicks;

    const totalGoals = match.fthg + match.ftag;
    const totalGoalsHT = getMatchHTTotal(match);
    const totalCorners = match.hc + match.ac;

    if (totalGoals >= 2) over15++;
    if (totalGoals >= 3) over25++;
    if (match.fthg > 0 && match.ftag > 0) btts++;
    if (totalGoalsHT >= 1) over05HT++;
    if (totalCorners > 8.5) over85Corners++;
  });

  const total = jogos.length;

  return {
    jogos,
    total,
    mediaGols: goalsFor / total,
    mediaSofridos: goalsAgainst / total,
    mediaGolsHT: goalsHTFor / total,
    mediaSofridosHT: goalsHTAgainst / total,
    mediaCantosPro: cornersFor / total,
    mediaCantosContra: cornersAgainst / total,
    mediaCantosTotal: (cornersFor + cornersAgainst) / total,
    mediaAmarelos: yellowsFor / total,
    mediaCartoes: cardsFor / total,
    mediaChutes: shotsFor / total,
    mediaChutesNoAlvo: shotsOnTargetFor / total,
    mediaChutesFora: shotsOffFor / total,
    mediaFaltas: foulsFor / total,
    over15: (over15 / total) * 100,
    over25: (over25 / total) * 100,
    over05HT: (over05HT / total) * 100,
    over85Corners: (over85Corners / total) * 100,
    btts: (btts / total) * 100,
  };
}