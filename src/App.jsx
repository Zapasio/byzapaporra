import React, { useState, useMemo, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, onSnapshot, setDoc, addDoc, updateDoc } from "firebase/firestore";

// --- TUS CLAVES DE FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyBrb39G4VXHQU3C_R3TPOHKLvT7FkadjMM",
  authDomain: "byzapaporra.firebaseapp.com",
  projectId: "byzapaporra",
  storageBucket: "byzapaporra.appspot.com",
  messagingSenderId: "399956071476",
  appId: "1:399956071476:web:4431f0835c444234b92661"
};

// Initialize Firebase and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- Iconos SVG ---
const TrophyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z" /></svg>;
const UserIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>;
const ShieldCheckIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.944a12.02 12.02 0 009 3c4.524 0 8.384-2.686 9.954-6.618a12.02 12.02 0 00-4.336-11.944z" /></svg>;
const ExclamationCircleIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const CogIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.532 1.532 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.532 1.532 0 01-.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106A1.532 1.532 0 0111.49 3.17zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>;

// --- DATOS DEL JUEGO ---
const TEAMS = ["Alavés", "Athletic Club", "Atlético de Madrid", "FC Barcelona", "Betis", "Cádiz", "Celta Vigo", "Getafe", "Girona", "Granada", "Las Palmas", "Mallorca", "Osasuna", "Rayo Vallecano", "Real Madrid", "Real Sociedad", "Sevilla", "Valencia", "Villarreal", "Leganés", "Valladolid", "Espanyol"];
const BANNED_TEAMS = ["Real Madrid", "FC Barcelona"];

const JORNADAS_DATA = {
    1: { matches: [ { id: 'J1-M1', home: 'Athletic Club', away: 'Getafe' }, { id: 'J1-M2', home: 'Betis', away: 'Girona' }, { id: 'J1-M3', home: 'Mallorca', away: 'Real Madrid' }, { id: 'J1-M4', home: 'Real Sociedad', away: 'Rayo Vallecano' }, { id: 'J1-M5', home: 'Valencia', away: 'FC Barcelona' }, { id: 'J1-M6', home: 'Villarreal', away: 'Atlético de Madrid' }, { id: 'J1-M7', home: 'Osasuna', away: 'Leganés' }, { id: 'J1-M8', home: 'Celta Vigo', away: 'Alavés' }, { id: 'J1-M9', home: 'Las Palmas', away: 'Sevilla' }, { id: 'J1-M10', home: 'Valladolid', away: 'Espanyol' } ], results: [ /* Los resultados se añadirían aquí al finalizar */ ] },
    2: { matches: [ { id: 'J2-M1', home: 'Alavés', away: 'Betis' }, { id: 'J2-M2', home: 'Atlético de Madrid', away: 'Athletic Club' }, { id: 'J2-M3', home: 'FC Barcelona', away: 'Valladolid' }, { id: 'J2-M4', home: 'Getafe', away: 'Rayo Vallecano' }, { id: 'J2-M5', home: 'Girona', away: 'Osasuna' }, { id: 'J2-M6', home: 'Real Madrid', away: 'Real Sociedad' }, { id: 'J2-M7', home: 'Sevilla', away: 'Celta Vigo' }, { id: 'J2-M8', home: 'Espanyol', away: 'Mallorca' }, { id: 'J2-M9', home: 'Leganés', away: 'Las Palmas' }, { id: 'J2-M10', home: 'Valencia', away: 'Villarreal' } ], results: [] },
    3: { matches: [ { id: 'J3-M1', home: 'Athletic Club', away: 'Valencia' }, { id: 'J3-M2', home: 'Betis', away: 'Getafe' }, { id: 'J3-M3', home: 'Celta Vigo', away: 'Villarreal' }, { id: 'J3-M4', home: 'Girona', away: 'Atlético de Madrid' }, { id: 'J3-M5', home: 'Las Palmas', away: 'Rayo Vallecano' }, { id: 'J3-M6', home: 'Mallorca', away: 'FC Barcelona' }, { id: 'J3-M7', home: 'Osasuna', away: 'Sevilla' }, { id: 'J3-M8', home: 'Real Madrid', away: 'Espanyol' }, { id: 'J3-M9', home: 'Real Sociedad', away: 'Alavés' }, { id: 'J3-M10', home: 'Valladolid', away: 'Leganés' } ], results: [] },
    4: { matches: [ { id: 'J4-M1', home: 'Alavés', away: 'Las Palmas' }, { id: 'J4-M2', home: 'Atlético de Madrid', away: 'Real Sociedad' }, { id: 'J4-M3', home: 'FC Barcelona', away: 'Girona' }, { id: 'J4-M4', home: 'Getafe', away: 'Mallorca' }, { id: 'J4-M5', home: 'Rayo Vallecano', away: 'Valladolid' }, { id: 'J4-M6', home: 'Sevilla', away: 'Real Madrid' }, { id: 'J4-M7', home: 'Valencia', away: 'Celta Vigo' }, { id: 'J4-M8', home: 'Villarreal', away: 'Betis' }, { id: 'J4-M9', home: 'Espanyol', away: 'Athletic Club' }, { id: 'J4-M10', home: 'Leganés', away: 'Osasuna' } ], results: [] }
};

// --- COMPONENTES DE UI ---
const Header = () => <header className="bg-black text-white p-4 shadow-lg shadow-yellow-400/20"><div className="container mx-auto flex items-center justify-center"><TrophyIcon /><h1 className="text-2xl md:text-3xl font-bold tracking-wider text-yellow-400">Porra 1ª División <span className="text-white font-light">ByZapa</span></h1></div></header>;
const Footer = () => <footer className="bg-black text-white text-center p-4 mt-auto"><p className="text-sm text-gray-400">Creado por ByZapa</p></footer>;
const Modal = ({ title, message, onClose }) => <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"><div className="bg-gray-800 rounded-lg shadow-xl p-6 w-11/12 max-w-md text-center border border-yellow-400"><h3 className="text-2xl font-bold text-yellow-400 mb-4">{title}</h3><p className="text-white mb-6">{message}</p><button onClick={onClose} className="bg-yellow-400 text-black font-bold py-2 px-6 rounded-lg hover:bg-yellow-300 transition-colors">Entendido</button></div></div>;

const WelcomeScreen = ({ onEnter, players, selectedPlayerId, setSelectedPlayerId }) => (
    <div className="text-center p-8 max-w-2xl mx-auto animate-fade-in">
        <h2 className="text-4xl font-bold text-yellow-400 mb-4">Bienvenido a la Porra</h2>
        <p className="text-gray-300 mb-6 text-lg">Para empezar, selecciona tu nombre de la lista y pulsa "Entrar al Juego".</p>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8 w-full">
            <h3 className="text-2xl font-semibold text-white mb-4">Selecciona tu Perfil</h3>
            <select value={selectedPlayerId} onChange={(e) => setSelectedPlayerId(e.target.value)} className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg text-white text-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 mb-6">
                <option value="">-- ¿Quién eres? --</option>
                {players.map(player => (<option key={player.id} value={player.id}>{player.name}</option>))}
            </select>
            <button onClick={onEnter} disabled={!selectedPlayerId} className="w-full bg-yellow-400 text-black font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-yellow-300 transform hover:scale-105 transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed">Entrar al Juego</button>
        </div>
    </div>
);

const PlayerDashboard = ({ loggedInPlayer, gameState, onShowModal }) => {
    const { players, jornada, picksClosed } = gameState;
    const player = players.find(p => p.id === loggedInPlayer.id);
    if (!player) return <div className="text-center text-yellow-400">Cargando tus datos...</div>;
    const hasPicked = player.picks.some(p => p.jornada === jornada);
    const availableTeams = useMemo(() => { const pickedTeams = new Set(player.picks.map(p => p.team)); const teamsInJornada = new Set(JORNADAS_DATA[jornada]?.matches.flatMap(m => [m.home, m.away]) || []); return TEAMS.filter(t => !pickedTeams.has(t) && teamsInJornada.has(t) && !BANNED_TEAMS.includes(t)); }, [player.picks, jornada]);
    const [selectedTeam, setSelectedTeam] = useState('');
    const handleSubmit = async (e) => { e.preventDefault(); if (selectedTeam) { const newPick = { jornada, team: selectedTeam }; const updatedPicks = [...player.picks, newPick]; const playerRef = doc(db, "players", player.id); await updateDoc(playerRef, { picks: updatedPicks }); onShowModal("¡Elección Guardada!", `Has elegido a ${selectedTeam} para la jornada ${jornada}. ¡Mucha suerte!`); setSelectedTeam(''); } };
    return ( <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in"> <div className="lg:col-span-2 space-y-8"> <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700"><div className="flex items-center mb-4"><UserIcon className="h-10 w-10 text-yellow-400 mr-4" /><div><h2 className="text-3xl font-bold text-white">{player.name}</h2>{player.status === 'activo' ? <div className="flex items-center text-green-400"><ShieldCheckIcon className="h-5 w-5 mr-1"/>Activo</div> : <div className="flex items-center text-red-500"><ExclamationCircleIcon className="h-5 w-5 mr-1"/>Eliminado en la jornada {player.jornadaEliminado}</div>}</div></div></div> {player.status === 'activo' && ( <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700"> <h3 className="text-2xl font-bold text-yellow-400 mb-4">Jornada {jornada}: Tu Elección</h3> {picksClosed ? <div className="text-center p-4 bg-gray-900 rounded-lg"><p className="text-yellow-400 text-lg">Las elecciones para la jornada {jornada} están cerradas.</p><p className="text-white mt-2">Tu elección fue: <strong className="font-bold">{player.picks.find(p=>p.jornada === jornada)?.team || 'No elegiste'}</strong></p></div> : hasPicked ? <div className="text-center p-4 bg-gray-900 rounded-lg"><p className="text-green-400 text-lg">¡Elección guardada para la Jornada {jornada}!</p><p className="text-white mt-2">Has elegido a: <strong className="font-bold">{player.picks.find(p=>p.jornada === jornada).team}</strong></p></div> : (<form onSubmit={handleSubmit}><p className="text-gray-300 mb-4">Elige un equipo ganador de los disponibles para esta jornada.</p><select value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)} className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"><option value="">-- Selecciona un equipo --</option>{availableTeams.map(team => <option key={team} value={team}>{team}</option>)}</select><button type="submit" disabled={!selectedTeam} className="mt-4 w-full bg-yellow-400 text-black font-bold py-3 rounded-lg shadow-md hover:bg-yellow-300 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors">Confirmar Elección</button></form>)} </div> )} <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700"><h3 className="text-2xl font-bold text-yellow-400 mb-4">Tu Historial de Elecciones</h3>{player.picks.length > 0 ? <ul className="space-y-2">{player.picks.slice().reverse().map(pick => <li key={pick.jornada} className="flex justify-between items-center bg-gray-900 p-3 rounded-md"><span className="text-gray-400">Jornada {pick.jornada}</span><strong className="font-semibold text-white">{pick.team}</strong></li>)}</ul> : <p className="text-gray-400">Aún no has hecho ninguna elección.</p>}</div> </div> <div className="space-y-8"> <div className="bg-gray-900 p-6 rounded-lg shadow-lg border border-yellow-400/50 text-center"><h3 className="text-xl font-semibold text-yellow-400 mb-2">Bote Actual</h3><p className="text-5xl font-bold text-white">{((players.length * 20) * 0.85).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</p><p className="text-sm text-gray-400 mt-2">Comisión (15%): {((players.length * 20) * 0.15).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</p></div> <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700"><h3 className="text-2xl font-bold text-yellow-400 mb-4">Jugadores Activos</h3><ul className="space-y-3">{players.filter(p => p.status === 'activo').map(p => <li key={p.id} className="flex items-center text-white"><ShieldCheckIcon className="h-5 w-5 mr-3 text-green-400" />{p.name}</li>)}</ul></div> </div> </div> ); };

const AdminPanel = ({ gameState, onProcessJornada, onAdvanceJornada, onShowModal, onAddPlayer, onRemovePick }) => {
    const { players, jornada, picksClosed } = gameState;
    const [newPlayerName, setNewPlayerName] = useState('');
    const [results, setResults] = useState(JORNADAS_DATA[jornada]?.matches.map(m => ({ matchId: m.id, winner: '' })) || []);
    useEffect(() => { setResults(JORNADAS_DATA[jornada]?.matches.map(m => ({ matchId: m.id, winner: '' })) || []); }, [jornada]);
    const handleAddPlayer = (e) => { e.preventDefault(); if (newPlayerName.trim()) { onAddPlayer(newPlayerName.trim()); setNewPlayerName(''); } };
    const handleResultChange = (matchId, winner) => { setResults(prev => prev.map(r => r.matchId === matchId ? { ...r, winner } : r)); };
    const handleProcess = () => { const validResults = results.filter(r => r.winner); if (validResults.length === 0) { onShowModal("Error", "Debes introducir al menos un resultado para procesar la jornada."); return; } onProcessJornada(validResults); };
    const handleAdvance = () => { if (!JORNADAS_DATA[jornada + 1]) { onShowModal("Error", "No hay datos para la siguiente jornada."); return; } onAdvanceJornada(); };

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 animate-fade-in">
            <h2 className="text-3xl font-bold text-yellow-400 mb-6 flex items-center"><CogIcon />Panel de Administración</h2>
            <div className="mb-8 bg-gray-900 p-4 rounded-lg"><h3 className="text-xl font-bold text-yellow-400 mb-3">Añadir Nuevo Jugador</h3><form onSubmit={handleAddPlayer} className="flex flex-col sm:flex-row gap-2"><input type="text" value={newPlayerName} onChange={(e) => setNewPlayerName(e.target.value)} placeholder="Nombre del amigo" className="flex-grow p-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400" /><button type="submit" className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-500">Añadir</button></form></div>
            <div className="mb-8 bg-gray-900 p-4 rounded-lg"><h3 className="text-xl font-bold text-yellow-400 mb-3">Introducir Resultados Jornada {jornada}</h3><div className="space-y-2">{JORNADAS_DATA[jornada]?.matches.map(match => (<div key={match.id} className="flex items-center justify-between text-sm"><span className="text-white">{match.home} vs {match.away}</span><select onChange={(e) => handleResultChange(match.id, e.target.value)} className="p-1 bg-gray-800 border border-gray-600 rounded text-white"><option value="">-- Ganador --</option><option value={match.home}>{match.home}</option><option value={match.away}>{match.away}</option><option value="DRAW">Empate</option></select></div>))}</div></div>
            <div className="space-y-4 mb-6"><p className="text-white">Jornada Actual: <strong className="text-xl">{jornada}</strong></p><p className="text-white">Estado de Elecciones: <strong className={picksClosed ? 'text-red-500' : 'text-green-400'}>{picksClosed ? 'Cerradas' : 'Abiertas'}</strong></p></div>
            <div className="flex flex-col sm:flex-row gap-4"><button onClick={handleProcess} disabled={picksClosed} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-500 disabled:bg-gray-600 transition-colors">Procesar Jornada {jornada}</button><button onClick={handleAdvance} disabled={!picksClosed} className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-500 disabled:bg-gray-600 transition-colors">Avanzar a Jornada {jornada + 1}</button></div>
            
            <div className="mt-8">
                <h3 className="text-2xl font-bold text-yellow-400 mb-4">Lista de Jugadores y Elecciones</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-white">
                        <thead className="bg-gray-900 text-yellow-400"><tr><th className="p-3">Nombre</th><th className="p-3">Estado</th><th className="p-3">Elección (J{jornada})</th><th className="p-3">Acciones</th></tr></thead>
                        <tbody>
                            {players.map(p => {
                                const currentPick = p.picks.find(pick => pick.jornada === jornada);
                                return (
                                    <tr key={p.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                        <td className="p-3">{p.name}</td>
                                        <td className={`p-3 font-semibold ${p.status === 'activo' ? 'text-green-400' : 'text-red-500'}`}>{p.status}</td>
                                        <td className="p-3">{currentPick?.team || <span className="text-gray-500">Sin elección</span>}</td>
                                        <td className="p-3">
                                            {currentPick && !picksClosed && (
                                                <button onClick={() => onRemovePick(p.id)} className="bg-red-700 text-white text-xs font-bold py-1 px-2 rounded hover:bg-red-600">
                                                    Anular Elección
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default function App() {
  const [screen, setScreen] = useState('welcome');
  const [gameState, setGameState] = useState({ players: [], jornada: 1, picksClosed: false });
  const [loggedInPlayer, setLoggedInPlayer] = useState(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const gameStateRef = doc(db, "game", "state");
    const unsubscribeGame = onSnapshot(gameStateRef, (doc) => { if (doc.exists()) { setGameState(prev => ({ ...prev, ...doc.data() })); } else { setDoc(gameStateRef, { jornada: 1, picksClosed: false }); } });
    const playersRef = collection(db, "players");
    const unsubscribePlayers = onSnapshot(playersRef, (snapshot) => { const playersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); setGameState(prev => ({ ...prev, players: playersData })); setIsLoading(false); });
    return () => { unsubscribeGame(); unsubscribePlayers(); };
  }, []);

  const handleEnterGame = () => { if (selectedPlayerId) { const player = gameState.players.find(p => p.id === selectedPlayerId); if (player) { setLoggedInPlayer(player); setScreen('dashboard'); } } };
  const handleShowModal = (title, message) => setModal({ isOpen: true, title, message });
  const handleCloseModal = () => setModal({ isOpen: false, title: '', message: '' });
  const handleAddPlayer = async (name) => { try { await addDoc(collection(db, "players"), { name: name, status: 'activo', picks: [], jornadaEliminado: null }); handleShowModal("¡Jugador Añadido!", `Se ha añadido a ${name} a la porra.`); } catch (error) { handleShowModal("Error", "No se pudo añadir al jugador."); console.error("Error adding document: ", error); } };
  
  const handleRemovePick = async (playerId) => {
    const player = gameState.players.find(p => p.id === playerId);
    if (!player) return;
    
    const newPicks = player.picks.filter(p => p.jornada !== gameState.jornada);
    const playerRef = doc(db, "players", playerId);
    try {
        await updateDoc(playerRef, { picks: newPicks });
        handleShowModal("Elección Anulada", `Se ha borrado la elección de ${player.name} para la jornada ${gameState.jornada}.`);
    } catch (error) {
        handleShowModal("Error", "No se pudo anular la elección.");
        console.error("Error updating player pick: ", error);
    }
  };

  const handleProcessJornada = async (results) => { const { players, jornada } = gameState; const batch = writeBatch(db); let eliminados = []; players.forEach(player => { if (player.status !== 'activo') return; let shouldBeEliminated = true; const pick = player.picks.find(p => p.jornada === jornada); if (pick) { const matchOfPick = JORNADAS_DATA[jornada].matches.find(m => m.home === pick.team || m.away === pick.team); if (matchOfPick) { const result = results.find(r => r.matchId === matchOfPick.id); if (result && result.winner === pick.team) { shouldBeEliminated = false; } } } if (shouldBeEliminated) { eliminados.push(player.name); const playerRef = doc(db, "players", player.id); batch.update(playerRef, { status: 'eliminado', jornadaEliminado: jornada }); } }); const gameStateRef = doc(db, "game", "state"); batch.update(gameStateRef, { picksClosed: true }); await batch.commit(); handleShowModal("Jornada Procesada", `Jugadores eliminados: ${eliminados.join(', ') || 'Ninguno'}. Las elecciones están cerradas.`); };
  const handleAdvanceJornada = async () => { const gameStateRef = doc(db, "game", "state"); await setDoc(gameStateRef, { jornada: gameState.jornada + 1, picksClosed: false }, { merge: true }); };
  const handleGoToWelcome = () => { setLoggedInPlayer(null); setSelectedPlayerId(''); setScreen('welcome'); }

  const renderScreen = () => {
    if (isLoading) return <div className="text-center text-2xl text-yellow-400 mt-16">Conectando con la base de datos...</div>;
    switch (screen) {
      case 'dashboard': return loggedInPlayer ? <PlayerDashboard loggedInPlayer={loggedInPlayer} gameState={gameState} onShowModal={handleShowModal} /> : <div className="text-center text-xl text-red-500">Error: Selecciona un jugador para continuar.</div>;
      case 'admin': return <AdminPanel gameState={gameState} onProcessJornada={handleProcessJornada} onAdvanceJornada={handleAdvanceJornada} onShowModal={handleShowModal} onAddPlayer={handleAddPlayer} onRemovePick={handleRemovePick} />;
      case 'welcome': default: return <WelcomeScreen onEnter={handleEnterGame} players={gameState.players} selectedPlayerId={selectedPlayerId} setSelectedPlayerId={setSelectedPlayerId} />;
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans flex flex-col">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&display=swap'); body { font-family: 'Roboto', sans-serif; } .animate-fade-in { animation: fadeIn 0.5s ease-in-out; } @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      {modal.isOpen && <Modal title={modal.title} message={modal.message} onClose={handleCloseModal} />}
      <Header />
      <nav className="bg-black py-2 sticky top-0 z-10"><div className="container mx-auto flex justify-center items-center gap-2 md:gap-6"><button onClick={handleGoToWelcome} className={`px-3 py-2 text-sm md:text-base rounded-md transition-colors ${screen === 'welcome' ? 'bg-yellow-400 text-black font-bold' : 'text-white hover:bg-gray-700'}`}>Inicio / Cambiar Jugador</button><button onClick={() => setScreen('admin')} className={`px-3 py-2 text-sm md:text-base rounded-md transition-colors ${screen === 'admin' ? 'bg-yellow-400 text-black font-bold' : 'text-white hover:bg-gray-700'}`}>Admin</button></div></nav>
      <main className="container mx-auto p-4 md:p-8 flex-grow">{renderScreen()}</main>
      <Footer />
    </div>
  );
}
