import { PublicClientApplication } from '@azure/msal-browser';

export const msalInstance = new PublicClientApplication({
  auth: {
    clientId: '1d1e71b9-a285-41a2-acab-0eeb6e867057',
    authority: 'https://login.microsoftonline.com/c0f5d6e1-fce3-434b-a7a3-71dedbac1a01',
    redirectUri: 'http://localhost:4200',
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  },
});


