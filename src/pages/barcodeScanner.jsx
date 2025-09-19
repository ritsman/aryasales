import React, { useRef, useState, useEffect } from "react";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";

const BarcodeScanner = ({ onDetected, onClose }) => {
  const videoRef = useRef(null);
  const codeReaderRef = useRef(null);

  const [error, setError] = useState("");

  useEffect(() => {
    startCamera();

    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    stopCamera(); // clear old streams

    const codeReader = new BrowserMultiFormatReader();
    codeReaderRef.current = codeReader;

    try {
      const devices = await codeReader.listVideoInputDevices();
      if (!devices.length) throw new Error("No camera devices found");

      // Prefer back camera if label contains "back"
      const backCamera = devices.find(d =>
        d.label.toLowerCase().includes("back")
      );
      const deviceId = backCamera ? backCamera.deviceId : devices[0].deviceId;

      await codeReader.decodeFromVideoDevice(
        deviceId,
        videoRef.current,
        (result, err) => {
          if (result) {
            const code = result.getText();
            stopCamera();
            if (onDetected) onDetected(code);
          } else if (err && !(err instanceof NotFoundException)) {
            console.warn("ZXing error:", err);
          }
        }
      );
    } catch (err) {
      console.error("Camera start failed:", err);
      setError("Camera access denied or not available");
    }
  };

  const stopCamera = () => {
    if (codeReaderRef.current) {
      try {
        codeReaderRef.current.reset();
      } catch (e) {}
      codeReaderRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md rounded-lg overflow-hidden relative">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4 z-10 bg-black bg-opacity-50">
          <h3 className="text-white text-lg font-semibold">Scan Barcode</h3>
          <button
            onClick={() => {
              stopCamera();
              if (onClose) onClose();
            }}
            className="text-gray-300 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Video feed */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-[400px] object-cover bg-black"
        />

        {/* Optional red box guide */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-64 h-24 border-2 border-red-500 rounded bg-transparent"></div>
        </div>

        {error && (
          <div className="absolute bottom-2 left-0 right-0 text-center text-red-500 text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default BarcodeScanner;
