import { Controller, Post, Body, UseGuards, Req, Headers, RawBodyRequest } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('checkout')
  @UseGuards(AuthGuard('jwt'))
  async createCheckout(@Req() req: any, @Body('orderId') orderId: string) {
    return this.paymentService.createCheckoutSession(req.user.id, orderId);
  }

  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') sig: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    return this.paymentService.handleWebhook(sig, req.rawBody);
  }
}