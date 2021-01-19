import { Router } from 'express';
import clearData from './routes/clear-data';
import removedPropertyCheck from './routes/removed-property-check';
import locationAnswer from './routes/location-answer';

export default () => {
  const app = Router();

  clearData(app);
  removedPropertyCheck(app);
  locationAnswer(app);

  return app;
};
