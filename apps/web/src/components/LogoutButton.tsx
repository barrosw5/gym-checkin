import { useAuth } from "../hooks/useAuth";

/** "Terminar sessão" (log out), shared by every role's home page. */
export default function LogoutButton() {
  const { logout } = useAuth();

  return (
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
      Terminar sessão
    </button>
  );
}
