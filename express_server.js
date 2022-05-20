const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
cookieSession = require('cookie-session')
const bcrypt = require('bcryptjs');
const { generateRandomString, checkRegistration, checkEmail, verifyUser, urlsForUser, getUserByEmail } = require('./helpers')
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: 'session',
    keys: ["user_id"],
  }))


const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};



let urlDatabase = {};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
    urls: urlsForUser(req.session.user_id, urlDatabase),
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  const userID = req.session.user_id;
  urlDatabase[shortURL] = { longURL, userID };
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
  };
  res.render("urls_new", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const user_id = req.session.user_id
  const user = users[user_id]
  if(!user){ 
    return res.redirect("/login")
  }
  delete urlDatabase[req.params.shortURL];
 res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const longURL = req.body.longURL;
  urlDatabase[req.params.id] = {
    longURL: longURL,
    userID: req.session.user_id,
  };
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
if (!urlDatabase[req.params.shortURL]){
  return res.status(403).send("The short url does not exist")
}
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  const user_id = req.session.user_id
  const user = users[user_id]
  if (!user){
    return res.redirect("/login")
    
  }
  if (!urlDatabase[req.params.shortURL]){
    return res.status(403).send("The short url does not exist")
  }
  const templateVars = {
    user: users[req.session.user_id],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
  };
  res.render("urls_show", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: null,
  };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = verifyUser(email, password, users);
  if (!getUserByEmail(email, users)){
    return res.status(403).send("Email is not registered")
  }
  if (!user) {
    return res.status(403).send("Email or password do not match");
  }
  
  req.session.user_id = user.id;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
  };
  res.render("urls_registration", templateVars);
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (!checkRegistration(email, password)) {
    return res.status(400).send("Email and/or password is missing");
  } else if (getUserByEmail(email, users)) {
    return res.status(400).send("This email has already been registered");
  }
  const userRandomID = generateRandomString();
  const hashedPassword = bcrypt.hashSync(req.body.password, 10)
  users[userRandomID] = {
    id: userRandomID,
    email: req.body.email,
    password: hashedPassword,
  };
  req.session.user_id = userRandomID;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
