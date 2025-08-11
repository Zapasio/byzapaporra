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
const TEAMS_DATA = { /* ... (datos de equipos actualizados) ... */ };
const BANNED_TEAMS = ['rma', 'bar'];
const JORNADAS_DATA = { /* ... (calendario completo de 38 jornadas) ... */ };

// --- COMPONENTES DE UI con DISEÑO FINAL ---

const Header = () => (
    <header className="p-4">
        <div className="container mx-auto flex items-center justify-center gap-4">
            <img src="https://www.laliga.com/build/assets/img/logo-laliga-h-negativo.50f7549a.svg" alt="La Liga" className="h-10"/>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-wide">
                PORRA BYZAPA
            </h1>
        </div>
    </header>
);

const Footer = () => <footer className="text-center p-6 mt-auto"><p className="text-sm text-gray-500">Creado por ByZapa</p></footer>;
const Modal = ({ title, message, onClose }) => <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"><div className="glass-effect rounded-xl p-8 w-full max-w-md text-center"><h3 className="text-2xl font-bold mb-4 gold-gradient bg-clip-text text-transparent">{title}</h3><p className="text-white mb-6">{message}</p><button onClick={onClose} className="gold-gradient text-black font-bold py-2 px-8 rounded-full hover:scale-105 transition-transform">Entendido</button></div></div>;

const AuthScreen = ({ onShowModal }) => {
    // ... (código de autenticación sin cambios)
};

const PlayerDashboard = ({ loggedInPlayer, gameState, onShowModal, onLogout }) => {
    // ... (código del dashboard con nuevo diseño)
};

const AdminPanel = ({ onProcessJornada, onAdvanceJornada, onShowModal, onRemovePick, gameState }) => {
    // ... (código del panel de admin con nuevo diseño)
};

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [gameState, setGameState] = useState({ players: [], jornada: 1, picksClosed: false });
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // ... (lógica de Firebase sin cambios)
  }, []);

  const handleShowModal = (title, message) => setModal({ isOpen: true, title, message });
  const handleCloseModal = () => setModal({ isOpen: false, title: '', message: '' });
  const handleLogout = async () => { await signOut(auth); };
  const handleRemovePick = async (playerId) => { /* ... */ };
  const handleProcessJornada = async (results) => { /* ... */ };
  const handleAdvanceJornada = async () => { /* ... */ };

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
    <div className="bg-gray-900 text-white min-h-screen font-sans flex flex-col bg-cover bg-center bg-fixed" style={{backgroundImage: "url('https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')"}}>
      <div className="bg-black/70 absolute inset-0 z-0"></div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700;900&display=swap');
        body { font-family: 'Roboto', sans-serif; }
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
