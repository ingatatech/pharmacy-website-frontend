import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Ingata Pharmacy — trusted pharmacy services, products and health information in Kigali, Rwanda.";

// A code-generated share image rather than a designed asset — keeps the
// site from showing a blank/broken preview on social platforms until a
// real branded image is commissioned.
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
          background: "linear-gradient(135deg, #0f3d3a 0%, #114b48 55%, #1a6b63 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 96,
            height: 96,
            borderRadius: 24,
            background: "rgba(255,255,255,0.12)",
            marginBottom: 36,
          }}
        >
          <div style={{ display: "flex", fontSize: 52, color: "#ffffff" }}>+</div>
        </div>
        <div style={{ display: "flex", fontSize: 64, fontWeight: 600, color: "#ffffff", letterSpacing: -1 }}>
          Ingata Pharmacy
        </div>
        <div style={{ display: "flex", marginTop: 18, fontSize: 28, color: "rgba(255,255,255,0.75)" }}>
          Trusted pharmacy care across Kigali, Rwanda
        </div>
      </div>
    ),
    { ...size }
  );
}
