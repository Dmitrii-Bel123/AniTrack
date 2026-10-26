import time
from unittest.mock import patch

import pytest

from concurrent.futures import ThreadPoolExecutor

from apps.main.models import Anime
from apps.main.services import get_or_create_anime

from apps.main.services import fetch_anime_detail
from apps.main.tests.conftest import jikan_anime_payload


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
    assert all(a.id == results[0].id for a in results)
    # 3. Проверяем M2M связи: жанры привязались корректно
    assert results[0].genres.count() == 2


@pytest.mark.django_db
@patch("apps.main.services.fetch_anime_detail") # Указали что подменяем и передаем в функцию
def test_anime_already_in_db(mock_fetch_anime, jikan_anime_payload):
    """
    Аниме уже есть в базе. Вернулась существующая запись; функция получения данных из API не вызывалась
    """
    anime = Anime.objects.create(
        mal_id=jikan_anime_payload["mal_id"],
        title = jikan_anime_payload["title"],
        episodes=jikan_anime_payload["episodes"]
    )

    # нужно вызвать get_or_create_anime
    result = get_or_create_anime(jikan_anime_payload["mal_id"])

    assert result == anime
    # Узнали, что аниме уже есть в базе и в апи уже не нужно идти

    # Проверили, что вызова апи не было (fetch_anime_detail)
    mock_fetch_anime.assert_not_called()


@pytest.mark.django_db
@patch("apps.main.services.fetch_anime_detail")
def test_no_anime_in_db_expect_new_entry(mock_fetch_anime, jikan_anime_payload):
    """
    Аниме отсутствует. На основе подставленных данных появилась запись с ожидаемыми полями
    """
    mock_fetch_anime.return_value = jikan_anime_payload # Настроили мок. Чтобы он возвращал что нам нужно
    assert Anime.objects.count() == 0
    result = get_or_create_anime(jikan_anime_payload["mal_id"]) # Вызываем саму функцию
    mock_fetch_anime.assert_called_once_with(jikan_anime_payload["mal_id"]) # Апи действительно вызвался
    assert Anime.objects.count() == 1

    created_anime = Anime.objects.first() # Достали аниме из базы и проверяем
    assert result == created_anime
    assert created_anime.mal_id == jikan_anime_payload["mal_id"]
    assert created_anime.title == jikan_anime_payload["title"]


@pytest.mark.django_db
@patch("apps.main.services.fetch_anime_detail")
def test_api_returned_genres_check_in_db(mock_fetch_anime, jikan_anime_payload):
    """
    API вернул жанры. У созданного аниме привязаны жанры с ожидаемыми названиями
    """
    mock_fetch_anime.return_value = jikan_anime_payload
    get_or_create_anime(jikan_anime_payload["mal_id"])

    created_anime = Anime.objects.first()

    actual_genres = list(created_anime.genres.values_list('title', flat=True))
    expected_genres = [g['name'] for g in jikan_anime_payload['genres']]
    assert sorted(actual_genres) == sorted(expected_genres)
