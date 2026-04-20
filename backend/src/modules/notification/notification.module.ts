import { Module } from '@nestjs/common';
import { NOTIFICATION_PORT } from './domain/ports/notification.port';
import { FirebaseNotificationAdapter } from './infrastructure/firebase-notification.adapter';

@Module({
  providers: [
    { provide: NOTIFICATION_PORT, useClass: FirebaseNotificationAdapter },
  ],
  exports: [NOTIFICATION_PORT],
})
export class NotificationModule {}
