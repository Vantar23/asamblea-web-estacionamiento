'use client';

import { useState, useRef, useEffect } from 'react';
import QrScanner from 'qr-scanner';

export default function Home() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);
  const isProcessingRef = useRef(false);
  const lastProcessedCode = useRef<string | null>(null);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    // Load count from database on mount
    const loadCount = async () => {
      try {
        const response = await fetch('/api/validaciones');
        const data = await response.json();
        if (data.success) {
          setScanCount(data.total);
        }
      } catch (error) {
        console.error('Error al cargar conteo:', error);
      }
    };
    
    loadCount();
  }, []);

  useEffect(() => {
    // Hide success message after 3 seconds
    if (showSuccess) {
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  const startScanner = async () => {
    setIsLoading(true);
    setError('');
    setIsScanning(true);
    
    // Wait a moment for the video element to render
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (videoRef.current) {
      qrScannerRef.current = new QrScanner(
        videoRef.current,
        async (result) => {
          if (result.data === 'Asamblea de circuito') {
            // Prevent multiple executions of the same code
            if (isProcessingRef.current || lastProcessedCode.current === result.data) {
              return;
            }
            
            isProcessingRef.current = true;
            lastProcessedCode.current = result.data;
            
            try {
              // Save to database
              const response = await fetch('/api/validaciones', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ codigo: result.data }),
              });
              
              const data = await response.json();
              
              if (data.success) {
                // Reload count from database to ensure accuracy
                const countResponse = await fetch('/api/validaciones');
                const countData = await countResponse.json();
                if (countData.success) {
                  setScanCount(countData.total);
                }
                setShowSuccess(true);
                closeScanner();
              }
            } catch (error) {
              console.error('Error al guardar validación:', error);
              // Still show success even if DB fails
              setShowSuccess(true);
              closeScanner();
            } finally {
              isProcessingRef.current = false;
            }
          } else {
            // Opcional: mostrar mensaje de error
            console.log('QR no válido');
          }
        },
        {
          returnDetailedScanResult: true,
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );

      try {
        await qrScannerRef.current.start();
        setIsLoading(false);
      } catch (err: any) {
        console.error('Error al iniciar el escáner:', err);
        setError(err.message || 'Error al iniciar la cámara. Por favor, verifica los permisos.');
        setIsLoading(false);
        setIsScanning(false);
      }
    }
  };

  const closeScanner = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    setIsScanning(false);
    setError('');
    setIsLoading(false);
    isProcessingRef.current = false;
    lastProcessedCode.current = null;
  };

  const limpiarValidaciones = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar todos los códigos validados?')) {
      return;
    }

    try {
      const response = await fetch('/api/validaciones/limpiar', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (data.success) {
        setScanCount(0);
        alert('Todos los códigos han sido eliminados');
      }
    } catch (error) {
      console.error('Error al limpiar validaciones:', error);
      alert('Error al limpiar los códigos validados');
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
                Códigos validados
              </p>
              <p className="text-5xl font-bold text-black dark:text-zinc-50">
                {scanCount}
              </p>
            </div>

            {showSuccess && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
                <div className="flex items-center gap-3 rounded-full bg-green-500 px-8 py-4 text-white shadow-lg">
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
                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                  <span className="text-lg font-semibold">Código validado</span>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-4">
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

              {scanCount > 0 && (
                <button
                  onClick={limpiarValidaciones}
                  className="flex h-12 w-64 items-center justify-center gap-2 rounded-full border border-red-500 px-6 text-sm font-medium text-red-500 transition-colors hover:bg-red-500 hover:text-white"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                    />
                  </svg>
                  Limpiar Validaciones
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="relative w-full max-w-md">
            {error ? (
              <div className="flex flex-col items-center gap-4 rounded-lg bg-red-50 p-8 text-center dark:bg-red-900/20">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-12 w-12 text-red-500"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                  />
                </svg>
                <p className="text-lg font-medium text-red-800 dark:text-red-300">
                  {error}
                </p>
                <button
                  onClick={closeScanner}
                  className="mt-4 rounded-full bg-red-500 px-6 py-3 text-white transition-colors hover:bg-red-600"
                >
                  Cerrar
                </button>
              </div>
            ) : (
              <>
                {isLoading && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 rounded-lg">
                    <div className="text-white text-lg">Cargando cámara...</div>
                  </div>
                )}
                <video
                  ref={videoRef}
                  className="w-full rounded-lg"
                />
                
                <button
                  onClick={closeScanner}
                  className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-white transition-colors hover:bg-red-600 z-20"
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

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="h-64 w-64 rounded-lg border-4 border-white shadow-lg"></div>
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}