import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Scanner, IDetectedBarcode } from "@yudiel/react-qr-scanner";

const QrReader: React.FC = () => {
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleScan = (detectedCodes: IDetectedBarcode[]) => {
    if (detectedCodes.length > 0) {
      const result = detectedCodes[0].rawValue;
      setScannedResult(result);

      navigate("/dashboard");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto">
      <div className="w-full">
        <Scanner
          onScan={handleScan}
          constraints={{ facingMode: "environment" }}
          classNames={{ container: "rounded-lg overflow-hidden" }}
          sound={false}
        />
      </div>

      {scannedResult && (
        <div className="mt-4 p-2 bg-green-100 text-green-800 rounded w-full text-center">
          ผลลัพธ์: {scannedResult}
        </div>
      )}
    </div>
  );
};

export default QrReader;
