export interface EduOSEnvelope<T = unknown> {
  success: boolean;
  data: T;
  message: string;
  errors?: Record<string, string[]>;
}

export function isEduOSEnvelope(value: unknown): value is EduOSEnvelope {
  return (
    typeof value === 'object' &&
    value !== null &&
    'success' in value &&
    'data' in value &&
    'message' in value
  );
}

export function unwrapEduOSResponse<T>(payload: unknown): T {
  if (isEduOSEnvelope(payload)) {
    if (!payload.success) {
      const detail =
        payload.errors && Object.keys(payload.errors).length > 0
          ? Object.values(payload.errors).flat().join('; ')
          : payload.message;
      throw new Error(detail || 'Request failed');
    }
    return payload.data as T;
  }

  return payload as T;
}
