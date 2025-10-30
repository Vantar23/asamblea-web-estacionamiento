'use client';

import { useState } from 'react';

export default function AdminLimpiarPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLimpiar = async () => {
    setIsLoading(true);
    setMessage(null);
    
    try {
      const response = await fetch('/api/validaciones/limpiar', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        setShowConfirm(false);
      } else {
        setMessage({ type: 'error', text: data.error || 'Error al limpiar las validaciones' });
        setShowConfirm(false);
      }
    } catch (error) {
      console.error('Error al limpiar validaciones:', error);
      setMessage({ type: 'error', text: 'Error al conectar con el servidor' });
      setShowConfirm(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center py-32 px-16 bg-white dark:bg-black">
        <div className="flex flex-col items-center gap-8">
          <h1 className="text-3xl font-semibold text-black dark:text-zinc-50">
            Panel de Administración
          </h1>
          
          <div className="flex flex-col items-center gap-6 max-w-md w-full">
            <p className="text-lg text-zinc-600 dark:text-zinc-400 text-center">
              Esta acción eliminará todas las validaciones de la base de datos de forma permanente.
            </p>

            {!showConfirm ? (
              <button
                onClick={() => setShowConfirm(true)}
                disabled={isLoading}
                className="flex h-14 w-64 items-center justify-center gap-3 rounded-full bg-red-600 px-8 text-lg font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                  />
                </svg>
                Borrar Todas las Validaciones
              </button>
            ) : (
              <div className="flex flex-col gap-4 w-full max-w-md">
                <div className="rounded-lg border-2 border-red-500 bg-red-50 dark:bg-red-900/20 p-6 text-center">
                  <p className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">
                    ¿Estás seguro?
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-400">
                    Esta acción no se puede deshacer. Se eliminarán todas las validaciones.
                  </p>
                </div>
                
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowConfirm(false)}
                    disabled={isLoading}
                    className="flex-1 h-12 rounded-full bg-gray-300 dark:bg-gray-700 px-6 text-base font-semibold text-gray-800 dark:text-gray-200 transition-colors hover:bg-gray-400 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleLimpiar}
                    disabled={isLoading}
                    className="flex-1 h-12 rounded-full bg-red-600 px-6 text-base font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="animate-spin h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Borrando...
                      </span>
                    ) : (
                      'Confirmar'
                    )}
                  </button>
                </div>
              </div>
            )}

            {message && (
              <div
                className={`animate-in fade-in slide-in-from-bottom-4 duration-300 w-full max-w-md rounded-lg p-4 ${
                  message.type === 'success'
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                    : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  {message.type === 'success' ? (
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
                        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                      />
                    </svg>
                  ) : (
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
                        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                      />
                    </svg>
                  )}
                  <p className="font-medium">{message.text}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

