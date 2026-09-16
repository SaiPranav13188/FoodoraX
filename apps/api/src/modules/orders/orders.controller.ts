import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';

@Controller('orders')
export class OrdersController {
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createOrder(@Body() body: any) {
    console.log('Received order payload:', body);
    
    // Returns a successful order response
    return {
      success: true,
      message: 'Order placed successfully',
      orderId: `ORD-${Date.now()}`,
      data: body,
    };
  }
}