import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { envs } from './config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
// import { RpcCustomExceptionFilter } from 'common';

async function bootstrap() {
  const logger = new Logger('Payments-ms');
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // app.useGlobalFilters(new RpcCustomExceptionFilter());

  app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.NATS,
      options: {
        servers: envs.messaging.options.NATS.servers,
      },
    },
    // En hibridos, no mantiene los pipes, interceptos, guards y filtros
    // inheritAppConfig: true, es para que los microservicios hereden la configuracion de la aplicacion
    { inheritAppConfig: true },
  );

  await app.startAllMicroservices();
  await app.listen(envs.paymentMsPort ?? 3003);
  console.log('Health check configured');
  logger.log(`Payments Microservice running on port ${envs.paymentMsPort}`);
}
bootstrap();
