import { useState } from "react";
import type { AdminUser } from "../core/types/adminUsers";
import { useUsersAdmin } from "../hooks/useUsersAdmin";

const EXAMPLE = "nome;quarto;username\nAna Silva;101;ana.silva\nRui Costa;102;rui.costa";

/** Admin panel section: import residents from a CSV, manage accounts. */
export default function UsersAdmin() {
  const { users, failed, importResult, busy, message, reload, importCsv, clearImportResult, update } =
    useUsersAdmin();
  const [csv, setCsv] = useState("");

  return (
    <section aria-labelledby="users-admin-title" style={{ margin: "30px 0" }}>
      <h2 id="users-admin-title">Gestão de utilizadores</h2>

      <section aria-labelledby="import-title" style={{ margin: "30px 0" }}>
        <h3 id="import-title">Importar residentes</h3>
        <p>
          Uma linha por residente: <code>nome;quarto;username</code> (o formato que o Excel
          exporta em &quot;CSV separado por ponto e vírgula&quot;). Ninguém é importado se houver erros.
        </p>
        <label>
          Ficheiro CSV{" "}
          <input
            type="file"
            accept=".csv,text/csv,text/plain"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) setCsv(await file.text());
            }}
          />
        </label>
        <textarea
          value={csv}
          onChange={(e) => setCsv(e.target.value)}
          placeholder={EXAMPLE}
          rows={8}
          aria-label="Conteúdo do CSV"
          style={{ display: "block", width: "100%", marginTop: "10px", fontFamily: "monospace" }}
        />
        <button
          onClick={() => importCsv(csv)}
          disabled={busy || !csv.trim()}
          style={{ marginTop: "10px", padding: "10px 16px" }}
        >
          {busy ? "A importar..." : "Importar"}
        </button>

        {importResult?.ok === false && (
          <div role="alert" style={{ color: "#c53030" }}>
            <p>Nada foi importado. Corrige estas linhas e tenta outra vez:</p>
            <ul>
              {importResult.errors.map((e) => (
                <li key={`${e.line}-${e.message}`}>
                  {e.line > 0 ? `Linha ${e.line}: ` : ""}
                  {e.message}
                </li>
              ))}
            </ul>
          </div>
        )}

        {importResult?.ok && (
          <div role="status" style={{ border: "2px solid #dd6b20", padding: "12px", marginTop: "10px" }}>
            <p>
              <strong>{importResult.created.length} contas criadas.</strong> Estas passwords
              temporárias <strong>só aparecem agora</strong>: copia-as e entrega-as a cada residente.
            </p>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th align="left">Nome</th>
                  <th align="left">Username</th>
                  <th align="left">Password temporária</th>
                </tr>
              </thead>
              <tbody>
                {importResult.created.map((a) => (
                  <tr key={a.username}>
                    <td>{a.name}</td>
                    <td>{a.username}</td>
                    <td>
                      <code>{a.temporaryPassword}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={clearImportResult} style={{ marginTop: "10px", padding: "8px 16px" }}>
              Já copiei, esconder
            </button>
          </div>
        )}
      </section>

      <section aria-labelledby="users-title">
        <h3 id="users-title">Contas</h3>
        {failed && (
          <p>
            Não foi possível carregar. <button onClick={reload}>Tentar outra vez</button>
          </p>
        )}
        {users === null && !failed && <p>A carregar...</p>}
        <ul style={{ listStyle: "none", padding: 0 }}>
          {users?.map((u) => (
            <UserRow key={u.id} user={u} busy={busy} onUpdate={(body) => update(u.id, body)} />
          ))}
        </ul>
      </section>

      {message && (
        <p role="alert" style={{ color: "#c53030" }}>
          {message}
        </p>
      )}
    </section>
  );
}

function UserRow(props: {
  user: AdminUser;
  busy: boolean;
  onUpdate: (body: { active?: boolean; room?: string }) => void;
}) {
  const { user, busy, onUpdate } = props;
  const [room, setRoom] = useState(user.room);

  return (
    <li
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "10px",
        alignItems: "center",
        padding: "10px 0",
        borderBottom: "1px solid #e2e8f0",
        opacity: user.active ? 1 : 0.6,
      }}
    >
      <span style={{ flex: "1 1 220px" }}>
        <strong>{user.name}</strong> · {user.username} · {user.role}
        {!user.active && " · desativada"}
      </span>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onUpdate({ room });
        }}
        style={{ display: "flex", gap: "6px" }}
      >
        <label>
          Quarto{" "}
          <input value={room} onChange={(e) => setRoom(e.target.value)} size={6} required />
        </label>
        <button type="submit" disabled={busy || room.trim() === user.room}>
          Guardar
        </button>
      </form>
      <button onClick={() => onUpdate({ active: !user.active })} disabled={busy}>
        {user.active ? "Desativar" : "Reativar"}
      </button>
    </li>
  );
}
