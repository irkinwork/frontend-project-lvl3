import { isURL, isMimeType } from 'validator';

const parser = new DOMParser();

export const validateUrl = (links, url) => {
  const isNew = !links.includes(url);
  const isValid = isURL(url) && isMimeType('text/xml');
  return isNew && isValid;
};

export const parseData = data => parser.parseFromString(data, 'text/xml');

const getElement = (doc, tag) => doc.getElementsByTagName(tag);
const getElementValue = (doc, tag) => getElement(doc, tag)[0].innerHTML;
const removeCdata = (value) => {
  const regex = new RegExp(/<!\[CDATA.*]]>/g);
  return regex.test(value) ? value.replace(/<!\[CDATA\[/g, '').replace(/]]>/g, '') : value;
};

const buildFeedItems = (htmlColl, fields) => {
  const coll = Array.from(htmlColl);
  return coll.map(node => fields
    .reduce((acc, field) => {
      const value = getElementValue(node, field);
      return { ...acc, [field]: removeCdata(value) };
    }, {}));
};

export const buildFeed = (doc, url, fields) => {
  const headerTitle = getElementValue(doc, 'title');
  const headerDescription = getElementValue(doc, 'description');
  const htmlColl = getElement(doc, 'item');
  const items = buildFeedItems(htmlColl, fields);
  const feed = {
    headerTitle, headerDescription, url, items,
  };
  return feed;
};

export const processData = (data, url, fields) => {
  const parsedData = parseData(data);
  const feed = buildFeed(parsedData, url, fields);
  return feed;
};
