from rest_framework import serializers
from .models import UserAnime

class UserListSerializer(serializers.ModelSerializer):

    class Meta:
        model = UserAnime
        fields = '__all__'

class UserDetailSerializer(serializers.ModelSerializer):

    class Meta:
        model = UserAnime
        fields = '__all__'