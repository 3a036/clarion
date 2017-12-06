"use strict";

document.addEventListener("DOMContentLoaded", function() {
  let processionElem = document.getElementById("procession");

  let handleUnsupported = () => {
    processionElem.className = 'procession_unsupported';
  };
  let unsupportedTimer = setTimeout(handleUnsupported, 3000);

  window.u2f.getApiVersion((ver) => {
    console.log(ver);
    clearTimeout(unsupportedTimer);

    let authnId = processionElem.attributes['data-authn-id'].value;
    let appId = processionElem.attributes['data-app-id'].value;
    let reqId = processionElem.attributes['data-req-id'].value;
    let requests = JSON.parse(processionElem.attributes['data-requests'].value);
    let challenge = JSON.parse(processionElem.attributes['data-challenge'].value);


    let processCallback = (json) => {
      processionElem.className = 'procession_ok';
    }

    let cb = (response) => {
      console.log(response);

      if (response.errorCode) {
        processionElem.className = 'procession_error';
        return;
      }
      processionElem.className = 'procession_contact';

      let payload = JSON.stringify({
        req_id: reqId,
        response: JSON.stringify(response),
      });

      let handleError = (err) => {
        console.log(err);
        processionElem.className = 'procession_error';
      };

      fetch(`/ui/verify/${authnId}`, {credentials: 'include', method: 'POST', body: payload}).then((resp) => {
        console.log(resp);
        if (!resp.ok) {
          processionElem.className = 'procession_error';
          return;
        }
        return resp.json().then((json) => {
          console.log(json);
          if (json.ok) {
            processCallback(json);
          } else {
            processionElem.className = 'procession_error';
          }
        });
      }).catch(handleError);
    };

    processionElem.className = 'procession_wait';
    window.u2f.sign(appId, challenge, requests, cb, 300000);
  });


});
