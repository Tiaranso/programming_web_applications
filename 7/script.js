document.addEventListener('DOMContentLoaded', () => {
    // Елементи
    const playBtn = document.getElementById('playBtn');
    const work = document.getElementById('work');
    const anim = document.getElementById('anim');
    const controlBtn = document.getElementById('controlBtn');
    const closeBtn = document.getElementById('closeBtn');
    const liveLog = document.getElementById('liveLog');
    const logsTableContainer = document.getElementById('logsTableContainer');

    // Змінні стану
    let isRunning = false;
    let timerId = null;
    let eventCounter = 0;
    
    // Кульки
    let balls = [
        { id: 'red', color: 'red', x: 0, y: 0, dx: 0, dy: 0, el: null },
        { id: 'green', color: 'green', x: 0, y: 0, dx: 0, dy: 0, el: null }
    ];

    // Керування

    playBtn.addEventListener('click', () => {
        work.style.display = 'block';
        resetGame();
        logEvent('Work opened');
    });

    closeBtn.addEventListener('click', async () => {
        stopGame();
        work.style.display = 'none';
        logEvent('Work closed');
        await displayLogs(); 
        // Очистка після закриття
        localStorage.removeItem('anim_logs'); 
        fetch('server.php?action=clear'); 
    });

    controlBtn.addEventListener('click', () => {
        if (controlBtn.innerText === 'START') {
            startGame();
        } else if (controlBtn.innerText === 'STOP') {
            stopGame();
            controlBtn.innerText = 'START';
            logEvent('Button STOP pressed');
        } else if (controlBtn.innerText === 'RELOAD') {
            resetGame();
            controlBtn.innerText = 'START';
            logEvent('Button RELOAD pressed');
        }
    });


    function initBalls() {
        anim.innerHTML = '';
        const w = anim.clientWidth;
        const h = anim.clientHeight;

        // Червона: зліва (x=0), випадковий у
        balls[0].x = 0;
        balls[0].y = Math.random() * (h - 20);
        balls[0].dx = 3 + Math.random() * 2; // Рух вправо
        balls[0].dy = (Math.random() - 0.5) * 4; // Трохи вертикалі

        // Зелена: зверху (y=0), випадковий х
        balls[1].x = Math.random() * (w - 20);
        balls[1].y = 0;
        balls[1].dx = (Math.random() - 0.5) * 4; // Трохи горизонталі
        balls[1].dy = 3 + Math.random() * 2; // Рух вниз

        balls.forEach(b => {
            const el = document.createElement('div');
            el.className = `ball ball-${b.color}`;
            el.style.left = b.x + 'px';
            el.style.top = b.y + 'px';
            anim.appendChild(el);
            b.el = el;
        });
    }

    function startGame() {
        if (!balls[0].el) initBalls();
        isRunning = true;
        controlBtn.innerText = 'STOP';
        logEvent('Button START pressed');
        
        // Інтервал анімації (20мс)
        timerId = setInterval(updatePhysics, 20);
    }

    function stopGame() {
        isRunning = false;
        clearInterval(timerId);
    }

    function resetGame() {
        stopGame();
        eventCounter = 0;
        localStorage.removeItem('anim_logs');
        fetch('server.php?action=clear');
        initBalls();
        controlBtn.innerText = 'START';
        liveLog.innerText = "Ready";
    }

    function updatePhysics() {
        if (!isRunning) return;

        const w = anim.clientWidth;
        const h = anim.clientHeight;
        let collision = false;

        balls.forEach(b => {
            // Рух
            b.x += b.dx;
            b.y += b.dy;

            let hitWall = false;

            // Стінки
            if (b.x <= 0) { b.x = 0; b.dx *= -1; hitWall = true; }
            if (b.x >= w - 20) { b.x = w - 20; b.dx *= -1; hitWall = true; }
            if (b.y <= 0) { b.y = 0; b.dy *= -1; hitWall = true; }
            if (b.y >= h - 20) { b.y = h - 20; b.dy *= -1; hitWall = true; }

            if (hitWall) logEvent(`${b.color} hit wall`);

            // Оновлення DOM
            b.el.style.left = b.x + 'px';
            b.el.style.top = b.y + 'px';
        });

        // Перевірка зіткнення кульок
        const dx = balls[0].x - balls[1].x;
        const dy = balls[0].y - balls[1].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 20) { // Радіус 10 + 10
            stopGame();
            controlBtn.innerText = 'RELOAD';
            logEvent('COLLISION! Game Over');
            collision = true;
        } else {
            logEvent('Step');
        }
    }


    function logEvent(desc) {
        eventCounter++;
        liveLog.innerText = `#${eventCounter}: ${desc}`;
        const now = new Date(); 

        const eventData = {
            id: eventCounter,
            desc: desc,
            clientTime: now.toISOString()
        };

        saveToLocalStorage(eventData);

        sendToServer(eventData);
    }

    function saveToLocalStorage(data) {
        let logs = JSON.parse(localStorage.getItem('anim_logs') || '[]');
        data.saveTimeLocal = new Date().toISOString(); 
        logs.push(data);
        localStorage.setItem('anim_logs', JSON.stringify(logs));
    }

    function sendToServer(data) {
        fetch('server.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).catch(err => console.error("Server error:", err));
    }


    async function displayLogs() {
        const localData = JSON.parse(localStorage.getItem('anim_logs') || '[]');
        
        // Отримуємо дані з Сервера
        let serverData = [];
        try {
            const response = await fetch('server.php?action=get');
            serverData = await response.json();
        } catch (e) {
            console.error("Failed to fetch server logs");
        }

        // Будуємо таблицю
        let html = `<h4>Звіт (подій: ${localData.length})</h4>`;
        html += `<table class="log-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Event</th>
                    <th>LS Time</th>
                    <th>Server Time</th>
                </tr>
            </thead>
            <tbody>`;

        // Виводимо останні 50 подій, щоб не забивати екран (бо їх тисячі)
        const limit = Math.min(localData.length, serverData.length);
        const start = Math.max(0, limit - 50);

        for (let i = start; i < limit; i++) {
            const l = localData[i];
            const s = serverData[i];
            
            const sTime = s ? s.serverTime : 'N/A';
            const sDesc = s ? s.desc : 'N/A';
            
            html += `<tr>
                <td>${l.id}</td>
                <td>${l.desc}</td>
                <td>${l.saveTimeLocal.split('T')[1].slice(0,12)}</td>
                <td>${sTime ? sTime.split(' ')[1] : '-'}</td>
                <td>-</td> 
            </tr>`;
        }
        html += `</tbody></table>`;
        html += `<p><em>Показано останні 50 записів. Загалом кроків: ${eventCounter}</em></p>`;

        logsTableContainer.innerHTML = html;
    }
});