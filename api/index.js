import { Router } from 'express';
import start from './routes/start';
import removedPropertyCheck from './routes/removed-property-check';

export default () => {
  const app = Router();

  start(app);
  removedPropertyCheck(app);

  return app;
};
