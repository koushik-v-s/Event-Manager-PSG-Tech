const exphbs = require('express-handlebars');
const Handlebars = require('handlebars'); // Import core Handlebars for direct helper use
const path = require('path');

const configureHandlebars = (app) => {
  app.engine('hbs', exphbs.engine({
    extname: '.hbs',
    defaultLayout: false,
    handlebars: Handlebars, // Use this instance with registered helpers
  }));
  app.set('view engine', 'hbs');
  app.set('views', path.join(__dirname, '../templates'));
};


module.exports = configureHandlebars;
