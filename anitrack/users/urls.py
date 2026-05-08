from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenBlacklistView
from .views import RegistrationAPIView, UserRetrieveUpdateAPIView, ChangePasswordAPIView


urlpatterns = [
    path('login/', TokenObtainPairView.as_view(), name='auth-login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='auth-token-refresh'),
    path('logout/', TokenBlacklistView.as_view(), name='auth-logout'),
    path('register/', RegistrationAPIView.as_view(), name='auth-register'),
    path('me/', UserRetrieveUpdateAPIView.as_view(), name='user-me'),
    path('change_password/', ChangePasswordAPIView.as_view(), name='auth-change-password'),
]
