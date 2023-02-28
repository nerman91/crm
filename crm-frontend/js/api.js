import { updateDataArray } from './helpers.js';
import { clientsData } from './index.js';

async function getClient(id) {
  const res = await fetch(`http://localhost:3000/api/clients/${id}`);
  return await res.json();
}

async function getClients() {
  const res = await fetch('http://localhost:3000/api/clients');
  const data = await res.json();
  updateDataArray(clientsData, data);
}

async function changeClient(name, surname, lastName, contacts, id) {
  return await fetch(`http://localhost:3000/api/clients/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      name,
      surname,
      lastName,
      contacts
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

async function createClient(name, surname, lastName, contacts) {
  return await fetch('http://localhost:3000/api/clients', {
    method: 'POST',
    body: JSON.stringify({
      name,
      surname,
      lastName,
      contacts
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

async function removeClient(id) {
  return await fetch(`http://localhost:3000/api/clients/${id}`, {
    method: 'DELETE'
  });
}

export { getClient, getClients, changeClient, createClient, removeClient };
