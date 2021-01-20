import { Router } from 'express';
import clearSession from './routes/clear-session';
import removedPropertyCheck from './routes/removed-property-check';

export default () => {
  const app = Router();

  clearSession(app);
  removedPropertyCheck(app);

  return app;
};
