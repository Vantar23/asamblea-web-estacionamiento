import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function POST() {
  try {
    const connection = await getConnection();
    
    // Delete all validations
    await connection.execute('DELETE FROM validaciones');

    return NextResponse.json({ 
      success: true,
      message: 'Todos los códigos validados han sido eliminados'
    });
  } catch (error) {
    console.error('Error al limpiar validaciones:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Para limpiar los códigos validados, usa POST a este endpoint' 
  });
}
