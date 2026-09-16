import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Read allowed origin from environment variable, falling back to localhost for local dev
  const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:3000';

  // Enable CORS with explicit methods and dynamic origin
  app.enableCors({
    origin: allowedOrigin,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Render automatically sets process.env.PORT dynamically
  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Backend API is running on port: ${port}`);
}
bootstrap();