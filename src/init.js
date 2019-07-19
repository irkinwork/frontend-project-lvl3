import '@babel/polyfill';
import Container from './Container';
import 'bootstrap';
import './styles.scss';

export default () => {
  const element = document.getElementById('point');
  const obj = new Container(element);
  obj.init();
};
