import pytest

from apps.users.serializers import RegistrationSerializer
from apps.users.models import User

# Сценарий 1. Пользователь сохраняется в базе
@pytest.mark.django_db
def test_user_save_correctly_and_check_password():
    serializer = RegistrationSerializer(
        data={
            "username": "test_user",
            "email": "test@test.com",
            "password": "Password123_"
        }
    )

    assert serializer.is_valid(), serializer.errors
    serializer.save()
    user = User.objects.get(username="test_user")
    assert user.check_password("Password123_")
    assert user.email == "test@test.com"
    assert not user.password == "Password123_" # пароль хэшируется
    assert "password" not in serializer.data # Пароль не попадает в выходные данные сериализатора.


# Сценарий 2. Имя пользователя занято
@pytest.mark.django_db
def test_username_exists():
    serializer = RegistrationSerializer(
        data={
            "username": "test_user",
            "email": "test@test.com",
            "password": "Password123_"
        }
    )
    assert serializer.is_valid(), serializer.errors
    serializer.save()

    # Вторая часть - имя занято
    wrong_serializer = RegistrationSerializer(
        data={
            "username": "test_user",
            "email": "test@test.com",
            "password": "Password123_"
        }
    )
    assert not wrong_serializer.is_valid(), wrong_serializer.errors
    assert "username" in wrong_serializer.errors

# Сценарий 3. Пароль не подходит
@pytest.mark.django_db
@pytest.mark.parametrize("password,expected", [("123", False), ("1234567", False), ("12345678", True)])
def test_registration_password_length(password, expected):

    serializer = RegistrationSerializer(
        data={
            "username": "test_user",
            "email": "testuser@test.com",
            "password": password
        }
    )

    assert serializer.is_valid() == expected, serializer.errors


# Сценарий 4. Без обязательного поля регистрация не проходит.
@pytest.mark.django_db
def test_without_required_field():
    serializer = RegistrationSerializer(
        data={
            "email": "testuser@test.com",
            "password": "Password123_"
        }
    )

    assert not serializer.is_valid(), serializer.errors
    assert "username" in serializer.errors
