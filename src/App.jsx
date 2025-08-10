import React, { uimport React, { useState, useMemo, useEffect } from 'react';
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

// --- TUS CLAVES DE FIREBASE (Leídas de forma segura desde Vercel) ---
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

    if (showPasswordReset) { return ( <div className="text-center p-4 max-w-md mx-auto animate-fade-in flex flex-co