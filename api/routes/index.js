import { Router } from 'express';
import clearSession from './clear-session';
import removedPropertyCheck from './removed-property-check';
import location from './location';
import findDate from './find-date';
import vesselInformation from './vessel-information';
import salvagedFrom from './salvaged-from';
import depth from './depth';
import personal from './personal';
import vesselDescription from './vessel-description';
import knownWreck from './known-wreck';
import propertySummary from './property-summary';
import propertyForm from './property-form';
import propertyFormImage from './property-form-image';
import propertyFormImageUpload from './property-form-image-upload';
import propertyFormImageDelete from './property-form-image-delete';
import propertyFormAddress from './property-form-address';
import salvageAward from './salvage-award';
import checkYourAnswers from './check-your-answers';

export default () => {
  const app = Router();

  clearSession(app);
  removedPropertyCheck(app);
  location(app);
  findDate(app);
  personal(app);
  knownWreck(app);
  vesselInformation(app);
  salvagedFrom(app);
  depth(app);
  vesselDescription(app);
  propertySummary(app);
  propertyForm(app);
  propertyFormImage(app);
  propertyFormImageUpload(app);
  propertyFormImageDelete(app);
  propertyFormAddress(app);
  salvageAward(app);
  checkYourAnswers(app);

  return app;
};
