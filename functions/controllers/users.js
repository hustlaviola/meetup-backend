const { db } = require('../utils/admin');
const { firebase } = require('../config/config');

const signup = (req, res) => {
  const { email, password, username } = req.body;

  let token, userId;

  return db.doc(`/users/${username}`).get()
    .then(doc => {
      if (doc.exists) {
        return res.status(409).json({ error: 'this username is already in use'})
      } else {
        return firebase.auth().createUserWithEmailAndPassword(email, password);
      }
    })
    .then(data => {
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then(idToken => {
      token = idToken;
      const userCredentials = {
        username,
        email,
        createdAt: new Date().toISOString(),
        userId
      }
      return db.doc(`/users/${username}`).set(userCredentials);
    })
    .then(() => {
      return res.status(201).json({ token });
    })
    .catch(error => {
      if ( error.code === 'auth/email-already-in-use') {
        return res.status(409).json({ error: error.message })
      }
      return res.status(500).json({ error })
    });
}

const login = (req, res) => {
  const { email, password } = req.body;

  return firebase.auth().signInWithEmailAndPassword(email, password)
    .then(data => {
      return data.user.getIdToken();
    })
    .then(token => {
      return res.json({token})
    })
    .catch(error => {
      if ( error.code === 'auth/user-not-found') {
        return res.status(404).json({ error: error.message });
      } else if (error.code === 'auth/wrong-password') {
        return res.status(403).json({ error: error.message });
      }
      return res.status(500).json({ error });
    });
}

module.exports = { signup, login };
