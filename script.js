// Stan aplikacji
let timerInterval = null;
let startTime = null;
let elapsedTime = 0;
let sessions = JSON.parse(localStorage.getItem('sessions')) || [];
let projects = JSON.parse(localStorage.getItem('projects')) || [
    { id: 'client-a', name: 'Klient A - Strona WWW' },
    { id: 'client-b', name: 'Klient B - Aplikacja Mobile' },
    { id: 'client-c', name: 'Klient C - Konsultacje' },
    { id: 'internal', name: 'Projekt Wewnętrzny' }
];

// Elementy DOM
const timerDisplay = document.getElementById('timerDisplay');
const costDisplay = document.getElementById('costDisplay');
const projectSelect = document.getElementById('projectSelect');
const hourlyRate = document.getElementById('hourlyRate');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const resetBtn = document.getElementById('resetBtn');
const sessionNotes = document.getElementById('sessionNotes');
const historyList = document.getElementById('historyList');
const todayTotal = document.getElementById('todayTotal');
const todayEarnings = document.getElementById('todayEarnings');
const addProjectBtn = document.getElementById('addProjectBtn');
const projectModal = document.getElementById('projectModal');
const newProjectName = document.getElementById('newProjectName');
const cancelProjectBtn = document.getElementById('cancelProjectBtn');
const saveProjectBtn = document.getElementById('saveProjectBtn');

// Inicjalizacja
loadProjects();
renderHistory();
updateTodayStats();

// Event Listeners
startBtn.addEventListener('click', startTimer);
stopBtn.addEventListener('click', stopTimer);
resetBtn.addEventListener('click', resetTimer);
addProjectBtn.addEventListener('click', () => {
    projectModal.classList.add('show');
    newProjectName.focus();
});
cancelProjectBtn.addEventListener('click', () => {
    projectModal.classList.remove('show');
    newProjectName.value = '';
});
saveProjectBtn.addEventListener('click', saveNewProject);

// Funkcje timera
function startTimer() {
    if (!projectSelect.value) {
        alert('Wybierz projekt przed rozpoczęciem!');
        return;
    }

    startTime = Date.now() - elapsedTime;
    timerInterval = setInterval(updateTimer, 100);
    
    startBtn.disabled = true;
    stopBtn.disabled = false;
    projectSelect.disabled = true;
}

function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    
    saveSession();
    
    startBtn.disabled = false;
    stopBtn.disabled = true;
    projectSelect.disabled = false;
}

function resetTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    elapsedTime = 0;
    startTime = null;
    
    updateDisplay();
    
    startBtn.disabled = false;
    stopBtn.disabled = true;
    projectSelect.disabled = false;
    sessionNotes.value = '';
}

function updateTimer() {
    elapsedTime = Date.now() - startTime;
    updateDisplay();
}

function updateDisplay() {
    const hours = Math.floor(elapsedTime / 3600000);
    const minutes = Math.floor((elapsedTime % 3600000) / 60000);
    const seconds = Math.floor((elapsedTime % 60000) / 1000);
    
    timerDisplay.textContent = 
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    const hoursDecimal = elapsedTime / 3600000;
    const cost = hoursDecimal * parseFloat(hourlyRate.value);
    costDisplay.textContent = cost.toFixed(2);
}

function saveSession() {
    const session = {
        id: Date.now(),
        project: projectSelect.value,
        projectName: projectSelect.options[projectSelect.selectedIndex].text,
        duration: elapsedTime,
        cost: (elapsedTime / 3600000) * parseFloat(hourlyRate.value),
        rate: parseFloat(hourlyRate.value),
        notes: sessionNotes.value,
        date: new Date().toISOString()
    };
    
    sessions.unshift(session);
    localStorage.setItem('sessions', JSON.stringify(sessions));
    
    renderHistory();
    updateTodayStats();
    resetTimer();
}

function renderHistory() {
    if (sessions.length === 0) {
        historyList.innerHTML = '<div class="empty-history">Brak zapisanych sesji</div>';
        return;
    }
    
    historyList.innerHTML = sessions.map(session => {
        const hours = Math.floor(session.duration / 3600000);
        const minutes = Math.floor((session.duration % 3600000) / 60000);
        const date = new Date(session.date);
        
        return `
            <div class="history-item">
                <div class="history-item-info">
                    <div class="history-item-project">${session.projectName}</div>
                    <div class="history-item-time">
                        ${date.toLocaleDateString('pl-PL')} ${date.toLocaleTimeString('pl-PL')} • 
                        ${hours}h ${minutes}m • ${session.rate} PLN/h
                    </div>
                    ${session.notes ? `<div class="history-item-notes">${session.notes}</div>` : ''}
                </div>
                <div class="history-item-cost">${session.cost.toFixed(2)} PLN</div>
                <button class="history-item-delete" onclick="deleteSession(${session.id})">🗑️</button>
            </div>
        `;
    }).join('');
}

function updateTodayStats() {
    const today = new Date().toDateString();
    const todaySessions = sessions.filter(s => new Date(s.date).toDateString() === today);
    
    const totalTime = todaySessions.reduce((sum, s) => sum + s.duration, 0);
    const totalEarnings = todaySessions.reduce((sum, s) => sum + s.cost, 0);
    
    const hours = Math.floor(totalTime / 3600000);
    const minutes = Math.floor((totalTime % 3600000) / 60000);
    
    todayTotal.textContent = `${hours}h ${minutes}m`;
    todayEarnings.textContent = `${totalEarnings.toFixed(2)} PLN`;
}

function deleteSession(id) {
    if (confirm('Czy na pewno chcesz usunąć tę sesję?')) {
        sessions = sessions.filter(s => s.id !== id);
        localStorage.setItem('sessions', JSON.stringify(sessions));
        renderHistory();
        updateTodayStats();
    }
}

function loadProjects() {
    projectSelect.innerHTML = '<option value="">Wybierz projekt...</option>';
    projects.forEach(project => {
        const option = document.createElement('option');
        option.value = project.id;
        option.textContent = project.name;
        projectSelect.appendChild(option);
    });
}

function saveNewProject() {
    const name = newProjectName.value.trim();
    if (!name) {
        alert('Podaj nazwę projektu!');
        return;
    }
    
    const project = {
        id: 'project-' + Date.now(),
        name: name
    };
    
    projects.push(project);
    localStorage.setItem('projects', JSON.stringify(projects));
    
    loadProjects();
    projectSelect.value = project.id;
    
    projectModal.classList.remove('show');
    newProjectName.value = '';
}

window.deleteSession = deleteSession;
