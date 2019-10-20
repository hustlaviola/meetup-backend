const isEmail = (email) => {
  const regEx = /^[\w]+[@][\w]+[.][a-z]{2,3}$/;
  const ans = email.match(regEx) ? true : false;
  return ans;
}

const isEmpty = (string) => {
  const ans = string && string.trim() ? false : true;
  return ans;
}

const authError = (req, res, next) => {
  const { email, password, confirmPassword, username } = req.body;

  let errors = {};

  if (isEmpty(email)) {
    errors.email = 'must not be empty';
  } else if (!isEmail(email)) {
    errors.email = 'must be a valid email address'
  }

  if (isEmpty(password)) errors.password = 'must not be empty';

  if (req.url.includes('signup')) {
    if (password !== confirmPassword) errors.confirmPassword = 'passwords must match';
    if (isEmpty(username)) errors.username = 'must not be empty';
  }

  if (Object.keys(errors).length > 0) return res.status(400).json(errors);

  return next();
}

const profile = data => {
  const { bio, occupation, website, location } = data;
  let userDetails = {};
  if (!isEmpty(bio)) userDetails.bio = bio.trim().replace(/  +/g, ' ');
  if (!isEmpty(occupation)) userDetails.occupation = occupation;
  if (!isEmpty(website)) {
    if (website.trim().substring(0, 4) !== 'http') {
      userDetails.website = `http://${website.trim()}`
    } else userDetails.website = website.trim();
  }
  if (!isEmpty(location)) userDetails.location = location;
  return userDetails;
}

module.exports = { authError, profile };
