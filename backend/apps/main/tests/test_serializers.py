
import pytest

from apps.main.serializers import AnimeCreateSerializer, UserAnimeDetailSerializer

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


def test_anime_create_serializer_ignores_unknown_fields():
    serializer = AnimeCreateSerializer(
        data={
            "mal_id": 123,
            "is_admin": True,
        }
    )
    assert serializer.is_valid()
    assert "is_admin" not in serializer.validated_data


def test_anime_detail_serializer_try_to_edit_anime():
    serializer = UserAnimeDetailSerializer(
        data={
            "anime": {"id": 123},
            "user_note": "My favorite anime"
        }
    )
    assert serializer.is_valid(), serializer.errors
    assert "anime" not in serializer.validated_data
    assert serializer.validated_data["user_note"] == "My favorite anime"