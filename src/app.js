import $ from 'jquery';
import { watch } from 'melanke-watchjs';
import axios from 'axios';
import { differenceBy } from 'lodash';
import {
  validateUrl, parseData, getRssTag, getRssItems,
} from './utils';
import {
  renderList, renderInput, renderModal, renderAlert,
} from './renderers';

const cors = 'https://cors-anywhere.herokuapp.com/';

export default (element) => {
  const container = element.querySelector('.container');
  const modal = $('#infoModal');
  const input = container.querySelector('#input');
  const submit = container.querySelector('#submit');
  const form = container.querySelector('#form');
  const exampleLinks = container.querySelectorAll('#example-links a');

  const store = {
    state: '',
    currentUrl: '',
    links: [],
    feeds: [],
    newsList: [],
    modal: {},
    alert: {},
  };

  const fields = ['title', 'link', 'description'];

  const addNews = (news, url) => {
    const currentNewsBlock = store.newsList.find(item => item.url === url);
    const newItems = differenceBy(news.items, currentNewsBlock.items, 'link');
    if (newItems.length > 0) {
      currentNewsBlock.items.push(...newItems);
    }
  };

  const addFeed = (doc, url) => {
    const items = getRssItems(doc, fields);
    const news = { items, url };
    const isCurrentFeedAdded = store.feeds
      .map(item => item.url)
      .includes(url);
    if (isCurrentFeedAdded) {
      addNews(news, url);
    } else {
      const title = getRssTag(doc, 'title');
      const description = getRssTag(doc, 'description');
      const feed = { title, description, url };
      store.feeds.push(feed);
      store.newsList.push(news);
    }
  };

  const fetchRSS = (url) => {
    axios.get(`${cors}${url}`)
      .then((response) => {
        const doc = parseData(response.data);
        addFeed(doc, url);
        setTimeout(() => {
          fetchRSS(url);
        }, 5000);
      })
      .catch((err) => {
        const { status, statusText } = err.response;
        const title = `${status} ${statusText}`;
        store.alert = { title, url };
        throw err;
      });
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formdata = new FormData(e.target);
    const url = formdata.get('url');
    store.currentUrl = url;
    const isValid = validateUrl(store.links, url);
    if (isValid) {
      store.links.push(url);
      store.state = 'valid';
      fetchRSS(url);
    } else {
      store.state = 'invalid';
    }
  });
  exampleLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const { href } = link;
      store.currentUrl = href;
      store.state = 'exampleLinksClick';
    });
  });
  modal.on('show.bs.modal', (event) => {
    const button = $(event.relatedTarget);
    const title = button.data('title');
    const description = button.data('description');
    store.modal = { title, description };
  });
  $(document).ready(() => {
    store.state = 'loading';
  });
  watch(store, () => {
    switch (store.state) {
      case 'loading': {
        const spinner = $('.spinner');
        spinner.hide();
        break;
      }
      case 'invalid': {
        renderInput('invalid', '#input', container);
        break;
      }
      case 'valid': {
        renderInput('valid', '#input', container);
        break;
      }
      case 'exampleLinksClick': {
        input.value = store.currentUrl;
        submit.click();
        break;
      }
      default: break;
    }
  });
  watch(store, 'newsList', () => {
    const { feeds, newsList } = store;
    renderList(feeds, newsList, '#list', container);
  });

  watch(store, 'modal', () => {
    const { title, description } = store.modal;
    renderModal(modal, title, description);
  });

  watch(store, 'alert', () => {
    const { title, url } = store.alert;
    renderAlert(element, title, url);
  });
};
