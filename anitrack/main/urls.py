from django.urls import path
from .views import UserAnimeListCreateView, UserAnimeDetailView



urlpatterns = [
    path('user/', UserAnimeListCreateView.as_view()),
    path('user/<int:pk>/', UserAnimeDetailView.as_view()),
    ]

'''

GET api/anime/{mal_id}/
GET /api/anime/?search=naruto
GET /api/anime/search/?q=naruto Передумал

user:
GET api/anime/user/
POST api/anime/user/
GET api/anime/user/?status=PR

GET api/anime/user/{id}/
PATCH api/anime/user/{id}/
DELETE api/anime/user/{id}/

'''