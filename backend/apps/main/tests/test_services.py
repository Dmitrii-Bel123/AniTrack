import pytest
from .conftest import jikan_anime_payload

def test_get_or_create_anime_concurrent(jikan_anime_payload):
    """
    Мок в conftest. Здесь сам сценарий гонки.
    """
    print(jikan_anime_payload)
    assert jikan_anime_payload["mal_id"] == 9999