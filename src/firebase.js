// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBVjReYy2L1xvdnEowpB_fsR1YoJtLKUVA",
  authDomain: "weather-app-100e7.firebaseapp.com",
  projectId: "weather-app-100e7",
  storageBucket: "weather-app-100e7.appspot.com",
  messagingSenderId: "169423529636",
  appId: "1:169423529636:web:0909de7fb300e6fe9fa831",
  measurementId: "G-CL2G7E4GP7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default app;