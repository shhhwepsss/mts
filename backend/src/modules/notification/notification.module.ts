import { Module } from '@nestjs/common';
import { NOTIFICATION_PORT } from '@/modules/notification/domain/ports/notification.port';
import { FirebaseNotificationAdapter } from '@/modules/notification/infrastructure/firebase-notification.adapter';

@Module({
  providers: [
    { provide: NOTIFICATION_PORT, useClass: FirebaseNotificationAdapter },
  ],
  exports: [NOTIFICATION_PORT],
})
export class NotificationModule {}
