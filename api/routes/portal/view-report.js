import axios from 'axios';
import dayjs from 'dayjs';
import { assignReportStatus } from '../../../utilities';
import { assignSalvageLocation } from '../../../utilities';
import { assignOutcome } from '../../../utilities';

const url = process.env.DATAVERSE_BASE_URL + process.env.DATAVERSE_SERVICE_URL;

export default function (app) {
  app.get(
    '/portal/report/:report',

    function (req, res) {
      let reportRef = req.params.report;
      reportRef = reportRef.replace('-', '/');

      const reportUrl = `${url}crf99_mcawreckreports?$filter=crf99_reportreference eq '${reportRef}'&$expand=crf99_MCAWreckMaterial_WreckReport_crf99_`;
      const token = req.session.data.token;
      let storageAddressUrl;
      let reportData;
      let storageAddressIDs = [];

      fetchReportData(token, reportUrl).then(() => {
        storageAddressUrl = `${url}crf99_mcastorageaddresses?$filter=Microsoft.Dynamics.CRM.In(PropertyName='crf99_mcastorageaddressid',PropertyValues=[${storageAddressIDs}])`;
        fetchStorageAddresses(token, storageAddressUrl).then(() => {
          res.render('portal/report', { reportData: reportData });
        });
      });

      function fetchReportData(token, url) {
        return new Promise((resolve, reject) => {
          axios
            .get(url, {
              headers: { Authorization: `bearer ${token}` },
            })
            .then((res) => {
              reportData = res.data.value[0];
              const reportStatus = assignReportStatus(reportData.crf99_reportstatus);
              const recoveredFromLocation = assignSalvageLocation(reportData.crf99_recoveredfrom);

              if (reportData.crf99_latitude && reportData.crf99_longitude) {
                reportData.coordinates = `${reportData.crf99_latitude}° ${reportData.crf99_longitude}°`;
              } else {
                reportData.coordinates = null;
              }

              reportData.dateReported = dayjs(
                reportData.crf99_datereported
              ).format('DD MM YYYY');
              reportData.dateFound = dayjs(reportData.crf99_datefound).format(
                'DD MM YYYY'
              );
              reportData['last-updated'] = dayjs(reportData.modifiedon).format(
                'DD MM YYYY'
              );
              reportData.status = reportStatus[0];
              reportData.statusColour = reportStatus[2];
              reportData['recovered-from'] = recoveredFromLocation;

              const wreckMaterialData = reportData.crf99_MCAWreckMaterial_WreckReport_crf99_;
              for (const wreckItem of wreckMaterialData) {
                // Add apostrophies before pushing to the storageAddressIDs array.
                // This is required to pass the array straight into the storageAddressUrl to filter the storage address data.
                const formattedValue = "'" + wreckItem._crf99_storageaddress_value + "'";
                storageAddressIDs.push(formattedValue);
                wreckItem.selectedOutcome = assignOutcome(wreckItem.crf99_outcome);
              }
              resolve();
            })
            .catch((err) => {
              console.log('Report data error: ' + err);
              if (err.response.status === 401) {
                res.redirect('/error');
              }
              reject();
            });
        });
      }

      function fetchStorageAddresses(token, url) {
        return new Promise((resolve, reject) => {
          axios
            .get(url, {
              headers: { Authorization: `bearer ${token}` },
            })
            .then((res) => {
              const addressData = res.data.value;
              // First loop through the address data from the api response
              for (const address of addressData) {
                // Loop through the wreck items in the existing 'reportData' object
                for (const wreckItem of reportData.crf99_MCAWreckMaterial_WreckReport_crf99_) {
                  // If we find a storage 'ID' in the response that matches a storage 'value' in the
                  // wreck items, grab the address details and add them to the item in reportData.
                  if (address.crf99_mcastorageaddressid === wreckItem._crf99_storageaddress_value) {
                    wreckItem.storageAddress = [];
                    const addressArr = wreckItem.storageAddress;
                    addressArr.push(
                      address.crf99_addressline1,
                      address.crf99_addressline2,
                      address.crf99_city,
                      address.crf99_county,
                      address.crf99_postcode
                    );
                  }
                }
              }
              resolve();
            })
            .catch((reqError) => {
              console.log('Storage address data error: ' + reqError);
              reject();
            });
        });
      }
    }
  );
}
