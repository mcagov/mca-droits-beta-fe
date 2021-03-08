import adal from 'adal-node';
import axios from 'axios';

export default function (app) {
  app.post('/portal/dashboard', function (req, res) {
    console.log('test');
    const adalAuthContext = adal.AuthenticationContext;

    const authorityHostUrl = 'https://login.microsoftonline.com';
    const tenant = '513fb495-9a90-425b-a49a-bc6ebe2a429e';
    const authorityUrl = authorityHostUrl + '/' + tenant;
    const clientId = '62ef4f36-0bd1-43f0-9ce4-eaf4a078b9a1';
    const clientSecret = 'H9Z5g5N0VN~AV2.g~n1UP_8Wn9l.-0u2N_';
    const resource = 'https://mca-sandbox.crm11.dynamics.com';
    const url = 'https://mca-sandbox.crm11.dynamics.com/api/data/v9.1/crf99_mcawreckreports';
    // Contains 1 test report, with a second added from the api response:
    let userReports = [
      { '@odata.etag': 'W/"1379431"',
        crf99_longitude: -3,
        statecode: 0,
        statuscode: 1,
        crf99_datereported: '2021-01-16T00:00:00Z',
        createdon: '2021-03-02T16:12:48Z',
        crf99_inukwaters: false,
        crf99_mcawreckreportid: '95a6141c-727b-eb11-a812-0022481a85d1',
        crf99_daysfromfoundtoreported: 717,
        crf99_recoveredfrom: 614880003,
        _ownerid_value: 'daa628f3-e768-eb11-b0b0-000d3a86e0f3',
        modifiedon: '2021-03-06T17:27:11Z',
        versionnumber: 1379431,
        crf99_newreporter: true,
        crf99_locationradius: 10,
        timezoneruleversionnumber: 4,
        crf99_reportstatus: 614880000,
        _crf99_reporter_value: '8da6141c-727b-eb11-a812-0022481a85d1',
        _modifiedby_value: 'daa628f3-e768-eb11-b0b0-000d3a86e0f3',
        _owningbusinessunit_value: 'e79f28f3-e768-eb11-b0b0-000d3a86e0f3',
        crf99_salvageawardclaimed: false,
        crf99_reportreference: '100/21',
        _createdby_value: 'daa628f3-e768-eb11-b0b0-000d3a86e0f3',
        crf99_latitude: 54,
        _crf99_receiver_value: '3a02607e-556c-eb11-b0b8-000d3a86b7aa',
        _owninguser_value: 'daa628f3-e768-eb11-b0b0-000d3a86e0f3',
        crf99_datefound: '2020-07-11T00:00:00Z',
        crf99_locationdescription: null,
        crf99_servicesestimatedcost: null,
        _stageid_value: null,
        crf99_servicesdescription: null,
        _transactioncurrencyid_value: null,
        overriddencreatedon: null,
        crf99_servicesduration: null,
        crf99_servicesestimatedcost_base: null,
        importsequencenumber: null,
        _modifiedonbehalfby_value: null,
        exchangerate: null,
        crf99_district: null,
        _crf99_closedby_value: null,
        _crf99_wreck_value: null,
        utcconversiontimezonecode: null,
        crf99_depth: null,
        processid: null,
        _createdonbehalfby_value: null,
        traversedpath: null,
        crf99_closeddate: null,
        crf99_goodsdischargedby: null,
        crf99_wreckconstructiondetails: null,
        crf99_what3words: null,
        _owningteam_value: null,
        crf99_legacyfilereference: null }
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
          fetchData(tokenResponse.accessToken);
        }
      }
    );

    function fetchData(accessToken) {      
      axios.get(
        url,
        {
          headers: { 'Authorization': `bearer ${accessToken}` },
        }
      )
      .then((res) => {        
        // For testing purposes we are hard coding a userID here, but the aim is to use the 
        // inputted email address to query 'contacts' and grab the userID, before querying 
        // 'mcawreckreports' to retrieve the wreck data related to that userID.
        // The userID is the _crf99_reporter_value
        const currentUserID = "8da6141c-727b-eb11-a812-0022481a85d1";
        const data = res.data.value;
        data.find(function(item, index) {
          if(item._crf99_reporter_value === currentUserID) {
            userReports.push(item);
          }
        })   
        console.log(userReports);   
        console.log('END');
      }) 
      .catch((reqError) => {
        console.error(reqError);
      })
    }

    return res.render('portal/dashboard', { reportData: userReports });
  });
}