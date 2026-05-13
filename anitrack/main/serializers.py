from rest_framework import serializers

from .models import UserAnime, Genre, Anime


# ─── Вспомогательные ─────────────────────────────────────────────────────────
class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ['id', 'title']
        read_only_fields = ['id']


# ─── Аниме ───────────────────────────────────────────────────────────────────
class AnimeShortSerializer(serializers.ModelSerializer):
    genres = GenreSerializer(many=True, read_only=True)

    """Только то что нужно для списка"""
    class Meta:
        model = Anime
        fields = ['id', 'mal_id', 'title', 'genres', 'poster', 'episodes']


class AnimeDetailSerializer(serializers.ModelSerializer):
    """Детальная информация об аниме"""
    genres = GenreSerializer(many=True, read_only=True)

    class Meta:
        model = Anime
        fields = ['id', 'mal_id', 'title', 'poster', 'episodes', 'genres']


# ─── UserAnime ────────────────────────────────────────────────────────────────
class UserAnimeListSerializer(serializers.ModelSerializer):
    """
        Список аниме пользователя.
        Показываем короткую инфу об аниме + статус.
    """
    anime = AnimeShortSerializer(read_only=True)

    class Meta:
        model = UserAnime
        fields = ['id', 'anime', 'user_rate', 'user_status']
        read_only_fields = ['id']


class UserAnimeDetailSerializer(serializers.ModelSerializer):
    """
    Детальная страница конкретного аниме из списка пользователя.
    Аниме — read_only (его не меняем здесь).
    Остальные поля — редактируемые.
    """
    anime = AnimeDetailSerializer(read_only=True)

    class Meta:
        model = UserAnime
        fields = ['id', 'anime', 'user_note',
                  'user_rate', 'user_fav_character',
                  'user_status', 'started_at', 'finished_at',
                  'created_at', 'updated_at']
        read_only_fields = ['id', 'anime', 'created_at', 'updated_at']


# ─── API serializers ────────────────────────────────────────────────────────────────
class AnimeSearchSerializer(serializers.Serializer):
    """Только для отображения результатов поиска без сохранения — не ModelSerializer."""
    mal_id = serializers.IntegerField()
    title = serializers.CharField()
    poster = serializers.SerializerMethodField()
    episodes = serializers.URLField()
    genres = serializers.SerializerMethodField()
    synopsis = serializers.CharField()

    def get_poster(self, obj):
        return obj.get('images', {}).get('jpg', {}).get('image_url')

    def get_genres(self, obj):
        return [genre["name"] for genre in obj.get('genres', [])]


# Для добавления аниме в список
class AnimeCreateSerializer(serializers.Serializer):
    mal_id = serializers.IntegerField()
    user_status = serializers.ChoiceField(UserAnime.StatusChoices, default=UserAnime.StatusChoices.WANT)

    def validate_mal_id(self, value):
        if value <= 0:
            raise serializers.ValidationError('Mal id must be positive')
        return value
