const { assert } = require('chai');

const { 
  getUserByEmail,
  generateRandomString,
  userURLS,
  addUser,
  authenticateUser } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

const testDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    assert.equal(user, expectedOutput);
  });
});

describe('generateRandomString', function() {
  it('should return a string of 6 random characters', function() {
    const user = generateRandomString().length;
    const expectedOutput = user.length = 6;
    assert.equal(user, expectedOutput);
  });
});