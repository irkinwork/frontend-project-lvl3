import { watch } from 'melanke-watchjs';
import { isURL, isMimeType } from 'validator';
import axios from 'axios';
import { differenceBy } from 'lodash';
import $ from 'jquery/dist/jquery.slim.min';
import Modal from './Modal';
import Spinner from './Spinner';
import Container from './Container';

const cors = 'https://cors-anywhere.herokuapp.com/';
const fields = ['title', 'link', 'description'];
const parser = new DOMParser();

export default class App {
  state = {
    links: [],
    feeds: [],
    mode: 'init',
  }

  constructor(element) {
    this.element = element;
    this.modal = new Modal();
    this.spinner = new Spinner();
    this.container = new Container();
    this.element.prepend(this.modal.template);
    this.element.append(this.spinner.template);
    this.element.append(this.container.template);
  }

  addListeners() {
    const submit = this.container.element.querySelector('#submit');
    const input = this.container.element.querySelector('#input');
    submit.addEventListener('click', (e) => {
      e.preventDefault();
      this.validateUrl(input.value);
    });
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        submit.focus();
        submit.click();
      }
    });
  }

  validateUrl(url) {
    const isNew = !this.state.links.includes(url);
    const isValid = isURL(url) && isMimeType('text/xml');
    if (isNew && isValid) {
      this.state.links.push(url);
      this.fetchRSS(url);
      this.state.mode = 'valid';
    } else {
      this.state.mode = 'invalid';
    }
  }

  fetchRSS(url) {
    axios.get(`${cors}${url}`)
      .then((response) => {
        this.parseData(response.data, url);
        setTimeout(() => {
          this.fetchRSS(url);
        }, 5000);
      })
      .catch(() => {
        throw new Error('Couldn\'t get RSS feed');
      });
  }

  parseData(data, url) {
    const doc = parser.parseFromString(data, 'text/xml');
    const headerTitleNodes = doc.getElementsByTagName('title');
    const headerTitle = headerTitleNodes[0].childNodes[0].nodeValue;
    const headerDescriptionNodes = doc.getElementsByTagName('description');
    const headerDescription = headerDescriptionNodes[0].childNodes[0].nodeValue;
    const nodes = doc.getElementsByTagName('item');
    const items = Array.from(nodes)
      .map(node => Array.from(node.childNodes)
        .filter(field => fields.includes(field.nodeName)))
      .map(item => item
        .reduce((acc, field) => {
          const { nodeName, innerHTML } = field;
          const regex = new RegExp(/<!\[CDATA.*]]>/g);
          const content = regex.test(innerHTML) ? innerHTML.replace(/<!\[CDATA\[/g, '').replace(/]]>/g, '') : innerHTML;
          return { ...acc, [nodeName]: content };
        }, {}));
    const feed = {
      headerTitle, headerDescription, url, items,
    };
    this.processFeed(feed, url);
  }

  processFeed(feed, url) {
    const isCurrentUrlProcessed = this.state.feeds
      .map(item => item.url)
      .includes(url);
    if (isCurrentUrlProcessed) {
      this.updateList(feed, url);
    } else {
      this.state.feeds.push(feed);
    }
    this.state.mode = 'pending';
    this.state.mode = 'renderList';
  }

  updateList(feed, url) {
    const currentFeed = this.state.feeds.find(item => item.url === url);
    const newItems = differenceBy(feed.items, currentFeed.items, 'link');
    if (newItems.length > 0) {
      currentFeed.items.push(...newItems);
    }
  }

  init() {
    watch(this.state, 'mode', () => {
      switch (this.state.mode) {
        case 'loading': {
          this.container.renderInputGroup(true);
          this.addListeners();
          this.modal.init();
          this.state.mode = 'loaded';
          break;
        }
        case 'loaded': {
          $(document).ready(() => {
            this.spinner.hide();
          });
          break;
        }
        case 'renderList': {
          this.container.renderList(this.state.feeds);
          break;
        }
        case 'invalid': {
          this.container.renderInputGroup(false);
          this.addListeners();
          break;
        }
        case 'valid': {
          this.container.renderInputGroup(true);
          this.addListeners();
          break;
        }
        default: break;
      }
    });
    this.state.mode = 'loading';
  }
}
