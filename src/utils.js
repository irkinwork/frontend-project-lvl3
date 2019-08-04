import { isURL, isMimeType } from 'validator';

const parser = new DOMParser();

export const validateUrl = (links, url) => {
  const isNew = !links.includes(url);
  const isValid = isURL(url) && isMimeType('text/xml');
  return isNew && isValid;
};

export const parseData = (data, url, fields) => {
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
        const regex = new RegExp(/<!\[CDATA.*]]>/g);
        const content = regex.test(innerHTML) ? innerHTML.replace(/<!\[CDATA\[/g, '').replace(/]]>/g, '') : innerHTML;
        return { ...acc, [nodeName]: content };
      }, {}));
  const feed = {
    headerTitle, headerDescription, url, items,
  };
  return feed;
};
