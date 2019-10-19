const firebase = require('firebase');

const firebaseConfig = {
  apiKey: "AIzaSyD5MTH2AsZ3sxPlnsOHr8CPBGEIXK3NE7Y",
  authDomain: "fiosa-meetup.firebaseapp.com",
  databaseURL: "https://fiosa-meetup.firebaseio.com",
  projectId: "fiosa-meetup",
  storageBucket: "fiosa-meetup.appspot.com",
  messagingSenderId: "235711777827",
  appId: "1:235711777827:web:c44ddfedf74b53f1563596",
  measurementId: "G-NVLTW0RQFH"
};

firebase.initializeApp(firebaseConfig);

module.exports = { firebase, firebaseConfig };
