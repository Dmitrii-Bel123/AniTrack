from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.status import HTTP_201_CREATED
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status


from .serializers import RegistrationSerializer, UserSerializer, ChangePasswordSerializer


# Create your views here.

class RegistrationAPIView(APIView):
    """
        Simple jwt регистрация
    """
    permission_classes = (AllowAny,)
    serializer_class = RegistrationSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=HTTP_201_CREATED)
        return Response(serializer.errors, status=400)


class UserRetrieveUpdateAPIView(RetrieveUpdateAPIView):
    """
        Страница пользователя
    """
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

class ChangePasswordAPIView(APIView):
    """
        Simple jwt сменить пароль
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user

        if not user.check_password(serializer.data['old_password']):
            return Response(
                {'old_password': 'Wrong password'},
                status=status.HTTP_400_BAD_REQUEST
            )
        user.set_password(serializer.data['new_password'])
        user.save()
        return Response({'message':'Password changed successfully'}, status=status.HTTP_200_OK)
