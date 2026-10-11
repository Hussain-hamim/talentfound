import { ImageResponse } from "next/og";

export function socialImage({
  name,
  headline,
  skills = [],
  demo = false,
}: {
  name?: string;
  headline?: string;
  skills?: string[];
  demo?: boolean;
} = {}) {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        padding: "54px 64px",
        color: "#fff",
        background:
          "linear-gradient(125deg, #0c2432 0%, #161719 55%, #513625 100%)",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          fontSize: 36,
          fontWeight: 700,
        }}
      >
        <span style={{ color: "#ff442b" }}>[</span>talentfound
        <span style={{ color: "#ff442b" }}>]</span>
      </div>
      <div
        style={{
          display: "flex",
          marginTop: 56,
          color: "#bbbfc5",
          fontSize: 18,
          letterSpacing: 4,
        }}
      >
        {name
          ? demo
            ? "DEMO DEVELOPER PROFILE"
            : "MEET YOUR NEXT COLLABORATOR"
          : "DEVELOPERS. PROJECTS. POSSIBILITIES."}
      </div>
      <div
        style={{
          display: "flex",
          marginTop: 20,
          fontSize: name ? (name.length > 30 ? 52 : 68) : 76,
          fontWeight: 700,
          letterSpacing: -3,
          lineHeight: 1.1,
        }}
      >
        {name ? name.slice(0, 48) : "Build what’s next."}
      </div>
      <div
        style={{
          display: "flex",
          marginTop: 8,
          fontSize: name ? ((headline?.length || 0) > 65 ? 28 : 34) : 76,
          color: "#ff442b",
          fontWeight: 700,
          lineHeight: 1.15,
        }}
      >
        {name ? (headline || "Developer").slice(0, 90) : "Find your people."}
      </div>
      <div
        style={{
          display: "flex",
          marginTop: "auto",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: "1px solid #ffffff30",
          paddingTop: 24,
          fontSize: 23,
          color: "#dedbd8",
        }}
      >
        <span>
          {name
            ? skills.slice(0, 4).join("  ·  ").slice(0, 85)
            : "Show your work. Discover talent. Build together."}
        </span>
        <span style={{ color: "#ff664e" }}>↗</span>
      </div>
    </div>,
    { width: 1200, height: 630 },
  );
}
