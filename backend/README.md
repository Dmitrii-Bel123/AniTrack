Запустить фронт локально, для динамического обновления. 
cd frontend
npm run dev


Что делать дальше:

1. Тесты. Начал.
2. Переписать print -> logging. Готово. Но надо доделать, в general.log летит мусор.
3. Защитить get_or_create_anime от гонки. Готово
4. get_serializer_class возвращает None.
5. AddAnimeToListView не тот код возвращает
6. Добавить validate_password в авторизации/регистрации
7. ChangePasswordAPIView. после is_valid() обращение в .data, а надо validated_data.