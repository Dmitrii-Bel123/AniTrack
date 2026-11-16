import { useEffect, useState } from 'react';
import { fetchCollection } from '../api/collection';
import type { UserAnime } from '../types';

export function useCollection() {
  const [items, setItems] = useState<UserAnime[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    fetchCollection(controller.signal)
      .then(data => { if (!controller.signal.aborted) setItems(data); })
      .catch(() => { if (!controller.signal.aborted) setFailed(true); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [attempt]);

  function reload() {
    setLoading(true);
    setFailed(false);
    setAttempt(value => value + 1);
  }
  return { items, loading, failed, reload };
}
