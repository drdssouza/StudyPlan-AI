import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { 
  DynamoDBDocumentClient, 
  GetCommand, 
  PutCommand, 
  UpdateCommand, 
  DeleteCommand,
  QueryCommand,
  ScanCommand 
} from '@aws-sdk/lib-dynamodb';
import { UserProfile, UserStudyPlan } from './userData';

// Configuração do DynamoDB
const client = new DynamoDBClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  // Credenciais são lidas automaticamente de:
  // 1. AWS CLI (aws configure)
  // 2. Variáveis de ambiente (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
  // 3. IAM Roles (em produção)
  ...(process.env.AWS_ACCESS_KEY_ID && {
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    }
  })
});

const docClient = DynamoDBDocumentClient.from(client);

// Nomes das tabelas
const USERS_TABLE = process.env.NEXT_PUBLIC_DYNAMODB_USERS_TABLE || 'studyplan-users';
const STUDY_PLANS_TABLE = process.env.NEXT_PUBLIC_DYNAMODB_STUDY_PLANS_TABLE || 'studyplan-study-plans';
const PROGRESS_TABLE = process.env.NEXT_PUBLIC_DYNAMODB_PROGRESS_TABLE || 'studyplan-user-progress';

export const dynamoDBService = {
  // ============ USUÁRIOS ============
  
  // Buscar perfil do usuário
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const command = new GetCommand({
        TableName: USERS_TABLE,
        Key: { userId }
      });

      const response = await docClient.send(command);
      return response.Item as UserProfile || null;
    } catch (error) {
      console.error('Erro ao buscar perfil do usuário:', error);
      return null;
    }
  },

  // Criar perfil do usuário
  async createUserProfile(userProfile: UserProfile): Promise<UserProfile> {
    try {
      const command = new PutCommand({
        TableName: USERS_TABLE,
        Item: userProfile
      });

      await docClient.send(command);
      return userProfile;
    } catch (error) {
      console.error('Erro ao criar perfil do usuário:', error);
      throw error;
    }
  },

  // Atualizar perfil do usuário
  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    try {
      // Construir expressão de atualização dinamicamente
      const updateExpression: string[] = [];
      const expressionAttributeNames: Record<string, string> = {};
      const expressionAttributeValues: Record<string, any> = {};

      Object.entries(updates).forEach(([key, value]) => {
        if (key !== 'userId') { // Não atualizar a chave primária
          updateExpression.push(`#${key} = :${key}`);
          expressionAttributeNames[`#${key}`] = key;
          expressionAttributeValues[`:${key}`] = value;
        }
      });

      // Sempre atualizar o timestamp
      updateExpression.push('#updatedAt = :updatedAt');
      expressionAttributeNames['#updatedAt'] = 'updatedAt';
      expressionAttributeValues[':updatedAt'] = new Date().toISOString();

      const command = new UpdateCommand({
        TableName: USERS_TABLE,
        Key: { userId },
        UpdateExpression: `SET ${updateExpression.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW'
      });

      const response = await docClient.send(command);
      return response.Attributes as UserProfile;
    } catch (error) {
      console.error('Erro ao atualizar perfil do usuário:', error);
      throw error;
    }
  },

  // ============ PLANOS DE ESTUDO ============

  // Buscar planos do usuário
  async getUserStudyPlans(userId: string): Promise<UserStudyPlan[]> {
    try {
      const command = new QueryCommand({
        TableName: STUDY_PLANS_TABLE,
        IndexName: 'UserPlansIndex',
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      });

      const response = await docClient.send(command);
      return response.Items as UserStudyPlan[] || [];
    } catch (error) {
      console.error('Erro ao buscar planos do usuário:', error);
      return [];
    }
  },

  // Buscar plano específico
  async getStudyPlan(planId: string): Promise<UserStudyPlan | null> {
    try {
      const command = new GetCommand({
        TableName: STUDY_PLANS_TABLE,
        Key: { planId }
      });

      const response = await docClient.send(command);
      return response.Item as UserStudyPlan || null;
    } catch (error) {
      console.error('Erro ao buscar plano de estudo:', error);
      return null;
    }
  },

  // Criar plano de estudo
  async createStudyPlan(studyPlan: UserStudyPlan): Promise<UserStudyPlan> {
    try {
      const command = new PutCommand({
        TableName: STUDY_PLANS_TABLE,
        Item: studyPlan
      });

      await docClient.send(command);
      return studyPlan;
    } catch (error) {
      console.error('Erro ao criar plano de estudo:', error);
      throw error;
    }
  },

  // Atualizar plano de estudo
  async updateStudyPlan(planId: string, updates: Partial<UserStudyPlan>): Promise<UserStudyPlan> {
    try {
      const updateExpression: string[] = [];
      const expressionAttributeNames: Record<string, string> = {};
      const expressionAttributeValues: Record<string, any> = {};

      Object.entries(updates).forEach(([key, value]) => {
        if (key !== 'planId') {
          updateExpression.push(`#${key} = :${key}`);
          expressionAttributeNames[`#${key}`] = key;
          expressionAttributeValues[`:${key}`] = value;
        }
      });

      updateExpression.push('#updatedAt = :updatedAt');
      expressionAttributeNames['#updatedAt'] = 'updatedAt';
      expressionAttributeValues[':updatedAt'] = new Date().toISOString();

      const command = new UpdateCommand({
        TableName: STUDY_PLANS_TABLE,
        Key: { planId },
        UpdateExpression: `SET ${updateExpression.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW'
      });

      const response = await docClient.send(command);
      return response.Attributes as UserStudyPlan;
    } catch (error) {
      console.error('Erro ao atualizar plano de estudo:', error);
      throw error;
    }
  },

  // Deletar plano de estudo
  async deleteStudyPlan(planId: string): Promise<void> {
    try {
      const command = new DeleteCommand({
        TableName: STUDY_PLANS_TABLE,
        Key: { planId }
      });

      await docClient.send(command);
    } catch (error) {
      console.error('Erro ao deletar plano de estudo:', error);
      throw error;
    }
  },

  // ============ PROGRESSO ============

  // Salvar progresso do usuário
  async saveProgress(progressData: {
    userId: string;
    progressId: string;
    planId: string;
    date: string;
    subject: string;
    hoursStudied: number;
    topicsStudied: string[];
    completed: boolean;
    notes?: string;
  }): Promise<void> {
    try {
      const command = new PutCommand({
        TableName: PROGRESS_TABLE,
        Item: {
          ...progressData,
          createdAt: new Date().toISOString()
        }
      });

      await docClient.send(command);
    } catch (error) {
      console.error('Erro ao salvar progresso:', error);
      throw error;
    }
  },

  // Buscar progresso do usuário
  async getUserProgress(userId: string, startDate?: string, endDate?: string): Promise<any[]> {
    try {
      const command = new QueryCommand({
        TableName: PROGRESS_TABLE,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      });

      // Adicionar filtro de data se fornecido
      if (startDate && endDate) {
        command.input.FilterExpression = '#date BETWEEN :startDate AND :endDate';
        command.input.ExpressionAttributeNames = { '#date': 'date' };
        command.input.ExpressionAttributeValues = {
          ...command.input.ExpressionAttributeValues,
          ':startDate': startDate,
          ':endDate': endDate
        };
      }

      const response = await docClient.send(command);
      return response.Items || [];
    } catch (error) {
      console.error('Erro ao buscar progresso:', error);
      return [];
    }
  },

  // ============ UTILITÁRIOS ============

  // Verificar se tabelas existem
  async healthCheck(): Promise<boolean> {
    try {
      // Teste simples - tentar fazer uma consulta
      const command = new ScanCommand({
        TableName: USERS_TABLE,
        Limit: 1
      });
      
      await docClient.send(command);
      return true;
    } catch (error) {
      console.error('Health check falhou:', error);
      return false;
    }
  },

  // Inicializar usuário (criar perfil vazio na primeira vez)
  async initializeUser(userId: string, email: string, name: string): Promise<UserProfile> {
    try {
      // Verificar se já existe
      const existing = await this.getUserProfile(userId);
      if (existing) {
        return existing;
      }

      // Criar perfil vazio
      const newProfile: UserProfile = {
        userId,
        email,
        name,
        studyPlans: [], // Array vazio - sem planos ainda
        preferences: {
          notifications: true,
          emailUpdates: true,
          theme: 'light'
        },
        stats: {
          totalStudyHours: 0,
          totalDaysStudied: 0,
          longestStreak: 0,
          currentStreak: 0,
          totalPlansCreated: 0
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return await this.createUserProfile(newProfile);
    } catch (error) {
      console.error('Erro ao inicializar usuário:', error);
      throw error;
    }
  }
};