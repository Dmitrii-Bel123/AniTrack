import requests
from requests.exceptions import RequestException

from .models import Anime, Genre

JIKAN_API_URL = "https://api.jikan.moe/v4/"

def search_anime(query: str) -> list:
    """Поиск аниме через Jikan. Ничего не сохраняем."""
    params = {'q':query, "limit":10}
    try:
        response = requests.get(f'{JIKAN_API_URL}anime/', params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        return data.get("data", [])
    except requests.RequestException as e:
        print(f'API error: {e}')
        return []


def fetch_anime_detail(mal_id: int) -> dict:
    """Получить полные данные об аниме по mal_id."""
    url = f'{JIKAN_API_URL}/anime/{mal_id}/'

    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data=response.json()
        return data.get("data", {})
    except requests.RequestException as e:
        print(f'API error: {e}')
        return {}


def get_or_create_anime(mal_id: int) -> Anime:
    """
    Главная функция — вызывается когда пользователь добавляет аниме.
    Если аниме уже есть в нашей БД — просто возвращаем.
    Если нет — тянем с Jikan и сохраняем.
    """
    try:
        anime = Anime.objects.get(mal_id=mal_id)
        return anime
    except Anime.DoesNotExist:
        print(">>> [3] в БД нет, идём в Jikan")

    api_data = fetch_anime_detail(mal_id)

    genres = []
    for genre_data in api_data.get("genres", []):
        genre, _ = Genre.objects.get_or_create(title=genre_data["name"])
        genres.append(genre)

    anime = Anime.objects.create(
        mal_id=api_data['mal_id'],
        title=api_data['title'],
        poster=api_data.get('images', {}).get('jpg', {}).get('image_url', ""),
        episodes=api_data.get('episodes') or 0,
    )
    anime.genres.set(genres)

    return anime