// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  // App Config
  PORT: 4200,
  VERSION: '',
  URL: 'http://localhost:4200/',
  //API_URI: 'https://api-dev.jober.com.vn/',
  // API_URI: 'https://api.jober.com.vn/',
   API_URI: 'http://localhost:2000/',
	//CDN_URI: 'https://cdn.jober.com.vn/',
  CDN_URI: 'https://res.cloudinary.com/dt6hbuc6l/image/upload', // Base URL của Cloudinary
  CLOUDINARY: {
    cloud_name: 'dt6hbuc6l',
    upload_preset: 'my_app_upload' // Thay bằng upload preset bạn tạo trong Cloudinary
  },
  VN_API: 'https://vn-public-apis.fpo.vn/',
  FILE_API: 'F:/Docs/Book/Test/',

};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
