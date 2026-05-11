from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models
from decimal import Decimal
from django.db.models import UniqueConstraint


from users.models import User


# Create your models here.

class Genre(models.Model):
    title = models.CharField(max_length=255)

    def __str__(self):
        return self.title

class Anime(models.Model):
    mal_id = models.PositiveIntegerField(unique=True, db_index=True)
    title = models.CharField(max_length=255)
    genres = models.ManyToManyField(Genre, related_name='genre')
    poster = models.URLField(null=True, blank=True, verbose_name='Обложка')
    episodes = models.PositiveSmallIntegerField(null=True, blank=True, verbose_name='Количество эпизодов')

    def __str__(self):
        return self.title



class UserAnime(models.Model):
    class StatusChoices(models.TextChoices):
        WANT = 'WW', 'Want to watch'
        WATCHING = 'PR', 'Watching'
        WATCHED = 'WD', 'Watched'
        DROPPED = 'DR', 'Dropped'

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='anime_list')
    anime = models.ForeignKey(Anime, on_delete=models.PROTECT, related_name='user_entries')
    user_note = models.TextField(null=True, blank=True, verbose_name='Заметка пользователя')
    user_rate = models.DecimalField(max_digits=3, decimal_places=1, null=True, blank=True,
                                    validators = [
                                        MinValueValidator(Decimal('1.0')),
                                        MaxValueValidator(Decimal('10.0'))
                                    ],
                                    verbose_name='Оценка пользователя')
    user_fav_character = models.CharField(max_length=255, null=True, blank=True, verbose_name='Любимый персонаж')
    user_status = models.CharField(max_length=2, choices=StatusChoices.choices, default=StatusChoices.WANT)
    started_at = models.DateField(null=True, blank=True)
    finished_at = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'anime'],
                name='unique_user_anime'
            )
        ]




    # title_english = models.CharField(max_length=255, null=True, verbose_name='Английское название')
    # title_japanese = models.CharField(max_length=255, null=True, verbose_name='Оригинальное название')
    # aired = models.IntegerField(null=True, blank=True, verbose_name='Год выпуска')
    # rating = models.FloatField(null=True, blank=True, verbose_name='Общий рейтинг')
    # "status": "Currently Airing",

