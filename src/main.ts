import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

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

  const port = Number(process.env.PORT) || 3333;
  await app.listen(port);
}
bootstrap();
