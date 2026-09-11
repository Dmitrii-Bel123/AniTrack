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

export interface UserAnime {
  id: number;
  anime: Anime;
  user_rate: string | null;
  user_status: 'WW' | 'PR' | 'WD' | 'DR';
  user_note: string | null;
  user_fav_character: string | null;
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Stats {
  total_anime: number;
  want: number;
  watching: number;
  watched: number;
  dropped: number;
  avg_rate: number | null;
  total_episodes: number | null;
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
  DR: 'Дропнуто',
};

export const STATUS_BADGE: Record<string, string> = {
  WW: 'badge-want',
  PR: 'badge-watching',
  WD: 'badge-watched',
  DR: 'badge-dropped',
};