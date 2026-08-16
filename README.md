# FCM Service

A Node.js + TypeScript service for sending Firebase Cloud Messaging (FCM) push notifications using Firebase Admin SDK and Fastify.

## Tech Stack

- Node.js
- TypeScript
- Fastify
- Firebase Admin SDK
- Firebase Cloud Messaging
- dotenv
- tsx

## Requirements

- Node.js 20+
- A Firebase project
- Firebase Admin SDK service account credentials

## Installation

Clone the repository:

```bash
git clone <your-repository-url>
cd fcm-service
```

### Endpoints

```
POST /fcm/send
POST /fcm/multicast
```

### Request example for send

```json
{
  "tokens": ["FCM_REGISTRATION_TOKEN_1", "FCM_REGISTRATION_TOKEN_2"],
  "notification": {
    "title": "Hello",
    "body": "This is a multicast notification"
  },
  "data": {
    "type": "general",
    "screen": "home"
  }
}
```

### Request example for MultiCast

```json
{
  "fids": ["fid_1", "fid_2", "fid_3"],
  "notification": {
    "title": "Hello",
    "body": "This is a multicast notification"
  },
  "data": {
    "type": "general",
    "screen": "home"
  }
}
```

## Send Request from server

```js
const response = await fetch("http://localhost:3000/fcm/multicast", {
  method: "POST",

  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer YOUR_API_KEY",
  },

  body: JSON.stringify({
    fids: ["FID_1", "FID_2"],

    notification: {
      title: "Hello",
      body: "Test notification",
    },

    data: {
      type: "test",
    },
  }),
});

const result = await response.json();

console.log(result);
```
