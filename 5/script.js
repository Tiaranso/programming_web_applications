// Завдання 1: Поміняти місцями контент блоків 4 та 5
function swapBlocks() {
    const block4 = document.querySelector('.right .first');
    const block5 = document.querySelector('.right .second');
    
    if (block4 && block5) {
        const tempContent = block4.innerHTML;
        block4.innerHTML = block5.innerHTML;
        block5.innerHTML = tempContent;
    }
}

// Завдання 2: Обчислення площі трикутника
function calculateTriangleArea() {
    // Змінні для обчислення площі трикутника (за формулою Герона або base*height/2)
    const base = 10;
    const height = 8;
    
    const area = (base * height) / 2;
    
    const centerBlock = document.querySelector('.center');
    if (centerBlock) {
        const resultDiv = document.createElement('div');
        resultDiv.className = 'highlight';
        resultDiv.style.marginTop = '20px';
        resultDiv.innerHTML = `Площа трикутника: ${area} кв. од. (основа=${base}, висота=${height})`;
        centerBlock.appendChild(resultDiv);
    }
}

// Завдання 3: Визначення кількості мінімальних чисел
function createNumberForm() {
    const centerBlock = document.querySelector('.center');
    if (!centerBlock) return;
    
    const formDiv = document.createElement('div');
    formDiv.className = 'highlight';
    formDiv.style.marginTop = '20px';
    formDiv.id = 'numberForm';
    
    let formHTML = '<h3>Введіть 10 чисел:</h3>';
    for (let i = 1; i <= 10; i++) {
        formHTML += `<input type="number" id="num${i}" placeholder="Число ${i}" style="margin: 5px; padding: 5px; width: 100px;"><br>`;
    }
    formHTML += '<button onclick="processNumbers()" style="margin-top: 10px; padding: 10px 20px; background: #d32f2f; color: white; border: none; cursor: pointer; border-radius: 5px;">Обчислити</button>';
    
    formDiv.innerHTML = formHTML;
    centerBlock.appendChild(formDiv);
}

function processNumbers() {
    const numbers = [];
    for (let i = 1; i <= 10; i++) {
        const value = parseFloat(document.getElementById(`num${i}`).value);
        if (!isNaN(value)) {
            numbers.push(value);
        }
    }
    
    if (numbers.length !== 10) {
        alert('Будь ласка, введіть всі 10 чисел!');
        return;
    }
    
    const minValue = Math.min(...numbers);
    const minCount = numbers.filter(num => num === minValue).length;
    
    const result = `Мінімальне значення: ${minValue}, Кількість мінімальних чисел: ${minCount}`;
    
    // Зберігаємо в cookies
    document.cookie = `minNumbers=${encodeURIComponent(result)}; path=/; max-age=3600`;
    
    alert(result);
}

function checkCookies() {
    const cookies = document.cookie.split('; ');
    const minNumbersCookie = cookies.find(row => row.startsWith('minNumbers='));
    
    if (minNumbersCookie) {
        const value = decodeURIComponent(minNumbersCookie.split('=')[1]);
        
        if (confirm(`Збережені дані: ${value}\n\nНатисніть OK для видалення cookies`)) {
            document.cookie = 'minNumbers=; path=/; max-age=0';
            alert('Cookies видалено! Натисніть OK для перезавантаження сторінки.');
            location.reload();
        }
        
        return true;
    }
    
    return false;
}

// Завдання 4: Зміна кольору тексту блоку 3 з localStorage
function initColorChange() {
    const centerBlock = document.querySelector('.center');
    if (!centerBlock) return;
    
    // Завантажуємо збережений колір
    const savedColor = localStorage.getItem('centerBlockColor');
    if (savedColor) {
        centerBlock.style.color = savedColor;
    }
    
    // Питаємо користувача про колір
    const userColor = prompt('Введіть колір тексту для центрального блоку (наприклад: red, blue, #FF0000):', savedColor || '#000000');
    
    if (userColor) {
        centerBlock.style.color = userColor;
        localStorage.setItem('centerBlockColor', userColor);
    }
}

// Завдання 5: Створення ненумерованого списку
function initListCreation() {
    const blocks = [
        document.querySelector('header'),
        document.querySelector('.left'),
        document.querySelector('.center'),
        document.querySelector('.right .first'),
        document.querySelector('.right .second'),
        document.querySelector('footer')
    ];
    
    blocks.forEach((block, index) => {
        if (!block) return;
        
        const blockId = `block${index + 1}`;
        block.setAttribute('data-block-id', blockId);
        
        // Завантажуємо збережений список
        loadListFromStorage(block, blockId);
        
        block.addEventListener('dblclick', function(e) {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') return;
            
            // Перевіряємо, чи вже є форма
            if (block.querySelector('.list-creator-form')) return;
            
            createListForm(block, blockId);
        });
    });
}

function createListForm(block, blockId) {
    const formDiv = document.createElement('div');
    formDiv.className = 'list-creator-form';
    formDiv.style.cssText = 'background: rgba(255,255,255,0.9); padding: 15px; margin: 10px 0; border-radius: 5px; color: #000;';
    
    formDiv.innerHTML = `
        <h4 style="margin-top: 0;">Створити список</h4>
        <div id="listItems${blockId}">
            <input type="text" class="list-item-input" placeholder="Пункт 1" style="margin: 5px 0; padding: 8px; width: 100%; box-sizing: border-box;">
        </div>
        <button onclick="addListItem('${blockId}')" style="margin: 5px 5px 5px 0; padding: 8px 15px; background: #388e3c; color: white; border: none; cursor: pointer; border-radius: 3px;">Додати пункт</button>
        <button onclick="saveList('${blockId}')" style="margin: 5px; padding: 8px 15px; background: #d32f2f; color: white; border: none; cursor: pointer; border-radius: 3px;">Зберегти список</button>
        <button onclick="cancelListCreation('${blockId}')" style="margin: 5px; padding: 8px 15px; background: #757575; color: white; border: none; cursor: pointer; border-radius: 3px;">Скасувати</button>
    `;
    
    block.appendChild(formDiv);
}

function addListItem(blockId) {
    const container = document.getElementById(`listItems${blockId}`);
    const currentCount = container.querySelectorAll('.list-item-input').length;
    
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'list-item-input';
    input.placeholder = `Пункт ${currentCount + 1}`;
    input.style.cssText = 'margin: 5px 0; padding: 8px; width: 100%; box-sizing: border-box;';
    
    container.appendChild(input);
}

function saveList(blockId) {
    const block = document.querySelector(`[data-block-id="${blockId}"]`);
    const inputs = document.querySelectorAll(`#listItems${blockId} .list-item-input`);
    
    const items = [];
    inputs.forEach(input => {
        if (input.value.trim()) {
            items.push(input.value.trim());
        }
    });
    
    if (items.length === 0) {
        alert('Додайте хоча б один пункт!');
        return;
    }
    
    // Зберігаємо оригінальний контент перед заміною
    const originalContent = block.getAttribute('data-original-content') || block.innerHTML;
    if (!block.getAttribute('data-original-content')) {
        block.setAttribute('data-original-content', originalContent);
    }
    
    // Зберігаємо в localStorage
    const listData = {
        items: items,
        originalContent: originalContent
    };
    localStorage.setItem(`list_${blockId}`, JSON.stringify(listData));
    
    // Створюємо список
    const ul = document.createElement('ul');
    ul.style.cssText = 'background: rgba(255,255,255,0.1); padding: 15px; border-radius: 5px;';
    items.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        li.style.margin = '8px 0';
        ul.appendChild(li);
    });
    
    block.innerHTML = '';
    block.appendChild(ul);
}

function cancelListCreation(blockId) {
    const block = document.querySelector(`[data-block-id="${blockId}"]`);
    const form = block.querySelector('.list-creator-form');
    if (form) {
        form.remove();
    }
}

function loadListFromStorage(block, blockId) {
    const savedData = localStorage.getItem(`list_${blockId}`);
    
    if (savedData) {
        const listData = JSON.parse(savedData);
        
        const ul = document.createElement('ul');
        ul.style.cssText = 'background: rgba(255,255,255,0.1); padding: 15px; border-radius: 5px;';
        listData.items.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            li.style.margin = '8px 0';
            ul.appendChild(li);
        });
        
        block.innerHTML = '';
        block.appendChild(ul);
    }
}

function clearListsOnUnload() {
    // Видаляємо всі списки з localStorage при перезавантаженні
    for (let i = 1; i <= 6; i++) {
        localStorage.removeItem(`list_block${i}`);
    }
}

// Ініціалізація при завантаженні сторінки
window.addEventListener('load', function() {
    // Завдання 1
    swapBlocks();
    
    // Завдання 2
    calculateTriangleArea();
    
    // Завдання 3
    if (!checkCookies()) {
        createNumberForm();
    }
    
    // Завдання 4
    initColorChange();
    
    // Завдання 5
    initListCreation();
});

// Видалення списків при перезавантаженні
window.addEventListener('beforeunload', clearListsOnUnload);
