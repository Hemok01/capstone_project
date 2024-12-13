import {onDocumentCreated} from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const sendNotification = onDocumentCreated(
  'triggers/{docId}',
  async event => {
    const data = event.data?.data();
    if (!data) return;

    const message = {
      token: data.token,
      notification: {
        title: data.title,
        body: data.body,
      },
    };

    return admin.messaging().send(message);
  },
);
