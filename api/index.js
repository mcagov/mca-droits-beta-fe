import { Router } from 'express';
import clearSession from './routes/clear-session';
import removedPropertyCheck from './routes/removed-property-check';
import locationAnswer from './routes/location-answer';
import findDate from './routes/find-date';
import salvagedFrom from './routes/salvaged-from';

export default () => {
  const app = Router();

  clearSession(app);
  removedPropertyCheck(app);
  locationAnswer(app);
  findDate(app);
  salvagedFrom(app);

  return app;
};
