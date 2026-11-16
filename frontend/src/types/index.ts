export interface Genre {
  id: number;
  title: string;
}

export interface Anime {
  id: number;
  mal_id: number;
  title: string;
  poster: string | null;
  episodes: number | null;
  genres: Genre[];
}

/** GET /anime/my/ — UserAnimeListSerializer, not the detail/export response. */
export interface UserAnime {
  id: number;
  anime: Anime;
  user_rate: string | null;
  user_status: 'WW' | 'PR' | 'WD' | 'DR';
  created_at: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  avatar: string | null;
}

export const STATUS_LABEL: Record<string, string> = {
  WW: 'Планирую',
  PR: 'Смотрю',
  WD: 'Просмотрено',
  DR: 'Брошено',
};

export const STATUS_BADGE: Record<string, string> = {
  WW: 'badge-want',
  PR: 'badge-watching',
  WD: 'badge-watched',
  DR: 'badge-dropped',
};
