const {admin, db } = require('../utils/admin');

const FBAuth = (req, res, next) => {
  const { authorization } = req.headers;
  let idToken;
  if (authorization && authorization.startsWith('Bearer ')) {
    idToken = authorization.split(' ')[1];
  } else {
    return res.status(403).json({error: 'Unauthorized'});
  }

  return admin.auth().verifyIdToken(idToken)
    .then(decodedToken => {
      req.user = decodedToken;
      return db.collection('users').where('userId', '==', req.user.uid).limit(1).get();
    })
    .then(data => {
      req.user.username = data.docs[0].data().username;
      req.user.imageUrl = data.docs[0].data().imageUrl;
      return next();
    })
    .catch(error => {
      if ( error.code === 'auth/argument-error') {
        return res.status(403).json({ error: 'invalid token' });
      } else if (error.code === 'auth/id-token-expired') {
        return res.status(403).json({ error: 'session expired' });
      }
      return res.status(500).json({ error });
    });
}



module.exports = { FBAuth };
