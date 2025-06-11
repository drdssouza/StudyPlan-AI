// src/app/api/s3/user-data/[userId]/active-plan/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'studyplan-ai-userdata';

async function getUserProfile(userId: string) {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: `users/${userId}/profile.json`,
    });

    const response = await s3Client.send(command);
    
    if (response.Body) {
      const profileData = await response.Body.transformToString();
      return JSON.parse(profileData);
    }
    
    return null;
  } catch (error: any) {
    if (error.name === 'NoSuchKey') {
      return null;
    }
    throw error;
  }
}

async function saveUserProfile(userId: string, profile: any) {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: `users/${userId}/profile.json`,
    Body: JSON.stringify(profile, null, 2),
    ContentType: 'application/json',
    Metadata: {
      updatedAt: new Date().toISOString(),
    },
  });

  await s3Client.send(command);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    const { activeStudyPlanId } = await request.json();
    
    // Buscar perfil atual
    let profile = await getUserProfile(userId);
    
    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }
    
    // Verificar se o plano existe
    if (profile.studyPlans && !profile.studyPlans.find((plan: any) => plan.id === activeStudyPlanId)) {
      return NextResponse.json({ error: 'Study plan not found' }, { status: 404 });
    }
    
    // Atualizar plano ativo
    profile.activeStudyPlanId = activeStudyPlanId;
    profile.updatedAt = new Date().toISOString();
    
    // Salvar perfil atualizado
    await saveUserProfile(userId, profile);
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Erro ao definir plano ativo:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}