import { Router } from 'express';
import clearSession from './routes/clear-session';
import removedPropertyCheck from './routes/removed-property-check';
import locationAnswer from './routes/location-answer';
import findDate from './routes/find-date';
import salvagedFrom from './routes/salvaged-from';
import depth from './routes/depth';
import personal from './routes/personal';
import vesselDescription from './routes/vessel-description';
import knownWreck from './routes/known-wreck';
import salvageAward from './routes/salvage-award';
import propertyForm from './routes/property-form';

export default () => {
  const app = Router();

  clearSession(app);
  removedPropertyCheck(app);
  locationAnswer(app);
  findDate(app);
  personal(app);
  knownWreck(app);
  salvagedFrom(app);
  depth(app);
  vesselDescription(app);
  salvageAward(app);
  propertyForm(app);

  return app;
};
