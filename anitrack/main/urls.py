from django.urls import path
# from .views import


urlpatterns = [
    path('list/', UserListView.as_view(), name='user-list'),
    path('add-new/', AddNewAnimeView.as_view(), name='add-new-anime'),
    path('delete/', DeleteAnimeView.as_view(), name='delete-anime'),
    path('delete/', DeleteAnimeView.as_view(), name='delete-anime'),
]

'''

GET api/anime/{mal_id}/

search:
GET /api/anime/search/?q=naruto

user:
GET api/anime/user/
POST api/anime/user/
GET api/anime/user/?status=PR

GET api/anime/user/{id}/
PATCH api/anime/user/{id}/
DELETE api/anime/user/{id}/

'''