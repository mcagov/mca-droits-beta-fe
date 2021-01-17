import { Router } from 'express';
import landingPage from './routes/landing-page';
import start from './routes/start';
import removedPropertyCheck from './routes/removed-property-check';
import location from './routes/location';

export default () => {
  const app = Router();

  landingPage(app);
  start(app);
  removedPropertyCheck(app);
  location(app);

  return app;
};
