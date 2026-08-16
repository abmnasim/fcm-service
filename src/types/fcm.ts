export interface NotificationPayload {
  title?: string;
  body?: string;
  imageUrl?: string;
}

export interface SendRequest {
  tokens: string[];
  notification?: NotificationPayload;
  data?: Record<string, string>;
}

export interface sendResponse {
  success: boolean;
  totalTokens: number;
  successCount: number;
  failureCount: number;
  invalidTokens: string[];
}

export interface MulticaseSendRequest {
  fids: string[];
  notification?: NotificationPayload;
  data?: Record<string, string>;
}

export interface MulticaseSendResponse {
  success: boolean;
  totalFids: number;
  successCount: number;
  failureCount: number;
  invalidFids: string[];
}
