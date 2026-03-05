import { Serwist } from 'serwist';

declare const self: {
  __SW_MANIFEST: unknown;
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
});

serwist.addEventListeners();
