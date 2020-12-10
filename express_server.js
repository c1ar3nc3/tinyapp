const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const PORT = 8080;

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser ());

app.set("view engine", "ejs");

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "userRandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

app.get("/urls/new", (req, res) => {
  const userId = req.cookies["user_Id"];
  const loggedIn = users[userId];

  const templateVars = {
    userId,
    loggedIn
  }
  if (!userId){
    return res.redirect('/login');
  } else {
  res.render("urls_new", templateVars);
  }
});

app.get("/urls", (req, res) => {
  const userId = req.cookies["user_Id"];
  const loggedIn = users[userId];
  const usersURLS = userURLS(userId);

  const templateVars = { 
    userId,
    loggedIn,
    urls: urlDatabase,
    users: users,
    usersURLS
  };

  if(userId) {
    res.render("urls_index", templateVars);
  } else {
    res.status(401).send('please log in to continue')
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const userId = req.cookies["user_Id"];
  const loggedIn = users[userId];
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].url
  
  const templateVars = { 
    shortURL: shortURL,
    longURL: longURL,
    userId,
    loggedIn,
  }

  if (!loggedIn) {
    res.redirect("/login");
  } else if (!longURL){
    res.status(404).send("URL does not exist!")
  } else {
  res.render("urls_show", templateVars);
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL].url;
  if (longURL) {
    res.redirect(longURL)
  } else {
    res.status(404).send('TinyURL not found')
  }
});

app.get("/register", (req, res) => {
  const userId = req.cookies["user_Id"];
  const loggedIn = users[userId];

  const templateVars = {
    userId,
    loggedIn
  }

  if(userId) {
    res.redirect('/urls')
  }
  res.render("register", templateVars)
});

app.get("/login", (req, res) => {
  const userId = req.cookies["user_Id"];
  const loggedIn = users[userId];

  const templateVars = {
    userId,
    loggedIn
  }
  if(userId) {
    res.redirect("/urls")
  } else {
    res.render("login", templateVars)
  }
});

//~~~~~~POSTS

// creates 6-digit string and pushes updated values to long/shortURL
app.post("/urls", (req, res) => {
  const userId = req.cookies["user_Id"];
  let newURL = generateRandomString();
  const longURL = req.body.longURL;

  urlDatabase[newURL] = {
      url: longURL,
      userID: userId
  }

  if (userId) {
    res.redirect(`/urls/${newURL}`);
  } else {
    res.status(401).send("please log in to continue")
  }
});

// will delete URL's and return to url Index
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL
  if (req.cookies["user_Id"]) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

// returns the updates short/long values to database
app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.id].longURL = req.body.longURLTwo;
  res.redirect('/urls')
});

//will login and save username as a cookie
app.post("/login", (req, res) => {
  const eM = req.body.email;
  const pW = req.body.password;
  for (let key in users) {
    let usrMatch = users[key].email;
    let pwMatch = users[key].password
    if (eM === usrMatch) {
      if (pW === pwMatch) {
        let user = users[key];
        res.cookie("user_Id", user)
        res.redirect('/urls')
        return;
      } else {
        return res.status(403).send('incorrect password');
      }
    }
  }
  return res.status(403).send('cannot find email address')
});

//sets username and password after registration
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const id = generateRandomString();
  const user = {
    id,
    email,
    password
  }
  users[id] = user;
  
  if (email === "") {
    return res.status(400).send('Email address cannot be empty');
  }

  if (email === users.email) {
    return res.status(400).send('Email address already registered');
  }
  res.redirect('/login')
});

//logs out user and clears cookie
app.post("/logout", (req, res) => {
  const user = req.body.username;
  res.clearCookie("user_Id", user)
  res.redirect('/login')
});


// end
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// helper functions
function generateRandomString() {
  let randomStr = '';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return randomStr;
};

function emailLookup(addy) {
  for (const mail in users) {
    if (addy === users[mail].email) {
      return users[mail];
    }
  }
  return false;
};

function pwLookup(pw) {
  for (const pass in users) {
    if (pw === users[pass].password) {
      return true;
    }
  }
  return false;
};

function userURLS(database, user) {
  let userDatabase = {};
  for (url in database) {
    if (database[url].user_ID === user) {
      userDatabase = database[url];
    }
  }
  return userDatabase;
}

const authenticateUser = (username, password) => {
  return users[username] && users[password].password === password;
}