import { Router } from 'express';
import clearSession from './routes/clear-session';
import removedPropertyCheck from './routes/removed-property-check';
import findDate from './routes/find-date';
import salvagedFrom from './routes/salvaged-from';
import depth from './routes/depth';
import personal from './routes/personal';

export default () => {
  const app = Router();

  clearSession(app);
  removedPropertyCheck(app);
  findDate(app);
  personal(app);
  salvagedFrom(app);
  depth(app);

  return app;
};
