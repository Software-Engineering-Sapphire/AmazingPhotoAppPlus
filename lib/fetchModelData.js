var Promise = require("Promise");

/**
  * FetchModel - Fetch a model from the web server.
  *     url - string - The URL to issue the GET request.
  * Returns: a Promise that should be filled
  * with the response of the GET request parsed
  * as a JSON object and returned in the property
  * named "data" of an object.
  * If the requests has an error the promise should be
  * rejected with an object contain the properties:
  *    status:  The HTTP response status
  *    statusText:  The statusText from the xhr request
  *
*/


function fetchModel(url) {
  return new Promise(function(resolve, reject) {
      const httpRequest = new XMLHttpRequest();

      httpRequest.onreadystatechange = function (){
          if(this.readyState === 4) {
              if (this.status === 200) {
                  try {
                      setTimeout(() => resolve({data: JSON.parse(this.responseText)}), 0);
                  } catch (error) {
                      setTimeout(() => reject({status: this.status, statusText: 'Error parsing JSON'}), 0);
                  }
              } else {
                  setTimeout(() => reject({status: this.status, statusText: this.statusText}), 0);
              }
          }
      }

      httpRequest.open('GET', url);
      httpRequest.send();
  });
}

export default fetchModel;
