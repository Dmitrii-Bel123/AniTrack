
import pytest

from apps.main.serializers import AnimeCreateSerializer

from apps.main.models import UserAnime


def test_anime_create_serializer_accepts_valid_data():
    """ Корректные данные должны приниматься """
    serializer = AnimeCreateSerializer(
        data={
            "mal_id": 123,
            "user_status": UserAnime.StatusChoices.WANT
        }
    )
    assert serializer.is_valid(), serializer.errors

@pytest.mark.parametrize("mal_id", [0, -1, -123])
def test_anime_create_serializer_rejects_negative_mal_id(mal_id):
    serializer = AnimeCreateSerializer(
        data={
            "mal_id":mal_id
        }
    )
    assert not serializer.is_valid()
    assert "mal_id" in serializer.errors


def test_anime_create_serializer_uses_default_status():
    serializer = AnimeCreateSerializer(
        data={
            "mal_id": 123
        }
    )
    assert serializer.is_valid()
    assert serializer.validated_data["user_status"] == UserAnime.StatusChoices.WANT


def test_anime_create_serializer_rejects_fake_status():
    serializer = AnimeCreateSerializer(
        data={
            "mal_id": 123,
            "user_status": "fake_status"
        }
    )
    assert not serializer.is_valid()
    assert "user_status" in serializer.errors


def test_anime_create_serializer_rejects_str_mal_id():
    serializer = AnimeCreateSerializer(
        data={
            "mal_id":"str_mal_id"
        }
    )
    assert not serializer.is_valid()
    assert "mal_id" in serializer.errors