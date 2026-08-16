import { cert, initializeApp} from "firebase-admin/app"
import { getMessaging } from "firebase-admin/messaging";
import serviceAccount from "../../credentials/firebase-service-account.json" with {
    type: "json"
}


const app = initializeApp({
    credential: cert(serviceAccount)
})

export const messaging = getMessaging(app)