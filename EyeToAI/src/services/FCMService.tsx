import messaging from '@react-native-firebase/messaging';
import notifee, {AndroidImportance} from '@notifee/react-native';
import firestore from '@react-native-firebase/firestore';
import {Platform, PermissionsAndroid} from 'react-native';

interface FCMServiceProps {
  userId: string;
}

type NotificationMessage = {
  notification?: {
    title?: string;
    body?: string;
  };
};

export class FCMService {
  private userId: string;

  constructor(props: FCMServiceProps) {
    this.userId = props.userId;
  }

  async init(): Promise<void> {
    try {
      await this.createNotificationChannel();
      await this.requestPermission();
      await this.setupToken();
      this.setupMessageHandler();
      this.setupTokenRefresh();
      this.setupBackgroundHandler();
    } catch (error) {
      console.error('FCM initialization failed:', error);
      throw error;
    }
  }

  private async createNotificationChannel(): Promise<void> {
    try {
      await notifee.createChannel({
        id: 'time_control',
        name: '시간 제어 알림',
        importance: AndroidImportance.HIGH,
      });
    } catch (error) {
      console.error('Channel creation failed:', error);
      throw error;
    }
  }

  private async requestPermission(): Promise<void> {
    try {
      await messaging().requestPermission();
      if (Platform.OS === 'android') {
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
      }
    } catch (error) {
      console.error('Permission request failed:', error);
      throw error;
    }
  }

  private async setupToken(): Promise<void> {
    try {
      const token = await messaging().getToken();
      await firestore()
        .collection('users')
        .doc(this.userId)
        .set({fcmToken: token}, {merge: true});
    } catch (error) {
      console.error('Token setup failed:', error);
      throw error;
    }
  }

  private setupMessageHandler(): void {
    messaging().onMessage(async (message: NotificationMessage) => {
      try {
        await notifee.displayNotification({
          title: message.notification?.title,
          body: message.notification?.body,
          android: {
            channelId: 'time_control',
          },
        });
      } catch (error) {
        console.error('Message handling failed:', error);
      }
    });
  }

  private setupTokenRefresh(): void {
    messaging().onTokenRefresh(async token => {
      try {
        await firestore()
          .collection('users')
          .doc(this.userId)
          .update({fcmToken: token});
      } catch (error) {
        console.error('Token refresh failed:', error);
      }
    });
  }

  private setupBackgroundHandler(): void {
    messaging().setBackgroundMessageHandler(async message => {
      try {
        return await notifee.displayNotification({
          title: message.notification?.title,
          body: message.notification?.body,
          android: {channelId: 'time_control'},
        });
      } catch (error) {
        console.error('Background message handling failed:', error);
        throw error;
      }
    });
  }
}
