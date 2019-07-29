import WatchJS from 'melanke-watchjs';
import { isURL, isMimeType } from 'validator';
import axios from 'axios';
import { uniqueId, differenceBy } from 'lodash';
import $ from 'jquery';

const { watch } = WatchJS;
const cors = 'https://cors-anywhere.herokuapp.com/';
const fields = ['title', 'link', 'description'];
const parser = new DOMParser();

export default class App {
  constructor(element, state) {
    this.element = element;
    this.state = state;
  }

  renderSpinner() {
    const spinner = document.createElement('div');
    spinner.classList.add('spinner');
    spinner.innerHTML = `<div class="bg-white fixed-top h-100 w-100 d-flex align-items-center justify-content-center"><div class="spinner-border text-info p-4" role="status">
    <span class="sr-only">Loading...</span>
  </div></div>`;
    this.element.append(spinner);
  }

  renderModal() {
    const modal = document.createElement('div');
    modal.classList.add('modal-wrapper');
    this.element.prepend(modal);
    modal.outerHTML = `<div class="modal fade" id="exampleModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel"></h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
          <div class="modal-body"></div>
        </div>
      </div>
    </div>`;
    const exampleModal = $('#exampleModal');
    exampleModal.on('show.bs.modal', (event) => {
      const button = $(event.relatedTarget);
      const title = button.data('title');
      const description = button.data('description');
      const modalTarget = $(event.target);
      modalTarget.find('.modal-title').text(title);
      modalTarget.find('.modal-body').text(description);
    });
  }

  renderContainer() {
    const container = document.createElement('div');
    container.classList.add('container');
    this.element.append(container);
    container.outerHTML = `
    <div class="container">
      <div class="jumbotron pb-4 pt-4">
        <div class="input-group"></div>
      </div>
      <div id="list"></div>`;
  }

  renderInputGroup(valid) {
    const input = this.element.querySelector('.input-group');
    input.outerHTML = `<div class="input-group">
    <div class="input-group-prepend">
      <span class="input-group-text" id="basic-addon1">Insert your RSS link</span>
    </div>
    <input type="text" id="input" class="form-control alert-${ valid ? 'dark' : 'danger'}" placeholder="RSS Link" aria-label="RSS Link" aria-describedby="basic-addon1">
    <div class="input-group-append">
      <button class="btn btn-outline-secondary" id="submit" role="button">Get RSS</button>
    </div>
  </div>
</div>`;
  }

  renderList(feeds) {
    this.element.querySelector('#list').innerHTML = `
      ${feeds.map(feed => `<div class="feed">
          <h5>${feed.headerTitle}</h5>
          <p>${feed.headerDescription}</p>
          <div class="content">
            ${feed.items.map(item => `<div class="item mb-1 mt-1">
              <button tabindex="0"  type="button" class="btnModal btn-sm btn btn-info" data-toggle="modal" data-target="#exampleModal" data-description="${item.description}" data-title="${item.title}">
              <i class="fas fa-info"></i>
              </button>
              <a href="${item.link}">${item.title}</a>
              </div>`).join('')}
          </div>
        <hr>
        </div>`).join('')}
      </div>
    </div>`;
  }

  bind() {
    const submit = this.element.querySelector('#submit');
    const input = this.element.querySelector('#input');
    submit.addEventListener('click', (e) => {
      e.preventDefault();
      this.state.url = input.value;
      this.validateUrl(this.state.url);
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
      this.state.mode = 'valid';
      this.state.links.push(url);
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
        }, 1000);
      })
      .catch(() => {
        throw new Error('Couldn\'t get RSS feed');
      });
    this.state.url = '';
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
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
          const guid = uniqueId();
          const regex = new RegExp(/<!\[CDATA.*]]>/g);
          const content = regex.test(innerHTML) ? innerHTML.replace(/<!\[CDATA\[/g, '').replace(/]]>/g, '') : innerHTML;
          return { ...acc, [nodeName]: content, guid };
        }, {}));
    const feed = {
      headerTitle, headerDescription, url, items,
    };
    this.processFeed(feed, url);
  }

  processFeed(feed, url) {
    const isCurrentUrlProcessed = this.state.feeds.map(item => item.url)
      .includes(url);
    if (isCurrentUrlProcessed) {
      this.updateList(feed, url);
    } else {
      this.state.feeds.push(feed);
    }
  }

  updateList(feed, url) {
    const currentFeed = this.state.feeds.find(item => item.url === url);
    const newItems = differenceBy(feed.items, currentFeed.items, 'link');
    if (newItems.length > 0) {
      currentFeed.items.push(...newItems);
    }
  }

  init() {
    watch(this.state, () => {
      switch (this.state.mode) {
        case 'loading': {
          this.renderSpinner();
          this.renderContainer();
          this.renderInputGroup(true);
          this.renderModal();
          this.bind();
          this.state.mode = 'loaded';
          break;
        }
        case 'loaded': {
          $(document).ready(() => {
            const spinner = $('.spinner');
            spinner.hide();
          });
          this.state.mode = 'renderList';
          break;
        }
        case 'renderList': {
          this.state.links.forEach((url) => {
            this.fetchRSS(url);
          });
          this.renderList(this.state.feeds);
          break;
        }
        case 'invalid': {
          this.state.url = '';
          this.renderInputGroup(false);
          this.bind();
          this.state.mode = 'renderList';
          break;
        }
        case 'valid': {
          this.state.url = '';
          this.renderInputGroup(true);
          this.bind();
          this.state.mode = 'renderList';
          break;
        }
        default: break;
      }
    });
    this.state.mode = 'loading';
  }
}
