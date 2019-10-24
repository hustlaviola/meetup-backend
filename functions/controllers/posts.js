const { db } = require('../utils/admin');
const { checkComment } = require('../middlewares/validations/validator')

const getPosts = (req, res) => {
  return db.collection('posts')
    .orderBy('createdAt', 'desc')
    .get()
    .then(data => {
      let posts = [];
      data.forEach(doc => {
        const {
          username,
          body,
          createdAt,
          likeCount,
          commentCount,
          userImage
        } = doc.data();

        posts.push({
          postId: doc.id,
          username,
          body,
          createdAt,
          likeCount,
          commentCount,
          userImage
        });
      });
      return res.json(posts);
    })
    .catch(error => res.status(500).json({ error }));
}

const createPost = (req, res) => {
  const { username } = req.user;
  const userImage = req.user.imageUrl;
  let { body } = req.body;
  body = body.trim().replace(/  +/g, ' ');
  const createdAt = new Date().toISOString();
  const newPost = {
    body,
    username,
    userImage,
    createdAt,
    likeCount: 0,
    commentCount: 0
  };

  return db.collection('posts').add(newPost)
    .then(doc => {
      const responsePost = newPost;
      responsePost.postId = doc.id;
      return res.json(responsePost);
    })
    .catch(error => res.status(500).json({ error }));
}

const getPost = (req, res) => {
  let postData = {};
  db.doc(`/posts/${req.params.postId}`).get()
    .then(doc => {
      if (!doc.exists) return res.status(404).json({error: 'Post not found'});
      postData = doc.data();
      postData.postId = doc.id;
      return db.collection('comments').orderBy('createdAt', 'desc')
        .where('postId', '==', req.params.postId).get();
    })
    .then(data => {
      postData.comments = [];
      data.forEach(doc => {
        postData.comments.push(doc.data());
      });
      return res.json(postData);
    })
    .catch(error => res.status(500).json({ error }));
}

const commentOnPost = (req, res) => {
  const isComment = checkComment(req.body);
  let { body } = req.body;
  body = body.trim().replace(/  +/g, ' ');

  if (!isComment) return res.status(400).json({error: 'must not be empty'})
  const newComment = {
    body,
    createdAt: new Date().toISOString(),
    postId: req.params.postId,
    username: req.user.username,
    userImage: req.user.imageUrl
  }
  return db.doc(`/posts/${req.params.postId}`).get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({ error: 'post not available' })
      }
      return doc.ref.update({ commentCount: doc.data().commentCount + 1});
    })
    .then(() => {
      return db.collection('comments').add(newComment);
    })
    .then(() => {
      return res.status(201).json(newComment);
    })
    .catch(error => res.status(500).json({ error }));
}

const likePost = (req, res) => {
  const { username } = req.user;
  const { postId } = req.params;
  const likeDocument = db.collection('likes').where('username', '==', username)
    .where('postId', '==', req.params.postId).limit(1);

  const postDocument = db.doc(`/posts/${postId}`);
  let postData;

  return postDocument.get()
    .then(doc => {
      if (doc.exists) {
        postData = doc.data();
        postData.postId = doc.id;
        return likeDocument.get();
      } else return res.status(404).json({error: 'post not available'});
    })
    .then(data => {
      if (data.empty) {
        return db.collection('likes').add({
          postId,
          username
        })
        .then(() => {
          postData.likeCount++;
          return postDocument.update({ likeCount: postData.likeCount });
        })
        .then(() => {
          return res.json(postData);
        })
      } else {
        return db.doc(`/likes/${data.docs[0].id}`).delete()
          .then(() => {
            postData.likeCount--;
            return postDocument.update({ likeCount: postData.likeCount });
          })
          .then(() => {
            return res.json(postData);
          })
      }
    })
    .catch(error => res.status(500).json({ error }));
}

const deletePost = (req, res) => {
  const myDocument = db.doc(`/posts/${req.params.postId}`);

  return myDocument.get()
    .then(doc => {
      if (!doc.exists) return res.status(404).json({ error: 'post not available' });
      const { username } = doc.data();
      if (username !== req.user.username) {
        return res.status(403).json({ error: 'unauthorized'});
      } else {
        return myDocument.delete();
      }
    })
    .then(() => {
      return res.json({message: 'post deleted successfully'});
    })
    .catch(error => res.status(500).json({ error }));
}

module.exports = {
  getPosts,
  createPost,
  getPost,
  commentOnPost,
  likePost,
  deletePost
};
