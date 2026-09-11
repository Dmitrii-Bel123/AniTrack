from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
class User(AbstractUser):
    avatar = models.ImageField(null=True, blank=True, verbose_name='Аватар')

    def __str__(self):
        return self.username