import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { appConfig } from './app.config';
import { provideServerRendering } from '@angular/platform-server';
import { provideHttpClient, withFetch } from '@angular/common/http';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    provideHttpClient(withFetch())
  ]
};

export const appConfigServer: ApplicationConfig = mergeApplicationConfig(appConfig, serverConfig);
export { appConfigServer as appConfig };
