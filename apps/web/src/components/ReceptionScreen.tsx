import { QRCodeSVG } from "qrcode.react";
import { useReceptionScreen } from "../hooks/useReceptionScreen";
import OccupancyCounter from "./OccupancyCounter";

/**
 * Full-screen page for the reception PC/tablet (ROADMAP 5.1). Students
 * scan the QR with the phone camera to check in.
 */
export default function ReceptionScreen() {
  const { qrUrl, stale } = useReceptionScreen();

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        padding: "16px",
        boxSizing: "border-box",
        fontFamily: "sans-serif",
        textAlign: "center",
      }}
    >
      <h1 style={{ margin: 0 }}>Entrar no ginásio</h1>
      <p style={{ margin: 0, fontSize: "1.3rem" }}>
        Aponta a câmara do telemóvel para o código
      </p>

      {qrUrl ? (
        <QRCodeSVG
          value={qrUrl}
          // Always black on white with a margin (quiet zone), even in dark
          // mode: inverted or borderless codes fail on many phone cameras
          bgColor="#ffffff"
          fgColor="#000000"
          marginSize={4}
          title="Código QR para entrar no ginásio"
          size={512}
          // Fits any screen, portrait or landscape (the SVG scales cleanly)
          style={{ width: "min(80vw, 65vh)", height: "auto" }}
        />
      ) : (
        <p>A gerar o código...</p>
      )}

      {stale && (
        <p role="alert" style={{ margin: 0, color: "#c53030" }}>
          Sem ligação ao servidor, a tentar outra vez...
        </p>
      )}

      <OccupancyCounter />
    </main>
  );
}
