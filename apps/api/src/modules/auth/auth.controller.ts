import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterSchema, LoginSchema } from '@foodorax/validation';
import { RedisThrottlerGuard } from './redis-throttler.guard';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
@UseGuards(RedisThrottlerGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: any) {
    const validated = RegisterSchema.parse(body);
    return this.authService.register(validated);
  }

  @Post('login')
  async login(@Body() body: any) {
    const validated = LoginSchema.parse(body);
    return this.authService.login(validated);
  }

  @Post('refresh')
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshTokens(refreshToken);
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  async logout(@Req() req: any) {
    return this.authService.logout(req.user.id);
  }
}