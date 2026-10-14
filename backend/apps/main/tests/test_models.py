import pytest
from django.db import IntegrityError

from apps.main.models import Anime, UserAnime
from apps.users.models import User


@pytest.mark.django_db
def test_user_anime_default_status_and_unique_constraint():
    """Модель UserAnime: статус по умолчанию и уникальность пары (user, anime)."""
    user = User.objects.create_user(username='tester', password='testpass123')
    anime = Anime.objects.create(mal_id=1, title='Test Anime')

    entry = UserAnime.objects.create(user=user, anime=anime)
    assert entry.user_status == UserAnime.StatusChoices.WANT

    with pytest.raises(IntegrityError):
        UserAnime.objects.create(user=user, anime=anime)
