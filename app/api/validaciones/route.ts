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
    
    try {
      // Insert validation record - will fail if unique constraint is violated
      await connection.execute(
        'INSERT INTO validaciones (codigo_validado, dispositivo_id) VALUES (?, ?)',
        [codigo, dispositivo_id]
      );

      console.log('Insert exitoso');
      return NextResponse.json({ 
        success: true,
        message: 'Código validado correctamente'
      });
    } catch (insertError: any) {
      console.error('Error al insertar:', insertError);
      // Check if it's a duplicate entry error
      if (insertError.code === 'ER_DUP_ENTRY' || insertError.errno === 1062) {
        console.log('Código duplicado');
        return NextResponse.json({ 
          success: true,
          message: 'Ya se había validado este código en este dispositivo',
          duplicate: true
        });
      }
      throw insertError;
    }
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
