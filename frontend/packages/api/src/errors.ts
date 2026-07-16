import axios, { isAxiosError } from 'axios';
import { unwrapEduOSResponse } from './envelope';

export function formatApiError(error: unknown): Error {
  if (isAxiosError(error)) {
    if (!error.response) {
      return new Error(
        'Cannot reach EduOS-backend. Start the API server, check EXPO_PUBLIC_API_URL, and use your PC LAN IP (not localhost) on a physical phone.',
      );
    }

    const status = error.response.status;
    const payload = error.response.data;

    try {
      unwrapEduOSResponse(payload);
    } catch (apiError) {
      if (apiError instanceof Error && apiError.message) {
        return apiError;
      }
    }

    if (typeof payload === 'object' && payload !== null) {
      const body = payload as Record<string, unknown>;
      if (typeof body.message === 'string' && body.message.length > 0) {
        return new Error(body.message);
      }
      if (typeof body.detail === 'string' && body.detail.length > 0) {
        return new Error(body.detail);
      }
      if (typeof body.error === 'string' && body.error.length > 0) {
        return new Error(body.error);
      }
    }

    return new Error(`Request failed (${status})`);
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error('Something went wrong. Please try again.');
}
