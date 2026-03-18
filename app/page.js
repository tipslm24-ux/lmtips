'use client';

import { useEffect, useMemo, useState } from 'react';

function fmt(value, digits = 2) {
  const num = Number(value || 0);
  return Number.isNaN(num) ? '0.00' : num.toFixed(digits);
}

function pct(value) {
  const num = Number(value || 0);
  return `${num.toFixed(1)}%`;
}

function calculateTeamStats(jogos, teamId) {
  if (!jogos?.length) return null;

  const getHTTotal = (match) => {
    if (
      match.hthg !== null &&
      match.hthg !== undefined &&
      match.htag !== null &&
      match.htag !== undefined
    ) {
      return Number(match.hthg) + Number(match.htag);
    }
    return Number(match.htTotal || 0);
  };

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
      const totalHT = getHTTotal(match);
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
    const totalGoalsHT = getHTTotal(match);
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

function calculateH2HStats(jogos) {
  if (!jogos?.length) return null;

  const getHTTotal = (match) => {
    if (
      match.hthg !== null &&
      match.hthg !== undefined &&
      match.htag !== null &&
      match.htag !== undefined
    ) {
      return Number(match.hthg) + Number(match.htag);
    }
    return Number(match.htTotal || 0);
  };

  let totalGoals = 0;
  let totalGoalsHT = 0;
  let totalCorners = 0;
  let btts = 0;
  let over15 = 0;
  let over25 = 0;
  let over05HT = 0;

  jogos.forEach((match) => {
    const goals = match.fthg + match.ftag;
    const goalsHT = getHTTotal(match);
    const corners = match.hc + match.ac;

    totalGoals += goals;
    totalGoalsHT += goalsHT;
    totalCorners += corners;

    if (match.fthg > 0 && match.ftag > 0) btts++;
    if (goals >= 2) over15++;
    if (goals >= 3) over25++;
    if (goalsHT >= 1) over05HT++;
  });

  const total = jogos.length;

  return {
    jogos,
    total,
    mediaGolsH2H: totalGoals / total,
    mediaGolsHTH2H: totalGoalsHT / total,
    mediaCantosH2H: totalCorners / total,
    bttsH2H: (btts / total) * 100,
    over15H2H: (over15 / total) * 100,
    over25H2H: (over25 / total) * 100,
    over05HTH2H: (over05HT / total) * 100,
  };
}

function StatCard({ title, value, color = 'text-white' }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-sm text-zinc-400">{title}</p>
      <p className={`mt-2 break-words text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState('ligas');
  const [leagues, setLeagues] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedTeamMatches, setSelectedTeamMatches] = useState([]);
  const [confrontationData, setConfrontationData] = useState(null);
  const [ambasData, setAmbasData] = useState(null);
  const [confrontationCache, setConfrontationCache] = useState({});
  const [top5, setTop5] = useState([]);

  const [teamA, setTeamA] = useState('');
  const [teamB, setTeamB] = useState('');

  const [leagueSearch, setLeagueSearch] = useState('');
  const [teamSearch, setTeamSearch] = useState('');
  const [teamGlobalSearch, setTeamGlobalSearch] = useState('');
  const [confrontLeagueSearch, setConfrontLeagueSearch] = useState('');
  const [teamASearch, setTeamASearch] = useState('');
  const [teamBSearch, setTeamBSearch] = useState('');
  const [top5LeagueSearch, setTop5LeagueSearch] = useState('');

  const [loadingLeagues, setLoadingLeagues] = useState(true);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [loadingLive, setLoadingLive] = useState(false);
  const [loadingConfrontation, setLoadingConfrontation] = useState(false);
  const [loadingAmbas, setLoadingAmbas] = useState(false);
  const [loadingTop5, setLoadingTop5] = useState(false);
  const [error, setError] = useState('');
  const [liveMatches, setLiveMatches] = useState([]);
  const [liveLeagueFilter, setLiveLeagueFilter] = useState('');
  const [selectedLiveMatch, setSelectedLiveMatch] = useState(null);

  useEffect(() => {
    async function loadLeagues() {
      try {
        setLoadingLeagues(true);
        setError('');

        const response = await fetch('/api/leagues', { cache: 'no-store' });
        const data = await response.json();

        if (!response.ok) throw new Error(data.error || 'Erro ao carregar ligas.');

        setLeagues(data.response || []);
      } catch (err) {
        setError(err.message || 'Erro ao carregar ligas.');
      } finally {
        setLoadingLeagues(false);
      }
    }

    loadLeagues();
  }, []);

  const filteredLeagues = useMemo(() => {
    const term = leagueSearch.toLowerCase().trim();
    if (!term) return leagues;

    return leagues.filter((league) =>
      league.displayName.toLowerCase().includes(term)
    );
  }, [leagues, leagueSearch]);

  const filteredTeams = useMemo(() => {
    const term = teamSearch.toLowerCase().trim();
    if (!term) return teams;

    return teams.filter((team) => team.name.toLowerCase().includes(term));
  }, [teams, teamSearch]);

  const filteredConfrontLeagues = useMemo(() => {
    const term = confrontLeagueSearch.toLowerCase().trim();
    if (!term) return leagues;

    return leagues.filter((league) =>
      league.displayName.toLowerCase().includes(term)
    );
  }, [leagues, confrontLeagueSearch]);

  const filteredTeamAOptions = useMemo(() => {
    const term = teamASearch.toLowerCase().trim();
    if (!term) return teams;

    return teams.filter((team) => team.name.toLowerCase().includes(term));
  }, [teams, teamASearch]);

  const filteredTeamBOptions = useMemo(() => {
    const term = teamBSearch.toLowerCase().trim();
    if (!term) return teams;

    return teams.filter((team) => team.name.toLowerCase().includes(term));
  }, [teams, teamBSearch]);

  const filteredTop5Leagues = useMemo(() => {
    const term = top5LeagueSearch.toLowerCase().trim();
    if (!term) return leagues;

    return leagues.filter((league) =>
      league.displayName.toLowerCase().includes(term)
    );
  }, [leagues, top5LeagueSearch]);

  const liveMatchesByLeague = useMemo(() => {
    return liveMatches.reduce((acc, match) => {
      const league = match.leagueName || 'Outras Ligas';
      if (!acc[league]) acc[league] = [];
      acc[league].push(match);
      return acc;
    }, {});
  }, [liveMatches]);

  async function loadTeams() {
    if (!selectedLeague) return;

    try {
      setLoadingTeams(true);
      setError('');
      setTeams([]);
      setSelectedTeam(null);
      setSelectedTeamMatches([]);
      setTeamSearch('');
      setTeamA('');
      setTeamB('');
      setTeamASearch('');
      setTeamBSearch('');
      setConfrontationData(null);

      const response = await fetch(
        `/api/teams?leagueId=${selectedLeague.leagueId}&season=${selectedLeague.season}`,
        { cache: 'no-store' }
      );
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Erro ao carregar times.');

      setTeams(data.response || []);
    } catch (err) {
      setError(err.message || 'Erro ao carregar times.');
    } finally {
      setLoadingTeams(false);
    }
  }

  async function searchTeamsGlobal() {
    if (!teamGlobalSearch.trim()) {
      setError('Digite um nome de time para busca global.');
      return;
    }

    try {
      setLoadingTeams(true);
      setError('');
      setTeams([]);
      setSelectedTeam(null);
      setSelectedTeamMatches([]);
      setTeamSearch('');
      setTeamA('');
      setTeamB('');
      setTeamASearch('');
      setTeamBSearch('');
      setConfrontationData(null);

      const response = await fetch(
        `/api/teams?teamName=${encodeURIComponent(teamGlobalSearch.trim())}`,
        { cache: 'no-store' }
      );
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Erro ao buscar times.');

      setTeams(data.response || []);
    } catch (err) {
      setError(err.message || 'Erro ao buscar times globalmente.');
    } finally {
      setLoadingTeams(false);
    }
  }

  async function openTeam(team) {
    try {
      setLoadingTeam(true);
      setError('');
      setSelectedTeam(team);
      setSelectedTeamMatches([]);

      const response = await fetch(`/api/team-last20?teamId=${team.id}`, {
        cache: 'no-store',
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Erro ao carregar jogos do time.');

      setSelectedTeamMatches(data.response || []);
    } catch (err) {
      setError(err.message || 'Erro ao carregar time.');
    } finally {
      setLoadingTeam(false);
    }
  }

  async function analyzeConfrontation() {
    try {
      setError('');

      const teamAId = String(teamA || '').trim();
      const teamBId = String(teamB || '').trim();

      if (!teamAId || !teamBId) {
        setError('Selecione os dois times na lista antes de analisar.');
        return;
      }

      if (teamAId === teamBId) {
        setError('Escolha dois times diferentes.');
        return;
      }

      const cacheKey = `${teamAId}-${teamBId}`;
      if (confrontationCache[cacheKey]) {
        setConfrontationData(confrontationCache[cacheKey]);
        return;
      }

      setLoadingConfrontation(true);

      const [resA, resB, resH2H] = await Promise.all([
        fetch(`/api/team-last20?teamId=${encodeURIComponent(teamAId)}`, {
          cache: 'no-store',
        }),
        fetch(`/api/team-last20?teamId=${encodeURIComponent(teamBId)}`, {
          cache: 'no-store',
        }),
        fetch(
          `/api/h2h?homeId=${encodeURIComponent(teamAId)}&awayId=${encodeURIComponent(teamBId)}`,
          {
            cache: 'no-store',
          }
        ),
      ]);

      const dataA = await resA.json();
      const dataB = await resB.json();
      const dataH2H = await resH2H.json();

      if (!resA.ok) throw new Error(dataA.error || 'Erro no time A.');
      if (!resB.ok) throw new Error(dataB.error || 'Erro no time B.');
      if (!resH2H.ok) throw new Error(dataH2H.error || 'Erro no H2H.');

      const teamAInfo = teams.find((t) => String(t.id) === teamAId);
      const teamBInfo = teams.find((t) => String(t.id) === teamBId);

      const aStats = calculateTeamStats(dataA.response || [], Number(teamAId));
      const bStats = calculateTeamStats(dataB.response || [], Number(teamBId));
      const h2hStats = calculateH2HStats(dataH2H.response || []);

      if (!aStats || !bStats) {
        throw new Error('Não foi possível calcular as estatísticas dos times.');
      }

      const probGolHT = (aStats.over05HT + bStats.over05HT) / 2;
      const mediaCantoFT = (aStats.mediaCantosTotal + bStats.mediaCantosTotal) / 2;
      const mediaCantoHT = mediaCantoFT * 0.42;
      const mediaCartoes = (aStats.mediaCartoes + bStats.mediaCartoes) / 2;
      const mediaChutesAlvoHome = aStats.mediaChutesNoAlvo;
      const mediaChutesAlvoAway = bStats.mediaChutesNoAlvo;
      const probOver15 = (aStats.over15 + bStats.over15) / 2;

      const outcome = {
        teamAInfo,
        teamBInfo,
        a: aStats,
        b: bStats,
        h2h: h2hStats,
        probGolHT,
        mediaCantoHT,
        mediaCantoFT,
        mediaCartoes,
        mediaChutesAlvoHome,
        mediaChutesAlvoAway,
        probOver15,
      };

      setConfrontationData(outcome);
      setConfrontationCache((prev) => ({
        ...prev,
        [`${teamAId}-${teamBId}`]: outcome,
      }));
    } catch (err) {
      setError(err.message || 'Erro ao analisar confronto.');
    } finally {
      setLoadingConfrontation(false);
    }
  }

  async function analyzeAmbas() {
    try {
      setError('');
      setAmbasData(null);

      const teamAId = String(teamA || '').trim();
      const teamBId = String(teamB || '').trim();

      if (!teamAId || !teamBId) {
        setError('Selecione os dois times na lista antes de analisar.');
        return;
      }

      if (teamAId === teamBId) {
        setError('Escolha dois times diferentes.');
        return;
      }

      const cacheKey = `ambas-${teamAId}-${teamBId}`;
      if (confrontationCache[cacheKey]) {
        setAmbasData(confrontationCache[cacheKey]);
        return;
      }

      setLoadingAmbas(true);

      const [resA, resB, resH2H] = await Promise.all([
        fetch(`/api/team-last20?teamId=${encodeURIComponent(teamAId)}`, {
          cache: 'no-store',
        }),
        fetch(`/api/team-last20?teamId=${encodeURIComponent(teamBId)}`, {
          cache: 'no-store',
        }),
        fetch(
          `/api/h2h?homeId=${encodeURIComponent(teamAId)}&awayId=${encodeURIComponent(teamBId)}`,
          {
            cache: 'no-store',
          }
        ),
      ]);

      const dataA = await resA.json();
      const dataB = await resB.json();
      const dataH2H = await resH2H.json();

      if (!resA.ok) throw new Error(dataA.error || 'Erro no time A.');
      if (!resB.ok) throw new Error(dataB.error || 'Erro no time B.');
      if (!resH2H.ok) throw new Error(dataH2H.error || 'Erro no H2H.');

      const teamAInfo = teams.find((t) => String(t.id) === teamAId);
      const teamBInfo = teams.find((t) => String(t.id) === teamBId);

      const aStats = calculateTeamStats(dataA.response || [], Number(teamAId));
      const bStats = calculateTeamStats(dataB.response || [], Number(teamBId));
      const h2hStats = calculateH2HStats(dataH2H.response || []);

      if (!aStats || !bStats) {
        throw new Error('Não foi possível calcular as estatísticas dos times.');
      }

      const probBtts = (aStats.btts + bStats.btts) / 2;
      const probOver25 = (aStats.over25 + bStats.over25) / 2;
      const probBttsH2H = h2hStats?.bttsH2H || 0;
      const probOver25H2H = h2hStats?.over25H2H || 0;

      const result = {
        teamAInfo,
        teamBInfo,
        a: aStats,
        b: bStats,
        h2h: h2hStats,
        probBtts,
        probOver25,
        probBttsH2H,
        probOver25H2H,
      };

      setAmbasData(result);
      setConfrontationCache((prev) => ({
        ...prev,
        [cacheKey]: result,
      }));
    } catch (err) {
      setError(err.message || 'Erro ao analisar ambas marcam + over 2.5.');
    } finally {
      setLoadingAmbas(false);
    }
  }

  async function loadTop5() {
    if (!selectedLeague) return;

    try {
      setLoadingTop5(true);
      setError('');
      setTop5([]);

      const response = await fetch(
        `/api/top5?leagueId=${selectedLeague.leagueId}&season=${selectedLeague.season}`,
        { cache: 'no-store' }
      );
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Erro ao carregar Top 5.');

      setTop5(data.response || []);
    } catch (err) {
      setError(err.message || 'Erro ao carregar Top 5.');
    } finally {
      setLoadingTop5(false);
    }
  }

  async function loadLiveMatches() {
    try {
      setLoadingLive(true);
      setError('');
      setLiveMatches([]);

      const leagueQuery = liveLeagueFilter ? `?leagueId=${encodeURIComponent(liveLeagueFilter)}` : '';
      const response = await fetch(`/api/live${leagueQuery}`, { cache: 'no-store' });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Erro ao carregar jogos ao vivo.');

      setLiveMatches(data.response || []);
    } catch (err) {
      setError(err.message || 'Erro ao carregar jogos ao vivo.');
    } finally {
      setLoadingLive(false);
    }
  }

  const selectedTeamStats = useMemo(() => {
    if (!selectedTeam || !selectedTeamMatches.length) return null;
    return calculateTeamStats(selectedTeamMatches, selectedTeam.id);
  }, [selectedTeam, selectedTeamMatches]);

  useEffect(() => {
    let interval;
    if (activeTab === 'live') {
      loadLiveMatches();
      interval = setInterval(loadLiveMatches, 20000); // atualizar de 20 em 20s
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTab, liveLeagueFilter]);

  return (
    <div className="min-h-screen bg-[#040b1c] text-white">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="w-full border-b border-white/10 bg-white/5 p-4 lg:min-h-screen lg:w-72 lg:border-b-0 lg:border-r">
          <div className="mb-6 flex items-center gap-3">
            <span className="text-4xl">🏆</span>
            <div>
              <h1 className="text-2xl font-bold">LM TIPS APP</h1>
              <p className="text-sm text-zinc-400">Painel profissional</p>
            </div>
          </div>

          <div className="space-y-2">
            {[
              ['ligas', 'Ligas e Times'],
              ['live', 'Ao Vivo'],
              ['confronto', 'Analisar Confronto'],
              ['top5', 'Top 5 Dicas'],
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
                  activeTab === key
                    ? 'bg-rose-500/20 text-white'
                    : 'text-zinc-300 hover:bg-white/5'
                }`}
              >
                <span className={activeTab === key ? 'text-rose-400' : 'text-zinc-500'}>
                  ●
                </span>
                <span className="text-lg">{label}</span>
              </button>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-zinc-400">
            Layout responsivo para celular e desktop.
          </div>
        </aside>

        <main className="flex-1 p-4 md:p-8">
          {error && (
            <div className="mb-6 rounded-2xl border border-red-900 bg-red-950 p-4 text-red-300">
              {error}
            </div>
          )}

          {activeTab === 'ligas' && (
            <>
              <h2 className="mb-6 text-4xl font-bold">Selecione um Time para Raio-X</h2>

              {!selectedTeam && (
                <>
                  <div className="mb-4">
                    <label className="mb-2 block text-lg font-medium">Escolha a Liga:</label>

                    <input
                      type="text"
                      placeholder="Digite para buscar a liga..."
                      value={leagueSearch}
                      onChange={(e) => setLeagueSearch(e.target.value)}
                      className="mb-3 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-lg text-white outline-none placeholder:text-zinc-500"
                    />

                    <div className="max-h-64 overflow-y-auto rounded-2xl border border-white/10 bg-[#0b1328]">
                      {loadingLeagues ? (
                        <p className="px-4 py-3 text-zinc-400">Carregando ligas...</p>
                      ) : filteredLeagues.length === 0 ? (
                        <p className="px-4 py-3 text-zinc-400">Nenhuma liga encontrada.</p>
                      ) : (
                        filteredLeagues.map((league) => (
                          <button
                            key={league.leagueId}
                            onClick={() => {
                              setSelectedLeague(league);
                              setTeams([]);
                              setSelectedTeam(null);
                              setSelectedTeamMatches([]);
                            }}
                            className={`block w-full border-b border-white/5 px-4 py-3 text-left transition last:border-b-0 ${
                              selectedLeague?.leagueId === league.leagueId
                                ? 'bg-emerald-500/20 text-white'
                                : 'text-zinc-300 hover:bg-white/5'
                            }`}
                          >
                            {league.displayName}
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                  <button
                    onClick={loadTeams}
                    disabled={!selectedLeague || loadingTeams}
                    className="mb-8 rounded-2xl border border-white/20 bg-white/5 px-5 py-3 text-lg hover:bg-white/10 disabled:opacity-50"
                  >
                    Ver Times (liga atual)
                  </button>

                  <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="mb-3 text-sm text-zinc-400">Ou busque um time diretamente em todas as ligas:</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Buscar time global..."
                        value={teamGlobalSearch}
                        onChange={(e) => setTeamGlobalSearch(e.target.value)}
                        className="flex-1 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-lg text-white outline-none placeholder:text-zinc-500"
                      />
                      <button
                        onClick={searchTeamsGlobal}
                        disabled={!teamGlobalSearch.trim() || loadingTeams}
                        className="rounded-2xl border border-white/20 bg-white/5 px-5 py-3 text-lg hover:bg-white/10 disabled:opacity-50"
                      >
                        Buscar Time
                      </button>
                    </div>
                  </div>

                  {loadingTeams && (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      Carregando times...
                    </div>
                  )}

                  {!!teams.length && (
                    <>
                      <div className="mb-4">
                        <input
                          type="text"
                          placeholder="Buscar time..."
                          value={teamSearch}
                          onChange={(e) => setTeamSearch(e.target.value)}
                          className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-lg text-white outline-none placeholder:text-zinc-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                        {filteredTeams.map((team) => (
                          <button
                            key={team.id}
                            onClick={() => openTeam(team)}
                            className="rounded-2xl border border-white/10 bg-transparent p-4 text-center transition hover:bg-white/5"
                          >
                            <img
                              src={team.logo}
                              alt={team.name}
                              className="mx-auto mb-3 h-16 w-16 object-contain"
                            />
                            <span className="inline-block rounded-xl border border-white/15 px-4 py-2 text-lg">
                              {team.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}

              {selectedTeam && (
                <div>
                  <button
                    onClick={() => {
                      setSelectedTeam(null);
                      setSelectedTeamMatches([]);
                    }}
                    className="mb-6 rounded-xl border border-white/10 bg-white/5 px-4 py-2"
                  >
                    ← Voltar
                  </button>

                  <div className="mb-6 flex items-center gap-4">
                    <img
                      src={selectedTeam.logo}
                      alt={selectedTeam.name}
                      className="h-16 w-16 object-contain"
                    />
                    <div>
                      <h3 className="text-5xl font-bold">Raio-X: {selectedTeam.name}</h3>
                      <p className="text-zinc-400">Últimos 20 jogos gerais</p>
                    </div>
                  </div>

                  {loadingTeam && (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      Carregando histórico do time...
                    </div>
                  )}

                  {!loadingTeam && selectedTeamStats && (
                    <>
                      <h4 className="mb-4 text-3xl font-bold">🎯 Tendências de Mercado</h4>

                      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
                        <StatCard title="Gol HT" value={pct(selectedTeamStats.over05HT)} color="text-green-400" />
                        <StatCard title="BTTS" value={pct(selectedTeamStats.btts)} color="text-emerald-400" />
                        <StatCard title="Over 1.5 Jogo" value={pct(selectedTeamStats.over15)} color="text-orange-400" />
                        <StatCard title="Over 2.5 Jogo" value={pct(selectedTeamStats.over25)} color="text-orange-400" />
                        <StatCard title="Média Cantos FT" value={fmt(selectedTeamStats.mediaCantosPro)} color="text-yellow-400" />
                        <StatCard title="Média Cantos HT" value={fmt(selectedTeamStats.mediaCantosPro * 0.42)} color="text-amber-400" />
                        <StatCard title="Over 8.5 Cantos" value={pct(selectedTeamStats.over85Corners)} color="text-yellow-400" />
                        <StatCard title="Média Chutes Alvo" value={fmt(selectedTeamStats.mediaChutesNoAlvo)} color="text-sky-400" />
                      </div>

                      <h4 className="mb-4 text-3xl font-bold">📋 Histórico (Últimos 20 Jogos Gerais)</h4>

                      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
                        <table className="min-w-[1000px] w-full text-left">
                          <thead className="border-b border-white/10 text-zinc-400">
                            <tr>
                              <th className="px-4 py-3">Data</th>
                              <th className="px-4 py-3">Confronto</th>
                              <th className="px-4 py-3">Placar HT</th>
                              <th className="px-4 py-3">Gol HT</th>
                              <th className="px-4 py-3">Cantos FT</th>
                              <th className="px-4 py-3">Cantos HT</th>
                              <th className="px-4 py-3">Cartões</th>
                              <th className="px-4 py-3">Chutes Alvo</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedTeamStats.jogos.map((match) => {
                              const htTotal =
                                match.hthg !== null && match.htag !== null
                                  ? match.hthg + match.htag
                                  : match.htTotal || 0;

                              const cornersFT = match.hc + match.ac;
                              const cornersHT = Math.round(cornersFT * 0.45);
                              const cards = match.hy + match.ay + match.hr + match.ar;
                              const shotsOnTarget = match.hst + match.ast;

                              return (
                                <tr key={match.id} className="border-b border-white/5">
                                  <td className="px-4 py-3">{match.date}</td>
                                  <td className="px-4 py-3">
                                    {match.homeTeam} {match.fthg}x{match.ftag} {match.awayTeam}
                                  </td>
                                  <td className="px-4 py-3">
                                    {match.hthg !== null && match.htag !== null
                                      ? `(${match.hthg}x${match.htag})`
                                      : `(${htTotal})`}
                                  </td>
                                  <td className="px-4 py-3">{htTotal > 0 ? '✅' : '❌'}</td>
                                  <td className="px-4 py-3">{cornersFT}</td>
                                  <td className="px-4 py-3">{cornersHT}</td>
                                  <td className="px-4 py-3">{cards}</td>
                                  <td className="px-4 py-3">{shotsOnTarget}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </div>
              )}
            </>
          )}

          {activeTab === 'live' && (
            <>
              <h2 className="mb-6 text-4xl font-bold">⚡ Jogos Ao Vivo</h2>

              <div className="mb-4 flex flex-wrap items-center gap-2">
                <button
                  onClick={loadLiveMatches}
                  disabled={loadingLive}
                  className="rounded-2xl border border-white/20 bg-white/5 px-4 py-2 text-sm hover:bg-white/10 disabled:opacity-50"
                >
                  Atualizar Agora
                </button>

                <input
                  type="text"
                  placeholder="Filtrar por liga (ID)..."
                  value={liveLeagueFilter}
                  onChange={(e) => setLiveLeagueFilter(e.target.value)}
                  className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-500"
                />
              </div>

              {loadingLive ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Carregando jogos ao vivo...</div>
              ) : liveMatches.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Nenhum jogo ao vivo no momento.</div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(liveMatchesByLeague).map(([league, matches]) => (
                    <div key={league} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <h3 className="mb-3 text-lg font-semibold text-emerald-300">{league}</h3>
                      <div className="space-y-2">
                        {matches.map((match) => {
                          const isSelected = selectedLiveMatch?.id === match.id;
                          return (
                            <button
                              key={match.id}
                              onClick={() => setSelectedLiveMatch(match)}
                              className={`w-full rounded-xl border p-3 text-left transition ${
                                isSelected
                                  ? 'border-emerald-300 bg-emerald-500/20'
                                  : 'border-white/10 bg-transparent hover:border-white/30 hover:bg-white/5'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <p className="text-sm text-zinc-400">{match.leagueRound}</p>
                                  <p className="text-lg font-bold">
                                    {match.homeTeam} {match.fthg} x {match.ftag} {match.awayTeam}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm text-zinc-400">{match.time} ({match.statusShort})</p>
                                  <p className="text-lg font-semibold">{match.elapsed ? `${match.elapsed}'` : ''}</p>
                                </div>
                              </div>
                              <div className="mt-2 text-sm text-zinc-300">
                                Cantos: {match.hc || 0} - {match.ac || 0} | HT: {match.hthg ?? '-'}x{match.htag ?? '-'} | Chutes: {match.hst || 0} / {match.ast || 0}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedLiveMatch && (
                <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-xl font-bold">Estatísticas do jogo</h3>
                    <button
                      onClick={() => setSelectedLiveMatch(null)}
                      className="rounded-lg border border-white/20 px-3 py-1 text-sm"
                    >
                      Fechar
                    </button>
                  </div>

                  <p className="mb-1 text-sm text-zinc-400">{selectedLiveMatch.leagueName} • {selectedLiveMatch.leagueRound}</p>
                  <p className="mb-4 text-2xl font-bold">
                    {selectedLiveMatch.homeTeam} {selectedLiveMatch.fthg} x {selectedLiveMatch.ftag} {selectedLiveMatch.awayTeam}
                  </p>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    <StatCard title="Cantos Home" value={selectedLiveMatch.hc || 0} />
                    <StatCard title="Cantos Away" value={selectedLiveMatch.ac || 0} />
                    <StatCard title="Cantos Total" value={(selectedLiveMatch.hc || 0) + (selectedLiveMatch.ac || 0)} />
                    <StatCard title="Chutes no alvo Home" value={selectedLiveMatch.hst || 0} />
                    <StatCard title="Chutes no alvo Away" value={selectedLiveMatch.ast || 0} />
                    <StatCard title="Amarelos Home" value={selectedLiveMatch.hy || 0} />
                    <StatCard title="Amarelos Away" value={selectedLiveMatch.ay || 0} />
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'confronto' && (
            <>
              <h2 className="mb-6 text-4xl font-bold">⚔️ Analisador de Confrontos LM</h2>

              <div className="mb-4">
                <label className="mb-2 block text-lg font-medium">Liga:</label>

                <input
                  type="text"
                  placeholder="Digite para buscar a liga..."
                  value={confrontLeagueSearch}
                  onChange={(e) => setConfrontLeagueSearch(e.target.value)}
                  className="mb-3 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-lg text-white outline-none placeholder:text-zinc-500"
                />

                <div className="max-h-64 overflow-y-auto rounded-2xl border border-white/10 bg-[#0b1328]">
                  {filteredConfrontLeagues.length === 0 ? (
                    <p className="px-4 py-3 text-zinc-400">Nenhuma liga encontrada.</p>
                  ) : (
                    filteredConfrontLeagues.map((league) => (
                      <button
                        key={league.leagueId}
                        onClick={() => {
                          setSelectedLeague(league);
                          setTeams([]);
                          setTeamA('');
                          setTeamB('');
                          setTeamASearch('');
                          setTeamBSearch('');
                          setConfrontationData(null);
                        }}
                        className={`block w-full border-b border-white/5 px-4 py-3 text-left transition last:border-b-0 ${
                          selectedLeague?.leagueId === league.leagueId
                            ? 'bg-emerald-500/20 text-white'
                            : 'text-zinc-300 hover:bg-white/5'
                        }`}
                      >
                        {league.displayName}
                      </button>
                    ))
                  )}
                </div>
              </div>

              <button
                onClick={loadTeams}
                disabled={!selectedLeague || loadingTeams}
                className="mb-8 rounded-2xl border border-white/20 bg-white/5 px-5 py-3 text-lg hover:bg-white/10 disabled:opacity-50"
              >
                Carregar Times
              </button>

              {!!teams.length && (
                <div className="grid gap-6 lg:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-lg font-medium">Time Casa:</label>

                    <input
                      type="text"
                      placeholder="Digite para buscar o time casa..."
                      value={teamASearch}
                      onChange={(e) => {
                        setTeamASearch(e.target.value);
                        setTeamA('');
                      }}
                      className="mb-3 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-lg text-white outline-none placeholder:text-zinc-500"
                    />

                    <div className="max-h-64 overflow-y-auto rounded-2xl border border-white/10 bg-[#0b1328]">
                      {filteredTeamAOptions.length === 0 ? (
                        <p className="px-4 py-3 text-zinc-400">Nenhum time encontrado.</p>
                      ) : (
                        filteredTeamAOptions.map((team) => (
                          <button
                            key={team.id}
                            onClick={() => {
                              setTeamA(String(team.id));
                              setTeamASearch(team.name);
                            }}
                            className={`block w-full border-b border-white/5 px-4 py-3 text-left transition last:border-b-0 ${
                              String(teamA) === String(team.id)
                                ? 'bg-emerald-500/20 text-white'
                                : 'text-zinc-300 hover:bg-white/5'
                            }`}
                          >
                            {team.name}
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-lg font-medium">Time Fora:</label>

                    <input
                      type="text"
                      placeholder="Digite para buscar o time fora..."
                      value={teamBSearch}
                      onChange={(e) => {
                        setTeamBSearch(e.target.value);
                        setTeamB('');
                      }}
                      className="mb-3 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-lg text-white outline-none placeholder:text-zinc-500"
                    />

                    <div className="max-h-64 overflow-y-auto rounded-2xl border border-white/10 bg-[#0b1328]">
                      {filteredTeamBOptions.length === 0 ? (
                        <p className="px-4 py-3 text-zinc-400">Nenhum time encontrado.</p>
                      ) : (
                        filteredTeamBOptions.map((team) => (
                          <button
                            key={team.id}
                            onClick={() => {
                              setTeamB(String(team.id));
                              setTeamBSearch(team.name);
                            }}
                            className={`block w-full border-b border-white/5 px-4 py-3 text-left transition last:border-b-0 ${
                              String(teamB) === String(team.id)
                                ? 'bg-emerald-500/20 text-white'
                                : 'text-zinc-300 hover:bg-white/5'
                            }`}
                          >
                            {team.name}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={analyzeConfrontation}
                disabled={!teamA || !teamB || teamA === teamB || loadingConfrontation}
                className="mt-6 rounded-2xl border border-white/20 bg-white/5 px-5 py-3 text-lg hover:bg-white/10 disabled:opacity-50"
              >
                🔥 ANALISAR PROBABILIDADES
              </button>

              {loadingConfrontation && (
                <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
                  Cruzando os últimos 20 jogos de cada equipe...
                </div>
              )}

              {confrontationData && (
                <>
                  <div className="my-8 border-t border-white/10" />

                  <h3 className="mb-4 text-4xl font-bold">🎯 Veredito LM TIPS</h3>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <StatCard title="Prob. GOL HT" value={pct(confrontationData.probGolHT)} color="text-green-400" />
                    <StatCard title="Média Canto HT" value={fmt(confrontationData.mediaCantoHT)} color="text-amber-400" />
                    <StatCard title="Média Canto FT" value={fmt(confrontationData.mediaCantoFT)} color="text-yellow-400" />
                    <StatCard title="Média Chutes Alvo Casa" value={fmt(confrontationData.mediaChutesAlvoHome)} color="text-sky-400" />
                    <StatCard title="Média Chutes Alvo Fora" value={fmt(confrontationData.mediaChutesAlvoAway)} color="text-sky-400" />
                    <StatCard title="Média Cartões" value={fmt(confrontationData.mediaCartoes)} color="text-red-400" />
                    <StatCard title="Prob. Over 1.5" value={pct(confrontationData.probOver15)} color="text-orange-400" />
                  </div>

                  <div className="mt-6 rounded-2xl border border-sky-500/20 bg-sky-500/10 p-4 text-lg text-sky-300">
                    ℹ️ Médias baseadas nos últimos 20 jogos de cada equipe em todas as competições.
                  </div>
                </>
              )}
            </>
          )}

          {activeTab === 'top5' && (
            <>
              <h2 className="mb-6 text-4xl font-bold">🔥 Top 5 Dicas</h2>

              <div className="mb-4">
                <label className="mb-2 block text-lg font-medium">Liga do dia:</label>

                <input
                  type="text"
                  placeholder="Digite para buscar a liga..."
                  value={top5LeagueSearch}
                  onChange={(e) => setTop5LeagueSearch(e.target.value)}
                  className="mb-3 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-lg text-white outline-none placeholder:text-zinc-500"
                />

                <div className="max-h-64 overflow-y-auto rounded-2xl border border-white/10 bg-[#0b1328]">
                  {filteredTop5Leagues.length === 0 ? (
                    <p className="px-4 py-3 text-zinc-400">Nenhuma liga encontrada.</p>
                  ) : (
                    filteredTop5Leagues.map((league) => (
                      <button
                        key={league.leagueId}
                        onClick={() => {
                          setSelectedLeague(league);
                          setTop5([]);
                        }}
                        className={`block w-full border-b border-white/5 px-4 py-3 text-left transition last:border-b-0 ${
                          selectedLeague?.leagueId === league.leagueId
                            ? 'bg-emerald-500/20 text-white'
                            : 'text-zinc-300 hover:bg-white/5'
                        }`}
                      >
                        {league.displayName}
                      </button>
                    ))
                  )}
                </div>
              </div>

              <button
                onClick={loadTop5}
                disabled={!selectedLeague || loadingTop5}
                className="mb-8 rounded-2xl border border-white/20 bg-white/5 px-5 py-3 text-lg hover:bg-white/10 disabled:opacity-50"
              >
                Buscar Top 5
              </button>

              {loadingTop5 && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  Calculando melhores jogos do dia...
                </div>
              )}

              <div className="grid gap-4">
                {top5.map((item, index) => (
                  <div
                    key={item.fixtureId || index}
                    className="rounded-2xl border border-white/10 bg-white/5 p-5"
                  >
                    <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-zinc-400">{item.leagueName}</p>
                        <h3 className="text-2xl font-bold">
                          #{index + 1} {item.homeTeam} x {item.awayTeam}
                        </h3>
                      </div>
                      <p className="text-sm text-zinc-400">
                        {item.kickoff
                          ? new Date(item.kickoff).toLocaleString('pt-BR')
                          : '-'}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                      <StatCard title="Prob. GOL HT" value={pct(item.probGolHT)} color="text-green-400" />
                      <StatCard title="Média Canto HT" value={fmt(item.mediaCantoHT)} color="text-amber-400" />
                      <StatCard title="Média Canto FT" value={fmt(item.mediaCantoFT)} color="text-yellow-400" />
                      <StatCard title="Prob. BTTS" value={item.probBtts !== null ? `${item.probBtts.toFixed(1)}%` : 'N/A'} color="text-emerald-400" />
                      <StatCard title="Prob. Over 1.5" value={pct(item.probOver15)} color="text-orange-400" />
                      <StatCard title="Prob. Over 2.5" value={item.probOver25 !== null ? `${item.probOver25.toFixed(1)}%` : 'N/A'} color="text-orange-500" />
                      <StatCard title="Média Chutes Alvo" value={fmt(item.mediaChutesAlvo)} color="text-sky-400" />
                      <StatCard title="Média Cartões" value={fmt(item.mediaCartoes)} color="text-red-400" />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}