import adal from 'adal-node';
import axios from 'axios';
import dayjs from 'dayjs';

export default function (app) {


  app.post('/portal/dashboard', function (req, res) {
    const adalAuthContext = adal.AuthenticationContext;
    const authorityHostUrl = 'https://login.microsoftonline.com';
    const tenant = '513fb495-9a90-425b-a49a-bc6ebe2a429e';
    const authorityUrl = authorityHostUrl + '/' + tenant;
    const clientId = '62ef4f36-0bd1-43f0-9ce4-eaf4a078b9a1';
    const clientSecret = 'H9Z5g5N0VN~AV2.g~n1UP_8Wn9l.-0u2N_';
    const resource = 'https://mca-sandbox.crm11.dynamics.com';
    
    let accessToken = '';
    const currentUserEmail = req.body.email;
    let currentUserID = '';
    
    const url = 'https://mca-sandbox.crm11.dynamics.com/api/data/v9.1/';
    const contactsUrl = url + 'contacts?$select=emailaddress1,contactid';
    const reportDataUrl = url + 'crf99_mcawreckreports?$select=crf99_reportreference,crf99_datereported,crf99_datefound,modifiedon,_crf99_reporter_value'
    //const wreckMaterialUrl = url + 'crf99_mcawreckmaterials';

    // Contains 2 test reports, with a third added from the api response:
    req.session.data.userReports = [
      {
        "report-ref": "98/21",
        "date-found": "2019-12-28T00:00:00Z",
        "date-reported": "2020-01-15T00:00:00Z",
        "last-updated": "2021-03-05T00:00:00Z",
        formattedDates: {
          "date-found": "28 12 2019",
          "date-reported": "15 01 2020",
          "last-updated": "05 03 2021"
        },
      },
      {
        "report-ref": "99/21",
        "date-found": "2020-01-17T00:00:00Z",
        "date-reported": "2020-02-23T00:00:00Z",
        "last-updated": "2021-02-01T00:00:00Z",
        formattedDates: {
          "date-found": "17 01 2020",
          "date-reported": "23 02 2020",
          "last-updated": "01 02 2021"
        }
      }
    ];

    const context = new adalAuthContext(authorityUrl);

    context.acquireTokenWithClientCredentials(
      resource,
      clientId,
      clientSecret,
      (err, tokenResponse) => {
        if (err) {
          console.log(`Token generation failed due to ${err}`);
        } else {
          accessToken = tokenResponse.accessToken;
          getUserID(accessToken).then(() => {
            fetchReportData(currentUserID).then(() => {
              return res.redirect('dashboard');
            })
          });
        }
      }
    );

    function getUserID(token) {  
      return new Promise((resolve, reject) => {  
        axios.get(
          contactsUrl,
          {
            headers: { 'Authorization': `bearer ${token}` },
          }
        )
        .then((res) => {        
          const data = res.data.value;

          data.find(function(item, index) {
            if(item.emailaddress1 === currentUserEmail) {
              currentUserID = item.contactid;
            }
          }) 
          resolve()
        })
        .catch((reqError) => {
          console.log('User ID error');
          console.log(reqError);
          reject();
        })
      })
    }

    function fetchReportData(userID) {
      return new Promise((resolve, reject) => {  
        axios.get(
          reportDataUrl,
          {
            headers: { 'Authorization': `bearer ${accessToken}` },
          }
        )
        .then((res) => {        
          const reportData = res.data.value;

          findUserReports(reportData, userID).then(() => {
            resolve();
          })
        })
        .catch((reqError) => {
          console.log('Report data error: ' + reqError);
          reject();
        })
      })
    }

    function findUserReports(data, ID) {
      return new Promise((resolve, reject) => { 
        if(data.length && ID.length) {
          data.forEach((item) => {
            if(item._crf99_reporter_value === ID) {        
              formatReportData(item);
            }
          })
          resolve();
        } else {
          console.log('Error finding user data');
          reject();
        }
      })
    }

    function formatReportData(data) {
      let reportItem = {
        "report-ref": "", 
        "date-found": "",
        "date-reported": "",
        "last-updated": "",
        formattedDates: {
          "date-found": "",
          "date-reported": "",
          "last-updated": ""
        }
      };
      const dates = reportItem.formattedDates;

      reportItem["report-ref"] = data.crf99_reportreference;
      reportItem["date-found"] = data.crf99_datefound;
      reportItem["date-reported"] = data.crf99_datereported;
      reportItem["last-updated"] = data.modifiedon; 
      dates["date-found"] = data.crf99_datefound;
      dates["date-reported"] = data.crf99_datereported;
      dates["last-updated"] = data.modifiedon;
      
      Object.keys(dates).forEach((key) => {
        dates[key] = dayjs(dates[key]).format("DD MM YYYY");
      })

      req.session.data.userReports.push(reportItem);
    }
  });
}