from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .serializers import UserListSerializer
from .models import UserAnime


class UserAnimeListCreateView(generics.ListCreateAPIView):
    """
        Список аниме, которые добавил пользователь
    """
    serializer_class = UserListSerializer
    permission_classes = [IsAuthenticated, ]
    # pagination_class = UserAnimePaginator

    def get_queryset(self):
        queryset = UserAnime.objects.filter(user=self.request.user).select_related('anime') # Получаем объекты пользователя
        status_param = self.request.query_params.get('status') # Узнаем статус
        if status_param:
            queryset = queryset.filter(status=status_param)  # Фильтрация
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class UserAnimeDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
        Детали аниме, добавленного пользователем
    """
    serializer_class = UserListSerializer
    permission_classes = [IsAuthenticated,]

    def get_queryset(self):
        return UserAnime.objects.filter(user=self.request.user).select_related('anime')