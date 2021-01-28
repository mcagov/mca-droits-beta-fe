import { Router } from 'express';
import clearSession from './clear-session';
import removedPropertyCheck from './removed-property-check';
import locationAnswer from './location-answer';
import findDate from './find-date';
import salvagedFrom from './salvaged-from';
import depth from './depth';
import personal from './personal';
import vesselDescription from './vessel-description';
import knownWreck from './known-wreck';
import propertyForm from './routes/property-form';
import salvageAward from './salvage-award';
import checkYourAnswers from './check-your-answers';

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
  propertyForm(app);
  salvageAward(app);
  checkYourAnswers(app);

  return app;
};
