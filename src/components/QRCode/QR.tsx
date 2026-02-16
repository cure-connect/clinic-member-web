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
      const url = new URL(rawValue);
      const pathSegments = url.pathname.split("/");
      const userid = pathSegments[pathSegments.length - 1];

      if (!userid) throw new Error("ไม่พบ user id ใน URL");

      const storedUser = localStorage.getItem("clinicUser");
      if (!storedUser) throw new Error("กรุณาเข้าสู่ระบบก่อนสแกน");

      const currentUser = JSON.parse(storedUser);

      if (currentUser.role === "admin" || currentUser.role === "manager") {
        navigate("/manage-points", {
          state: {
            userid,
            fromQR: true,
          },
        });
      } else {
        window.location.href = rawValue;
      }

    } catch (err) {
      console.error("QR code ไม่ถูกต้อง", err);
      alert("QR code ไม่ถูกต้อง หรือไม่ใช่ URL ที่ถูกต้อง");
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
