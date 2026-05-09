from tkinter.constants import CASCADE

from django.db import models
from users.models import User

# Create your models here.

class Genre(models.Model):
    title = models.CharField(max_length=255)

class Anime(models.Model):
    mal_id = models.IntegerField()
    title = models.CharField(max_length=255)
    genres = models.ManyToManyField(Genre, related_name='genre')
    poster = models.ImageField(null=True, blank=True, verbose_name='Обложка')
    episodes = models.IntegerField(null=True, blank=True, verbose_name='Количество эпизодов')


class UserAnime(models.Model):
    class StatusChoices(models.TextChoices):
        WANT = 'WW', 'Want to watch'
        WATCHING = 'PR', 'Watching'
        WATCHED = 'WD', 'Watched'
        DROPPED = 'DR', 'Dropped'

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_anime')
    anime = models.ForeignKey(Anime, on_delete=models.PROTECT, related_name='user_anime')
    user_note = models.TextField(null=True, blank=True, verbose_name='Заметка пользователя')
    user_rate = models.FloatField(null=True, blank=True, verbose_name='Оценка пользователя')
    user_fav_character = models.CharField(max_length=255, null=True, blank=True, verbose_name='Любимый персонаж')
    user_status = models.CharField(max_length=2, choices=StatusChoices.choices, default=StatusChoices.WANT)



    # title_english = models.CharField(max_length=255, null=True, verbose_name='Английское название')
    # title_japanese = models.CharField(max_length=255, null=True, verbose_name='Оригинальное название')
    # aired = models.IntegerField(null=True, blank=True, verbose_name='Год выпуска')
    # rating = models.FloatField(null=True, blank=True, verbose_name='Общий рейтинг')
    # "status": "Currently Airing",

