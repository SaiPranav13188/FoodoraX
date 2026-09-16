import { Injectable, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class RedisThrottlerGuard extends ThrottlerGuard {
  protected async throwThrottlingException(context: ExecutionContext): Promise<void> {
    throw new HttpException(
      {
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}