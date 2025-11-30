// Import Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Konfiguracja Firebase
const firebaseConfig = {
    apiKey: "AIzaSyChcctklohpqhqxl-tF7EJl47TTQ7b-oLA",
    authDomain: "instagenius-9f123.firebaseapp.com",
    projectId: "instagenius-9f123",
    storageBucket: "instagenius-9f123.firebasestorage.app",
    messagingSenderId: "572031758226",
    appId: "1:572031758226:web:7f40d1b1ac9254b221db4b"
};

// Inicjalizacja Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Stan aplikacji
let timerInterval = null;
let startTime = null;
let elapsedTime = 0;
let sessions = [];
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
loadSessions();

// Ładowanie sesji z Firebase
async function loadSessions() {
    try {
        const q = query(collection(db, 'sessions'), orderBy('date', 'desc'));
        const querySnapshot = await getDocs(q);
        sessions = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        renderHistory();
        updateTodayStats();
    } catch (error) {
        console.error('Błąd ładowania sesji:', error);
        // Fallback do localStorage
        sessions = JSON.parse(localStorage.getItem('sessions')) || [];
        renderHistory();
        updateTodayStats();
    }
}

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

async function saveSession() {
    const sessionData = {
        project: projectSelect.value,
        projectName: projectSelect.options[projectSelect.selectedIndex].text,
        duration: elapsedTime,
        cost: (elapsedTime / 3600000) * parseFloat(hourlyRate.value),
        rate: parseFloat(hourlyRate.value),
        notes: sessionNotes.value,
        date: new Date().toISOString()
    };
    
    try {
        // Zapisz do Firebase
        const docRef = await addDoc(collection(db, 'sessions'), sessionData);
        
        // Dodaj do lokalnej tablicy
        sessions.unshift({
            id: docRef.id,
            ...sessionData
        });
        
        // Backup do localStorage
        localStorage.setItem('sessions', JSON.stringify(sessions));
        
        showNotification('✅ Sesja zapisana!');
    } catch (error) {
        console.error('Błąd zapisywania:', error);
        
        // Fallback do localStorage
        const session = {
            id: Date.now().toString(),
            ...sessionData
        };
        sessions.unshift(session);
        localStorage.setItem('sessions', JSON.stringify(sessions));
        
        showNotification('⚠️ Zapisano lokalnie');
    }
    
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

async function deleteSession(id) {
    if (!confirm('Czy na pewno chcesz usunąć tę sesję?')) return;
    
    try {
        // Usuń z Firebase
        await deleteDoc(doc(db, 'sessions', id));
        
        // Usuń z lokalnej tablicy
        sessions = sessions.filter(s => s.id !== id);
        localStorage.setItem('sessions', JSON.stringify(sessions));
        
        renderHistory();
        updateTodayStats();
        
        showNotification('🗑️ Sesja usunięta');
    } catch (error) {
        console.error('Błąd usuwania:', error);
        
        // Fallback - usuń lokalnie
        sessions = sessions.filter(s => s.id !== id);
        localStorage.setItem('sessions', JSON.stringify(sessions));
        
        renderHistory();
        updateTodayStats();
        
        showNotification('⚠️ Usunięto lokalnie');
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

// Powiadomienia
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

window.deleteSession = deleteSession;
