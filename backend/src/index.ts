import 'dotenv/config';
import { env } from './config/env';
import app from './app';
import { startSubscriptionWorker } from './workers/subscriptionJob';

const PORT = env.PORT;

async function main() {
  // Start subscription worker
  startSubscriptionWorker();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Environment: ${env.NODE_ENV}`);
  });
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
