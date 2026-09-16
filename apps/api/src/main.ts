import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable global validation pipe for request payloads
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Read allowed origin from environment variable, falling back to localhost or wildcards
  const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:3000';

  // Enable CORS supporting both local development and Vercel deployments
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || origin.includes('vercel.app') || origin === allowedOrigin || origin.includes('localhost')) {
        callback(null, true);
      } else {
        callback(null, true); // Allow all during testing/proxying
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Explicitly set global route prefix so all endpoints live under /api
  app.setGlobalPrefix('api');

  // Render automatically sets process.env.PORT dynamically
  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Backend API is running on port: ${port} with prefix /api`);
}
bootstrap();