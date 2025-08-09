import React, { useState, useMemo, useEffect } from 'react';
// Importamos TODO lo necesario de Firebase, incluyendo Autenticación
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, onSnapshot, setDoc, updateDoc, getDoc } from "firebase/firestore";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    sendPasswordResetEmail
} from "firebase/auth";

// --- TUS CLAVES DE FIREBASE ---
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID
};

// Initialize Firebase services
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// --- Iconos SVG ---
const TrophyIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M20.2,2H3.8C3.3,2,3,2.3,3,2.8v13.4c0,0.5,0.3,0.8,0.8,0.8h3.4c-0.1,0.3-0.2,0.6-0.2,0.9c0,1.9,1.6,3.5,3.5,3.5s3.5-1.6,3.5-3.5c0-0.3-0.1-0.6-0.2-0.9h3.4c0.5,0,0.8-0.3,0.8-0.8V2.8C21,2.3,20.7,2,20.2,2z M10.5,20.5c-1.4,0-2.5-1.1-2.5-2.5s1.1-2.5,2.5-2.5s2.5,1.1,2.5,2.5S11.9,20.5,10.5,20.5z M19,15H5V4h14V15z"/><path d="M6,5h2v5H6V5z M16,5h-2v5h2V5z"/></svg>;
const UserIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>;
const ShieldCheckIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.944a12.02 12.02 0 009 3c4.524 0 8.384-2.686 9.954-6.618a12.02 12.02 0 00-4.336-11.944z" /></svg>;
const ExclamationCircleIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const CogIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.532 1.532 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.532 1.532 0 01-.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106A1.532 1.532 0 0111.49 3.17zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;

// --- DATOS DEL JUEGO ---
const TEAMS_DATA = {
    'ala': { name: 'Alavés', logo: 'https://ssl.gstatic.com/onebox/media/sports/logos/32_6Y-Q1e3u2y2-3Ias80A_96x96.png' },
    'ath': { name: 'Athletic Club', logo: 'https://ssl.gstatic.com/onebox/media/sports/logos/paYnEE8hcrP96neHRNofhQ_96x96.png' },
    'atm': { name: 'Atlético de Madrid', logo: 'https://ssl.gstatic.com/onebox/media/sports/logos/srSSZ961en6BAMtcB2nlyA_96x96.png' },
    'bar': { name: 'FC Barcelona', logo: 'https://ssl.gstatic.com/onebox/media/sports/logos/paYnEE8hcrP96neHRNofhQ_96x96.png' },
    'bet': { name: 'Betis', logo: 'https://ssl.gstatic.com/onebox/media/sports/logos/S0fDZjYYytbZaUt0f3cIhg_96x96.png' },
    'cad': { name: 'Cádiz', logo: 'https://ssl.gstatic.com/onebox/media/sports/logos/Irs_FUL8l12H35I6la_sow_96x96.png' },
    'cel': { name: 'Celta Vigo', logo: 'https://ssl.gstatic.com/onebox/media/sports/logos/1Gdpf-Ph-Ipu7_8h8a0v7g_96x96.png' },
    'get': { name: 'Getafe', logo: 'https://ssl.gstatic.com/onebox/media/sports/logos/1f81u0h0NL1hZ3v3x_soCQ_96x96.png' },
    'gir': { name: 'Girona', logo: 'https://ssl.gstatic.com/onebox/media/sports/logos/sHiSmLm_V4qBYa7e2a4G2A_96x96.png' },
    'gra': { name: 'Granada', logo: 'https://ssl.gstatic.com/onebox/media/sports/logos/f-kQZblCFLSM2-t-2lG6Ag_96x96.png' },
    'lp': { name: 'Las Palmas', logo: 'https://ssl.gstatic.com/onebox/media/sports/logos/l2V1L6a01sYY60y4j2-w1A_96x96.png' },
    'mal': { name: 'Mallorca', logo: 'https://ssl.gstatic.com/onebox/media/sports/logos/1dfi-K2AC5q3xZ7652j7qg_96x96.png' },
    'osa': { name: 'Osasuna', logo: 'https://ssl.gstatic.com/onebox/media/sports/logos/S-48I0hjkkc0D2dY9L-3xw_96x96.png' },
    'ray': { name: 'Rayo Vallecano', logo: 'https://ssl.gstatic.com/onebox/media/sports/logos/QOUA2k5J41J2s2xMJWvQ_A_96x96.png' },
    'rma': { name: 'Real Madrid', logo: 'https://ssl.gstatic.com/onebox/media/sports/logos/Th4fAVAZeCJWRcKoLW7koA_96x96.png' },
    'rso': { name: 'Real Sociedad', logo: 'https://ssl.gstatic.com/onebox/media/sports/logos/6f2k-PGFzK62e2y6z15HSA_96x96.png' },
    'sev': { name: 'Sevilla', logo: 'https://ssl.gstatic.com/onebox/media/sports/logos/h4FUmAq3_gR93vjHjE5t1A_96x96.png' },
    'val': { name: 'Valencia', logo: 'https://ssl.gstatic.com/onebox/media/sports/logos/QPbGOIML1qIqzzc112-AEQ_96x96.png' },
    'vil': { name: 'Villarreal', logo: 'https://ssl.gstatic.com/onebox/media/sports/logos/WKHd2bT-3e2e2VpUNvD_uw_96x96.png' },
    'leg': { name: 'Leganés', logo: 'https://ssl.gstatic.com/onebox/media/sports/logos/62K2z9704o3nQX9xgrwD3w_96x96.png' },
    'valld': { name: 'Valladolid', logo: 'https://ssl.gstatic.com/onebox/media/sports/logos/3h1fBwSjO3mb8gSjsd23aA_96x96.png' },
    'esp': { name: 'Espanyol', logo: 'https://ssl.gstatic.com/onebox/media/sports/logos/wSDRf24sDbD3p87L-2rf5A_96x96.png' }
};
const BANNED_TEAMS = ['rma', 'bar'];
const JORNADAS_DATA = { 1: { matches: [ { id: 'J1-M1', home: 'ath', away: 'get' }, { id: 'J1-M2', home: 'bet', away: 'gir' }, { id: 'J1-M3', home: 'mal', away: 'rma' }, { id: 'J1-M4', home: 'rso', away: 'ray' }, { id: 'J1-M5', home: 'val', away: 'bar' }, { id: 'J1-M6', home: 'vil', away: 'atm' }, { id: 'J1-M7', home: 'osa', away: 'leg' }, { id: 'J1-M8', home: 'cel', away: 'ala' }, { id: 'J1-M9', home: 'lp', away: 'sev' }, { id: 'J1-M10', home: 'valld', away: 'esp' } ], results: [] }, 2: { matches: [ { id: 'J2-M1', home: 'ala', away: 'bet' }, { id: 'J2-M2', home: 'atm', away: 'ath' }, { id: 'J2-M3', home: 'bar', away: 'valld' }, { id: 'J2-M4', home: 'get', away: 'ray' }, { id: 'J2-M5', home: 'gir', away: 'osa' }, { id: 'J2-M6', home: 'rma', away: 'rso' }, { id: 'J2-M7', home: 'sev', away: 'cel' }, { id: 'J2-M8', home: 'esp', away: 'mal' }, { id: 'J2-M9', home: 'leg', away: 'lp' }, { id: 'J2-M10', home: 'val', away: 'vil' } ], results: [] }, 3: { matches: [ { id: 'J3-M1', home: 'ath', away: 'val' }, { id: 'J3-M2', home: 'bet', away: 'get' }, { id: 'J3-M3', home: 'cel', away: 'vil' }, { id: 'J3-M4', home: 'gir', away: 'atm' }, { id: 'J3-M5', home: 'lp', away: 'ray' }, { id: 'J3-M6', home: 'mal', away: 'bar' }, { id: 'J3-M7', home: 'osa', away: 'sev' }, { id: 'J3-M8', home: 'rma', away: 'esp' }, { id: 'J3-M9', home: 'rso', away: 'ala' }, { id: 'J3-M10', home: 'valld', away: 'leg' } ], results: [] }, 4: { matches: [ { id: 'J4-M1', home: 'ala', away: 'lp' }, { id: 'J4-M2', home: 'atm', away: 'rso' }, { id: 'J4-M3', home: 'bar', away: 'gir' }, { id: 'J4-M4', home: 'get', away: 'mal' }, { id: 'J4-M5', home: 'ray', away: 'valld' }, { id: 'J4-M6', home: 'sev', away: 'rma' }, { id: 'J4-M7', home: 'val', away: 'cel' }, { id: 'J4-M8', home: 'vil', away: 'bet' }, { id: 'J4-M9', home: 'esp', away: 'ath' }, { id: 'J4-M10', home: 'leg', away: 'osa' } ], results: [] }};

// --- COMPONENTES DE UI con DISEÑO GLASSMORPHISM ---

const Header = () => ( <header className="p-4"><div className="container mx-auto flex items-center justify-center gap-3"><h1 className="text-3xl md:text-4xl font-black gold-gradient bg-clip-text text-transparent tracking-wide">PORRA BYZAPA</h1></div></header> );
const Footer = () => <footer className="text-center p-6 mt-auto"><p className="text-sm text-gray-500">Creado por ByZapa</p></footer>;
const Modal = ({ title, message, onClose }) => <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"><div className="glass-effect rounded-xl p-8 w-full max-w-md text-center"><h3 className="text-2xl font-bold mb-4 gold-gradient bg-clip-text text-transparent">{title}</h3><p className="text-white mb-6">{message}</p><button onClick={onClose} className="gold-gradient text-black font-bold py-2 px-8 rounded-full hover:scale-105 transition-transform">Entendido</button></div></div>;

const AuthScreen = ({ onShowModal }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [resetEmail, setResetEmail] = useState('');
    const [showPasswordReset, setShowPasswordReset] = useState(false);

    const handleAuth = async (e) => { e.preventDefault(); try { if (isLogin) { await signInWithEmailAndPassword(auth, email, password); } else { const userCredential = await createUserWithEmailAndPassword(auth, email, password); await setDoc(doc(db, "players", userCredential.user.uid), { name: name, email: email, status: 'activo', picks: [], jornadaEliminado: null, role: 'player' }); } } catch (err) { onShowModal("Error de Autenticación", err.message); } };
    const handlePasswordReset = async () => { if (!resetEmail) { onShowModal("Error", "Por favor, introduce tu email."); return; } try { await sendPasswordResetEmail(auth, resetEmail); onShowModal("Correo Enviado", "Se ha enviado un enlace a tu email para recuperar tu contraseña."); setShowPasswordReset(false); setResetEmail(''); } catch (err) { onShowModal("Error", err.message); } };

    if (showPasswordReset) { return ( <div className="text-center p-4 max-w-md mx-auto animate-fade-in flex flex-col items-center justify-center min-h-[70vh]"><div className="glass-effect rounded-xl p-8 w-full"><h3 className="text-2xl font-semibold text-white mb-4">Recuperar Contraseña</h3><p className="text-gray-400 mb-6">Introduce tu email y te enviaremos un enlace.</p><input type="email" placeholder="Tu email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} className="w-full p-3 bg-gray-900/80 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 mb-4" /><button onClick={handlePasswordReset} className="w-full gold-gradient text-black font-bold py-3 px-8 rounded-full shadow-lg shadow-yellow-500/20 transform hover:scale-105 transition-all duration-300">Enviar Correo</button><button onClick={() => setShowPasswordReset(false)} className="mt-4 text-gray-400 hover:text-white">Volver</button></div></div> ); }
    return ( <div className="text-center p-4 max-w-md mx-auto animate-fade-in flex flex-col items-center justify-center min-h-[70vh]"><h2 className="text-6xl font-black gold-gradient bg-clip-text text-transparent mb-4">{isLogin ? 'Bienvenido' : 'Únete a la Porra'}</h2><p className="text-gray-400 mb-8 text-lg">{isLogin ? 'Inicia sesión para continuar.' : 'Crea tu cuenta para empezar a jugar.'}</p><div className="glass-effect rounded-xl p-8 w-full"><form onSubmit={handleAuth} className="space-y-4">{!isLogin && (<input type="text" placeholder="Tu Nombre" value={name} onChange={(e) => setName(e.target.value)} required className="w-full p-3 bg-gray-900/80 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400" />)}<input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full p-3 bg-gray-900/80 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400" /><input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full p-3 bg-gray-900/80 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400" /><button type="submit" className="w-full gold-gradient text-black font-bold py-3 px-8 rounded-full shadow-lg shadow-yellow-500/20 transform hover:scale-105 transition-all duration-300">{isLogin ? 'Entrar' : 'Registrarse y Pagar 20€'}</button></form><button onClick={() => setIsLogin(!isLogin)} className="mt-6 text-yellow-400 hover:text-yellow-300">{isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}</button>{isLogin && (<button onClick={() => setShowPasswordReset(true)} className="mt-2 text-sm text-gray-400 hover:text-white">¿Has olvidado tu contraseña?</button>)}</div></div> );
};

const PlayerDashboard = ({ loggedInPlayer, gameState, onShowModal, onLogout }) => {
    const { players, jornada, picksClosed } = gameState;
    const player = players.find(p => p.id === loggedInPlayer.uid);
    if (!player) return <div className="text-center text-yellow-400">Cargando tus datos...</div>;
    const hasPicked = player.picks.some(p => p.jornada === jornada);
    const availableTeams = useMemo(() => { const pickedTeams = new Set(player.picks.map(p => p.team)); const teamsInJornada = new Set(JORNADAS_DATA[jornada]?.matches.flatMap(m => [m.home, m.away]) || []); return Object.keys(TEAMS_DATA).filter(teamId => !pickedTeams.has(teamId) && teamsInJornada.has(teamId) && !BANNED_TEAMS.includes(teamId)); }, [player.picks, jornada]);
    const [selectedTeam, setSelectedTeam] = useState('');
    const handleSubmit = async (e) => { e.preventDefault(); if (selectedTeam) { const newPick = { jornada, team: selectedTeam }; const updatedPicks = [...player.picks, newPick]; const playerRef = doc(db, "players", player.id); await updateDoc(playerRef, { picks: updatedPicks }); onShowModal("¡Elección Guardada!", `Has elegido a ${TEAMS_DATA[selectedTeam].name}. ¡Mucha suerte!`); setSelectedTeam(''); } };
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
            <div className="lg:col-span-2 space-y-8">
                <div className="glass-effect rounded-xl p-6"><div className="flex items-center justify-between"><div className="flex items-center gap-4"><UserIcon className="h-12 w-12 text-yellow-400" /><div><h2 className="text-3xl font-bold text-white">{player.name}</h2>{player.status === 'activo' ? <div className="flex items-center text-green-400 font-semibold"><ShieldCheckIcon className="h-5 w-5 mr-2"/>Activo</div> : <div className="flex items-center text-red-500 font-semibold"><ExclamationCircleIcon className="h-5 w-5 mr-2"/>Eliminado en J.{player.jornadaEliminado}</div>}</div></div><button onClick={onLogout} className="bg-red-600/80 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors">Salir</button></div></div>
                {player.status === 'activo' && (
                    <div className="glass-effect rounded-xl p-6">
                        <h3 className="text-2xl font-bold mb-4 gold-gradient bg-clip-text text-transparent">Jornada {jornada}: Tu Elección</h3>
                        {picksClosed ? <div className="text-center p-4 bg-black/20 rounded-lg"><p className="text-yellow-400 text-lg">Las elecciones están cerradas.</p><p className="text-gray-300 mt-2">Tu elección: <strong className="font-bold text-white">{player.picks.find(p=>p.jornada === jornada)?.team ? TEAMS_DATA[player.picks.find(p=>p.jornada === jornada)?.team].name : 'N/A'}</strong></p></div>
                        : hasPicked ? <div className="text-center p-4 bg-black/20 rounded-lg"><p className="text-green-400 text-lg">¡Elección guardada!</p><p className="text-gray-300 mt-2">Has elegido a: <strong className="font-bold text-white">{TEAMS_DATA[player.picks.find(p=>p.jornada === jornada).team].name}</strong></p></div>
                        : (<form onSubmit={handleSubmit}><p className="text-gray-400 mb-4">Elige un equipo ganador para esta jornada.</p><select value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)} className="w-full p-3 bg-gray-900/80 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"><option value="" className="bg-gray-800">-- Selecciona un equipo --</option>{availableTeams.map(teamId => <option key={teamId} value={teamId} className="bg-gray-800">{TEAMS_DATA[teamId].name}</option>)}</select><button type="submit" disabled={!selectedTeam} className="mt-4 w-full gold-gradient text-black font-bold py-3 rounded-full shadow-lg shadow-yellow-500/20 transform hover:scale-105 transition-all duration-300 disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed">Confirmar Elección</button></form>)}
                    </div>
                )}
                <div className="glass-effect rounded-xl p-6"><h3 className="text-2xl font-bold mb-4 gold-gradient bg-clip-text text-transparent">Partidos Jornada {jornada}</h3><div className="space-y-3">{JORNADAS_DATA[jornada]?.matches.map(match => (<div key={match.id} className="flex items-center justify-center text-center bg-black/20 p-3 rounded-lg"><div className="flex-1 flex items-center justify-end gap-3"><span className="font-bold text-white">{TEAMS_DATA[match.home].name}</span><img src={TEAMS_DATA[match.home].logo} alt={TEAMS_DATA[match.home].name} className="w-8 h-8"/></div><span className="text-gray-500 mx-4">vs</span><div className="flex-1 flex items-center justify-start gap-3"><img src={TEAMS_DATA[match.away].logo} alt={TEAMS_DATA[match.away].name} className="w-8 h-8"/><span className="font-bold text-white">{TEAMS_DATA[match.away].name}</span></div></div>))}</div></div>
            </div>
            <div className="space-y-8">
                <div className="glass-effect rounded-xl p-6 text-center"><h3 className="text-xl font-semibold mb-2 gold-gradient bg-clip-text text-transparent">Bote Actual</h3><p className="text-5xl font-bold text-white">{((players.length * 20) * 0.85).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</p><p className="text-sm text-gray-500 mt-2">Comisión: {((players.length * 20) * 0.15).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</p></div>
                <div className="glass-effect rounded-xl p-6"><h3 className="text-2xl font-bold mb-4 gold-gradient bg-clip-text text-transparent">Clasificación</h3><ul className="space-y-3">{players.sort((a, b) => b.picks.length - a.picks.length).map(p => <li key={p.id} className={`flex items-center justify-between text-white bg-black/20 p-3 rounded-md ${p.status === 'eliminado' ? 'opacity-50' : ''}`}><div className="flex items-center"><ShieldCheckIcon className={`h-5 w-5 mr-3 ${p.status === 'activo' ? 'text-green-400' : 'text-red-500'}`} />{p.name}</div><span className="font-bold">{p.picks.length} pts</span></li>)}</ul></div>
            </div>
        </div>
    );
};

const AdminPanel = ({ onProcessJornada, onAdvanceJornada, onShowModal, onRemovePick, gameState }) => {
    const { players, jornada, picksClosed } = gameState;
    const [results, setResults] = useState(JORNADAS_DATA[jornada]?.matches.map(m => ({ matchId: m.id, winner: '' })) || []);
    useEffect(() => { setResults(JORNADAS_DATA[jornada]?.matches.map(m => ({ matchId: m.id, winner: '' })) || []); }, [jornada]);
    const handleResultChange = (matchId, winner) => { setResults(prev => prev.map(r => r.matchId === matchId ? { ...r, winner } : r)); };
    const handleProcess = () => { const validResults = results.filter(r => r.winner); if (validResults.length === 0) { onShowModal("Error", "Debes introducir al menos un resultado para procesar la jornada."); return; } onProcessJornada(validResults); };
    const handleAdvance = () => { if (!JORNADAS_DATA[jornada + 1]) { onShowModal("Error", "No hay datos para la siguiente jornada."); return; } onAdvanceJornada(); };

    return (
        <div className="glass-effect rounded-xl p-6 animate-fade-in">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3 gold-gradient bg-clip-text text-transparent"><CogIcon className="h-8 w-8 text-yellow-400" />Panel de Administración</h2>
            <div className="mb-8 bg-black/20 p-4 rounded-lg"><h3 className="text-xl font-bold text-yellow-400 mb-3">Introducir Resultados Jornada {jornada}</h3><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">{JORNADAS_DATA[jornada]?.matches.map(match => (<div key={match.id} className="flex items-center justify-between text-sm bg-gray-900/80 p-2 rounded-lg"><span className="text-gray-300 truncate pr-2">{TEAMS_DATA[match.home].name} vs {TEAMS_DATA[match.away].name}</span><select onChange={(e) => handleResultChange(match.id, e.target.value)} className="p-1 bg-gray-700 border border-gray-600 rounded text-white text-xs"><option value="" className="bg-gray-800">Ganador</option><option value={match.home} className="bg-gray-800">{TEAMS_DATA[match.home].name}</option><option value={match.away} className="bg-gray-800">{TEAMS_DATA[match.away].name}</option><option value="DRAW" className="bg-gray-800">Empate</option></select></div>))}</div></div>
            <div className="space-y-4 mb-6"><p className="text-white">Jornada Actual: <strong className="text-xl text-yellow-400">{jornada}</strong></p><p className="text-white">Estado de Elecciones: <strong className={picksClosed ? 'text-red-500' : 'text-green-400'}>{picksClosed ? 'Cerradas' : 'Abiertas'}</strong></p></div>
            <div className="flex flex-col sm:flex-row gap-4"><button onClick={handleProcess} disabled={picksClosed} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-500 disabled:bg-gray-600 transition-colors">Procesar Jornada {jornada}</button><button onClick={handleAdvance} disabled={!picksClosed} className="bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-500 disabled:bg-gray-600 transition-colors">Avanzar a Jornada {jornada + 1}</button></div>
            <div className="mt-8"><h3 className="text-2xl font-bold mb-4 gold-gradient bg-clip-text text-transparent">Lista de Jugadores</h3><div className="overflow-x-auto"><table className="w-full text-left text-white">
                <thead className="border-b border-gray-700"><tr className="text-gray-400 text-sm"><th className="p-3">Nombre</th><th className="p-3">Estado</th><th className="p-3">Elección (J{jornada})</th><th className="p-3 text-right">Acciones</th></tr></thead>
                <tbody>{players.map(p => { const currentPick = p.picks.find(pick => pick.jornada === jornada); return ( <tr key={p.id} className="border-b border-gray-800 hover:bg-gray-900/50"><td className="p-3 font-semibold">{p.name}</td><td className={`p-3 font-semibold ${p.status === 'activo' ? 'text-green-400' : 'text-red-500'}`}>{p.status}</td><td className="p-3">{currentPick?.team ? TEAMS_DATA[currentPick.team].name : <span className="text-gray-500">Sin elección</span>}</td><td className="p-3 text-right">{currentPick && !picksClosed && (<button onClick={() => onRemovePick(p.id)} className="bg-red-700 text-white text-xs font-bold p-2 rounded-full hover:bg-red-600 transition-colors"><TrashIcon /></button>)}</td></tr> )})}</tbody>
            </table></div></div>
        </div>
    );
};

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [gameState, setGameState] = useState({ players: [], jornada: 1, picksClosed: false });
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async user => {
        if (user) {
            const userDoc = await getDoc(doc(db, "players", user.uid));
            if (userDoc.exists() && userDoc.data().role === 'admin') { setIsAdmin(true); } else { setIsAdmin(false); }
            setCurrentUser(user);
        } else {
            setCurrentUser(null);
            setIsAdmin(false);
        }
        setIsLoading(false);
    });
    const gameStateRef = doc(db, "game", "state");
    const unsubscribeGame = onSnapshot(gameStateRef, (doc) => { if (doc.exists()) { setGameState(prev => ({ ...prev, ...doc.data() })); } else { setDoc(gameStateRef, { jornada: 1, picksClosed: false }); } });
    const playersRef = collection(db, "players");
    const unsubscribePlayers = onSnapshot(playersRef, (snapshot) => { const playersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); setGameState(prev => ({ ...prev, players: playersData })); });
    return () => { unsubscribeAuth(); unsubscribeGame(); unsubscribePlayers(); };
  }, []);

  const handleShowModal = (title, message) => setModal({ isOpen: true, title, message });
  const handleCloseModal = () => setModal({ isOpen: false, title: '', message: '' });
  const handleLogout = async () => { await signOut(auth); };
  const handleRemovePick = async (playerId) => { const player = gameState.players.find(p => p.id === playerId); if (!player) return; const newPicks = player.picks.filter(p => p.jornada !== gameState.jornada); const playerRef = doc(db, "players", playerId); try { await updateDoc(playerRef, { picks: newPicks }); handleShowModal("Elección Anulada", `Se ha borrado la elección de ${player.name} para la jornada ${gameState.jornada}.`); } catch (error) { handleShowModal("Error", "No se pudo anular la elección."); } };
  const handleProcessJornada = async (results) => { const { players, jornada } = gameState; const batch = writeBatch(db); let eliminados = []; players.forEach(player => { if (player.status !== 'activo') return; let shouldBeEliminated = true; const pick = player.picks.find(p => p.jornada === jornada); if (pick) { const matchOfPick = JORNADAS_DATA[jornada].matches.find(m => m.home === pick.team || m.away === pick.team); if (matchOfPick) { const result = results.find(r => r.matchId === matchOfPick.id); if (result && result.winner === pick.team) { shouldBeEliminated = false; } } } if (shouldBeEliminated) { eliminados.push(player.name); const playerRef = doc(db, "players", player.id); batch.update(playerRef, { status: 'eliminado', jornadaEliminado: jornada }); } }); const gameStateRef = doc(db, "game", "state"); batch.update(gameStateRef, { picksClosed: true }); await batch.commit(); handleShowModal("Jornada Procesada", `Jugadores eliminados: ${eliminados.join(', ') || 'Ninguno'}. Las elecciones están cerradas.`); };
  const handleAdvanceJornada = async () => { const gameStateRef = doc(db, "game", "state"); await setDoc(gameStateRef, { jornada: gameState.jornada + 1, picksClosed: false }, { merge: true }); };

  const renderContent = () => {
      if (isLoading) return <div className="text-center text-2xl text-yellow-400 mt-16">Cargando...</div>;
      if (currentUser) {
          if (isAdmin) {
              return <AdminPanel gameState={gameState} onProcessJornada={handleProcessJornada} onAdvanceJornada={handleAdvanceJornada} onShowModal={handleShowModal} onRemovePick={handleRemovePick} />;
          }
          return <PlayerDashboard loggedInPlayer={currentUser} gameState={gameState} onShowModal={handleShowModal} onLogout={handleLogout} />;
      }
      return <AuthScreen onShowModal={handleShowModal} />;
  };

  return (
    <div className="bg-black text-white min-h-screen font-sans flex flex-col">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700;900&display=swap');
        body { font-family: 'Roboto', sans-serif; background-color: #000; }
        .animate-fade-in { animation: fadeIn 0.5s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .gold-gradient { background: linear-gradient(135deg, #FFD700, #FFA500); }
        .glass-effect { background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.1); }
      `}</style>
      <div className="relative z-10 flex flex-col min-h-screen">
        {modal.isOpen && <Modal title={modal.title} message={modal.message} onClose={handleCloseModal} />}
        <Header />
        <main className="container mx-auto p-4 md:p-8 flex-grow">
            {renderContent()}
        </main>
        <Footer />
      </div>
    </div>
  );
}
