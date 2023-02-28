import handlers from './handlers.js';
import { createTable, createHead, loadClientsAndRender } from './view.js';

export const clientsData = [];
const appWrapper = document.getElementById('app');
const { header } = createHead(handlers);
const table = createTable(handlers);

appWrapper.append(header, table);
loadClientsAndRender();
