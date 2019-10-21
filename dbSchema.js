const db = {
  users: [
    {
      userId: 'eefdgfhfhht5r6',
      email: 'user@mail.com',
      username: 'user',
      createdAt: '2019-10-18T17:08:02.093Z',
      imageUrl: 'https://firebasestorage.googleapis.com/v0/b/fiosa-meetup.appspot.com/o/98936956497016.jpg?alt=media',
      bio: 'I am a person',
      location: 'Akure, Ondo State'
    }
  ],
  posts: [
    {
      username: 'user',
      body: 'A new post',
      createdAt: '2019-10-18T17:08:02.093Z',
      likeCount: 5,
      commentCount: 2
    }
  ],
  comments: [
    {
      username: 'user',
      postId: 'jdjdgdgdjrt55',
      body: 'Cool one',
      createdAt: '2019-10-18T17:08:02.093Z'
    }
  ],
  notifications: [
    {
      recipient: 'user',
      sendder: 'viola',
      read: 'true | false',
      postId: 'jfh45njfndjfd',
      type: 'like | comment',
      createdAt: '2019-10-18T17:08:02.093Z'
    }
  ]
}

const userDetails = {
  // Redux data
  userCredentials: {
    userId: 'eefdgfhfhht5r6',
    email: 'user@mail.com',
    username: 'user',
    createdAt: '2019-10-18T17:08:02.093Z',
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/fiosa-meetup.appspot.com/o/98936956497016.jpg?alt=media',
    bio: 'I am a person',
    location: 'Akure, Ondo State'
  },
  likes: [
    {
      username: 'user',
      postId: 'jkssfdufie56ns'
    },
    {
      username: 'user',
      postId: 'jks43eufie56ns'
    }
  ]
}