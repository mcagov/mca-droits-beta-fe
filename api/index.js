import { Router } from 'express';
import clearData from './routes/clear-data';
import removedPropertyCheck from './routes/removed-property-check';
import location from './routes/location';

export default () => {
  const app = Router();

  clearData(app);
  removedPropertyCheck(app);
  location(app);

  return app;
};
