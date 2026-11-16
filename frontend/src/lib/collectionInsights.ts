import type { UserAnime } from '../types';

export function selectWatchingFeature(items: UserAnime[]) {
  // The list endpoint exposes created_at; updated_at belongs to detail responses.
  return items.filter(item => item.user_status === 'PR')
    .sort((a, b) => b.created_at.localeCompare(a.created_at) || b.id - a.id)[0];
}

export function collectionInsights(items: UserAnime[], now = new Date()) {
  const counts = { PR: 0, WW: 0, WD: 0, DR: 0 };
  let episodes = 0;
  let unknownEpisodes = 0;
  const genres = new Map<string, number>();
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: date.toLocaleDateString('ru-RU', { month: 'short' }).replace('.', ''),
      fullLabel: date.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }),
      count: 0,
    };
  });

  for (const item of items) {
    counts[item.user_status]++;
    if (item.user_status === 'WD') {
      if (item.anime.episodes == null) unknownEpisodes++;
      else episodes += item.anime.episodes;
    }
    for (const genre of new Set(item.anime.genres.map(g => g.title))) {
      genres.set(genre, (genres.get(genre) ?? 0) + 1);
    }
    const date = new Date(item.created_at);
    const month = months.find(m => m.key === `${date.getFullYear()}-${date.getMonth()}`);
    if (month) month.count++;
  }

  return {
    counts, episodes, unknownEpisodes, months,
    completedPercent: items.length ? Math.round(counts.WD / items.length * 100) : 0,
    topGenres: [...genres.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'ru')).slice(0, 6),
    topRated: items.filter(item => Number(item.user_rate) > 0)
      .sort((a, b) => Number(b.user_rate) - Number(a.user_rate) || b.id - a.id).slice(0, 5),
  };
}
