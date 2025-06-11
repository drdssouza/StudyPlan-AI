import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'studyplan-ai-editais';

export async function POST(request: NextRequest) {
  try {
    const { fileName, fileType, fileKey } = await request.json();

    if (!fileName || !fileType || !fileKey) {
      return NextResponse.json(
        { error: 'fileName, fileType e fileKey são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar tipo de arquivo (apenas PDFs)
    if (!fileType.includes('pdf')) {
      return NextResponse.json(
        { error: 'Apenas arquivos PDF são permitidos' },
        { status: 400 }
      );
    }

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
      ContentType: fileType,
      Metadata: {
        originalName: fileName,
        uploadedAt: new Date().toISOString(),
      },
    });

    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600, // 1 hora
    });

    return NextResponse.json({
      success: true,
      uploadUrl,
      fileKey,
      bucketName: BUCKET_NAME,
    });

  } catch (error) {
    console.error('Erro ao gerar URL assinada:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}