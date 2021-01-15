import { Router } from 'express';
import landingPage from './routes/landing-page';
import start from './routes/start';
import removedPropertyCheck from './routes/removed-property-check';

export default () => {
  const app = Router();

  landingPage(app);
  start(app);
  removedPropertyCheck(app);

  return app;
};
