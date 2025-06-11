import { v4 as uuidv4 } from 'uuid';

export interface UploadResult {
  success: boolean;
  fileKey?: string;
  uploadUrl?: string;
  error?: string;
}

export const s3UploadService = {
  async getSignedUploadUrl(fileName: string, fileType: string): Promise<UploadResult> {
    try {
      const fileExtension = fileName.split('.').pop();
      const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileKey = `editais/${uuidv4()}-${sanitizedFileName}`;

      const response = await fetch('/api/s3/signed-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: sanitizedFileName,
          fileType,
          fileKey
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        fileKey: result.fileKey,
        uploadUrl: result.uploadUrl
      };
    } catch (error) {
      console.error('Erro ao obter URL assinada:', error);
      return {
        success: false,
        error: 'Erro ao preparar upload'
      };
    }
  },

  async uploadFile(file: File, uploadUrl: string): Promise<UploadResult> {
    try {
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      return {
        success: true
      };
    } catch (error) {
      console.error('Erro no upload:', error);
      return {
        success: false,
        error: 'Erro ao fazer upload do arquivo'
      };
    }
  },

  async uploadPdfAndGetKey(file: File): Promise<UploadResult> {
    try {
      // 1. Obter URL assinada
      const signedUrlResult = await this.getSignedUploadUrl(file.name, file.type);
      
      if (!signedUrlResult.success || !signedUrlResult.uploadUrl) {
        return signedUrlResult;
      }

      // 2. Fazer upload
      const uploadResult = await this.uploadFile(file, signedUrlResult.uploadUrl);
      
      if (!uploadResult.success) {
        return uploadResult;
      }

      return {
        success: true,
        fileKey: signedUrlResult.fileKey
      };
    } catch (error) {
      console.error('Erro no processo de upload:', error);
      return {
        success: false,
        error: 'Erro no processo de upload'
      };
    }
  }
};