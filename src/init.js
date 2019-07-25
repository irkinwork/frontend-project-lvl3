import 'jquery';
import 'popper.js';
import '@babel/polyfill';
import 'bootstrap';
import './styles.scss';
import '@fortawesome/fontawesome-free/js/fontawesome';
import '@fortawesome/fontawesome-free/js/solid';
import '@fortawesome/fontawesome-free/js/regular';
import '@fortawesome/fontawesome-free/js/brands';
import App from './App';

const state = {
  url: '',
  links: [],
  feeds: [],
  isUrlValid: true,
};

export default () => {
  const element = document.getElementById('point');
  const app = new App(element, state);
  app.init();
};
