import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { MessagingModule } from 'src/messaging/messaging.module';

@Module({
  imports: [MessagingModule.register()],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
