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
const TrophyIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M20.2,2H3.8C3.3,2,3,2.3,3,2.8v13.4c0,0.5,0.3,0.8,0.8,0.8h3.4c-0.1,0.3-0.2,0.6-0.2,0.9c0,1.9,1.6,3.5,3.5,3.5s3.5-1.6,3.5-3.5c0-0.3-0.1-0.6-0.2-0.9h3.4c0.5,0,0.8-0.3,0.8-0.8V2.8C21,2.3,20.7,2,20.2,2z M10.5,20.5c-1.4,0-2.5-1.1-2.5-2.5s1.1-2.5,2.5-2.5s2.5,1.1,2.5,2.5S11.9,20.5,10.5,20.5z M19,15H5V4h14V15z"/><path d="M6,5h2v5H6V5z M16,5h-2v5h2V5z"/></svg>;
const UserIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>;
const ShieldCheckIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.944a12.02 12.02 0 009 3c4.524 0 8.384-2.686 9.954-6.618a12.02 12.02 0 00-4.336-11.944z" /></svg>;
const ExclamationCircleIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const CogIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.532 1.532 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.532 1.532 0 01-.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106A1.532 1.532 0 0111.49 3.17zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;

// --- DATOS DEL JUEGO ---
const TEAMS = ["Alavés", "Athletic Club", "Atlético de Madrid", "FC Barcelona", "Betis", "Cádiz", "Celta Vigo", "Getafe", "Girona", "Granada", "Las Palmas", "Mallorca", "Osasuna", "Rayo Vallecano", "Real Madrid", "Real Sociedad", "Sevilla", "Valencia", "Villarreal", "Leganés", "Valladolid", "Espanyol"];
const BANNED_TEAMS = ["Real Madrid", "FC Barcelona"];
const JORNADAS_DATA = { 1: { matches: [ { id: 'J1-M1', home: 'Athletic Club', away: 'Getafe' }, { id: 'J1-M2', home: 'Betis', away: 'Girona' }, { id: 'J1-M3', home: 'Mallorca', away: 'Real Madrid' }, { id: 'J1-M4', home: 'Real Sociedad', away: 'Rayo Vallecano' }, { id: 'J1-M5', home: 'Valencia', away: 'FC Barcelona' }, { id: 'J1-M6', home: 'Villarreal', away: 'Atlético de Madrid' }, { id: 'J1-M7', home: 'Osasuna', away: 'Leganés' }, { id: 'J1-M8', home: 'Celta Vigo', away: 'Alavés' }, { id: 'J1-M9', home: 'Las Palmas', away: 'Sevilla' }, { id: 'J1-M10', home: 'Valladolid', away: 'Espanyol' } ], results: [ /* Los resultados se añadirían aquí al finalizar */ ] }, 2: { matches: [ { id: 'J2-M1', home: 'Alavés', away: 'Betis' }, { id: 'J2-M2', home: 'Atlético de Madrid', away: 'Athletic Club' }, { id: 'J2-M3', home: 'FC Barcelona', away: 'Valladolid' }, { id: 'J2-M4', home: 'Getafe', away: 'Rayo Vallecano' }, { id: 'J2-M5', home: 'Girona', away: 'Osasuna' }, { id: 'J2-M6', home: 'Real Madrid', away: 'Real Sociedad' }, { id: 'J2-M7', home: 'Sevilla', away: 'Celta Vigo' }, { id: 'J2-M8', home: 'Espanyol', away: 'Mallorca' }, { id: 'J2-M9', home: 'Leganés', away: 'Las Palmas' }, { id: 'J2-M10', home: 'Valencia', away: 'Villarreal' } ], results: [] }, 3: { matches: [ { id: 'J3-M1', home: 'Athletic Club', away: 'Valencia' }, { id: 'J3-M2', home: 'Betis', away: 'Getafe' }, { id: 'J3-M3', home: 'Celta Vigo', away: 'Villarreal' }, { id: 'J3-M4', home: 'Girona', away: 'Atlético de Madrid' }, { id: 'J3-M5', home: 'Las Palmas', away: 'Rayo Vallecano' }, { id: 'J3-M6', home: 'Mallorca', away: 'FC Barcelona' }, { id: 'J3-M7', home: 'Osasuna', away: 'Sevilla' }, { id: 'J3-M8', home: 'Real Madrid', away: 'Espanyol' }, { id: 'J3-M9', home: 'Real Sociedad', away: 'Alavés' }, { id: 'J3-M10', home: 'Valladolid', away: 'Leganés' } ], results: [] }, 4: { matches: [ { id: 'J4-M1', home: 'Alavés', away: 'Las Palmas' }, { id: 'J4-M2', home: 'Atlético de Madrid', away: 'Real Sociedad' }, { id: 'J4-M3', home: 'FC Barcelona', away: 'Girona' }, { id: 'J4-M4', home: 'Getafe', away: 'Mallorca' }, { id: 'J4-M5', home: 'Rayo Vallecano', away: 'Valladolid' }, { id: 'J4-M6', home: 'Sevilla', away: 'Real Madrid' }, { id: 'J4-M7', home: 'Valencia', away: 'Celta Vigo' }, { id: 'J4-M8', home: 'Villarreal', away: 'Betis' }, { id: 'J4-M9', home: 'Espanyol', away: 'Athletic Club' }, { id: 'J4-M10', home: 'Leganés', away: 'Osasuna' } ], results: [] }};

// --- COMPONENTES DE UI con NUEVO DISEÑO ---

const Card = ({ children, className = '', isHoverable = false }) => (
    <div className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg transition-all duration-300 ${isHoverable ? 'hover:bg-white/10 hover:border-white/20' : ''} ${className}`}>
        {children}
    </div>
);

const Header = () => (
    <header className="bg-transparent text-white p-4 sticky top-0 z-40">
        <div className="container mx-auto flex items-center justify-center gap-3">
            <TrophyIcon className="h-8 w-8 text-amber-300" />
            <h1 className="text-2xl md:text-3xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-400">
                PORRA BYZAPA
            </h1>
        </div>
    </header>
);

const Footer = () => <footer className="bg-transparent text-white text-center p-6 mt-auto"><p className="text-sm text-white/30">Creado por ByZapa</p></footer>;

const Modal = ({ title, message, onClose }) => <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"><Card className="w-full max-w-md text-center"><div className="p-6"><h3 className="text-2xl font-bold text-amber-300 mb-4">{title}</h3><p className="text-white/80 mb-6">{message}</p><button onClick={onClose} className="bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-bold py-2 px-6 rounded-lg hover:opacity-90 transition-all duration-300 transform hover:scale-105">Entendido</button></div></Card></div>;

const WelcomeScreen = ({ onEnter, players, selectedPlayerId, setSelectedPlayerId }) => (
    <div className="text-center p-4 max-w-2xl mx-auto animate-fade-in flex flex-col items-center justify-center min-h-[70vh]">
        <h2 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-amber-300 mb-4">Bienvenido</h2>
        <p className="text-white/60 mb-8 text-lg">Selecciona tu perfil para empezar a jugar.</p>
        <Card className="w-full">
            <div className="p-6 md:p-8">
                <h3 className="text-2xl font-semibold text-white mb-4">¿Quién eres?</h3>
                <select value={selectedPlayerId} onChange={(e) => setSelectedPlayerId(e.target.value)} className="w-full p-4 bg-black/20 border border-white/20 rounded-lg text-white text-lg focus:outline-none focus:ring-2 focus:ring-amber-400 mb-6 transition-all">
                    <option value="">-- Selecciona tu nombre --</option>
                    {players.map(player => (<option key={player.id} value={player.id} className="bg-gray-800">{player.name}</option>))}
                </select>
                <button onClick={onEnter} disabled={!selectedPlayerId} className="w-full bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-bold py-4 px-8 rounded-lg shadow-lg hover:shadow-yellow-400/20 transform hover:scale-105 transition-all duration-300 disabled:from-gray-600 disabled:to-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none">Entrar al Juego</button>
            </div>
        </Card>
    </div>
);

const PlayerDashboard = ({ loggedInPlayer, gameState, onShowModal }) => {
    const { players, jornada, picksClosed } = gameState;
    const player = players.find(p => p.id === loggedInPlayer.id);
    if (!player) return null;
    const hasPicked = player.picks.some(p => p.jornada === jornada);
    const availableTeams = useMemo(() => { const pickedTeams = new Set(player.picks.map(p => p.team)); const teamsInJornada = new Set(JORNADAS_DATA[jornada]?.matches.flatMap(m => [m.home, m.away]) || []); return TEAMS.filter(t => !pickedTeams.has(t) && teamsInJornada.has(t) && !BANNED_TEAMS.includes(t)); }, [player.picks, jornada]);
    const [selectedTeam, setSelectedTeam] = useState('');
    const handleSubmit = async (e) => { e.preventDefault(); if (selectedTeam) { const newPick = { jornada, team: selectedTeam }; const updatedPicks = [...player.picks, newPick]; const playerRef = doc(db, "players", player.id); await updateDoc(playerRef, { picks: updatedPicks }); onShowModal("¡Elección Guardada!", `Has elegido a ${selectedTeam} para la jornada ${jornada}. ¡Mucha suerte!`); setSelectedTeam(''); } };
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            {/* Bento Grid Layout */}
            <Card className="lg:col-span-2 p-6 flex items-center gap-6">
                <UserIcon className="h-16 w-16 text-amber-300 flex-shrink-0" />
                <div>
                    <h2 className="text-4xl font-bold text-white">{player.name}</h2>
                    {player.status === 'activo' ? <div className="flex items-center text-green-400 font-semibold mt-1"><ShieldCheckIcon className="h-5 w-5 mr-2"/>Activo</div> : <div className="flex items-center text-red-500 font-semibold mt-1"><ExclamationCircleIcon className="h-5 w-5 mr-2"/>Eliminado en J.{player.jornadaEliminado}</div>}
                </div>
            </Card>

            <Card className="text-center p-6 flex flex-col justify-center">
                <h3 className="text-xl font-semibold text-amber-300 mb-1">Bote Actual</h3>
                <p className="text-5xl font-extrabold text-white">{((players.length * 20) * 0.85).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</p>
            </Card>

            {player.status === 'activo' && (
                <Card className="lg:col-span-3">
                    <div className="p-6">
                        <h3 className="text-2xl font-bold text-amber-300 mb-4">Jornada {jornada}: Tu Elección</h3>
                        {picksClosed ? <div className="text-center p-4 bg-black/20 rounded-lg"><p className="text-amber-400 text-lg">Las elecciones para esta jornada están cerradas.</p><p className="text-white/70 mt-2">Tu elección fue: <strong className="font-bold text-white">{player.picks.find(p=>p.jornada === jornada)?.team || 'No elegiste'}</strong></p></div>
                        : hasPicked ? <div className="text-center p-4 bg-black/20 rounded-lg"><p className="text-green-400 text-lg">¡Elección guardada!</p><p className="text-white/70 mt-2">Has elegido a: <strong className="font-bold text-white">{player.picks.find(p=>p.jornada === jornada).team}</strong></p></div>
                        : (<form onSubmit={handleSubmit}><p className="text-white/60 mb-4">Elige un equipo ganador para esta jornada.</p><select value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)} className="w-full p-3 bg-black/20 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"><option value="" className="bg-gray-800">-- Selecciona un equipo --</option>{availableTeams.map(team => <option key={team} value={team} className="bg-gray-800">{team}</option>)}</select><button type="submit" disabled={!selectedTeam} className="mt-4 w-full bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-bold py-3 rounded-lg shadow-lg hover:shadow-yellow-400/20 transform hover:scale-105 transition-all duration-300 disabled:from-gray-600 disabled:to-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed">Confirmar Elección</button></form>)}
                    </div>
                </Card>
            )}

            <Card className="lg:col-span-2"><div className="p-6"><h3 className="text-2xl font-bold text-amber-300 mb-4">Historial</h3>{player.picks.length > 0 ? <ul className="space-y-3">{player.picks.slice().reverse().map(pick => <li key={pick.jornada} className="flex justify-between items-center bg-black/20 p-3 rounded-lg"><span className="text-white/50">Jornada {pick.jornada}</span><strong className="font-semibold text-white">{pick.team}</strong></li>)}</ul> : <p className="text-white/60">Aún no has hecho ninguna elección.</p>}</div></Card>
            <Card><div className="p-6"><h3 className="text-2xl font-bold text-amber-300 mb-4">Activos</h3><ul className="space-y-3">{players.filter(p => p.status === 'activo').map(p => <li key={p.id} className="flex items-center text-white bg-black/20 p-3 rounded-lg"><ShieldCheckIcon className="h-5 w-5 mr-3 text-green-400" />{p.name}</li>)}</ul></div></Card>
        </div>
    );
};

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
        <Card className="animate-fade-in"><div className="p-6">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-400 mb-6 flex items-center gap-3"><CogIcon className="h-8 w-8" />Panel de Administración</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card className="bg-black/20"><div className="p-4"><h3 className="text-xl font-bold text-amber-300 mb-3">Añadir Jugador</h3><form onSubmit={handleAddPlayer} className="flex gap-2"><input type="text" value={newPlayerName} onChange={(e) => setNewPlayerName(e.target.value)} placeholder="Nombre del amigo" className="flex-grow p-2 bg-black/20 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-400" /><button type="submit" className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-500 transition-colors">Añadir</button></form></div></Card>
                <Card className="bg-black/20"><div className="p-4"><h3 className="text-xl font-bold text-amber-300 mb-3">Control de Jornada</h3><div className="flex flex-col sm:flex-row gap-4"><button onClick={handleProcess} disabled={picksClosed} className="flex-1 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-500 disabled:bg-gray-600 transition-colors">Procesar J.{jornada}</button><button onClick={handleAdvance} disabled={!picksClosed} className="flex-1 bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-500 disabled:bg-gray-600 transition-colors">Avanzar a J.{jornada + 1}</button></div></div></Card>
            </div>
            <Card className="bg-black/20 mb-6"><div className="p-4"><h3 className="text-xl font-bold text-amber-300 mb-3">Introducir Resultados Jornada {jornada}</h3><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">{JORNADAS_DATA[jornada]?.matches.map(match => (<div key={match.id} className="flex items-center justify-between text-sm bg-black/20 p-2 rounded-lg"><span className="text-white/70 truncate pr-2">{match.home} vs {match.away}</span><select onChange={(e) => handleResultChange(match.id, e.target.value)} className="p-1 bg-gray-700 border border-gray-600 rounded text-white text-xs"><option value="" className="bg-gray-800">Ganador</option><option value={match.home} className="bg-gray-800">{match.home}</option><option value={match.away} className="bg-gray-800">{match.away}</option><option value="DRAW" className="bg-gray-800">Empate</option></select></div>))}</div></div></Card>
            <div><h3 className="text-2xl font-bold text-amber-300 mb-4">Lista de Jugadores</h3><div className="overflow-x-auto"><table className="w-full text-left text-white">
                <thead className="border-b border-white/20"><tr className="text-white/50 text-sm"><th className="p-3">Nombre</th><th className="p-3">Estado</th><th className="p-3">Elección (J{jornada})</th><th className="p-3 text-right">Acciones</th></tr></thead>
                <tbody>{players.map(p => { const currentPick = p.picks.find(pick => pick.jornada === jornada); return ( <tr key={p.id} className="border-b border-white/10 hover:bg-white/5"><td className="p-3 font-semibold">{p.name}</td><td className={`p-3 font-semibold ${p.status === 'activo' ? 'text-green-400' : 'text-red-500'}`}>{p.status}</td><td className="p-3">{currentPick?.team || <span className="text-white/40">Sin elección</span>}</td><td className="p-3 text-right">{currentPick && !picksClosed && (<button onClick={() => onRemovePick(p.id)} className="bg-red-700/80 text-white text-xs font-bold p-2 rounded-full hover:bg-red-600 transition-colors"><TrashIcon /></button>)}</td></tr> )})}</tbody>
            </table></div></div>
        </div></Card>
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
  const handleRemovePick = async (playerId) => { const player = gameState.players.find(p => p.id === playerId); if (!player) return; const newPicks = player.picks.filter(p => p.jornada !== gameState.jornada); const playerRef = doc(db, "players", playerId); try { await updateDoc(playerRef, { picks: newPicks }); handleShowModal("Elección Anulada", `Se ha borrado la elección de ${player.name} para la jornada ${gameState.jornada}.`); } catch (error) { handleShowModal("Error", "No se pudo anular la elección."); console.error("Error updating player pick: ", error); } };
  const handleProcessJornada = async (results) => { const { players, jornada } = gameState; const batch = writeBatch(db); let eliminados = []; players.forEach(player => { if (player.status !== 'activo') return; let shouldBeEliminated = true; const pick = player.picks.find(p => p.jornada === jornada); if (pick) { const matchOfPick = JORNADAS_DATA[jornada].matches.find(m => m.home === pick.team || m.away === pick.team); if (matchOfPick) { const result = results.find(r => r.matchId === matchOfPick.id); if (result && result.winner === pick.team) { shouldBeEliminated = false; } } } if (shouldBeEliminated) { eliminados.push(player.name); const playerRef = doc(db, "players", player.id); batch.update(playerRef, { status: 'eliminado', jornadaEliminado: jornada }); } }); const gameStateRef = doc(db, "game", "state"); batch.update(gameStateRef, { picksClosed: true }); await batch.commit(); handleShowModal("Jornada Procesada", `Jugadores eliminados: ${eliminados.join(', ') || 'Ninguno'}. Las elecciones están cerradas.`); };
  const handleAdvanceJornada = async () => { const gameStateRef = doc(db, "game", "state"); await setDoc(gameStateRef, { jornada: gameState.jornada + 1, picksClosed: false }, { merge: true }); };
  const handleGoToWelcome = () => { setLoggedInPlayer(null); setSelectedPlayerId(''); setScreen('welcome'); }

  const renderScreen = () => {
    if (isLoading) return <div className="text-center text-2xl text-amber-300 mt-16">Conectando...</div>;
    switch (screen) {
      case 'dashboard': return loggedInPlayer ? <PlayerDashboard loggedInPlayer={loggedInPlayer} gameState={gameState} onShowModal={handleShowModal} /> : <div className="text-center text-xl text-red-500">Error: Selecciona un jugador para continuar.</div>;
      case 'admin': return <AdminPanel gameState={gameState} onProcessJornada={handleProcessJornada} onAdvanceJornada={handleAdvanceJornada} onShowModal={handleShowModal} onAddPlayer={handleAddPlayer} onRemovePick={handleRemovePick} />;
      case 'welcome': default: return <WelcomeScreen onEnter={handleEnterGame} players={gameState.players} selectedPlayerId={selectedPlayerId} setSelectedPlayerId={setSelectedPlayerId} />;
    }
  };

  return (
    <div className="bg-slate-900 text-white min-h-screen font-sans flex flex-col overflow-hidden">
      {/* Aurora Background Effect */}
      <div className="aurora-bg">
          <div className="aurora-bg__blur-1"></div>
          <div className="aurora-bg__blur-2"></div>
          <div className="aurora-bg__blur-3"></div>
      </div>
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&display=swap');
        body { font-family: 'Sora', sans-serif; }
        .animate-fade-in { animation: fadeIn 0.7s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        
        /* Aurora Background Styles */
        .aurora-bg { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -1; }
        .aurora-bg__blur-1, .aurora-bg__blur-2, .aurora-bg__blur-3 {
            position: absolute;
            filter: blur(100px);
            opacity: 0.4;
            border-radius: 50%;
        }
        .aurora-bg__blur-1 {
            width: 400px; height: 400px;
            background: rgba(253, 224, 71, 0.3); /* yellow */
            top: -50px; left: -100px;
            animation: move1 20s infinite alternate;
        }
        .aurora-bg__blur-2 {
            width: 500px; height: 500px;
            background: rgba(59, 130, 246, 0.3); /* blue */
            bottom: -100px; right: -150px;
            animation: move2 25s infinite alternate;
        }
        .aurora-bg__blur-3 {
            width: 300px; height: 300px;
            background: rgba(168, 85, 247, 0.3); /* purple */
            bottom: 50px; left: 100px;
            animation: move3 15s infinite alternate;
        }

        @keyframes move1 { from { transform: translate(0, 0) rotate(0deg); } to { transform: translate(100px, 50px) rotate(30deg); } }
        @keyframes move2 { from { transform: translate(0, 0) rotate(0deg); } to { transform: translate(-150px, -50px) rotate(-40deg); } }
        @keyframes move3 { from { transform: translate(0, 0) rotate(0deg); } to { transform: translate(50px, -100px) rotate(20deg); } }
      `}</style>
      
      <div className="relative z-10 flex flex-col min-h-screen">
        {modal.isOpen && <Modal title={modal.title} message={modal.message} onClose={handleCloseModal} />}
        <Header />
        <nav className="bg-black/10 backdrop-blur-lg p-2 sticky top-0 z-30 mb-4 border-b border-t border-white/10">
            <div className="container mx-auto flex justify-center items-center gap-2 md:gap-6">
                <button onClick={handleGoToWelcome} className="px-4 py-2 text-sm md:text-base rounded-lg transition-colors text-white/70 hover:bg-white/10 hover:text-white">Inicio / Cambiar Jugador</button>
                <button onClick={() => setScreen('admin')} className="px-4 py-2 text-sm md:text-base rounded-lg transition-colors text-white/70 hover:bg-white/10 hover:text-white">Admin</button>
            </div>
        </nav>
        <main className="container mx-auto p-4 md:p-6 flex-grow">
            {renderScreen()}
        </main>
        <Footer />
      </div>
    </div>
  );
}