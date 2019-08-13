import $ from 'jquery';
import { watch } from 'melanke-watchjs';
import axios from 'axios';
import { differenceBy } from 'lodash';
import { validateUrl, processData } from './utils';
import { renderList, renderInput, renderModal } from './renderers';

const cors = 'https://cors-anywhere.herokuapp.com/';

export default (element) => {
  const container = element.querySelector('.container');
  const modal = $('#infoModal');
  const input = container.querySelector('#input');
  const submit = container.querySelector('#submit');
  const form = container.querySelector('#form');
  const exampleLinks = container.querySelectorAll('#example-links a');

  const store = {
    state: 'init',
    links: [],
    feeds: [],
    modalTitle: '',
    modalDescription: '',
    currentUrl: '',
  };
  const fields = ['title', 'link', 'description'];

  const updateList = (feed, url) => {
    const currentFeed = store.feeds.find(item => item.url === url);
    const newItems = differenceBy(feed.items, currentFeed.items, 'link');
    if (newItems.length > 0) {
      currentFeed.items.push(...newItems);
    }
  };

  const processFeed = (feed, url) => {
    const isCurrentUrlProcessed = store.feeds
      .map(item => item.url)
      .includes(url);
    if (isCurrentUrlProcessed) {
      updateList(feed, url);
    } else {
      store.feeds.push(feed);
    }
    store.state = 'renderList';
  };

  const fetchRSS = (url) => {
    axios.get(`${cors}${url}`)
      .then((response) => {
        const feed = processData(response.data, url, fields);
        processFeed(feed, url);
        setTimeout(() => {
          fetchRSS(url);
        }, 5000);
      })
      .catch((err) => {
        const { status, statusText } = err.response;
        store.modalTitle = `${status} ${statusText}`;
        store.modalDescription = `Couldn't get RSS feed: ${url}`;
        store.state = 'renderErrorModal';
        throw err;
      });
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const url = input.value;
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
    store.modalTitle = title;
    store.modalDescription = description;
    store.state = 'renderInfoModal';
  });
  watch(store, () => {
    const { modalTitle, modalDescription, feeds } = store;
    switch (store.state) {
      case 'loading': {
        $(document).ready(() => {
          const spinner = $('.spinner');
          spinner.hide();
        });
        break;
      }
      case 'renderInfoModal': {
        renderModal(modal, modalTitle, modalDescription);
        break;
      }
      case 'renderErrorModal': {
        modal.trigger('error');
        modal.modal('show');
        renderModal(modal, modalTitle, modalDescription);
        break;
      }
      case 'renderList': {
        renderList(feeds, '#list', container);
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
  store.state = 'loading';
};
