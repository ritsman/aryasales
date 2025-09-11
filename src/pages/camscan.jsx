import React, { useEffect, useRef } from "react";

export default function Billing2() {
  const videoRef = useRef(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera error:", err);
        alert("Camera error: " + err.message);
      }
    };
    startCamera();
  }, []);
useEffect(() => {
  if (!navigator.mediaDevices) {
    alert("❌ navigator.mediaDevices is not available. Use HTTPS or Safari/Chrome.");
  } else if (!navigator.mediaDevices.getUserMedia) {
    alert("❌ getUserMedia is not available in this browser.");
  } else {
    alert("✅ Camera API is supported!");
  }
}, []);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      style={{ width: "100%", height: "300px", border: "1px solid black" }}
    />
  );
}
