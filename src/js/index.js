// Глобальные переменные:
var FIELD_SIZE_X = 30; // строки
var FIELD_SIZE_Y = 30; // столбцы
var SNAKE_SPEED = 300; // Интервал между перемещениями змейки

var snake = []; // Сама змейка, array of snakes elements
var direction = 'y+';
// Начальное значение направления движения змейки вверх
var gameIsRunning = false; // Статусный флаг: запущена ли игра
var snake_timer; // Таймер змейки
var food_timer; // Таймер для еды
var score = 0; // Результат
var scoreElem = document.querySelector(".display-score .score");
// Элемент отображения результата
var haveBarriers;
// Boolean flag for use or nor "barriers" on field

function init() {
    prepareGameField(); // Выполнение генерации поля

    var wrap = document.getElementsByClassName('wrap')[0];
    // Подгоняем размер контейнера под игровое поле
    wrap.style.width = 'auto';

    // Добавление обработчиков событий 'click' к элементам кнопок 'Старт' - startGame, 'Новая игра' - refreshGame
    document.getElementById('snake-start').addEventListener('click', startGame);
    document.getElementById('snake-renew').addEventListener('click', refreshGame);

    // Добавление обработчика событий 'keydown' - нажатия клавиш клавиатуры
    addEventListener('keydown', changeDirection);
}

/**
 * Функция генерации игрового поля
 */
function prepareGameField() {
    // Создание таблицы
    var game_table = document.createElement('table');
    // game_table.setAttribute('class', 'game-table'); // classList.add(), className = 'game-table'
    game_table.classList.add('game-table');

    // Генерация ячеек игровой таблицы
    for (var i = 0; i < FIELD_SIZE_X; i++) {
        // Создание строки
        var row = document.createElement('tr');
        row.className = 'game-table-row row-' + i;

        for (var j = 0; j < FIELD_SIZE_Y; j++) {
            // Создание ячейки
            var cell = document.createElement('td');
            cell.className = 'game-table-cell cell-' + i + '-' + j;

            row.appendChild(cell); // Добавление ячейки
        }

        game_table.appendChild(row); // Добавление строки
    }

    document.getElementById('snake-field').appendChild(game_table); // Добавление таблицы
}

/**
 * Старт игры
 */
function startGame() {
    gameIsRunning = true; // Устанавливаем статус игры - "запущена"
    respawn(); // создаем новую змейку в центре поля
    // Устанавливаем интервал вызова функции движения move snake
    snake_timer = setInterval(move, SNAKE_SPEED);

    haveBarriers = document.getElementById("barrierInput").checked;
    // assign value of input checkbox
    // console.log('useBarrier: ' + haveBarriers);

    // Через 5с запускаем функцию создания еды 
    //setTimeout(createFood, 5000);  // Old createFood
    setTimeout(createUnit, 5000);

    // if (haveBarriers) useBarriers(); // Use or not option "Barriers"
}

/**
 * Функция создания змейки на игровом поле
 * respawn - возрождаться
 */
function respawn() {
    // Змейка - массив td
    // Стартовая длина змейки = 2

    // Respawn змейки из центра
    var start_coord_x = Math.floor(FIELD_SIZE_X / 2);
    var start_coord_y = Math.floor(FIELD_SIZE_Y / 2);

    // Голова змейки
    var snake_head = document.getElementsByClassName('cell-' + start_coord_y + '-' + start_coord_x)[0];
    // snake_head.setAttribute('class', snake_head.getAttribute('class') + ' snake-unit');
    snake_head.classList.add('snake-unit');

    // Тело змейки (хвост - на 1 ячейку меньше головы)
    var snake_tail = document.getElementsByClassName('cell-' + (start_coord_y - 1) + '-' + start_coord_x)[0];
    // snake_tail.setAttribute('class', snake_tail.getAttribute('class') + ' snake-unit');
    snake_tail.classList.add('snake-unit');

    snake.push(snake_head); // Добавляем в конец массива элементы (объекты ячеек)
    snake.push(snake_tail);
}

/**
 * Движение змейки
 */
function move() {
    //console.log('move', direction);
    // Сборка классов
    // var snake_head_classes = snake[snake.length - 1].getAttribute('class').split(' ');
    // var snake_head_classes = snake[snake.length - 1].className.split(' ');
    var snake_head_classes = snake[snake.length - 1].classList;
    // <td class="game-table-cell cell-15-19 snake-unit"></td>

    // Сдвиг головы - движение вперед по направления согласно нажатиям клавиш, по обработчику 
    var new_unit;
    var snake_coords = snake_head_classes[1].split('-'); // cell-15-19 -> [cell, 15, 19]
    var coord_y = parseInt(snake_coords[1]); // [.., 15, ..]
    var coord_x = parseInt(snake_coords[2]); // [.., .., 19]

    // Создаем дополнительную ячейку для головы
    // Проверяем значение direction - направление и получаем объект элемента этого класса из ячеек таблицы
    if (direction == 'x-') {
        new_unit = document.getElementsByClassName('cell-' + (coord_y) + '-' + (coord_x - 1))[0]; // влево (- 1)
    } else if (direction == 'x+') {
        new_unit = document.getElementsByClassName('cell-' + (coord_y) + '-' + (coord_x + 1))[0]; // вправо (+ 1)
    } else if (direction == 'y+') {
        new_unit = document.getElementsByClassName('cell-' + (coord_y - 1) + '-' + (coord_x))[0];
        // нумерация строк сверху, координату уменьшаем
    } else if (direction == 'y-') {
        new_unit = document.getElementsByClassName('cell-' + (coord_y + 1) + '-' + (coord_x))[0];
    }

    // Проверяем:
    //  1) new_unit не часть змейки
    //  2) Змейка не ушла за границу поля
    // new_unit !== undefined, условие нахождения вполе
    if (isRightUnit(new_unit) && (new_unit !== undefined)) {
        // Добавление новой части змейки
        new_unit.classList.add('snake-unit');
        snake.push(new_unit);

        // Проверяем, надо ли убрать хвост, т.е. передвинуться вперед.
        // При отсутствии съеденной еды убираем хвост
        if (!haveFood(new_unit)) {
            // Находим хвост в массиве, первый элемент
            var removed = snake.splice(0, 1)[0];

            // удаляем хвост - удалением класса змейки
            removed.classList.remove('snake-unit');
        }
    } else {
        finishTheGame();
    }
}

/**
 * Проверка массива snake на содержание элемента unit
 * Проверка unita на принадлежность 'barrier-unit'
 * @param unit
 * @returns {boolean}
 */
function isRightUnit(unit) {
    var check = false;
    // str.includes(searchStr); поиск подстроки 'unit' в приведенном к строке массиве snake (ES6), return true/false
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/includes

    if (unit) {
        if (!snake.includes(unit)) {
            check = true;
        }
        // Check if unit is the 'barrier-unit'
        if (!unit.classList.contains('barrier-unit')) {
            check = true;
        }
    }

    return check;
}

/**
 * Проверка на еду. Если змейка съела "еду", мы увеличиваем счет и удаляем класс еды из классов ячейки
 * @param unit
 * @returns {boolean}
 */
function haveFood(unit) {
    var check = false;

    // Если змейка проглотила еду, перевариваем ее и создаем новую
    // Проверяем содержит ли строка с классами подстроку 'food-unit'
    if (unit.classList.contains('food-unit')) {
        check = true;
        unit.classList.remove('food-unit');

        // запускаем создание еды
        // createFood(); // Old
        // () - no barriers
        haveBarriers ? createUnit(true) : createUnit();

        // Увеличиваем счет
        score++;
        // Отображаем в элементе счет <span class="score">
        scoreElem.textContent = score;
    }

    return check;
}

/**
 * Создание еды
 */
// function createFood() {
//     var foodCreated = false;
//     // пока статус foodCreated не станет "Истиной"
//     while (!foodCreated) {
//         // случайный выбор координат
//         var food_x = Math.floor(Math.random() * FIELD_SIZE_X);
//         var food_y = Math.floor(Math.random() * FIELD_SIZE_Y);

//         // согласно сгенерированным координатам получаем HTML элемент по имени класса
//         var food_cell = document.getElementsByClassName('cell-' + food_y + '-' + food_x)[0];
//         // <td class="game-table-cell cell-0-17"></td>
//         // Если список классов ячейки еды не содержит класса змейки
//         if (!food_cell.classList.contains('snake-unit')) {
//             // Добавляем класс 'food-unit' к сгенерированной ячейке и она становится едой через CSS правило
//             food_cell.classList.add('food-unit'); // [game-table-cell, cell-0-17, food-unit]

//             // Устанавливаем флаг "еда создана", статус foodCreated Истина
//             foodCreated = true;
//             // Выходим из цикла
//         }
//     }
// }

/**
 * Create Unit: Food and Barrier, or just Food 
 * @param barriersFlag {boolean}
 * @returns void
 */
function createUnit(barriersFlag) {
    var snakeClass = 'snake-unit';
    var foodClass = 'food-unit'; // always have food

    // but barriers may be not
    var barrierClass = (haveBarriers || barriersFlag) ? 'barrier-unit' : '';
    // Status flags
    var foodCreated = false;
    var barrierCreated = false;

    // 1 stage create food
    // пока статус foodCreated не станет "Истиной"
    while (!foodCreated) {
        // случайный выбор координат
        var food_x = Math.floor(Math.random() * FIELD_SIZE_X);
        var food_y = Math.floor(Math.random() * FIELD_SIZE_Y);

        // согласно сгенерированным координатам получаем HTML элемент по имени класса
        var food_cell = document.getElementsByClassName('cell-' + food_y + '-' + food_x)[0];
        // <td class="game-table-cell cell-0-17"></td>
        // Если список классов ячейки еды не содержит класса змейки и уже созданных барьеров
        if (!barrierClass) { // Without barriers
            if (!food_cell.classList.contains(snakeClass)) {
                // Добавляем класс 'food-unit' к сгенерированной ячейке и она становится едой через CSS правило
                food_cell.classList.add(foodClass); // [game-table-cell, cell-0-17, food-unit]

                // Устанавливаем флаг "еда создана", статус foodCreated Истина
                foodCreated = true;
                // Выходим из цикла
            }
        } else {
            if (!food_cell.classList.contains(snakeClass) && !food_cell.classList.contains(barrierClass)) {
                // Добавляем класс 'food-unit' к сгенерированной ячейке и она становится едой через CSS правило
                food_cell.classList.add(foodClass); // [game-table-cell, cell-0-17, food-unit]

                // Устанавливаем флаг "еда создана", статус foodCreated Истина
                foodCreated = true;
                // Выходим из цикла
            }
        }
    }
    // Create brarriers if need
    if (foodCreated && barrierClass) {
        while (!barrierCreated) {
            // случайный выбор координат
            var barrier_x = Math.floor(Math.random() * FIELD_SIZE_X);
            var barrier_y = Math.floor(Math.random() * FIELD_SIZE_Y);

            // согласно сгенерированным координатам получаем HTML элемент по имени класса
            var barrier_cell = document.getElementsByClassName('cell-' + barrier_x + '-' + barrier_y)[0];
            // <td class="game-table-cell cell-0-17"></td>
            // Если список классов ячейки барьера не содержит класса змейки и еды
            if (!barrier_cell.classList.contains(snakeClass) && !barrier_cell.classList.contains(foodClass)) {
                // Добавляем класс barrierClass к сгенерированной ячейке и она становится барьером через CSS правило
                barrier_cell.classList.add(barrierClass); // [game-table-cell, cell-0-17, barrier-unit]

                // Устанавливаем флаг
                barrierCreated = true;
                // Выходим из цикла
            }
        }
    }
}

/**
 * Изменение направления движения змейки
 * @param e {object} - событие
 */
function changeDirection(e) {
    // console.log(e);
    switch (e.keyCode) {
        case 37: // Клавиша влево <-, если предидущее значение direction не было вправо
            if (direction != 'x+') {
                direction = 'x-';
            }
            break;
        case 38: // Клавиша вверх ^
            if (direction != 'y-') {
                direction = 'y+';
            }
            break;
        case 39: // Клавиша вправо ->
            if (direction != 'x-') {
                direction = 'x+';
            }
            break;
        case 40: // Клавиша вниз 
            if (direction != 'y+') {
                direction = 'y-';
            }
            break;
    }
}

/**
 * Функция завершения игры
 */
function finishTheGame() {
    gameIsRunning = false;
    clearInterval(snake_timer);
    alert('The game finished / игра закончена!');
}

/**
 * Новая игра
 */
function refreshGame() {
    location.reload();
}

// Инициализация
window.onload = init;

// Function Use barriers on field
// function useBarriers() {
//     console.log('We use barriers');
// }