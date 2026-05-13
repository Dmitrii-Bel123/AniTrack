from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import UserAnimeListSerializer, UserAnimeDetailSerializer, AnimeSearchSerializer, AnimeCreateSerializer
from .models import UserAnime
from .services import search_anime, get_or_create_anime



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
    """
    GET /api/anime/search/?q=naruto
    Проксируем запрос в Jikan, возвращаем результаты.
    В БД ничего не пишем.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.query_params.get('q', '').strip()
        if not query:
            return Response(
                {"detail":"Параметр q обязателен"},
                status=status.HTTP_400_BAD_REQUEST
            )
        results = search_anime(query)
        serializer = AnimeSearchSerializer(instance=results, many=True)
        return Response(serializer.data)

    serializer_class = AnimeSearchSerializer

class AddAnimeToListView(APIView):
    """
    POST /api/anime/my/add/
    Тело: { "mal_id": 1735, "user_status": "plan_to_watch" }

    1. Валидируем входные данные
    2. get_or_create аниме (возможен запрос в Jikan)
    3. Создаём UserAnime, если ещё не добавлено
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = AnimeCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        mal_id = serializer.validated_data['mal_id']
        user_status = serializer.validated_data['user_status']

        # Получаем или создаём аниме в нашей БД
        try:
            anime = get_or_create_anime(mal_id)
        except Exception as e:
            return Response(
                {"detail": f"Ошибка при получении аниме: {str(e)}"}
            )

        # Проверяем: вдруг пользователь уже добавил это аниме
        user_anime, created = UserAnime.objects.get_or_create(
            user=request.user,
            anime=anime,
            defaults={'user_status':user_status}
        )

        if not created:
            return Response({'detail': 'Аниме уже есть в вашем списке'}, status=status.HTTP_200_OK)
        return Response(
            UserAnimeDetailSerializer(user_anime).data,
            status=status.HTTP_201_CREATED
        )