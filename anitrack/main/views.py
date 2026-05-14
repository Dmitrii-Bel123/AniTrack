from rest_framework import generics, status
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend


from .serializers import (UserAnimeListSerializer, UserAnimeDetailSerializer,
                          AnimeSearchSerializer, AnimeCreateSerializer)
from .models import UserAnime
from .services import search_anime, get_or_create_anime, fetch_anime_detail



class UserAnimeListView(generics.ListAPIView):
    """
    GET /api/anime/my/

    GET /api/anime/my?ordering=user_rate
    GET /api/anime/my?user_status=PR
    GET /api/anime/my?search=One Piece - Не работает
    Список аниме, которые добавил пользователь
    """
    serializer_class = UserAnimeListSerializer
    permission_classes = [IsAuthenticated, ]
    filter_backends = [OrderingFilter, DjangoFilterBackend, SearchFilter]
    ordering_fields = ['user_rate', 'created_at']
    filterset_fields = ['user_status']
    search_fields = ['anime__title']
    ordering = ['created_at']
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
    permission_classes = [IsAuthenticated,]
    http_method_names = ['get', 'patch', 'delete']

    def get_queryset(self):
        return UserAnime.objects.filter(user=self.request.user).select_related('anime')

    def get_serializer_class(self):
        """ PATCH использует обычный сериализатор без Jikan """
        if self.request.method=='PATCH':
            return UserAnimeDetailSerializer
        return None


    def retrieve(self, request, *args, **kwargs):
        """ Переопределение. Для отображения более подробной динамической информации из апи """
        user_anime = self.get_object() # автоматически проверяет что объект принадлежит юзеру

        try:
            jikan_data = fetch_anime_detail(user_anime.anime.mal_id)
        except Exception:
            jikan_data = {}

        user_data = UserAnimeDetailSerializer(user_anime).data

        response_data = {
            # Из Jikan
            "mal_id": jikan_data.get("mal_id"),
            "url": jikan_data.get("url"),
            "title": jikan_data.get("title"),
            "title_japanese": jikan_data.get("title_japanese"),
            "source": jikan_data.get("source"),
            "synopsis": jikan_data.get("synopsis"),
            "episodes": jikan_data.get("episodes"),
            "status": jikan_data.get("status"),  # OnAir / Finished и т.д.
            "airing": jikan_data.get("airing"), # Выходит ли еще
            "score": jikan_data.get("score"),  # оценка MAL
            "year": jikan_data.get("year"),
            "poster": (
                jikan_data.get("images", {})
                .get("jpg", {})
                .get("large_image_url")  # large — для детальной страницы
            ),
            "genres": [
                g["name"] for g in jikan_data.get("genres", [])
            ],
            "studios": [
                s["name"] for s in jikan_data.get("studios", [])
            ],
            "trailer": (
                jikan_data.get("trailer", {}).get("url")
            ),

            # Данные пользователя поверх
            "user_anime_id": user_data["id"],
            "user_status": user_data["user_status"],
            "user_rate": user_data["user_rate"],
            "user_note": user_data["user_note"],
            "user_fav_character": user_data["user_fav_character"],
            "started_at": user_data["started_at"],
            "finished_at": user_data["finished_at"],
            "created_at": user_data["created_at"],
            "updated_at": user_data["updated_at"],
        }

        return Response(response_data)

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