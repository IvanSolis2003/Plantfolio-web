import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(180deg, #2D6A4F 0%, #1B4332 100%)",
        }}
      >
        <div style={{ display: "flex", fontSize: 160, marginBottom: 24 }}>🌿</div>
        <div style={{ display: "flex", fontSize: 88, fontWeight: 700, color: "#FFFFFF" }}>
          Plantfolio
        </div>
        <div style={{ display: "flex", fontSize: 34, color: "#B7E4C7", marginTop: 16 }}>
          Identifica y colecciona la flora chilena
        </div>
      </div>
    ),
    { ...size }
  );
}
