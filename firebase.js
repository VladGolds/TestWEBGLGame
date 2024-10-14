// Firebase конфигурация
const firebaseConfig = {
    apiKey: "AIzaSyAZqT98d7V8gpCeNma7Aos3u7ol5_wOug4",
    authDomain: "games-63197.firebaseapp.com",
    databaseURL: "https://games-63197-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "games-63197",
    storageBucket: "games-63197.appspot.com",
    messagingSenderId: "217470228668",
    appId: "1:217470228668:web:30844724050d278a7358b9"
};

// Инициализация Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Функция для создания лобби
function createLobby() {
    const lobbyCode = Math.floor(Math.random() * 90000) + 10000; // Генерация случайного кода лобби
    const lobbyRef = db.ref('lobbies/' + lobbyCode);
    
    lobbyRef.set({
        host: 'Player 1', // Имя хоста
        players: {
            'Player 1': { ready: false }
        }
    }).then(() => {
        window.location.href = 'lobby.html?code=' + lobbyCode;
    });
}

// Функция для присоединения к лобби
function joinLobby(code) {
    const lobbyRef = db.ref('lobbies/' + code);
    
    lobbyRef.once('value', snapshot => {
        if (snapshot.exists()) {
            const players = snapshot.val().players;
            const newPlayer = 'Player ' + (Object.keys(players).length + 1);

            lobbyRef.child('players/' + newPlayer).set({
                ready: false
            }).then(() => {
                window.location.href = 'lobby.html?code=' + code;
            });
        } else {
            alert('Лобби с таким кодом не существует.');
        }
    });
}

// Проверка имени пользователя при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    const username = localStorage.getItem('username');
    const authButton = document.getElementById('auth-button');
    const adminButton = document.querySelector('.admin-button');
    const welcomeMessageContainer = document.querySelector('.auth-buttons');
    const welcomeMessage = document.getElementById('welcome-message');
    const dropdownMenu = document.getElementById('dropdown-menu');
    const logoutButton = document.getElementById('logout-button');

    if (username) {
        // Удаляем кнопку регистрации/входа
        authButton?.remove(); 

        // Создаем элемент с приветственным сообщением
        const welcomeMessage = document.createElement('span');
        welcomeMessage.textContent = `Добро пожаловать, ${username}!`;
        welcomeMessage.classList.add('username-highlight');
        welcomeMessageContainer.appendChild(welcomeMessage);

        // Показ выпадающего меню при клике на приветственное сообщение
        welcomeMessage.addEventListener('click', () => {
            dropdownMenu.classList.toggle('show');
        });

        // Обработчик клика на кнопку "Выход"
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('username'); // Удаляем имя пользователя из localStorage
            window.location.reload(); // Перезагружаем страницу
        });

        // Получаем информацию о пользователе из Firebase
        const userRef = ref(database, 'users/' + username);
        get(userRef).then((snapshot) => {
            if (snapshot.exists()) {
                const userData = snapshot.val();

                // Проверяем роль пользователя
                if (userData.role === 'admin') {
                    adminButton.style.display = 'block'; // Показываем кнопку для админов
                } else {
                    adminButton.style.display = 'none'; // Скрываем кнопку для обычных пользователей
                }
            } else {
                console.log('Пользователь не найден в базе данных.');
                adminButton.style.display = 'none'; // Если пользователя нет, скрываем кнопку
            }
        }).catch((error) => {
            console.error("Ошибка получения данных: ", error);
            adminButton.style.display = 'none'; // Если произошла ошибка, скрываем кнопку
        });
    } else {
        adminButton.style.display = 'none'; // Если пользователь не авторизован, скрываем кнопку
    }

    // Обработчик для навигации по категориям
    const currentPage = window.location.pathname.split('/').pop(); // Получаем имя текущей страницы
    const categories = document.querySelectorAll('.categories li a'); // Находим все ссылки в категории

    categories.forEach(category => {
        if (category.getAttribute('href') === currentPage) {
            category.classList.add('active'); // Добавляем активный класс к текущей ссылке
        }
    });
});


// Настройка лобби
function setupLobby(code) {
    const lobbyRef = db.ref('lobbies/' + code);

    lobbyRef.on('value', snapshot => {
        const lobbyData = snapshot.val();
        document.getElementById('host-name').textContent = lobbyData.host;

        const playersList = document.getElementById('players-list');
        playersList.innerHTML = ''; // Очищаем список игроков

        for (const player in lobbyData.players) {
            const row = document.createElement('tr');
            const nameCell = document.createElement('td');
            const statusCell = document.createElement('td');

            nameCell.textContent = player;
            statusCell.textContent = lobbyData.players[player].ready ? 'Готов' : 'Не готов';
            statusCell.className = lobbyData.players[player].ready ? 'ready' : 'not-ready';

            row.appendChild(nameCell);
            row.appendChild(statusCell);
            playersList.appendChild(row);
        }
    });
}