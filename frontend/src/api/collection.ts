import api from './axios';
import type { AxiosResponse } from 'axios';
import type { UserAnime } from '../types';

export async function fetchCollection(signal?: AbortSignal): Promise<UserAnime[]> {
  const out: UserAnime[] = [];
  let url: string | null = '/anime/my/';
  while (url) {
    const r: AxiosResponse<UserAnime[] | { results?: UserAnime[]; next?: string | null }> =
      await api.get(url, { signal });
    const d = r.data;
    if (Array.isArray(d)) { out.push(...d); break; }
    out.push(...(d.results ?? []));
    url = d.next ?? null;
  }
  return out;
}
