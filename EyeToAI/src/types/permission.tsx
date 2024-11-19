import {PermissionsAndroid} from 'react-native';

declare module 'react-native' {
  namespace PermissionsAndroid {
    interface Permission {
      PACKAGE_USAGE_STATS: 'android.permission.PACKAGE_USAGE_STATS';
    }

    interface Permissions {
      PACKAGE_USAGE_STATS: Permission['PACKAGE_USAGE_STATS'];
    }
  }
}
