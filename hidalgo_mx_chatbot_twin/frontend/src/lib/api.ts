import axios from 'axios';

const API_URL = 'http://localhost:8000';

export interface ChatResponse {
  response: string;
  source_documents?: string[];
}

export const sendMessage = async (message: string, model: string = 'phi-2', userContext: any = {}, isAdvisor: boolean = false): Promise<ChatResponse> => {
  try {
    const response = await axios.post(`${API_URL}/chat`, {
      message,
      model_name: model,
      user_context: userContext,
      is_advisor: isAdvisor
    });
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const verifyAdvisorKey = async (key: string): Promise<boolean> => {
  try {
    const response = await axios.post(`${API_URL}/verify-key`, { key });
    return response.data.valid;
  } catch (error) {
    console.error('Error verifying key:', error);
    return false;
  }
};

export const uploadFiles = async (files: File[]) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });

  try {
    const response = await axios.post(`${API_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      // Increase timeout for large files
      timeout: 30000,
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading files:', error);
    throw error;
  }
};
