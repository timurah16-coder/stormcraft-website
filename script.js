// Mobile Navigation
const burger = document.querySelector('.burger');
const nav = document.querySelector('.nav-links');
const navLinks = document.querySelectorAll('.nav-links li');

burger.addEventListener('click', () => {
    nav.classList.toggle('active');
    
    // Burger Animation
    burger.classList.toggle('toggle');
});

// Close mobile menu when clicking on a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        nav.classList.remove('active');
    });
});

// Copy IP to Clipboard
function copyIP() {
    const ip = document.getElementById('server-ip').innerText;
    navigator.clipboard.writeText(ip).then(() => {
        const message = document.getElementById('copy-message');
        message.classList.add('show');
        setTimeout(() => {
            message.classList.remove('show');
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = ip;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        const message = document.getElementById('copy-message');
        message.classList.add('show');
        setTimeout(() => {
            message.classList.remove('show');
        }, 2000);
    });
}

// Fetch Server Status - Multiple API fallback
async function fetchServerStatus() {
    const serverIP = 'mc.storm-craft.ru';
    const serverPort = 30013;
    
    // API endpoints (пробуем по очереди)

    const apis = [
        `https://api.mcsrvstat.us/2/${serverIP}:${serverPort}`,
        `https://api.mcnstatus.ru/server/${serverIP}:${serverPort}`,
        `https://mcapi.ca/data/${serverIP}:${serverPort}`
    ];
    
    for (const api of apis) {
        try {
            const response = await fetch(api, { 
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) continue;
            
            const data = await response.json();
            
            // Разные форматы ответов от разных API
            let onlinePlayers = 0;
            let maxPlayers = 100;
            let isOnline = false;
            
            if (data.players && typeof data.players.online === 'number') {
                // mcsrvstat.us формат
                onlinePlayers = data.players.online;
                maxPlayers = data.players.max || 100;
                isOnline = data.online || false;
            } else if (data.currentPlayers && typeof data.currentPlayers === 'number') {
                // mcnstatus.ru формат
                onlinePlayers = data.currentPlayers;
                maxPlayers = data.maxPlayers || 100;
                isOnline = data.online || false;
            } else if (data.players && typeof data.players === 'number') {
                // mcapi.ca формат
                onlinePlayers = data.players;
                maxPlayers = data.max_players || 100;
                isOnline = true;
            }
            
            if (isOnline || onlinePlayers > 0) {
                updatePlayerCount(onlinePlayers, maxPlayers);
                return;
            }
        } catch (error) {
            console.warn(`API failed: ${api}`, error);
            // Пробуем следующий API
            continue;
        }
    }
    
    // Если все API не сработали - показываем 0
    console.log('All APIs failed, showing offline status');
    updatePlayerCount(0, 100);
}

function updatePlayerCount(online, max) {
    const playerCountElements = document.querySelectorAll('#player-count, #online-players');
    playerCountElements.forEach(el => {
        if (el) el.innerText = online;
    });
    
    // Обновляем статус
    const statusText = document.getElementById('status-text');
    if (statusText) {
        statusText.innerHTML = `Онлайн: <span id="player-count">${online}</span>/${max}`;
    }
    
    console.log(`%c✅ Server Status: ${online}/${max} players`, 'color: #22c55e; font-weight: bold;');
}

// Update server status every 30 seconds
fetchServerStatus();
setInterval(fetchServerStatus, 30000);

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add scroll effect to navbar
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.3)';
    } else {
        navbar.style.boxShadow = 'none';
    }
    
    lastScroll = currentScroll;
});

// Animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all feature cards and steps
document.querySelectorAll('.feature-card, .step, .stat-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    observer.observe(el);
});

// Console easter egg
console.log('%c⚡ StormCraft Server', 'color: #4ade80; font-size: 24px; font-weight: bold;');
console.log('%cПрисоединяйся: mc.storm-craft.ru', 'color: #3b82f6; font-size: 14px;');