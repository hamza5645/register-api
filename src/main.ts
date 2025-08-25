import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { createServer } from 'node:net';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

const config = new DocumentBuilder()
.setTitle("Register API")
.setDescription("API for Register")
.setVersion("1.0")
.addBearerAuth(
  { type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
  }, "access-token")
  .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    jsonDocumentUrl: "openapi.json",
  });

  // Choose a free port automatically if desired one is busy
  const desired = Number(process.env.PORT) || 3333;

  async function isPortFree(port: number): Promise<boolean> {
    return new Promise((resolve) => {
      const srv = createServer();
      srv.once('error', () => resolve(false));
      srv.once('listening', () => srv.close(() => resolve(true)));
      srv.listen(port, '0.0.0.0');
    });
  }

  async function findAvailablePort(start: number, attempts = 50): Promise<number> {
    for (let i = 0; i < attempts; i++) {
      const port = start + i;
      if (await isPortFree(port)) return port;
    }
    // Fall back to ephemeral port chosen by OS
    return 0;
  }

  const selectedPort = await findAvailablePort(desired);
  await app.listen(selectedPort);
  const url = await app.getUrl();
  // eslint-disable-next-line no-console
  console.log(`Listening on ${url}`);
}
bootstrap();
