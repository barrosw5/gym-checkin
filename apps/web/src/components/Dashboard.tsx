import { useDashboard } from "../hooks/useDashboard";

export default function Dashboard() {
  const { user, loading, logout } = useDashboard();

  if (loading) return <p style={{ textAlign: "center" }}>A carregar...</p>;
  if (!user) return null; // Fallback just in case

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "50px auto",
        fontFamily: "sans-serif",
      }}
    >
      <h1>Bem-vindo, {user.name}!</h1>
      <p>
        <strong>Quarto:</strong> {user.room}
      </p>
      <p>
        <strong>Role:</strong> {user.role}
      </p>

      <button
        onClick={logout}
        style={{
          marginTop: "20px",
          padding: "10px",
          backgroundColor: "#e53e3e",
          color: "white",
          border: "none",
          cursor: "pointer",
        }}
      >
        Sair (Logout)
      </button>
    </div>
  );
}
