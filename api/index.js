import { Router } from 'express';
import clearData from './routes/clear-data';
import removedPropertyCheck from './routes/removed-property-check';
import findDate from './routes/find-date';

export default () => {
  const app = Router();

  clearData(app);
  removedPropertyCheck(app);
  findDate(app);

  return app;
};
