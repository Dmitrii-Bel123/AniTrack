import pytest

"""
Моковые данные
"""

@pytest.fixture
def jikan_anime_payload():
    payload = {
        'mal_id': 9999,
        'title': 'Cowboy Bebop',
        'images': {"jpg": {"image_url": "https://example.com/poster.jpg"}},
        'episodes': 26,
        'genres': [{'name':'horror'}, {'name':'adventure'}],
    }
    return payload