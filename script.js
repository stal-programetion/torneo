// Equipos específicos
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
let currentMatchFilter = 'all';

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', function() {
    loadTournamentSelector();
});

// Crear nueva liga
function createTournament() {
    const tournamentName = document.getElementById('tournamentName').value.trim();
    
    if (!tournamentName) {
        showAlert('Por favor ingresa un nombre para la liga', 'error');
        return;
    }
    
    if (tournaments[tournamentName]) {
        showAlert('Ya existe una liga con ese nombre', 'error');
        return;
    }
    
    tournaments[tournamentName] = {
        name: tournamentName,
        players: [],
        assignments: {},
        matches: [],
        standings: {},
        createdAt: new Date().toISOString()
    };
    
    localStorage.setItem('tournaments', JSON.stringify(tournaments));
    document.getElementById('tournamentName').value = '';
    
    loadTournamentSelector();
    showAlert('Liga creada exitosamente', 'success');
}

// Cargar selector de torneos
function loadTournamentSelector() {
    const select = document.getElementById('tournamentSelect');
    select.innerHTML = '<option value="">Selecciona una liga</option>';
    
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
    renderStandings();
    renderMatches();
    updateGenerateButton();
}

// Mostrar/ocultar secciones
function showAllSections() {
    document.getElementById('playersSection').style.display = 'block';
    document.getElementById('assignmentsSection').style.display = 'block';
    
    const tournament = tournaments[currentTournament];
    if (tournament.matches.length > 0) {
        document.getElementById('standingsSection').style.display = 'block';
        document.getElementById('matchesSection').style.display = 'block';
    }
}

function hideAllSections() {
    document.getElementById('playersSection').style.display = 'none';
    document.getElementById('assignmentsSection').style.display = 'none';
    document.getElementById('standingsSection').style.display = 'none';
    document.getElementById('matchesSection').style.display = 'none';
}

// Agregar jugador
function addPlayer() {
    const playerName = document.getElementById('playerName').value.trim();
    
    if (!playerName) {
        showAlert('Por favor ingresa un nombre de jugador', 'error');
        return;
    }
    
    if (!currentTournament) {
        showAlert('Selecciona una liga primero', 'error');
        return;
    }
    
    const tournament = tournaments[currentTournament];
    
    if (tournament.players.includes(playerName)) {
        showAlert('Este jugador ya está en la liga', 'error');
        return;
    }
    
    if (tournament.players.length >= 10) {
        showAlert('Máximo 10 jugadores por liga', 'error');
        return;
    }
    
    tournament.players.push(playerName);
    localStorage.setItem('tournaments', JSON.stringify(tournaments));
    document.getElementById('playerName').value = '';
    
    renderPlayers();
    updateGenerateButton();
    showAlert(`${playerName} agregado a la liga`, 'success');
}

// Remover jugador
function removePlayer(playerName) {
    if (!currentTournament) return;
    
    const tournament = tournaments[currentTournament];
    const index = tournament.players.indexOf(playerName);
    
    if (index > -1) {
        tournament.players.splice(index, 1);
        delete tournament.assignments[playerName];
        delete tournament.standings[playerName];
        tournament.matches = [];
        
        localStorage.setItem('tournaments', JSON.stringify(tournaments));
        
        renderPlayers();
        renderAssignments();
        renderStandings();
        renderMatches();
        updateGenerateButton();
        document.getElementById('standingsSection').style.display = 'none';
        document.getElementById('matchesSection').style.display = 'none';
        showAlert(`${playerName} removido de la liga`, 'success');
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
        playersList.innerHTML = '<p>No hay jugadores en esta liga.</p>';
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
        generateBtn.textContent = `Generar Liga (${tournament.players.length} jugadores)`;
    }
}

// Generar liga completa
function generateLeague() {
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
    
    // Generar todos los partidos (todos contra todos)
    tournament.matches = generateAllMatches(tournament.players);
    
    // Inicializar tabla de posiciones
    initializeStandings(tournament);
    
    localStorage.setItem('tournaments', JSON.stringify(tournaments));
    
    renderAssignments();
    renderStandings();
    renderMatches();
    document.getElementById('standingsSection').style.display = 'block';
    document.getElementById('matchesSection').style.display = 'block';
    showAlert('Liga generada exitosamente', 'success');
}

// Generar todos los partidos
function generateAllMatches(players) {
    const matches = [];
    let matchId = 1;
    
    for (let i = 0; i < players.length; i++) {
        for (let j = i + 1; j < players.length; j++) {
            matches.push({
                id: matchId++,
                player1: players[i],
                player2: players[j],
                score1: null,
                score2: null,
                completed: false,
                createdAt: new Date().toISOString()
            });
        }
    }
    
    return matches;
}

// Inicializar tabla de posiciones
function initializeStandings(tournament) {
    tournament.standings = {};
    
    tournament.players.forEach(player => {
        tournament.standings[player] = {
            player: player,
            points: 0,
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            goalDifference: 0
        };
    });
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
        assignmentsList.innerHTML = '<p>No hay asignaciones todavía. Genera la liga para asignar equipos.</p>';
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

// Renderizar tabla de posiciones
function renderStandings() {
    const standingsTable = document.getElementById('standingsTable');
    
    if (!currentTournament) {
        standingsTable.innerHTML = '';
        return;
    }
    
    const tournament = tournaments[currentTournament];
    const standings = Object.values(tournament.standings);
    
    if (standings.length === 0) {
        standingsTable.innerHTML = '<p>Genera la liga para ver la tabla de posiciones.</p>';
        return;
    }
    
    // Ordenar por puntos, luego por diferencia de goles
    standings.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
        return b.goalsFor - a.goalsFor;
    });
    
    standingsTable.innerHTML = `
        <div class="standings-table">
            <table>
                <thead>
                    <tr>
                        <th>Pos</th>
                        <th>Jugador</th>
                        <th>Equipo</th>
                        <th>PJ</th>
                        <th>PG</th>
                        <th>PE</th>
                        <th>PP</th>
                        <th>GF</th>
                        <th>GC</th>
                        <th>DG</th>
                        <th>Pts</th>
                    </tr>
                </thead>
                <tbody>
                    ${standings.map((standing, index) => `
                        <tr>
                            <td class="position">${index + 1}</td>
                            <td class="team-cell">
                                <span>👤 ${standing.player}</span>
                            </td>
                            <td class="team-cell">
                                <div class="team-logo-small">${getPlayerTeamLogo(standing.player)}</div>
                                <span>${getPlayerTeamName(standing.player)}</span>
                            </td>
                            <td class="stats">${standing.played}</td>
                            <td class="stats">${standing.won}</td>
                            <td class="stats">${standing.drawn}</td>
                            <td class="stats">${standing.lost}</td>
                            <td class="stats">${standing.goalsFor}</td>
                            <td class="stats">${standing.goalsAgainst}</td>
                            <td class="stats">${standing.goalDifference >= 0 ? '+' : ''}${standing.goalDifference}</td>
                            <td class="points">${standing.points}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Filtrar partidos
function filterMatches(filter) {
    currentMatchFilter = filter;
    
    // Actualizar botones
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
    
    renderMatches();
}

// Renderizar partidos
function renderMatches() {
    const matchesList = document.getElementById('matchesList');
    
    if (!currentTournament) {
        matchesList.innerHTML = '';
        return;
    }
    
    const tournament = tournaments[currentTournament];
    let matches = tournament.matches;
    
    if (matches.length === 0) {
        matchesList.innerHTML = '<p>Genera la liga para ver los partidos.</p>';
        return;
    }
    
    // Aplicar filtro
    if (currentMatchFilter === 'pending') {
        matches = matches.filter(match => !match.completed);
    } else if (currentMatchFilter === 'completed') {
        matches = matches.filter(match => match.completed);
    }
    
    const totalMatches = tournament.matches.length;
    const completedMatches = tournament.matches.filter(match => match.completed).length;
    
    matchesList.innerHTML = `
        <div class="stats">
            <div class="stat-item">
                <span class="stat-number">${totalMatches}</span>
                <span class="stat-label">Total Partidos</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">${completedMatches}</span>
                <span class="stat-label">Completados</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">${totalMatches - completedMatches}</span>
                <span class="stat-label">Pendientes</span>
            </div>
        </div>
        ${matches.map(match => `
            <div class="match-card ${match.completed ? 'completed' : ''}">
                <div class="match-header">
                    <div class="match-date">Partido #${match.id}</div>
                    <div class="match-status ${match.completed ? 'completed' : 'pending'}">
                        ${match.completed ? 'Completado' : 'Pendiente'}
                    </div>
                </div>
                <div class="match-teams">
                    <div class="match-team ${match.completed && match.score1 > match.score2 ? 'winner' : ''}">
                        <div class="team-logo">${getPlayerTeamLogo(match.player1)}</div>
                        <span>👤 ${match.player1}</span>
                        <span>(${getPlayerTeamName(match.player1)})</span>
                    </div>
                    <div class="match-vs">VS</div>
                    <div class="match-team ${match.completed && match.score2 > match.score1 ? 'winner' : ''}">
                        <div class="team-logo">${getPlayerTeamLogo(match.player2)}</div>
                        <span>👤 ${match.player2}</span>
                        <span>(${getPlayerTeamName(match.player2)})</span>
                    </div>
                </div>
                <div class="match-score">
                    ${match.completed ? `
                        <div class="score-display">${match.score1} - ${match.score2}</div>
                    ` : `
                        <input type="number" class="score-input" id="score1_${match.id}" min="0" max="20" placeholder="0">
                        <span>-</span>
                        <input type="number" class="score-input" id="score2_${match.id}" min="0" max="20" placeholder="0">
                    `}
                </div>
                <div class="match-actions">
                    ${match.completed ? `
                        <button class="edit-btn" onclick="editMatch(${match.id})">Editar</button>
                    ` : `
                        <button class="save-btn" onclick="saveMatch(${match.id})">Guardar Resultado</button>
                    `}
                </div>
            </div>
        `).join('')}
    `;
}

// Guardar resultado del partido
function saveMatch(matchId) {
    const score1Input = document.getElementById(`score1_${matchId}`);
    const score2Input = document.getElementById(`score2_${matchId}`);
    
    const score1 = parseInt(score1Input.value);
    const score2 = parseInt(score2Input.value);
    
    if (isNaN(score1) || isNaN(score2) || score1 < 0 || score2 < 0) {
        showAlert('Por favor ingresa resultados válidos', 'error');
        return;
    }
    
    const tournament = tournaments[currentTournament];
    const match = tournament.matches.find(m => m.id === matchId);
    
    if (!match) {
        showAlert('Partido no encontrado', 'error');
        return;
    }
    
    match.score1 = score1;
    match.score2 = score2;
    match.completed = true;
    
    updateStandings(match);
    localStorage.setItem('tournaments', JSON.stringify(tournaments));
    
    renderStandings();
    renderMatches();
    showAlert('Resultado guardado exitosamente', 'success');
}

// Editar partido
function editMatch(matchId) {
    const tournament = tournaments[currentTournament];
    const match = tournament.matches.find(m => m.id === matchId);
    
    if (!match) {
        showAlert('Partido no encontrado', 'error');
        return;
    }
    
    // Revertir estadísticas
    revertMatchStats(match);
    
    match.completed = false;
    match.score1 = null;
    match.score2 = null;
    
    localStorage.setItem('tournaments', JSON.stringify(tournaments));
    
    renderStandings();
    renderMatches();
    showAlert('Partido listo para editar', 'info');
}

// Actualizar tabla de posiciones
function updateStandings(match) {
    const tournament = tournaments[currentTournament];
    const player1Stats = tournament.standings[match.player1];
    const player2Stats = tournament.standings[match.player2];
    
    // Actualizar estadísticas generales
    player1Stats.played++;
    player2Stats.played++;
    
    player1Stats.goalsFor += match.score1;
    player1Stats.goalsAgainst += match.score2;
    player1Stats.goalDifference = player1Stats.goalsFor - player1Stats.goalsAgainst;
    
    player2Stats.goalsFor += match.score2;
    player2Stats.goalsAgainst += match.score1;
    player2Stats.goalDifference = player2Stats.goalsFor - player2Stats.goalsAgainst;
    
    // Determinar resultado
    if (match.score1 > match.score2) {
        // Jugador 1 gana
        player1Stats.won++;
        player1Stats.points += 3;
        player2Stats.lost++;
    } else if (match.score2 > match.score1) {
        // Jugador 2 gana
        player2Stats.won++;
        player2Stats.points += 3;
        player1Stats.lost++;
    } else {
        // Empate
        player1Stats.drawn++;
        player1Stats.points += 1;
        player2Stats.drawn++;
        player2Stats.points += 1;
    }
}

// Revertir estadísticas del partido
function revertMatchStats(match) {
    const tournament = tournaments[currentTournament];
    const player1Stats = tournament.standings[match.player1];
    const player2Stats = tournament.standings[match.player2];
    
    // Revertir estadísticas generales
    player1Stats.played--;
    player2Stats.played--;
    
    player1Stats.goalsFor -= match.score1;
    player1Stats.goalsAgainst -= match.score2;
    player1Stats.goalDifference = player1Stats.goalsFor - player1Stats.goalsAgainst;
    
    player2Stats.goalsFor -= match.score2;
    player2Stats.goalsAgainst -= match.score1;
    player2Stats.goalDifference = player2Stats.goalsFor - player2Stats.goalsAgainst;
    
    // Revertir resultado
    if (match.score1 > match.score2) {
        player1Stats.won--;
        player1Stats.points -= 3;
        player2Stats.lost--;
    } else if (match.score2 > match.score1) {
        player2Stats.won--;
        player2Stats.points -= 3;
        player1Stats.lost--;
    } else {
        player1Stats.drawn--;
        player1Stats.points -= 1;
        player2Stats.drawn--;
        player2Stats.points -= 1;
    }
}

// Obtener logo del equipo del jugador
function getPlayerTeamLogo(playerName) {
    if (!currentTournament) return '?';
    
    const tournament = tournaments[currentTournament];
    const assignment = tournament.assignments[playerName];
    
    return assignment ? assignment.team.logo : '?';
}

// Obtener nombre del equipo del jugador
function getPlayerTeamName(playerName) {
    if (!currentTournament) return 'Sin equipo';
    
    const tournament = tournaments[currentTournament];
    const assignment = tournament.assignments[playerName];
    
    return assignment ? assignment.team.name : 'Sin equipo';
}

// Reiniciar liga
function resetLeague() {
    if (!currentTournament) return;
    
    if (confirm('¿Estás seguro de que quieres reiniciar la liga? Se perderán todas las asignaciones, partidos y resultados.')) {
        tournaments[currentTournament].assignments = {};
        tournaments[currentTournament].matches = [];
        tournaments[currentTournament].standings = {};
        
        localStorage.setItem('tournaments', JSON.stringify(tournaments));
        
        renderAssignments();
        renderStandings();
        renderMatches();
        document.getElementById('standingsSection').style.display = 'none';
        document.getElementById('matchesSection').style.display = 'none';
        showAlert('Liga reiniciada', 'success');
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