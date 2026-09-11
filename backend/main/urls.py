from django.urls import path
from .views import UserAnimeListView, UserAnimeDetailView, AnimeSearchView, AddAnimeToListView, StatisticsView

urlpatterns = [
    # User routs
    path('my/', UserAnimeListView.as_view()),
    path('my/<int:pk>/', UserAnimeDetailView.as_view()),

    # Jikan Api
    path('search/', AnimeSearchView.as_view()),
    path('my/add/', AddAnimeToListView.as_view()),

    #Statistics
    path('my/stat/', StatisticsView.as_view()),
    ]
