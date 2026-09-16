import { Controller, Sse, Query, MessageEvent } from '@nestjs/common';
import { AiService } from './ai.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Sse('recommend')
  streamRecommendations(@Query('prompt') prompt: string): Observable<MessageEvent> {
    return this.aiService.streamRecommendation(prompt).pipe(
      map((payload) => ({
        data: payload,
      } as MessageEvent))
    );
  }
}