export const NOTIFICATION_PORT = Symbol('NOTIFICATION_PORT');

export interface NotificationPort {
  sendPush(deviceToken: string, title: string, body: string): Promise<void>;
}
