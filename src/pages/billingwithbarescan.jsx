import React, { useState } from "react";
import BarcodeScanner from "./barcodeScanner";

export default function Billing() {
  const [scanning, setScanning] = useState(false);
  const [lastCode, setLastCode] = useState("");

  return (
    <div className="p-4">
      <button
        onClick={() => setScanning(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Start Scan
      </button>

      {lastCode && <p className="mt-4">Last scanned: {lastCode}</p>}

      {scanning && (
        <BarcodeScanner
          onDetected={code => {
            setLastCode(code);
            setScanning(false);
          }}
          onClose={() => setScanning(false)}
        />
      )}
    </div>
  );
}
