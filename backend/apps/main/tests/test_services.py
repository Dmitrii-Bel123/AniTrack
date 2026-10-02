import time
from asyncio import as_completed

import pytest

from concurrent.futures import ThreadPoolExecutor

from apps.main.models import Anime
from apps.main.services import get_or_create_anime


@pytest.mark.django_db(transaction=True)
def test_get_or_create_anime_concurrent(mocker, jikan_anime_payload):
    """
    Мок в conftest. Здесь сам сценарий гонки.
    """
    def slow_fetch(mal_id):
        time.sleep(0.1)
        return jikan_anime_payload

    mocker.patch("apps.main.services.fetch_anime_detail", side_effect=slow_fetch)

    mal_id = 9999
    threads_count = 5

    with ThreadPoolExecutor(max_workers=threads_count) as executor:
        futures = [
            executor.submit(get_or_create_anime, mal_id)
            for _ in range(threads_count)
        ]
        results = [f.result() for f in futures]

    assert Anime.objects.filter(mal_id=mal_id).count() == 1
    # 2. Проверяем возвращаемый объект: все 5 вызовов вернули один и тот же id
    assert all(a.id == results[0] for a in futures)
    # 3. Проверяем M2M связи: жанры привязались корректно
    assert results[0].genres.count() == 2



    anime = Anime.objects.create()


    print(jikan_anime_payload)
    assert jikan_anime_payload["mal_id"] == 9999