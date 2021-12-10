import { ConfigType } from '@nestjs/config';
import { ConfigModuleOptions } from '@nestjs/config/dist/interfaces';
import { appConfigsFactory } from './app.config';

const appConfig = appConfigsFactory();

export const configModuleOptions: ConfigModuleOptions = {
  load: [appConfig],
  isGlobal: true,
};

export const APP_CONFIGS_KEY = appConfig.KEY;

export type TAppConfigs = ConfigType<typeof appConfig>;
