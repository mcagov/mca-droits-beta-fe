import axios from 'axios';
import adal from 'adal-node';

import { $, $1, closest } from '../utilities/selector.js';

import ComponentManager from '../tools/component-manager.js';
import LoadManager, { QUEUE } from '../tools/load-manager.js';

export class PortalDashboard {
  constructor(el) {
    if (!el) return;

    this.el = el;
    this.url = 'https://mca-sandbox.crm11.dynamics.com/api/data/v9.1/crf99_mcawreckreports';
    //this.reporterID = '8da6141c-727b-eb11-a812-0022481a85d1';
    //const detailUrl = 'https://mca-sandbox.crm11.dynamics.com/api/data/v9.1/crf99_mcawreckreports?$select=crf99_reportreference';
    this.token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6Im5PbzNaRHJPRFhFSzFqS1doWHNsSFJfS1hFZyIsImtpZCI6Im5PbzNaRHJPRFhFSzFqS1doWHNsSFJfS1hFZyJ9.eyJhdWQiOiJodHRwczovL21jYS1zYW5kYm94LmNybTExLmR5bmFtaWNzLmNvbSIsImlzcyI6Imh0dHBzOi8vc3RzLndpbmRvd3MubmV0LzUxM2ZiNDk1LTlhOTAtNDI1Yi1hNDlhLWJjNmViZTJhNDI5ZS8iLCJpYXQiOjE2MTQ5NDIwNDgsIm5iZiI6MTYxNDk0MjA0OCwiZXhwIjoxNjE0OTQ1OTQ4LCJhaW8iOiJFMlpnWUdodUNYbDJ0dUhFZ1IvUE9qaTMvVHNrQVFBPSIsImFwcGlkIjoiNjJlZjRmMzYtMGJkMS00M2YwLTljZTQtZWFmNGEwNzhiOWExIiwiYXBwaWRhY3IiOiIxIiwiaWRwIjoiaHR0cHM6Ly9zdHMud2luZG93cy5uZXQvNTEzZmI0OTUtOWE5MC00MjViLWE0OWEtYmM2ZWJlMmE0MjllLyIsIm9pZCI6ImRiYTQyZTNhLTNmYTQtNDkyMi1iYTc2LTFlYjBlNGIzNTliNSIsInJoIjoiMC5BQUFBbGJRX1VaQ2FXMEtrbXJ4dXZpcENualpQNzJMUkNfQkRuT1RxOUtCNHVhRjVBQUEuIiwic3ViIjoiZGJhNDJlM2EtM2ZhNC00OTIyLWJhNzYtMWViMGU0YjM1OWI1IiwidGlkIjoiNTEzZmI0OTUtOWE5MC00MjViLWE0OWEtYmM2ZWJlMmE0MjllIiwidXRpIjoiM2NqcWxJb25hVXFFNnRrdGlrVjBBQSIsInZlciI6IjEuMCJ9.UxsH5UwVjXZD1WzbdEYxkriMNYVVawIFDmnoq7R5IMYl8WxBQKZNWNyN9OHpGXostDqk-Bb1-GujzAvfj_2ol_GtulMIwgF1aYaG3Hs4jUL9nQ0yso7rboNUvu9dIHehTgt62m-ZNIeRvdp2gBacpFeSpo5KuTD4OmYMLIL1RXDM1F3fWPi6MGIPND9NK0rPdQu6SVIHzl9C-x9c5j7JKvzABaNGrlx-JrVIOnjxlmuMC_a3T2nLo6rd_IU7Q1E7xiOxS97YPBIe9Da2Og0_o_y8jc92GjMq7LowEnDIxLpITDOijgS_p9yD7g6a5-S6kRYHfqa-rMlyqUusTOlkfQ";

    LoadManager.queue(this.init.bind(this), QUEUE.RESOURCES);
  }

  init() {
    //this.getToken();
    this.fetchData();
    
  }

  test() {
    return new Promise((resolve, reject) => {
      if(this.getToken()) {
        resolve();
      } else {
        reject();
      }
    })
  }

  async fetchData() {
    try {
      const res = await axios.get(
        this.url,
        {
          headers: { 'Authorization': `bearer ${this.token}` },
        }
      );

      if (res.data) {
        console.log(res.data.value);
      } 
    } catch (reqError) {
      console.error(reqError);
    }
  }

  getToken() {
    axios.post(
      '/portal/access-dataverse',
    )
    .then((res) => {
      console.log(res);
      this.token = res.data;
    })
    .catch((error) => {
      console.error(error);
    })
  }
}

export default LoadManager.queue(() => {
  new ComponentManager(PortalDashboard, '[data-js~=portal-dashboard]');
}, QUEUE.DOM);
