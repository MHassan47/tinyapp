const bcrypt = require('bcryptjs');

// Generate a random alphanumerical string of 6 values
function generateRandomString() {
    let randomString = "";
    let possible =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 6; i++) {
      randomString += possible.charAt(
        Math.floor(Math.random() * possible.length)
      );
    }
    return randomString;
  }

//   Checks if email and password are entered 
  const checkRegistration = function (email, password) {
    if (email && password) {
      return true;
    } else {
      return false;
    }
  };

// Checks if email is in the user database
  const getUserByEmail = function (email, database) {
    return Object.values(database).find((user) => user.email === email);
  };

// Checks if the email and password match with account credentials
  const verifyUser = function (email, password, database) {
    const user = getUserByEmail(email, database);
    if (user){
    if (bcrypt.compareSync(password, user.password)) {
      return user;
    }
  }
    return false;
  };

//   Generates a filtered url database for logged in user
  const urlsForUser = function (userID, database) {
    let filtered = {}
    for (let urlID of Object.keys(database)) {
      if (database[urlID].userID === userID) {
        filtered[urlID] = database[urlID];
      }
    }
    return filtered;
  };

module.exports = { 
    generateRandomString,
    checkRegistration,
    getUserByEmail,
    verifyUser,
    urlsForUser,
}