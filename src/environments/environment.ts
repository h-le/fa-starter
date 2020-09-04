/* 1. cp environment.ts environment.prod.ts */
/* 2. Set up variables as necessary. */
/* When working locally, `ng serve --prod` */
export const environment = {
  production: false,
  firebaseConfig: {
    apiKey: '',
    authDomain: '',
    databaseURL: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
  },
};
