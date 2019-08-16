import $ from 'jquery';
import { watch } from 'melanke-watchjs';
import axios from 'axios';
import { differenceBy } from 'lodash';
import { validateUrl, parseData } from './utils';
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
  };

  const feedList = [];

  const modalStore = {
    title: '',
    description: '',
  };

  const alertStore = {
    title: '',
    url: '',
  };

  const fields = ['title', 'link', 'description'];

  const addFeed = (feed, url) => {
    const currentFeed = feedList.find(item => item.url === url);
    const newItems = differenceBy(feed.items, currentFeed.items, 'link');
    if (newItems.length > 0) {
      currentFeed.items.push(...newItems);
    }
  };

  const updateList = (feed, url) => {
    const isCurrentUrlProcessed = feedList
      .map(item => item.url)
      .includes(url);
    if (isCurrentUrlProcessed) {
      addFeed(feed, url);
    } else {
      feedList.push(feed);
    }
  };

  const fetchRSS = (url) => {
    axios.get(`${cors}${url}`)
      .then((response) => {
        const feed = parseData(response.data, url, fields);
        updateList(feed, url);
        setTimeout(() => {
          fetchRSS(url);
        }, 5000);
      })
      .catch((err) => {
        const { status, statusText } = err.response;
        alertStore.title = `${status} ${statusText}`;
        alertStore.url = url;
        throw err;
      });
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const url = e.srcElement[0].value;
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
    modalStore.title = title;
    modalStore.description = description;
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
        renderInput(false, '#input', container);
        break;
      }
      case 'valid': {
        renderInput(true, '#input', container);
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
  watch(feedList, () => {
    renderList(feedList, '#list', container);
  });

  watch(modalStore, () => {
    const { title, description } = modalStore;
    renderModal(modal, title, description);
  });

  watch(alertStore, 'url', () => {
    const { title, url } = alertStore;
    renderAlert(element, title, url);
  });
};
