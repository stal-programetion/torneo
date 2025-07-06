// Datos de equipos de FIFA con banderas emoji
const fifaTeams = [
    { name: 'Argentina', flag: '🇦🇷' },
    { name: 'Brasil', flag: '🇧🇷' },
    { name: 'Francia', flag: '🇫🇷' },
    { name: 'Inglaterra', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    { name: 'España', flag: '🇪🇸' },
    { name: 'Alemania', flag: '🇩🇪' },
    { name: 'Italia', flag: '🇮🇹' },
    { name: 'Portugal', flag: '🇵🇹' },
    { name: 'Países Bajos', flag: '🇳🇱' },
    { name: 'Bélgica', flag: '🇧🇪' },
    { name: 'Uruguay', flag: '🇺🇾' },
    { name: 'Colombia', flag: '🇨🇴' },
    { name: 'México', flag: '🇲🇽' },
    { name: 'Estados Unidos', flag: '🇺🇸' },
    { name: 'Croacia', flag: '🇭🇷' },
    { name: 'Dinamarca', flag: '🇩🇰' },
    { name: 'Suecia', flag: '🇸🇪' },
    { name: 'Suiza', flag: '🇨🇭' },
    { name: 'Austria', flag: '🇦🇹' },
    { name: 'Polonia', flag: '🇵🇱' },
    { name: 'Ucrania', flag: '🇺🇦' },
    { name: 'Turquía', flag: '🇹🇷' },
    { name: 'Japón', flag: '🇯🇵' },
    { name: 'Corea del Sur', flag: '🇰🇷' },
    { name: 'Australia', flag: '🇦🇺' },
    { name: 'Marruecos', flag: '🇲🇦' },
    { name: 'Senegal', flag: '🇸🇳' },
    { name: 'Ghana', flag: '🇬🇭' },
    { name: 'Nigeria', flag: '🇳🇬' },
    { name: 'Egipto', flag: '🇪🇬' },
    { name: 'Chile', flag: '🇨🇱' },
    { name: 'Perú', flag: '🇵🇪' },
    { name: 'Ecuador', flag: '🇪🇨' },
    { name: 'Venezuela', flag: '🇻🇪' },
    { name: 'Paraguay', flag: '🇵🇾' },
    { name: 'Bolivia', flag: '🇧🇴' },
    { name: 'Costa Rica', flag: '🇨🇷' },
    { name: 'Panamá', flag: '🇵🇦' },
    { name: 'Jamaica', flag: '🇯🇲' },
    { name: 'Canadá', flag: '🇨🇦' }
];

// Variables globales
let tournaments = JSON.parse(localStorage.getItem('tournaments')) || {};
let currentTournament = '';
let isSelectingTeams = false;

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', function() {
    loadTournamentSelector();
    renderTeams();
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
        selectedTeams: [],
        players: [],
        assignments: {},
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
    renderTeams();
    renderPlayers();
    renderAssignments();
    updateAssignButton();
}

// Mostrar/ocultar secciones
function showAllSections() {
    document.getElementById('teamsSection').style.display = 'block';
    document.getElementById('playersSection').style.display = 'block';
    document.getElementById('assignmentsSection').style.display = 'block';
}

function hideAllSections() {
    document.getElementById('teamsSection').style.display = 'none';
    document.getElementById('playersSection').style.display = 'none';
    document.getElementById('assignmentsSection').style.display = 'none';
}

// Renderizar equipos
function renderTeams() {
    const teamsGrid = document.getElementById('teamsGrid');
    const tournament = tournaments[currentTournament];
    
    if (!tournament) return;
    
    teamsGrid.innerHTML = '';
    
    fifaTeams.forEach(team => {
        const teamCard = document.createElement('div');
        teamCard.className = 'team-card';
        teamCard.onclick = () => toggleTeamSelection(team);
        
        // Verificar si el equipo está seleccionado
        if (tournament.selectedTeams.some(t => t.name === team.name)) {
            teamCard.classList.add('selected');
        }
        
        // Verificar si el equipo está asignado
        if (Object.values(tournament.assignments).some(assignment => assignment.team.name === team.name)) {
            teamCard.classList.add('assigned');
        }
        
        teamCard.innerHTML = `
            <span class="team-flag">${team.flag}</span>
            <span class="team-name">${team.name}</span>
        `;
        
        teamsGrid.appendChild(teamCard);
    });
}

// Alternar selección de equipos
function toggleTeamSelection(team) {
    if (!currentTournament) return;
    
    const tournament = tournaments[currentTournament];
    const teamIndex = tournament.selectedTeams.findIndex(t => t.name === team.name);
    
    // Verificar si el equipo ya está asignado
    if (Object.values(tournament.assignments).some(assignment => assignment.team.name === team.name)) {
        showAlert('Este equipo ya está asignado a un jugador', 'error');
        return;
    }
    
    if (teamIndex === -1) {
        tournament.selectedTeams.push(team);
        showAlert(`${team.name} agregado al torneo`, 'success');
    } else {
        tournament.selectedTeams.splice(teamIndex, 1);
        showAlert(`${team.name} removido del torneo`, 'success');
    }
    
    localStorage.setItem('tournaments', JSON.stringify(tournaments));
    renderTeams();
    updateAssignButton();
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
    
    tournament.players.push(playerName);
    localStorage.setItem('tournaments', JSON.stringify(tournaments));
    document.getElementById('playerName').value = '';
    
    renderPlayers();
    updateAssignButton();
    showAlert(`${playerName} agregado al torneo`, 'success');
}

// Renderizar jugadores
function renderPlayers() {
    // Esta función podría expandirse para mostrar una lista de jugadores
    updateAssignButton();
}

// Actualizar botón de asignación
function updateAssignButton() {
    const assignBtn = document.getElementById('assignBtn');
    
    if (!currentTournament) {
        assignBtn.disabled = true;
        return;
    }
    
    const tournament = tournaments[currentTournament];
    const canAssign = tournament.selectedTeams.length > 0 && 
                     tournament.players.length > 0 && 
                     tournament.selectedTeams.length >= tournament.players.length;
    
    assignBtn.disabled = !canAssign;
    
    if (!canAssign && tournament.selectedTeams.length < tournament.players.length) {
        assignBtn.textContent = `Necesitas más equipos (${tournament.selectedTeams.length}/${tournament.players.length})`;
    } else {
        assignBtn.textContent = 'Asignar Equipos Aleatoriamente';
    }
}

// Asignar equipos aleatoriamente
function assignTeams() {
    if (!currentTournament) return;
    
    const tournament = tournaments[currentTournament];
    const availableTeams = tournament.selectedTeams.filter(team => 
        !Object.values(tournament.assignments).some(assignment => assignment.team.name === team.name)
    );
    
    if (availableTeams.length < tournament.players.length) {
        showAlert('No hay suficientes equipos disponibles', 'error');
        return;
    }
    
    // Mezclar equipos disponibles
    const shuffledTeams = [...availableTeams].sort(() => Math.random() - 0.5);
    
    // Asignar equipos a jugadores
    tournament.players.forEach((player, index) => {
        if (!tournament.assignments[player]) {
            tournament.assignments[player] = {
                player: player,
                team: shuffledTeams[index],
                assignedAt: new Date().toISOString()
            };
        }
    });
    
    localStorage.setItem('tournaments', JSON.stringify(tournaments));
    renderTeams();
    renderAssignments();
    updateAssignButton();
    showAlert('Equipos asignados exitosamente', 'success');
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
        assignmentsList.innerHTML = '<p>No hay asignaciones todavía. Agrega jugadores y equipos, luego asigna aleatoriamente.</p>';
        return;
    }
    
    // Crear estadísticas
    const stats = document.createElement('div');
    stats.className = 'stats';
    stats.innerHTML = `
        <div class="stat-item">
            <span class="stat-number">${tournament.players.length}</span>
            <span class="stat-label">Jugadores</span>
        </div>
        <div class="stat-item">
            <span class="stat-number">${tournament.selectedTeams.length}</span>
            <span class="stat-label">Equipos</span>
        </div>
        <div class="stat-item">
            <span class="stat-number">${assignments.length}</span>
            <span class="stat-label">Asignados</span>
        </div>
    `;
    
    assignmentsList.innerHTML = '';
    assignmentsList.appendChild(stats);
    
    assignments.forEach(assignment => {
        const assignmentItem = document.createElement('div');
        assignmentItem.className = 'assignment-item';
        
        assignmentItem.innerHTML = `
            <div class="player-info">
                <span class="player-name">👤 ${assignment.player}</span>
            </div>
            <div class="team-info">
                <span class="team-flag-small">${assignment.team.flag}</span>
                <span class="team-name-small">${assignment.team.name}</span>
            </div>
        `;
        
        assignmentsList.appendChild(assignmentItem);
    });
}

// Reiniciar asignaciones
function resetAssignments() {
    if (!currentTournament) return;
    
    if (confirm('¿Estás seguro de que quieres reiniciar todas las asignaciones?')) {
        tournaments[currentTournament].assignments = {};
        localStorage.setItem('tournaments', JSON.stringify(tournaments));
        renderTeams();
        renderAssignments();
        updateAssignButton();
        showAlert('Asignaciones reiniciadas', 'success');
    }
}

// Mostrar alertas
function showAlert(message, type) {
    // Remover alertas existentes
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

// Funciones adicionales para mejorar la experiencia
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