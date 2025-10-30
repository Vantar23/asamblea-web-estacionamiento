import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('POST /api/validaciones recibido:', body);
    
    const { codigo, dispositivo_id } = body;
    
    if (!codigo || !dispositivo_id) {
      console.log('Faltan campos:', { codigo, dispositivo_id });
      return NextResponse.json(
        { error: 'Código y dispositivo_id requeridos' },
        { status: 400 }
      );
    }

    const connection = await getConnection();
    console.log('Conexión obtenida, intentando insertar...');
    
    // Insert validation record - now allows multiple scans from same device
    await connection.execute(
      'INSERT INTO validaciones (codigo_validado, dispositivo_id) VALUES (?, ?)',
      [codigo, dispositivo_id]
    );

    console.log('Insert exitoso');
    return NextResponse.json({ 
      success: true,
      message: 'Código validado correctamente'
    });
  } catch (error) {
    console.error('Error al validar código:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: String(error) },
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
