// Equipos específicos solicitados
const fifaTeams = [
    { name: 'PSG', logo: 'PSG', color: '#004170' },
    { name: 'Real Madrid', logo: 'RMA', color: '#ffffff' },
    { name: 'Barcelona', logo: 'BAR', color: '#a50044' },
    { name: 'Liverpool', logo: 'LIV', color: '#c8102e' },
    { name: 'Al Hilal', logo: 'HIL', color: '#0066cc' },
    { name: 'Al Nassr', logo: 'NAS', color: '#ffff00' },
    { name: 'Bayern Múnich', logo: 'BAY', color: '#dc052d' },
    { name: 'Milan', logo: 'MIL', color: '#fb090b' },
    { name: 'Inter', logo: 'INT', color: '#0f1419' },
    { name: 'Boca Juniors', logo: 'BOC', color: '#005aab' }
];

// Variables globales
let tournaments = JSON.parse(localStorage.getItem('tournaments')) || {};
let currentTournament = '';

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', function() {
    loadTournamentSelector();
});

// Crear nuevo torneo
function createTournament() {
    const tournamentName = document.getElementById('tournamentName').value.trim();
    
    if (!tournamentName) {
        showAlert('Por favor ingresa un nombre para el torneo', 'error');
        return;
    }
    
    if (tournaments[tournamentName]) {
        showAlert('Ya existe un torneo con ese nombre', 'error');
        return;
    }
    
    tournaments[tournamentName] = {
        name: tournamentName,
        players: [],
        assignments: {},
        bracket: null,
        tournamentType: '',
        createdAt: new Date().toISOString()
    };
    
    localStorage.setItem('tournaments', JSON.stringify(tournaments));
    document.getElementById('tournamentName').value = '';
    
    loadTournamentSelector();
    showAlert('Torneo creado exitosamente', 'success');
}

// Cargar selector de torneos
function loadTournamentSelector() {
    const select = document.getElementById('tournamentSelect');
    select.innerHTML = '<option value="">Selecciona un torneo</option>';
    
    Object.keys(tournaments).forEach(tournamentName => {
        const option = document.createElement('option');
        option.value = tournamentName;
        option.textContent = tournamentName;
        select.appendChild(option);
    });
}

// Cargar torneo seleccionado
function loadTournament() {
    const selectedTournament = document.getElementById('tournamentSelect').value;
    
    if (!selectedTournament) {
        hideAllSections();
        return;
    }
    
    currentTournament = selectedTournament;
    showAllSections();
    renderPlayers();
    renderAssignments();
    renderBracket();
    updateGenerateButton();
}

// Mostrar/ocultar secciones
function showAllSections() {
    document.getElementById('playersSection').style.display = 'block';
    document.getElementById('assignmentsSection').style.display = 'block';
    
    const tournament = tournaments[currentTournament];
    if (tournament.bracket) {
        document.getElementById('bracketSection').style.display = 'block';
    }
}

function hideAllSections() {
    document.getElementById('playersSection').style.display = 'none';
    document.getElementById('assignmentsSection').style.display = 'none';
    document.getElementById('bracketSection').style.display = 'none';
}

// Agregar jugador
function addPlayer() {
    const playerName = document.getElementById('playerName').value.trim();
    
    if (!playerName) {
        showAlert('Por favor ingresa un nombre de jugador', 'error');
        return;
    }
    
    if (!currentTournament) {
        showAlert('Selecciona un torneo primero', 'error');
        return;
    }
    
    const tournament = tournaments[currentTournament];
    
    if (tournament.players.includes(playerName)) {
        showAlert('Este jugador ya está en el torneo', 'error');
        return;
    }
    
    if (tournament.players.length >= 10) {
        showAlert('Máximo 10 jugadores por torneo', 'error');
        return;
    }
    
    tournament.players.push(playerName);
    localStorage.setItem('tournaments', JSON.stringify(tournaments));
    document.getElementById('playerName').value = '';
    
    renderPlayers();
    updateGenerateButton();
    showAlert(`${playerName} agregado al torneo`, 'success');
}

// Remover jugador
function removePlayer(playerName) {
    if (!currentTournament) return;
    
    const tournament = tournaments[currentTournament];
    const index = tournament.players.indexOf(playerName);
    
    if (index > -1) {
        tournament.players.splice(index, 1);
        delete tournament.assignments[playerName];
        tournament.bracket = null;
        localStorage.setItem('tournaments', JSON.stringify(tournaments));
        
        renderPlayers();
        renderAssignments();
        updateGenerateButton();
        document.getElementById('bracketSection').style.display = 'none';
        showAlert(`${playerName} removido del torneo`, 'success');
    }
}

// Renderizar jugadores
function renderPlayers() {
    const playersList = document.getElementById('playersList');
    
    if (!currentTournament) {
        playersList.innerHTML = '';
        return;
    }
    
    const tournament = tournaments[currentTournament];
    
    if (tournament.players.length === 0) {
        playersList.innerHTML = '<p>No hay jugadores en este torneo.</p>';
        return;
    }
    
    playersList.innerHTML = `
        <div class="stats">
            <div class="stat-item">
                <span class="stat-number">${tournament.players.length}</span>
                <span class="stat-label">Jugadores</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">${10 - tournament.players.length}</span>
                <span class="stat-label">Disponibles</span>
            </div>
        </div>
        <div class="players-list">
            ${tournament.players.map(player => `
                <div class="player-item">
                    <span class="player-name">👤 ${player}</span>
                    <button class="remove-btn" onclick="removePlayer('${player}')">✕</button>
                </div>
            `).join('')}
        </div>
    `;
}

// Actualizar botón de generar
function updateGenerateButton() {
    const generateBtn = document.getElementById('generateBtn');
    
    if (!currentTournament) {
        generateBtn.disabled = true;
        return;
    }
    
    const tournament = tournaments[currentTournament];
    const canGenerate = tournament.players.length >= 2 && tournament.players.length <= 10;
    
    generateBtn.disabled = !canGenerate;
    
    if (tournament.players.length < 2) {
        generateBtn.textContent = 'Necesitas al menos 2 jugadores';
    } else if (tournament.players.length > 10) {
        generateBtn.textContent = 'Máximo 10 jugadores';
    } else {
        generateBtn.textContent = `Generar Torneo (${tournament.players.length} jugadores)`;
    }
}

// Generar torneo completo
function generateTournament() {
    if (!currentTournament) return;
    
    const tournament = tournaments[currentTournament];
    
    // Asignar equipos aleatoriamente
    const shuffledTeams = [...fifaTeams].sort(() => Math.random() - 0.5);
    tournament.assignments = {};
    
    tournament.players.forEach((player, index) => {
        tournament.assignments[player] = {
            player: player,
            team: shuffledTeams[index],
            assignedAt: new Date().toISOString()
        };
    });
    
    // Generar bracket según cantidad de jugadores
    tournament.bracket = generateBracket(tournament.players.length);
    tournament.tournamentType = getTournamentType(tournament.players.length);
    
    localStorage.setItem('tournaments', JSON.stringify(tournaments));
    
    renderAssignments();
    renderBracket();
    document.getElementById('bracketSection').style.display = 'block';
    showAlert('Torneo generado exitosamente', 'success');
}

// Determinar tipo de torneo
function getTournamentType(playerCount) {
    if (playerCount === 2) return 'Final Directa';
    if (playerCount <= 4) return 'Semifinales';
    if (playerCount <= 8) return 'Cuartos de Final';
    return 'Octavos de Final';
}

// Generar bracket
function generateBracket(playerCount) {
    const tournament = tournaments[currentTournament];
    const players = [...tournament.players].sort(() => Math.random() - 0.5);
    
    let bracket = {
        rounds: [],
        currentRound: 0
    };
    
    // Calcular número de rondas necesarias
    const rounds = Math.ceil(Math.log2(playerCount));
    
    // Primera ronda
    const firstRound = {
        name: getPhaseNameByParticipants(playerCount),
        matches: []
    };
    
    // Si el número no es potencia de 2, algunos jugadores pasan automáticamente
    const nextPowerOf2 = Math.pow(2, rounds);
    const byes = nextPowerOf2 - playerCount;
    
    let matchId = 1;
    let playerIndex = 0;
    
    // Crear matches de la primera ronda
    for (let i = 0; i < playerCount / 2; i++) {
        if (playerIndex < players.length - byes) {
            // Match normal
            firstRound.matches.push({
                id: matchId++,
                player1: players[playerIndex++],
                player2: players[playerIndex++],
                winner: null,
                type: 'normal'
            });
        }
    }
    
    // Agregar byes si es necesario
    while (playerIndex < players.length) {
        firstRound.matches.push({
            id: matchId++,
            player1: players[playerIndex++],
            player2: 'BYE',
            winner: null,
            type: 'bye'
        });
    }
    
    bracket.rounds.push(firstRound);
    
    // Generar rondas siguientes
    let currentParticipants = Math.ceil(playerCount / 2);
    
    while (currentParticipants > 1) {
        const round = {
            name: getPhaseNameByParticipants(currentParticipants * 2),
            matches: []
        };
        
        for (let i = 0; i < currentParticipants / 2; i++) {
            round.matches.push({
                id: matchId++,
                player1: 'TBD',
                player2: 'TBD',
                winner: null,
                type: 'normal'
            });
        }
        
        bracket.rounds.push(round);
        currentParticipants = Math.ceil(currentParticipants / 2);
    }
    
    return bracket;
}

// Obtener nombre de fase por número de participantes
function getPhaseNameByParticipants(participants) {
    switch (participants) {
        case 2: return 'Final';
        case 4: return 'Semifinal';
        case 8: return 'Cuartos de Final';
        case 16: return 'Octavos de Final';
        default: return `Ronda de ${participants}`;
    }
}

// Renderizar asignaciones
function renderAssignments() {
    const assignmentsList = document.getElementById('assignmentsList');
    
    if (!currentTournament) {
        assignmentsList.innerHTML = '';
        return;
    }
    
    const tournament = tournaments[currentTournament];
    const assignments = Object.values(tournament.assignments);
    
    if (assignments.length === 0) {
        assignmentsList.innerHTML = '<p>No hay asignaciones todavía. Genera el torneo para asignar equipos.</p>';
        return;
    }
    
    assignmentsList.innerHTML = assignments.map(assignment => `
        <div class="assignment-item">
            <div class="player-info">
                <span class="player-name">👤 ${assignment.player}</span>
            </div>
            <div class="team-info">
                <div class="team-logo">${assignment.team.logo}</div>
                <span class="team-name-small">${assignment.team.name}</span>
            </div>
        </div>
    `).join('');
}

// Renderizar bracket
function renderBracket() {
    const bracketContainer = document.getElementById('bracketContainer');
    const tournamentType = document.getElementById('tournamentType');
    
    if (!currentTournament) {
        bracketContainer.innerHTML = '';
        return;
    }
    
    const tournament = tournaments[currentTournament];
    
    if (!tournament.bracket) {
        bracketContainer.innerHTML = '<p>Genera el torneo para ver los cruces.</p>';
        return;
    }
    
    tournamentType.textContent = `Formato: ${tournament.tournamentType}`;
    
    const bracket = tournament.bracket;
    
    bracketContainer.innerHTML = `
        <div class="bracket-container">
            <div class="bracket">
                ${bracket.rounds.map((round, roundIndex) => `
                    <div class="bracket-round">
                        <h3>${round.name}</h3>
                        ${round.matches.map(match => `
                            <div class="match ${round.name === 'Final' ? 'finals-match' : ''}">
                                <div class="match-participant ${match.type === 'bye' ? 'bye' : ''}">
                                    <div class="participant-logo">${getPlayerTeamLogo(match.player1)}</div>
                                    <div class="participant-name">${match.player1}</div>
                                </div>
                                <div class="match-vs">VS</div>
                                <div class="match-participant ${match.type === 'bye' ? 'bye' : ''}">
                                    <div class="participant-logo">${getPlayerTeamLogo(match.player2)}</div>
                                    <div class="participant-name">${match.player2}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Obtener logo del equipo del jugador
function getPlayerTeamLogo(playerName) {
    if (!currentTournament || playerName === 'TBD' || playerName === 'BYE') {
        return playerName === 'BYE' ? 'BYE' : '?';
    }
    
    const tournament = tournaments[currentTournament];
    const assignment = tournament.assignments[playerName];
    
    return assignment ? assignment.team.logo : '?';
}

// Reiniciar torneo
function resetTournament() {
    if (!currentTournament) return;
    
    if (confirm('¿Estás seguro de que quieres reiniciar el torneo? Se perderán todas las asignaciones y cruces.')) {
        tournaments[currentTournament].assignments = {};
        tournaments[currentTournament].bracket = null;
        tournaments[currentTournament].tournamentType = '';
        
        localStorage.setItem('tournaments', JSON.stringify(tournaments));
        
        renderAssignments();
        renderBracket();
        document.getElementById('bracketSection').style.display = 'none';
        showAlert('Torneo reiniciado', 'success');
    }
}

// Mostrar alertas
function showAlert(message, type) {
    const existingAlerts = document.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());
    
    const alert = document.createElement('div');
    alert.className = `alert ${type}`;
    alert.textContent = message;
    
    document.querySelector('.container').insertBefore(alert, document.querySelector('main'));
    
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

// Event listeners
document.getElementById('playerName').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addPlayer();
    }
});

document.getElementById('tournamentName').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        createTournament();
    }
});