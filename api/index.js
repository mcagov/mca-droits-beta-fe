import { Router } from 'express';
import clearSession from './routes/clear-session';
import removedPropertyCheck from './routes/removed-property-check';
import salvagedFrom from './routes/salvaged-from';
import depth from './routes/depth';

export default () => {
  const app = Router();

  clearSession(app);
  removedPropertyCheck(app);
  salvagedFrom(app);
  depth(app);

  return app;
};
