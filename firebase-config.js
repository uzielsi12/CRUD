// Configuración de Firebase (rellena con tus datos reales)
const firebaseConfig = {
  apiKey: "AIzaSyBm4N5gu9SM1VEDp2AAy9ruODeRgYnkYNM",
  authDomain: "fire-base-p-9cc94.firebaseapp.com",
  projectId: "fire-base-p-9cc94",
  storageBucket: "fire-base-p-9cc94.appspot.com",
  messagingSenderId: "143205101712",
  appId: "1:143205101712:web:9b770882421f7cf7ed2815",
  measurementId: "G-JJHBRF1K1S"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Exportar servicios
const db = firebase.firestore();
const auth = firebase.auth();
