![Data!](public/img/logo.png)
======

Электронная таблица в браузере

Возможности
------

* Редактирование содержимого и фона ячеек
* Работа с формулами
* Экспорт в csv
* Авторизация и сохранение таблиц

Подробнее в нашей [Wiki](https://github.com/bmstu-iu9/utp2018-4-spreadsheet/wiki) 

Запуск
------

### Запуск на **Linux**
* Запуск с 3мя gnome-terminal(Останавливать каждый терминал на SIGINT):
  ```bash
  ./run_terminal.sh
  ```
* Запуск в фоне с логированием в файлы:
  ```bash
  ./run.sh
  ```
* Отключение в фоне:
  ```bash
  ./stop.sh
  ```

### Запуск на **Windows**
* Запуск с 3мя cmd(Останавливать каждый терминал на SIGINT):
  ```cmd
  run_terminal.bat
  ```
После запуска локально с дефолтным конфигом обратиться к серверу можно по **127.0.0.1:8080** (не через localhost)

### Зависимости

* Для запуска требуется **sqlite3**(он вшит в репозиторий только для *Linux Node v8.11.4*, на случай каких-то страшных обстоятельств)
  ```bash
  npm i sqlite3
  ```

Команда разработчиков
------

* Гавриловский Даниил - [@GDVFox](https://github.com/GDVFox)
* Апахов Михаил - [@Apakhov](https://github.com/Apakhov)
* Бакланов Лев - [@penachett](https://github.com/penachett)
* Прийма Антон - [@antonpriyma](https://github.com/antonpriyma)
* Мамаев Алексей - [@AleksMa](https://github.com/AleksMa)
* Пичугин Влад - [@VladisP](https://github.com/VladisP)

##### utp2018-4-spreadsheet
