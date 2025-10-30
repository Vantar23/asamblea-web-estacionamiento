'use client';

import { useState, useRef, useEffect } from 'react';
import QrScanner from 'qr-scanner';

export default function Home() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.destroy();
      }
    };
  }, []);

  const startScanner = async () => {
    if (videoRef.current) {
      qrScannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          if (result.data === 'Asamblea de circuito') {
            setScanCount(prev => prev + 1);
            closeScanner();
          } else {
            // Opcional: mostrar mensaje de error
            console.log('QR no válido');
          }
        },
        {
          returnDetailedScanResult: true,
        }
      );

      try {
        await qrScannerRef.current.start();
        setIsScanning(true);
      } catch (error) {
        console.error('Error al iniciar el escáner:', error);
      }
    }
  };

  const closeScanner = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
      setIsScanning(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center py-32 px-16 bg-white dark:bg-black">
        {!isScanning ? (
          <div className="flex flex-col items-center gap-8">
            <h1 className="text-3xl font-semibold text-black dark:text-zinc-50">
              Asamblea de Circuito
            </h1>
            
            <div className="flex flex-col items-center gap-2">
              <p className="text-xl font-medium text-zinc-800 dark:text-zinc-300">
                Escaneos exitosos
              </p>
              <p className="text-5xl font-bold text-black dark:text-zinc-50">
                {scanCount}
              </p>
            </div>

            <button
              onClick={startScanner}
              className="flex h-14 w-64 items-center justify-center gap-3 rounded-full bg-foreground px-8 text-lg font-semibold text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 17.25h.75v.75h-.75v-.75ZM17.25 6.75h.75v.75h-.75v-.75ZM12 12h.75v.75H12v-.75ZM12 16.5h.75v.75H12V16.5ZM16.5 12h.75v.75h-.75V12ZM16.5 16.5h.75v.75h-.75V16.5ZM12 10.5h.75v.75H12V10.5ZM7.5 12h.75v.75H7.5V12ZM6 16.5h.75v.75H6V16.5ZM6.75 10.5h.75v.75h-.75V10.5ZM10.5 6h.75v.75H10.5V6ZM10.5 18h.75v.75H10.5V18ZM18 10.5h.75v.75H18V10.5ZM18 16.5h.75v.75H18V16.5ZM21.75 7.5h-2.25m0 0v2.25m0-2.25V4.5M6 7.5h2.25m0 0V5.25m0 2.25V9M3 3v3.75M3 21v-3.75M21 3v3.75M21 21v-3.75M12 3v2.25m0 13.5V21"
                />
              </svg>
              Abrir Escáner QR
            </button>
          </div>
        ) : (
          <div className="relative w-full max-w-md">
            <video
              ref={videoRef}
              className="w-full rounded-lg"
            />
            
            <button
              onClick={closeScanner}
              className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-white transition-colors hover:bg-red-600"
              aria-label="Cerrar escáner"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-64 w-64 rounded-lg border-4 border-white shadow-lg"></div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}