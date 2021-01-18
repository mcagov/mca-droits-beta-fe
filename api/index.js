import { Router } from 'express';
import clearData from './routes/clear-data';
import landingPage from './routes/landing-page';
import start from './routes/start';
import removedPropertyCheck from './routes/removed-property-check';
import notRemovedPropertyContent from './routes/not-removed-property-content';

export default () => {
  const app = Router();

  clearData(app);
  landingPage(app);
  start(app);
  removedPropertyCheck(app);
  notRemovedPropertyContent(app);

  return app;
};
