import { Router } from 'express';
import clearData from './routes/clear-data';
import removedPropertyCheck from './routes/removed-property-check';
import salvagedFrom from './routes/salvaged-from';

export default () => {
  const app = Router();

  clearData(app);
  removedPropertyCheck(app);
  salvagedFrom(app);

  return app;
};
