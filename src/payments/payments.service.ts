import { Injectable } from '@nestjs/common';
import { envs } from 'src/config';
import Stripe from 'stripe';
import { PaymentSessionDto } from './dto/payment-session.dto';
import { Request, Response } from 'express';

@Injectable()
export class PaymentsService {
  private readonly stripe = new Stripe(envs.stripeSecret);

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
      success_url: 'http://localhost:3003/payments/success',
      cancel_url: 'http://localhost:3003/payments/cancel',
    });
    return session;
  }

  stripeWebhook(req: Request, res: Response) {
    const sig = req.headers['stripe-signature'];
    if (!sig) throw new Error('Falta la cabecera stripe-signature');
    let event: Stripe.Event;
    const endpointSecret = 'whsec_JfTfSpFB6ofU5W7PeiomMnG44iwCZHKv';
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
        // TODO: llamar nuestro microservicio
        console.log({
          metadata: chargeSucceeded.metadata,
          orderId: chargeSucceeded.metadata.orderId,
        });
        break;
      default:
        console.log(`Event ${event.type} not supported`);
    }
    return res.status(200).json({ sig });
  }
}
