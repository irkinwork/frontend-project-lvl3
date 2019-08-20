import { isURL, isMimeType } from 'validator';

const parser = new DOMParser();

export const validateUrl = (links, url) => {
  const isNew = !links.includes(url);
  const isValid = isURL(url) && isMimeType('text/xml');
  return isNew && isValid;
};

const cleanCdata = (value) => {
  const regex = new RegExp(/<!\[CDATA.*]]>/g);
  return regex.test(value) ? value.replace(/<!\[CDATA\[/g, '').replace(/]]>/g, '') : value;
};

export const parseData = data => parser.parseFromString(data, 'text/xml');
export const getRssTag = (data, tag) => data.querySelector(tag).innerHTML;

export const getRssItems = (data, fields) => {
  const htmlColl = data.querySelectorAll('item');
  return Array.from(htmlColl).map(node => fields
    .reduce((acc, field) => {
      const value = node.querySelector(field).innerHTML;
      return { ...acc, [field]: cleanCdata(value) };
    }, {}));
};
