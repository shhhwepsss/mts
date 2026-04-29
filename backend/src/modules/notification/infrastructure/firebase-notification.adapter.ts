import { Injectable, Logger } from '@nestjs/common';
import { NotificationPort } from '@/modules/notification/domain/ports/notification.port';

@Injectable()
export class FirebaseNotificationAdapter implements NotificationPort {
  private readonly logger = new Logger(FirebaseNotificationAdapter.name);

  sendPush(deviceToken: string, title: string, body: string): Promise<void> {
    this.logger.log(
      `[STUB] Push notification: token=${deviceToken}, title="${title}", body="${body}"`,
    );
    return Promise.resolve();
  }
}
