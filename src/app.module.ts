import { Module } from '@nestjs/common';
import { PaymentsModule } from './payments/payments.module';
import { MessagingModule } from './messaging/messaging.module';
import { HealthCheckModule } from './health-check/health-check.module';

@Module({
  imports: [PaymentsModule, MessagingModule, HealthCheckModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
