from rest_framework import serializers
from .models import UserAnime, Genre, Anime


"""
Base entity serializers
"""
class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ['id', 'title']


class AnimeSerializer(serializers.ModelSerializer):
    genres = GenreSerializer(many=True)

    class Meta:
        model = Anime
        fields = ['mal_id', 'title', 'genres', 'poster', 'episodes']


"""
Relation entity
"""
class UserListSerializer(serializers.ModelSerializer):
    anime = AnimeSerializer(read_only=True)
    class Meta:
        model = UserAnime
        fields = ['id', 'anime', 'user_note',
                  'user_rate', 'user_fav_character',
                  'user_status', 'started_at', 'finished_at',
                  'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

