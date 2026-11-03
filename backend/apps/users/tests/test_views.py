import pytest

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from apps.users.models import User


@pytest.fixture
def api_client():
    return APIClient()

# Полный процесс регистрации
@pytest.mark.django_db
def test_registration_flow(api_client):
    registration_data = {'username':'test_user', 'email':'test@gmail.com', 'password':'Password123_'}
    response = api_client.post(reverse("auth-register"), registration_data, format='json')
    assert response.status_code == status.HTTP_201_CREATED

    user = User.objects.get(username='test_user')
    assert user.check_password("Password123_")
    assert user.password != "Password123_"
    assert user.email == 'test@gmail.com'
    assert 'password' not in response.data


@pytest.mark.django_db
def test_registrations_refuse(api_client):
    registration_data = {'username': 'test_user', 'email': 'test@gmail.com', 'password': '123'}
    response = api_client.post(reverse("auth-register"), registration_data, format='json')
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert 'password' in response.data
    assert User.objects.count() == 0


@pytest.mark.django_db
def test_login_flow(api_client):
    registration_data = {'username':'test_user', 'email':'test@gmail.com', 'password':'Password123_'}
    response = api_client.post(reverse('auth-register'), registration_data, format='json')
    assert response.status_code == status.HTTP_201_CREATED
    user = User.objects.get(username='test_user')
    assert user.check_password('Password123_')
    login_data = {'username':'test_user', 'password':'Password123_'}
    response_login = api_client.post(reverse('auth-login'), login_data, format='json')
    assert response_login.status_code == status.HTTP_200_OK
    assert 'access' in response_login.data
    assert 'refresh' in response_login.data


@pytest.mark.django_db
def test_wrong_password(api_client):
    User.objects.create_user(username='test_user', email='test@gmail.com', password='Password123_')
    wrong_login_data = {'username':'test_user', 'password':'wrong_password'}
    response = api_client.post(reverse('auth-login'), wrong_login_data, format='json')
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert 'access' not in response.data
    assert 'refresh' not in response.data