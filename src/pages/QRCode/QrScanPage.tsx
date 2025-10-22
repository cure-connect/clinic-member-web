import { useState } from "react";
import QrReader from "../../components/QRCode/QR.tsx";

const QrScanPage: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <h2 className="text-2xl font-semibold mb-4">สแกน QR Code</h2>

      {!isScanning ? (
        <button
          onClick={() => setIsScanning(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          เริ่มสแกน
        </button>
      ) : (
        <QrReader />
      )}
    </div>
  );
};

export default QrScanPage;
