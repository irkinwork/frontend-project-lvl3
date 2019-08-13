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

export const processData = (data, url, fields) => {
  const doc = parser.parseFromString(data, 'text/xml');
  const headerTitle = doc.getElementsByTagName('title')[0].innerHTML;
  const headerDescription = doc.getElementsByTagName('description')[0].innerHTML;
  const htmlColl = doc.getElementsByTagName('item');
  const items = Array.from(htmlColl).map(node => fields
    .reduce((acc, field) => {
      const value = node.getElementsByTagName(field)[0].innerHTML;
      return { ...acc, [field]: cleanCdata(value) };
    }, {}));
  return {
    headerTitle, headerDescription, url, items,
  };
};
