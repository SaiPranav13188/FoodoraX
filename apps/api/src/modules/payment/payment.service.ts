import { Injectable, BadRequestException } from '@nestjs/common';
import Stripe from 'stripe';
import { PrismaClient, OrderStatus } from '@foodorax/database';

@Injectable()
export class PaymentService {
  private stripe: Stripe;
  private prisma: PrismaClient;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
      apiVersion: '2023-10-16' as any,
    });
    this.prisma = new PrismaClient();
  }

  async createCheckoutSession(userId: string, orderId: string): Promise<{ checkoutUrl: string | null }> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: { include: { menuItem: true } } },
    });

    if (!order || order.userId !== userId) {
      throw new BadRequestException('Order not found');
    }

    const lineItems = order.orderItems.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: { name: item.menuItem.name },
        unit_amount: Math.round(Number(item.price) * 100),
      },
      quantity: item.quantity,
    }));

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/orders/${orderId}?status=success`,
      cancel_url: `${process.env.FRONTEND_URL}/orders/${orderId}?status=cancelled`,
      metadata: { orderId, userId },
    });

    return { checkoutUrl: session.url };
  }

  async handleWebhook(signature: string, payload: Buffer): Promise<{ received: boolean }> {
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET || '',
      );
    } catch (err: any) {
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;

      if (orderId) {
        await this.prisma.order.update({
          where: { id: orderId },
          data: { status: OrderStatus.PAID },
        });
      }
    }

    return { received: true };
  }
}