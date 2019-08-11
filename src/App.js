import $ from 'jquery';
import { watch } from 'melanke-watchjs';
import { differenceBy } from 'lodash';
import { validateUrl, processData, fetchRSS } from './utils';
import { renderList, renderInput, renderModal } from './renderers';

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
};

export default (element) => {
  const container = element.querySelector('.container');
  const modal = $('#infoModal');
  const input = container.querySelector('#input');
  const submit = container.querySelector('#submit');
  const form = container.querySelector('#form');
  const exampleLinks = container.querySelectorAll('#example-links a');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const url = input.value;
    const fetchCb = (data) => {
      const feed = processData(data, url, fields);
      processFeed(feed, url);
      store.state = 'pending';
      store.state = 'renderList';
    };
    const errCb = (err) => {
      const { status, statusText } = err.response;
      store.modalTitle = `${status} ${statusText}`;
      store.modalDescription = `Couldn't get RSS feed: ${url}`;
      store.state = 'pending';
      store.state = 'renderErrorModal';
      throw err;
    };
    const isValid = validateUrl(store.links, url);
    if (isValid) {
      store.links.push(url);
      store.state = 'valid';
      fetchRSS(url, fetchCb, errCb);
    } else {
      store.state = 'invalid';
    }
  });
  exampleLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const { href } = link;
      store.currentUrl = href;
      store.state = 'pending';
      store.state = 'exampleLinksClick';
    });
  });
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      store.state = 'pending';
      store.state = 'enterPress';
    }
  });
  modal.on('show.bs.modal', (event) => {
    const button = $(event.relatedTarget);
    const title = button.data('title');
    const description = button.data('description');
    store.modalTitle = title;
    store.modalDescription = description;
    store.state = 'pending';
    store.state = 'renderInfoModal';
  });
  watch(store, 'state', () => {
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
      case 'enterPress': {
        submit.focus();
        submit.click();
        break;
      }
      default: break;
    }
  });
  store.state = 'loading';
};
