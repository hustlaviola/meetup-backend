function isEmail(email) {
  const regEx = /^[\w]+[@][\w]+[.][a-z]{2,3}$/;
  const ans = email.match(regEx) ? true : false;
  return ans;
}

function isEmpty(string) {
  const ans = string && string.trim() ? false : true;
  return ans;
}

function authError(req, res, next) {
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

module.exports = { authError };
