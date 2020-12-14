function generateRandomString() {
  let randomStr = '';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return randomStr;
};

function checkEmail(email, users) {
  let emailAddy = false;
  for (let user in users) {
    if (email === users[user]["email"]) {
      emailAddy = true;
    }
  }
  return emailAddy;
}

const urlsForUser = function(id, urlDatabase) {
  const userUrls = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userUrls[shortURL] = urlDatabase[shortURL];
    }
  }
  return userUrls;
};

function userByEmail(email, database) {
  for (id in database) {
    if (database[id]["email"] === email) {
      return database[id];
    }
  }
};

module.exports = {
  generateRandomString,
  checkEmail,
  urlsForUser,
  userByEmail
}