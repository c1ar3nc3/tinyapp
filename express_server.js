const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");
const PORT = 8080;

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: "session",
  keys: ["secretKey"],
  maxAge: 24 * 60 * 60 * 1000
}))

app.set("view engine", "ejs");

const { 
  generateRandomString,
  checkEmail,
  urlsForUser } = require("./helpers");

const users = {
};

const urlDatabase = {
};

//HOME PAGE~~~~
app.get('/', (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  if (user) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

//LOGIN~~~~~
app.get("/login", (req,res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  if (req.session["user_id"] === undefined) {
    const templateVars = { 
      user
    };
    res.render("login", templateVars);
  } else {
    res.redirect("/urls");
  }
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  if (checkEmail(email, users) === false) {
    return res.status(403).send("email not registered");    
  }
  for (let user in users) {
    if (email === users[user]["email"]) {
      if (bcrypt.compareSync(req.body.password, users[user]["password"])) {
        req.session.user_id = userByEmail(email)["id"];
        res.redirect("/urls");
      } else {
        return res.status(403).send("incorrect password");
      }
    }
  }
});

//LOGOUT~~~~
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/");
});

//ERROR~~~~~
app.get("/error", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const templateVars = { 
    user
  };
  res.render("error", templateVars);
});

//REGISTER~~~
app.get("/register", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const templateVars = { 
    user
   };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const emailAddy = req.body.email;
  if ((req.body.email === "") || (req.body.password === "")) {
    res.status(400).send("fields cannot be blank");
  } else if (checkEmail(emailAddy, users) === true) {
    res.status(400).send("email already registered");
  } else {
    let newID = generateRandomString();
    users[newID] = {
      id: newID,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password,10)
    };
    req.session.user_id = newID;
  };
  res.redirect("/urls");
});

/*  ~~~~~TinyURL~~~~~ */
//creates URL Index for Users/non-Users
app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  // const userUrls = urlsForUser(userID, urlDatabase);
    const templateVars = {
      urls: urlDatabase,
      user
    };
    res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const fullURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {};
  urlDatabase[shortURL]["longURL"] = fullURL;
  urlDatabase[shortURL]["userID"] = req.session.user_id;
  res.redirect("/urls/${shortURL}");
});

//Create a new TinyURL
app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  if (req.session.user_id !== undefined) {
    const userID = req.session.user_id;
    const templateVars = {
      user
    };
    return res.render("urls_new", templateVars);
  } 
  return res.redirect("/login")
});

//makes tinyURL an active link
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL] === undefined) {
    return res.redirect("/login");
  } 
  const longURL = urlDatabase[req.params.shortURL].longURL;
  return res.redirect(longURL);
});

//displays tinyURL link/longURL & Edit URL
app.get("/urls/:shortURL", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const shortURL = req.params.shortURL;
  if (req.session.user_id === undefined) {
    return res.redirect("/login");
  } else {
    if (urlDatabase[req.params.shortURL]) {
      const templateVars = {
        shortURL,
        longURL: urlDatabase[req.params.shortURL],
        user
      };
      return res.render("urls_show", templateVars);
    } else {
      return res.redirect("/login");
    }
  }
});

/*~~~~~EDIT/DELETE~~~~~*/
//edits longURL for TinyURL
app.post("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session.user_id;
  if (!req.session.user_id) {
    return res.status(401).send("please log in to continue");
  }
  if (userID !== urlDatabase[shortURL].userID) {
    return res.status(404).send("cannot edit another users URL");
  }
    urlDatabase[shortURL].longURL = req.body.newURL;
    res.redirect("/urls");
});

// will delete URL's and return to url Index
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session.user_id;
  if (!req.session.user_id) {
    res.redirect("/error");
  }
  if (userID !== urlDatabase[shortURL].userID) {
    return res.status(404).send("cannot delete another users URL");
  } else {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  }
});

// end
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function userByEmail(email) {
  for (id in users) {
    if (users[id]["email"] === email) {
      return users[id];
    }
  }
}