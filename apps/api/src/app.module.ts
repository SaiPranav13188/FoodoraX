import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './modules/auth/auth.module'; // or AuthController/AuthService depending on your setup
import { PaymentModule } from './modules/payment/payment.module';
import { AiController } from './modules/ai/ai.controller';
import { AiService } from './modules/ai/ai.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'foodorax-secret-key',
      signOptions: { expiresIn: '1d' },
    }),
    // Include existing modules or add controllers/providers directly
  ],
  controllers: [AiController],
  providers: [AiService],
})
export class AppModule {}