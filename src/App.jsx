import { useState, useEffect } from "react";
import { auth, db } from "../firebase"; // firebase.js en la raíz
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs
} from "firebase/firestore";

export default function App() {
  // Auth / estado base
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // App state visible
  const [status, setStatus] = useState("");
  const [players, setPlayers] = useState([]);
  const [gameState, setGameState] = useState({ jornada: 1, picksClosed: false });

  // ======== Sesión + rol admin + game/state en vivo ========
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      try {
        if (user) {
          setCurrentUser(user);
          // rol
          const meRef = doc(db, "players", user.uid);
          const meSnap = await getDoc(meRef);
          setIsAdmin(meSnap.exists() && meSnap.data().role === "admin");

          // game/state (si no existe, NO lo creamos aquí para no dar permisos de más)
          const gsRef = doc(db, "game", "state");
          const gsSnap = await getDoc(gsRef);
          if (gsSnap.exists()) {
            setGameState(gsSnap.data());
          } else {
            setGameState({ jornada: 1, picksClosed: false });
          }
        } else {
          setCurrentUser(null);
          setIsAdmin(false);
        }
      } catch (e) {
        console.error(e);
        setStatus("Error al cargar estado: " + e.message);
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  // ======== Auth acciones ========
  const register = async () => {
    try {
      setStatus("Creando usuario…");
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "players", cred.user.uid), {
        email,
        role: "user",
        name: email.split("@")[0],
        status: "activo",
        picks: [],
        jornadaEliminado: null
      });
      setStatus("Usuario registrado ✅");
    } catch (e) {
      setStatus("Error: " + e.message);
    }
  };

  const login = async () => {
    try {
      setStatus("Entrando…");
      await signInWithEmailAndPassword(auth, email, password);
      setStatus("Sesión iniciada ✅");
    } catch (e) {
      setStatus("Error: " + e.message);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setStatus("Sesión cerrada");
  };

  // ======== Utilidades admin ========
  const initGameState = async () => {
    try {
      setStatus("Inicializando game/state…");
      const ref = doc(db, "game", "state");
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        await setDoc(ref, { jornada: 1, picksClosed: false });
        setGameState({ jornada: 1, picksClosed: false });
        setStatus("game/state creado ✅");
      } else {
        setStatus("game/state ya existía");
      }
    } catch (e) {
      setStatus("Error init: " + e.message);
    }
  };

  const togglePicks = async () => {
    try {
      const ref = doc(db, "game", "state");
      const newVal = !gameState.picksClosed;
      await updateDoc(ref, { picksClosed: newVal });
      setGameState((g) => ({ ...g, picksClosed: newVal }));
      setStatus(`Elecciones ${newVal ? "cerradas" : "abiertas"} ✅`);
    } catch (e) {
      setStatus("Error cambiando estado: " + e.message);
    }
  };

  const advanceJornada = async () => {
    try {
      const ref = doc(db, "game", "state");
      const next = (gameState.jornada || 1) + 1;
      await updateDoc(ref, { jornada: next, picksClosed: false });
      setGameState({ jornada: next, picksClosed: false });
      setStatus("Jornada avanzada ✅");
    } catch (e) {
      setStatus("Error al avanzar jornada: " + e.message);
    }
  };

  const loadPlayers = async () => {
    try {
      setStatus("Cargando jugadores…");
      const qs = await getDocs(collection(db, "players"));
      const list = qs.docs.map((d) => ({ id: d.id, ...d.data() }));
      setPlayers(list);
      setStatus(`Jugadores cargados: ${list.length}`);
    } catch (e) {
      setStatus("Error al leer players: " + e.message);
    }
  };

  const createDummyPlayer = async () => {
    try {
      const id = "demo-" + Math.random().toString(36).slice(2, 7);
      await setDoc(doc(db, "players", id), {
        email: `${id}@demo.com`,
        role: "user",
        name: `Jugador ${id}`,
        status: "activo",
        picks: [],
        jornadaEliminado: null
      });
      setStatus("Jugador de prueba creado ✅");
    } catch (e) {
      setStatus("Error creando jugador: " + e.message);
    }
  };

  // ======== UI ========
  if (loading) return <div style={{ padding: 20 }}>Cargando…</div>;

  if (!currentUser) {
    return (
      <div style={{ padding: 20, maxWidth: 420 }}>
        <h1>Porra Zapa Final</h1>
        <h3>Registro / Login</h3>
        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ display: "block", width: "100%", marginBottom: 8 }}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ display: "block", width: "100%", marginBottom: 8 }}
        />
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={register}>Registrar</button>
          <button onClick={login}>Iniciar Sesión</button>
        </div>
        <p style={{ marginTop: 8 }}>{status}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, maxWidth: 900 }}>
      <h2>Bienvenido: {currentUser.email}</h2>
      <p>Jornada actual: <b>{gameState.jornada}</b> — Elecciones: <b>{gameState.picksClosed ? "Cerradas" : "Abiertas"}</b></p>
      <div style={{ marginBottom: 12 }}>
        <button onClick={logout}>Cerrar sesión</button>
      </div>

      {isAdmin ? (
        <>
          <h3>📌 Panel de Administrador</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
            <button onClick={initGameState}>🔧 Crear game/state</button>
            <button onClick={togglePicks}>
              {gameState.picksClosed ? "🔓 Abrir elecciones" : "🔒 Cerrar elecciones"}
            </button>
            <button onClick={advanceJornada}>⏭️ Avanzar jornada</button>
            <button onClick={loadPlayers}>👥 Cargar jugadores</button>
            <button onClick={createDummyPlayer}>➕ Crear jugador demo</button>
          </div>

          {players.length > 0 && (
            <div style={{ border: "1px solid #ccc", padding: 12 }}>
              <h4>Jugadores:</h4>
              <ul>
                {players.map((p) => (
                  <li key={p.id}>
                    <b>{p.name || p.email || p.id}</b> — role: {p.role || "user"} — estado: {p.status || "?"}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : (
        <h3>👤 Eres usuario normal (pide a un admin que te ponga role = "admin").</h3>
      )}

      <p style={{ marginTop: 8 }}>{status}</p>
    </div>
  );
}
