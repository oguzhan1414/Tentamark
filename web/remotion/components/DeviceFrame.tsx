import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

// CSS-only device chrome — a real phone/laptop silhouette instead of the
// generic rounded-rectangle-with-three-dots "browser window" placeholder.
// No 3D asset (.glb) or WebGL involved: the illusion of depth comes from the
// caller's own perspective/rotateX/rotateY wrapper plus a moving glare sweep
// drawn here in CSS.
export const DeviceFrame: React.FC<{
  variant: "phone" | "laptop";
  children: React.ReactNode;
}> = ({ variant, children }) => {
  const frame = useCurrentFrame();
  const glareShift = interpolate(frame % 150, [0, 150], [-30, 150]);

  const glare = (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `linear-gradient(115deg, transparent ${glareShift - 26}%, rgba(255,255,255,0.14) ${glareShift}%, transparent ${glareShift + 26}%)`,
        pointerEvents: "none",
        zIndex: 15,
      }}
    />
  );

  if (variant === "phone") {
    return (
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 320,
          aspectRatio: "9 / 19.3",
          margin: "0 auto",
          borderRadius: 52,
          padding: 12,
          background: "linear-gradient(155deg, #4b4b52 0%, #0a0a0c 65%)",
          boxShadow: "0 45px 90px rgba(0,0,0,0.8), inset 0 0 0 1.5px rgba(255,255,255,0.1)",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            borderRadius: 38,
            overflow: "hidden",
            backgroundColor: "#000",
          }}
        >
          {children}
          {/* Dynamic Island */}
          <div
            style={{
              position: "absolute",
              top: 14,
              left: "50%",
              transform: "translateX(-50%)",
              width: "32%",
              height: 24,
              borderRadius: 20,
              backgroundColor: "#000",
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
              zIndex: 20,
            }}
          />
          {glare}
        </div>
      </div>
    );
  }

  // laptop — screen shell + a thin hinge/base beneath it
  return (
    <div style={{ position: "relative", width: "100%" }}>
      <div
        style={{
          position: "relative",
          borderRadius: "14px 14px 3px 3px",
          padding: "16px 16px 10px",
          background: "linear-gradient(155deg, #4b4b52 0%, #0a0a0c 70%)",
          boxShadow: "0 45px 90px rgba(0,0,0,0.8)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 6,
            left: "50%",
            transform: "translateX(-50%)",
            width: 7,
            height: 7,
            borderRadius: "50%",
            backgroundColor: "#1c1c1e",
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)",
          }}
        />
        <div
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "16 / 10",
            borderRadius: 6,
            overflow: "hidden",
            backgroundColor: "#000",
          }}
        >
          {children}
          {glare}
        </div>
      </div>
      {/* Base */}
      <div
        style={{
          height: 14,
          background: "linear-gradient(180deg, #3a3a3f 0%, #131315 100%)",
          borderRadius: "0 0 10px 10px",
          boxShadow: "0 10px 24px rgba(0,0,0,0.6)",
        }}
      />
      <div
        style={{
          height: 5,
          width: "34%",
          margin: "0 auto",
          backgroundColor: "#161618",
          borderRadius: "0 0 8px 8px",
        }}
      />
    </div>
  );
};
