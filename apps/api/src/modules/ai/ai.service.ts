import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { Observable } from 'rxjs';

@Injectable()
export class AiService {
  private openai: OpenAI | null = null;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    // Only initialize OpenAI if a valid key is provided
    if (apiKey && !apiKey.includes('mock') && !apiKey.includes('your_openai_api_key')) {
      this.openai = new OpenAI({ apiKey });
    }
  }

  streamRecommendation(prompt: string): Observable<{ text: string }> {
    return new Observable((subscriber) => {
      // Fallback to Mock Streaming (emitting valid JSON) if no valid OpenAI key is set
      if (!this.openai) {
        const mockReply = JSON.stringify({
          meals: [
            {
              id: 'mock-1',
              name: 'Vegetarian Gyro Wrap',
              description: 'Warm pita stuffed with seasoned veggies and tzatziki.',
              price: 11.99,
              category: 'Greek',
            },
            {
              id: 'mock-2',
              name: 'Fresh Greek Salad with Feta',
              description: 'Crisp cucumbers, tomatoes, olives, and authentic feta.',
              price: 9.5,
              category: 'Salads',
            },
            {
              id: 'mock-3',
              name: 'Falafel & Hummus Platter',
              description: 'Crispy falafels served with creamy house-made hummus.',
              price: 13.0,
              category: 'Platters',
            },
          ],
        });

        // Break JSON into small chunks to simulate streaming
        const chunkSize = 20;
        let index = 0;

        const interval = setInterval(() => {
          if (index < mockReply.length) {
            const chunk = mockReply.slice(index, index + chunkSize);
            subscriber.next({ text: chunk });
            index += chunkSize;
          } else {
            clearInterval(interval);
            subscriber.complete();
          }
        }, 80);

        return () => clearInterval(interval);
      }

      // Live OpenAI Streaming logic with enforced JSON schema output
      (async () => {
        try {
          const stream = await this.openai!.chat.completions.create({
            model: 'gpt-4o-mini',
            response_format: { type: 'json_object' },
            messages: [
              {
                role: 'system',
                content: `
                  You are the AI Assistant for FoodoraX. 
                  Always respond ONLY with a valid JSON object matching this schema:
                  {
                    "meals": [
                      {
                        "id": "string",
                        "name": "string",
                        "description": "string",
                        "price": number,
                        "category": "string"
                      }
                    ]
                  }
                  Do not include markdown code block formatting (like \`\`\`json). Output pure JSON only.
                `,
              },
              { role: 'user', content: prompt },
            ],
            stream: true,
          });

          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              subscriber.next({ text: content });
            }
          }
          subscriber.complete();
        } catch (error) {
          console.error('OpenAI Stream Error:', error);
          subscriber.error(error);
        }
      })();
    });
  }
}