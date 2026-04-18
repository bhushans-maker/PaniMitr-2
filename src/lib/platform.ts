import { Capacitor } from '@capacitor/core';

export const isNative = () => Capacitor.isNativePlatform();
export const isWeb = () => !isNative();
