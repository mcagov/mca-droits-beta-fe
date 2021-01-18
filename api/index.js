import { Router } from 'express';
import clearData from './routes/clear-data';
import removedPropertyCheck from './routes/removed-property-check';

export default () => {
  const app = Router();

  clearData(app);
  removedPropertyCheck(app);

  return app;
};
