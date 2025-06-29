import { useClerk } from '@/lib/auth/clerk';

/**
 * Simple client-side audit logger. In a real app this should POST to an
 * audit-log micro-service or write to secure storage. For now we just push
 * into localStorage in dev and emit to console.
 */
export type AuditEventType =
  | 'LOGIN'
  | 'LOGOUT'
  | 'SESSION_END'
  | 'NAVIGATE'
  | 'ROLE_UPDATE'
  | 'SECURITY'
  | 'DESKTOP_START'
  | 'ERROR';

export interface AuditEvent {
  id: string;
  type: AuditEventType;
  userId?: string;
  timestamp: number;
  payload?: Record<string, unknown>;
}

/**
 * Persist event to localStorage (dev) and console.
 */
export const logSecurityEvent = (
  type: AuditEventType,
  payload?: Record<string, unknown>
) => {
  const event: AuditEvent = {
    id: (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2)), 
    type,
    timestamp: Date.now(),
    payload,
  };

  try {
    const existing = JSON.parse(localStorage.getItem('auditLog') || '[]') as AuditEvent[];
    existing.push(event);
    localStorage.setItem('auditLog', JSON.stringify(existing.slice(-500)));
  } catch (_) {
    // ignore storage quota issues
  }

  if (import.meta.env.DEV) {
    console.info('[AUDIT]', event);
  }
};

/**
 * React hook that wires Clerk session/user events → audit log.
 */
export const useSecurityAuditLogger = () => {
  const { user } = useClerk();

  const logEvent = (type: AuditEventType, payload?: Record<string, unknown>) =>
    logSecurityEvent(type, { userId: user?.id, ...payload });

  return { logEvent };
};
