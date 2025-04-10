import { Module } from '@nestjs/common';
import { PaymentsModule } from './payments/payments.module';
import { MessagingModule } from './messaging/messaging.module';

@Module({
  imports: [PaymentsModule, MessagingModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
