import { Router } from 'express';
import clearSession from './routes/clear-session';
import removedPropertyCheck from './routes/removed-property-check';
import salvagedFrom from './routes/salvaged-from';
import personal from './routes/personal';

export default () => {
  const app = Router();

  clearSession(app);
  removedPropertyCheck(app);
  personal(app);
  salvagedFrom(app);

  return app;
};
