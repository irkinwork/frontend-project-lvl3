import { isURL, isMimeType } from 'validator';
import axios from 'axios';

const cors = 'https://cors-anywhere.herokuapp.com/';

const parser = new DOMParser();

export const validateUrl = (links, url) => {
  const isNew = !links.includes(url);
  const isValid = isURL(url) && isMimeType('text/xml');
  return isNew && isValid;
};

const parseData = data => parser.parseFromString(data, 'text/xml');
const getElement = (doc, tag) => doc.getElementsByTagName(tag);
const getElementValue = (doc, tag) => getElement(doc, tag)[0].innerHTML;

const cleanCdata = (value) => {
  const regex = new RegExp(/<!\[CDATA.*]]>/g);
  return regex.test(value) ? value.replace(/<!\[CDATA\[/g, '').replace(/]]>/g, '') : value;
};

const buildFeedItems = (htmlColl, fields) => {
  const coll = Array.from(htmlColl);
  return coll.map(node => fields
    .reduce((acc, field) => {
      const value = getElementValue(node, field);
      return { ...acc, [field]: cleanCdata(value) };
    }, {}));
};

const buildFeed = (doc, url, fields) => {
  const headerTitle = getElementValue(doc, 'title');
  const headerDescription = getElementValue(doc, 'description');
  const htmlColl = getElement(doc, 'item');
  const items = buildFeedItems(htmlColl, fields);
  return {
    headerTitle, headerDescription, url, items,
  };
};

export const processData = (data, url, fields) => {
  const parsedData = parseData(data);
  return buildFeed(parsedData, url, fields);
};

export const fetchRSS = (url, cb, errCb) => {
  axios.get(`${cors}${url}`)
    .then((response) => {
      cb(response.data);
      setTimeout(() => {
        fetchRSS(url, cb, errCb);
      }, 5000);
    })
    .catch((e) => {
      errCb(e);
    });
};
