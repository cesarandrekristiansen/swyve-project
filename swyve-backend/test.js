const { addUser } = require('./userService');

addUser('testuser', 'testuser@example.com', 'password123')
  .then((message) => {
    console.log(message);
  })
  .catch((error) => {
    console.error('Error:', error);
  });
