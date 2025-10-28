import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Scanner, IDetectedBarcode } from "@yudiel/react-qr-scanner";

const QrReader: React.FC = () => {
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [hasScanned, setHasScanned] = useState(false);
  const navigate = useNavigate();

  const handleScan = (detectedCodes: IDetectedBarcode[]) => {
    if (hasScanned || detectedCodes.length === 0) return;

    const rawValue = detectedCodes[0]?.rawValue;
    if (!rawValue) return;

    setScannedResult(rawValue);
    setHasScanned(true);

    try {
      const parsed = JSON.parse(rawValue);
      const storedUser = localStorage.getItem("clinicUser");
      if (!storedUser) throw new Error("กรุณาเข้าสู่ระบบก่อนสแกน");
      const currentUser = JSON.parse(storedUser);

      if (currentUser.role === "admin" || currentUser.role === "manager") {
        navigate("/manage-points", {
          state: {
            userid: parsed.userid,
            firstname: parsed.firstname,
            lastname: parsed.lastname,
            username: parsed.username,
            fromQR: true,
          },
        });
      } else {
        window.location.href = `${import.meta.env.VITE_FRONTEND}/userinfo/${parsed.userid}`;
      }
    } catch (err) {
      console.error("QR code ไม่ถูกต้อง", err);
      alert("QR code ไม่ถูกต้อง หรือข้อมูลไม่ใช่ JSON");
      setHasScanned(false);
    }
  };


  const handleError = (error: unknown) => {
    console.error("เกิดข้อผิดพลาดในการสแกน:", error);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto">
      <div className="w-full rounded-lg overflow-hidden">
        <Scanner
          onScan={handleScan}
          onError={handleError}
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
