import 'reflect-metadata'; // Required for tsyringe
import Fastify from 'fastify';
import { z } from 'zod';
import { container, injectable, inject, Lifecycle } from 'tsyringe';
import fastifyZod from 'fastify-zod';
import fastifySwagger from '@fastify/swagger';

const fastify = Fastify();

// Register global dependencies in tsyringe container
@injectable()
class UserService {
  getUserData() {
    return { name: 'John Doe', age: 30 };
  }
}

// Register your service globally
container.registerSingleton(UserService);

// Define your Zod schema for a DTO
const createUserSchema = z.object({
  name: z.string(),
  age: z.number().min(18),
});

// Fastify Swagger for OpenAPI generation
fastify.register(fastifySwagger, {
  swagger: {
    info: {
      title: 'API',
      description: 'API documentation',
      version: '0.1.0',
    },
  },
});

fastify.register(fastifyZod);

// Middleware to fork the container for each request
fastify.addHook('onRequest', (request, reply, done) => {
  // Create a new child container for each request
  request.container = container.createChildContainer();
  done();
});

// Extend Fastify's request type to include the DI container
declare module 'fastify' {
  interface FastifyRequest {
    container: typeof container;
  }
}

// Route handler using request-scoped DI container
fastify.post('/user', { schema: { body: createUserSchema } }, async (request, reply) => {
  const userService = request.container.resolve(UserService);
  const userData = userService.getUserData();
  return { message: 'User created', data: userData };
});

// Start the server
fastify.listen(3000, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log('Server listening on http://localhost:3000');
});
