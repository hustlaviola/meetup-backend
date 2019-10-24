const functions = require('firebase-functions');
const app = require('express')();
const { db } = require('./utils/admin');
const { FBAuth } = require('./middlewares/FBAuth');
const { authError } = require('./middlewares/validations/validator');
const {
  getPosts,
  createPost,
  getPost,
  commentOnPost,
  likePost,
  deletePost
} = require('./controllers/posts');

const {
  signup,
  login,
  uploadProfileImage,
  updateProfile,
  getOwnDetails,
  getUserDetails,
  markNotificationsRead
} = require('./controllers/users');

// Post route
app.get('/posts', FBAuth, getPosts);

app.post('/posts', FBAuth, createPost);

app.get('/posts/:postId', getPost);

app.post('/posts/:postId/comments', FBAuth, commentOnPost);

app.get('/posts/:postId/like', FBAuth, likePost);

app.delete('/posts/:postId', FBAuth, deletePost);

// Auth route
app.post('/auth/signup', authError, signup);

app.post('/auth/login', authError, login);

app.post('/users/image', FBAuth, uploadProfileImage);

app.post('/users/profile', FBAuth, updateProfile);

app.get('/users/credentials', FBAuth, getOwnDetails);

app.get('/users/:username', getUserDetails);

app.post('/notifications', FBAuth, markNotificationsRead);

exports.api = functions.https.onRequest(app);

exports.createLikeNotification = functions.firestore.document('likes/{id}')
  .onCreate(snapshot => {
    const snap = snapshot.data();
    return db.doc(`/posts/${snap.postId}`).get()
      .then(doc => {
        if (doc.exists && doc.data().username !== snap.username) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().username,
            sender: snapshot.data().username,
            type: 'like',
            read: false,
            postId: doc.id
          });
        }
        return true;
      })
      .catch(error => {
        return;
      })
  })

exports.deleteNotifications = functions.firestore.document('likes/{id}')
  .onDelete(snapshot => {
    return db.doc(`/notifications/${snapshot.id}`).delete()
      .catch(error => {
        return;
      })
  })

exports.createCommentNotification = functions.firestore.document('comments/{id}')
  .onCreate(snapshot => {
    const snap = snapshot.data();
    return db.doc(`/posts/${snap.postId}`).get()
      .then(doc => {
        if (doc.exists && doc.data().username !== snap.username) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().username,
            sender: snapshot.data().username,
            type: 'comment',
            read: false,
            postId: doc.id
          });
        }
        return true;
      })
      .catch(error => {
        return;
      })
  })

exports.onUserImageChange = functions.firestore.document('users/{userId}')
  .onUpdate(change => {
    const before = change.before.data();
    const after = change.after.data();
    if (before.imageUrl !== after.imageUrl) {
      let batch = db.batch();
      return db.collection('posts').where('username', '==', before.username).get()
        .then(data => {
          data.forEach(doc => {
            const post = db.doc(`/posts/${doc.id}`);
            batch.update(post, { userImage: after.imageUrl });
          })
          return db.collection('comments').where('username', '==', before.username).get()
        })
        .then(data => {
          data.forEach(doc => {
            const comment = db.doc(`/comments/${doc.id}`);
            batch.update(comment, { userImage: after.imageUrl });
          })
          return batch.commit();
        })
        .catch(error => {
          return;
        })
    }
    return true;
  })

exports.onPostDelete = functions.firestore.document('posts/{postId}')
  .onDelete((snapshot, context) => {
    const { postId } = context.params;
    const batch = db.batch();
    return db.collection('comments').where('postId', '==', postId).get()
      .then(data => {
        data.forEach(doc => {
          batch.delete(db.doc(`/comments/${doc.id}`));
        })
        return db.collection('likes').where('postId', '==', postId).get();
      })
      .then(data => {
        data.forEach(doc => {
          batch.delete(db.doc(`/likes/${doc.id}`));
        })
        return db.collection('notifications').where('postId', '==', postId).get();
      })
      .then(data => {
        data.forEach(doc => {
          batch.delete(db.doc(`/notifications/${doc.id}`));
        })
        return batch.commit();
      })
      .catch(error => {
        return;
      })
  })
