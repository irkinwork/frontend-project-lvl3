import 'jquery';
import 'popper.js';
import '@babel/polyfill';
import 'bootstrap';
import './styles.scss';
import '@fortawesome/fontawesome-free/js/fontawesome';
import '@fortawesome/fontawesome-free/js/solid';
import App from './App';

const state = {
  url: '',
  links: [],
  feeds: [],
  mode: 'init',
};

export default () => {
  const element = document.getElementById('point');
  const app = new App(element, state);
  app.init();
};
