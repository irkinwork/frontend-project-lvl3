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

  render() {
    this.element.innerHTML = `
    <div class="modal fade" id="exampleModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel"></h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body"></div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
          <button type="button" class="btn btn-primary">Send message</button>
        </div>
      </div>
    </div>
  </div>
    <div class="container">
      <div class="jumbotron pb-4 pt-4">
        <div class="input-group">
          <div class="input-group-prepend">
            <span class="input-group-text" id="basic-addon1">Insert your RSS link</span>
          </div>
          <input type="text" id="input" class="form-control alert ${this.state.isUrlValid ? 'alert-dark' : 'alert-danger'}" placeholder="RSS Link" aria-label="RSS Link" aria-describedby="basic-addon1">
          <div class="input-group-append">
            <button class="btn btn-outline-secondary" id="submit" role="button">Get RSS</button>
          </div>
        </div>
      </div>
      <div id="list"></div>`;
    this.renderList(this.state.feeds);
    this.bind();
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
    const exampleModal = $('#exampleModal');
    const submit = this.element.querySelector('#submit');
    const input = this.element.querySelector('#input');
    exampleModal.on('show.bs.modal', (event) => {
      const button = $(event.relatedTarget);
      const title = button.data('title');
      const description = button.data('description');
      const modal = $(event.target);
      modal.find('.modal-title').text(title);
      modal.find('.modal-body').text(description);
    });
    submit.addEventListener('click', (e) => {
      e.preventDefault();
      this.state.url = input.value;
      this.fetchStream('start', this.state.url);
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
    return isNew && isValid;
  }

  fetchStream(mode, url) {
    const parseData = (data) => {
      const content = parser.parseFromString(data, 'text/xml');
      this.parseList(content, url, mode);
      setTimeout(() => {
        this.fetchStream('update', url);
      }, 5000);
    };
    switch (mode) {
      case 'start': {
        if (this.validateUrl(url)) {
          axios.get(`${cors}${url}`, { headers: { 'Access-Control-Allow-Origin': '*' } })
            .then((response) => {
              // console.log('++++valid');
              if (!this.state.links.includes(url)) {
                this.state.links.push(url);
                parseData(response.data);
                this.state.url = '';
                this.state.isUrlValid = true;
              }
              setTimeout(() => {
                this.fetchStream('update', url);
              }, 1000);
            })
            .catch(() => {
              // console.log('----errror');
              this.state.url = '';
              this.state.isUrlValid = false;
              throw new Error('Couldn\'t get RSS feed');
            });
        } else {
          // console.log('----invalid');
          this.state.url = '';
          this.state.isUrlValid = false;
          console.log(this.state);
        }
        break;
      }
      case 'update': {
        axios.get(`${cors}${url}`, { headers: { 'Access-Control-Allow-Origin': '*' } })
          .then((response) => {
            // console.log('++++update request');
            parseData(response.data);
          })
          .catch(() => {
            // console.log('----update errror');
            throw new Error('Couldn\'t update RSS feed');
          });
        break;
      }
      default: break;
    }
  }

  parseList(doc, url, mode) {
    const headerTitle = doc.getElementsByTagName('title')[0].childNodes[0].nodeValue;
    const headerDescription = doc.getElementsByTagName('description')[0].childNodes[0].nodeValue;
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
    this.updateList(feed, url, mode);
  }

  updateList(feed, url, mode) {
    switch (mode) {
      case 'start': {
        this.state.feeds.push(feed);
        break;
      }
      case 'update': {
        const currentFeed = this.state.feeds.find(item => item.url === url);
        const newItems = differenceBy(feed.items, currentFeed.items, 'link');
        // console.log('feed.items', feed.items);
        // console.log('currentFeed.items', currentFeed.items);
        // console.log('...newItems', ...newItems);
        if (newItems.length > 0) {
          currentFeed.items.push(...newItems);
        }
        break;
      }
      default: break;
    }
  }

  init() {
    this.render();
    watch(this.state, () => {
      WatchJS.noMore = true;
      this.render();
    });
  }
}
