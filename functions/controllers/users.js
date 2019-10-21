const { admin, db } = require('../utils/admin');
const { firebase, firebaseConfig } = require('../config/config');
const { checkProfile } = require('../middlewares/validations/validator');

const signup = (req, res) => {
  const { email, password, username } = req.body;

  let token, userId;

  const avatar = 'no-img.png';

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
        imageUrl: `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${avatar}?alt=media`,
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

const updateProfile = (req, res) => {
  const userDetails = checkProfile(req.body);

  return db.doc(`/users/${req.user.username}`).update(userDetails)
    .then(() => {
      return res.json({ message: 'profile updated successfully' })
    })
    .catch(error => res.status(500).json({ error: error.code }));
}

const getOwnDetails = (req, res) => {
  let userInfo = {};
  return db.doc(`/users/${req.user.username}`).get()
    .then(doc => {
      if (!doc.exists) return null;
      userInfo.credentials = doc.data();
      return db.collection('likes').where('username', '==', req.user.username).get();
    })
    .then(data => {
      if (!data) return res.status(404).json({ error: 'user credentials not found'});
      userInfo.likes = [];
      data.forEach(doc => {
        userInfo.likes.push(doc.data());
      })
      return res.json(userInfo);
    })
    .catch(error => res.status(500).json({ error }));
}

const uploadProfileImage = (req, res) => {
  const BusBoy = require('busboy');
  const path = require('path');
  const os = require('os');
  const fs = require('fs');

  const busboy = new BusBoy({ headers: req.headers });

  let imageName;
  let imageToBeUploaded;

  busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
    const mimetypes = ['image/jpeg', 'image/png'];
    if (!mimetypes.includes(mimetype)) return res.status(400).json({ error: 'file type not supported'});
    filenameArray = filename.split('.');
    const imageExtension = filenameArray[filenameArray.length - 1];
    imageName = `${Math.round(Math.random() * 100000000000000)}.${imageExtension}`;
    const filepath = path.join(os.tmpdir(), imageName);
    imageToBeUploaded = { filepath, mimetype };
    file.pipe(fs.createWriteStream(filepath))
  });
  busboy.on('finish', () => {
    admin.storage().bucket().upload(imageToBeUploaded.filepath, {
      resumable: false,
      metadata: {
        metadata: {
          contentType: imageToBeUploaded.mimetype
        }
      }
    })
    .then(() => {
      const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${imageName}?alt=media`;
      return db.doc(`/users/${req.user.username}`).update({ imageUrl });
    })
    .then(() => {
      return res.json({message: 'image uploaded succesfully'});
    })
    .catch((error) => {
      return res.status(500).json({ error });
    })
  });
  busboy.end(req.rawBody);
  return;
}

module.exports = { signup, login, uploadProfileImage, updateProfile, getOwnDetails };
