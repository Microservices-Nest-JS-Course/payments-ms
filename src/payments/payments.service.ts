import { Injectable, Logger } from '@nestjs/common';
import { envs } from 'src/config';
import Stripe from 'stripe';
import { PaymentSessionDto } from './dto/payment-session.dto';
import { Request, Response } from 'express';
import { MessagingService } from 'src/messaging/messaging.service';

@Injectable()
export class PaymentsService {
  private readonly stripe = new Stripe(envs.stripeSecret);
  private readonly Logger = new Logger(PaymentsService.name);
  constructor(private readonly client: MessagingService) {}

  async createPaymentSession(paymentSessionDto: PaymentSessionDto) {
    const { currency, items, orderId } = paymentSessionDto;
    const lineItems = items.map((item) => ({
      price_data: {
        currency,
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));
    const session = await this.stripe.checkout.sessions.create({
      // colocar aqui el id de mi orden
      payment_intent_data: {
        metadata: {
          orderId,
        },
      },
      // es un arreglo para colocar los items de mi orden
      line_items: lineItems,
      mode: 'payment',
      success_url: envs.stripeSuccessUrl,
      cancel_url: envs.stripeCancelUrl,
    });
    // return session;
    return {
      cancelUrl: session.cancel_url,
      successUrl: session.success_url,
      url: session.url,
    };
  }

  stripeWebhook(req: Request, res: Response) {
    const sig = req.headers['stripe-signature'];
    if (!sig) throw new Error('Falta la cabecera stripe-signature');
    let event: Stripe.Event;
    const endpointSecret = envs.stripeEndpointSecret;
    try {
      event = this.stripe.webhooks.constructEvent(
        req['rawBody'],
        sig,
        endpointSecret,
      );
      // return event;
    } catch (err: any) {
      if (err instanceof Error) {
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
      }
      res.status(400).send(`Webhook Error: ${err}`);
      return;
    }
    switch (event.type) {
      case 'charge.succeeded':
        // eslint-disable-next-line no-case-declarations
        const chargeSucceeded = event.data.object;
        // eslint-disable-next-line no-case-declarations
        const payload = {
          stripePaymentId: chargeSucceeded.id,
          orderId: chargeSucceeded.metadata.orderId,
          receipUrl: chargeSucceeded.receipt_url,
        };
        // Emtir el evento del: pago realizado
        this.client.emit('payment.succeeded', payload);
        break;
      default:
        console.log(`Event ${event.type} not supported`);
    }
    return res.status(200).json({ sig });
  }
}
