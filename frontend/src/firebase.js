// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyChdAGcMjGCIvpSze-aQvoekhGhsZ6HQro",
    authDomain: "spatial-survey.firebaseapp.com",
    projectId: "spatial-survey",
    storageBucket: "spatial-survey.appspot.com",
    messagingSenderId: "919898216788",
    appId: "1:919898216788:web:cb704e66851370782c10c1",
    measurementId: "G-TJHWF6YFH7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };