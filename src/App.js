import WatchJS from 'melanke-watchjs';
import { isURL, isMimeType } from 'validator';
import axios from 'axios';
import { uniqueId, merge, pick, differenceBy, flatten } from 'lodash';

const { watch } = WatchJS;
const cors = 'https://cors-anywhere.herokuapp.com/';
const fields = ['title', 'link', 'description'];

export default class App {
  constructor(element, state) {
    this.element = element;
    this.state = state;
  }

  render() {
    this.element.innerHTML = `
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
      <div id="list">
        ${this.state.feeds.map(feed => `<div class="feed">
            <h5>${feed.headerTitle}</h5>
            <p>${feed.headerDescription}</p>
            <div class="content">
              ${feed.items.map(item => `<div class="item mb-1 mt-1">
              <!-- Modal -->
                <div class="modal fade" id="exampleModal${item.guid}" tabindex="-1" role="dialog" aria-labelledby="exampleModal${item.guid}Label" aria-hidden="true">
                  <div class="modal-dialog" role="document">
                    <div class="modal-content">
                      <div class="modal-header">
                        <h5 class="modal-title" id="exampleModal${item.guid}Label">${item.title}</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                          <span aria-hidden="true">&times;</span>
                        </button>
                      </div>
                      <div class="modal-body">
                        ${item.description}
                      </div>
                    </div>
                  </div>
                </div>
                <button type="button" class="btn-sm btn btn-info" data-toggle="modal" data-target="#exampleModal${item.guid}">
                <i class="fas fa-info"></i>
                </button>
                <a href="${item.link}">${item.title}</a>
                </div>`).join('')}
            </div>
            <hr>
          </div>`).join('')}
      </div>
    </div>`;
    this.bind();
    this.element.querySelector('#input').value = this.state.url;
  }

  bind() {
    this.element.querySelector('#submit').addEventListener('click', (e) => {
      console.log('click?');
      e.preventDefault();
      this.state.url = this.element.querySelector('#input').value;
      this.fetchStream('start', this.state.url);
    });
    this.element.querySelector('#input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.element.querySelector('#submit').focus();
        this.element.querySelector('#submit').click();
      }
    });
  }

  validateRSSUrl() {
    const isNew = !this.state.links.includes(this.state.url);
    const isValid = isURL(this.state.url) && isMimeType('text/xml');
    return isNew && isValid;
  }

  fetchStream(mode, url) {
    const parseData = (data) => {
      const parser = new DOMParser();
      const content = parser.parseFromString(data, 'text/xml');
      this.parseList(content, url, mode);
      setTimeout(() => {
        this.fetchStream('update', url);
      }, 1000);
    }
    switch (mode) {
      case 'start': {
        if (this.validateRSSUrl()) {
          axios.get(`${cors}${url}`, { headers: { 'Access-Control-Allow-Origin': '*' } })
            .then((response) => {
              console.log('++++valid');
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
              console.log('----errror');
              this.state.url = '';
              this.state.isUrlValid = false;
              throw new Error('Couldn\'t get RSS feed');
            });
        } else {
          console.log('----invalid');
          this.state.url = '';
          this.state.isUrlValid = false;
          console.log(this.state);
        }
        break;
      }
      case 'update': {
        axios.get(`${cors}${url}`, { headers: { 'Access-Control-Allow-Origin': '*' } })
          .then((response) => {
            console.log('++++update request');
            parseData(response.data)
          })
          .catch(() => {
            console.log('----update errror');
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
    const feed = { headerTitle, headerDescription, url, items };
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
        const currentFeedIndex = this.state.feeds.findIndex(item => item.url === url);
        const newItems = differenceBy(currentFeed.items, feed.items, 'link');
        console.log('new items', flatten(newItems))
        currentFeed.items.push(flatten(newItems))
        // const pureItemsData = currentFeed.items.map(item => pick(item, fields));
        // const updatedItems = merge(pureItemsData, feed.items);
        // const { length } = this.state.feeds[currentFeedIndex].items;
        // this.state.feeds[currentFeedIndex].items.splice(0, length, updatedItems);
        // this.state.feeds[currentFeedIndex].items.push(updatedItems);
        // console.log(this.state.feeds[currentFeedIndex].items);
        // console.log(updatedItems);
        break;
      }
      default: break;
    }
    // if (!this.state.feeds.includes(feed)) {
    //   console.log('new feed', feed);
    //   console.log('check this.state.feeds', this.state.feeds);
    //   this.state.feeds.push(feed);
    // } else {
    //   console.log('repeated feed', feed);
    //   console.log('check this.state.feeds', this.state.feeds);

    // }
  }

  init() {
    this.render();
    watch(this.state, () => {
      WatchJS.noMore = true;
      this.render();
    });
  }
}
