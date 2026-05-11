from django.shortcuts import render
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .serializers import UserListSerializer
from .models import UserAnime


class UserAnimeListCreateView(generics.ListCreateAPIView):

    def get_queryset(self):
        return UserAnime.objects.filter(user=self.request.user)

    serializer_class = UserListSerializer
    permission_classes = [IsAuthenticated, ]


class UserAnimeDetailView(generics.RetrieveUpdateDestroyAPIView):
    pass


