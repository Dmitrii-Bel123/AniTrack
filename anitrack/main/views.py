from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from .serializers import UserAnimeListSerializer, UserAnimeDetailSerializer
from .models import UserAnime



class UserAnimeListView(generics.ListAPIView):
    """
    GET /api/anime/my/
    Список аниме, которые добавил пользователь
    """
    serializer_class = UserAnimeListSerializer
    permission_classes = [IsAuthenticated, ]
    # filtering
    # pagination_class = UserAnimePaginator

    def get_queryset(self):
        return (UserAnime.objects.filter(user=self.request.user)
                    .select_related('anime')
                    .prefetch_related('anime__genres')) # Получаем объекты пользователя



class UserAnimeDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Детали аниме, добавленного пользователем
    GET    /api/anime/my/<id>/  — детальная страница
    PATCH  /api/anime/my/<id>/  — обновить статус / оценку / заметку
    DELETE /api/anime/my/<id>/  — удалить из списка
    """
    serializer_class = UserAnimeDetailSerializer
    permission_classes = [IsAuthenticated,]
    http_method_names = ['get', 'patch', 'delete']

    def get_queryset(self):
        return UserAnime.objects.filter(user=self.request.user).select_related('anime')


class AnimeSearchView(APIView):
    pass


class AddAnimeToListView(APIView):
    pass