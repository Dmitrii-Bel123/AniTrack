from django.urls import path
from .views import UserAnimeListView, UserAnimeDetailView, AnimeSearchView, AddAnimeToListView



urlpatterns = [
    # User routs
    path('my/', UserAnimeListView.as_view()),
    path('my/<int:pk>/', UserAnimeDetailView.as_view()),

    # Jikan Api
    path('search', AnimeSearchView.as_view()),
    path('my/add/', AddAnimeToListView.as_view()),
    ]

'''

GET api/anime/{mal_id}/
GET /api/anime/?search=naruto
GET /api/anime/search/?q=naruto Передумал

user:
GET api/anime/my/
GET api/anime/my/?status=PR

GET api/anime/user/{id}/
PATCH api/anime/user/{id}/
DELETE api/anime/user/{id}/

'''