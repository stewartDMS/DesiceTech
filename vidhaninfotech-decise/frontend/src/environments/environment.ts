// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,

  apiUrl: 'http://localhost:80/v1/',
  uploadsUrl: 'http://localhost:80/uploads/', 
  uploadFile: 'https://17imjsjqd8.execute-api.eu-north-1.amazonaws.com/dev/desice-uploaded-files/',

  // apiUrl: 'http://13.50.94.246/v1/',
  // uploadsUrl: 'http://13.50.94.246/uploads/',

  // apiUrl: 'http://decisedevelopment.vidhaninfotech.com/v1/',
  // uploadsUrl: 'http://decisedevelopment.vidhaninfotech.com/uploads/',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
