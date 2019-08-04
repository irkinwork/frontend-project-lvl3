import { watch } from 'melanke-watchjs';
import axios from 'axios';
import { differenceBy } from 'lodash';
import $ from 'jquery';
import Container from './Container';
import { validateUrl, parseData } from './utils';

const cors = 'https://cors-anywhere.herokuapp.com/';
const fields = ['title', 'link', 'description'];

export default class App {
  state = {
    links: [],
    feeds: [],
    mode: 'init',
  }

  constructor(element) {
    this.element = element;
    this.container = new Container();
  }

  addListenersToModal() {
    this.exampleModal = $('#exampleModal');
    this.exampleModal.on('show.bs.modal', (event) => {
      const button = $(event.relatedTarget);
      const title = button.data('title');
      const description = button.data('description');
      const modalTarget = $(event.target);
      modalTarget.find('.modal-title').text(title);
      modalTarget.find('.modal-body').text(description);
    });
  }

  addListeners() {
    const submit = this.container.element.querySelector('#submit');
    const input = this.container.element.querySelector('#input');
    submit.addEventListener('click', (e) => {
      e.preventDefault();
      const url = input.value;
      const isValid = validateUrl(this.state.links, url);
      if (isValid) {
        this.state.links.push(url);
        this.fetchRSS(url);
        this.state.mode = 'valid';
      } else {
        this.state.mode = 'invalid';
      }
    });
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        submit.focus();
        submit.click();
      }
    });
  }

  fetchRSS(url) {
    axios.get(`${cors}${url}`)
      .then((response) => {
        const feed = parseData(response.data, url, fields);
        this.processFeed(feed, url);
        setTimeout(() => {
          this.fetchRSS(url);
        }, 5000);
      })
      .catch(() => {
        throw new Error('Couldn\'t get RSS feed');
      });
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
          this.container.addListenersToExampleLinks();
          this.addListeners();
          this.addListenersToModal();
          $(document).ready(() => {
            this.spinner = $('.spinner');
            this.spinner.hide();
          });
          break;
        }
        case 'renderList': {
          this.container.renderList(this.state.feeds);
          break;
        }
        case 'invalid': {
          this.container.renderInput(false);
          break;
        }
        case 'valid': {
          this.container.renderInput(true);
          break;
        }
        default: break;
      }
    });
    this.state.mode = 'loading';
  }
}
