from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenBlacklistView
from .views import RegistrationAPIView


urlpatterns = [
    path('register/', RegistrationAPIView.as_view(), name='auth-register'), # Кастом
    path('login/', TokenObtainPairView.as_view(), name='auth-login'),  # ← JWT login
    path('token/refresh/', TokenRefreshView.as_view(), name='auth-token-refresh'),  # обновление
    # path('me/', UserRetrieveUpdateAPIView.as_view(), name='user-me'),  # профиль
    # path('change-password/', ChangePasswordAPIView.as_view(), name='auth-change-password'), # Кстом
    path('logout/', TokenBlacklistView.as_view(), name='auth-logout'),
]