import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { codigo } = await request.json();
    
    if (!codigo) {
      return NextResponse.json(
        { error: 'Código requerido' },
        { status: 400 }
      );
    }

    const connection = await getConnection();
    
    // Insert validation record
    await connection.execute(
      'INSERT INTO validaciones (codigo_validado) VALUES (?)',
      [codigo]
    );

    return NextResponse.json({ 
      success: true,
      message: 'Código validado correctamente'
    });
  } catch (error) {
    console.error('Error al validar código:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const connection = await getConnection();
    
    // Get count of validations
    const [rows] = await connection.execute(
      'SELECT COUNT(*) as total FROM validaciones'
    );

    const total = (rows as any[])[0].total;
    
    return NextResponse.json({ 
      success: true,
      total: Number(total)
    });
  } catch (error) {
    console.error('Error al obtener conteo:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
