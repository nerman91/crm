import {
  createClientForm,
  showLoader,
  toogleClassNameSort,
  renderListClients,
  loadClientsAndRender,
  setVisibleAddContactBtn,
  removeClientFromTable
} from './view.js';
import { sortById, sortByDate, sortByName, reverseSort } from './sorting.js';
import { getClient, changeClient, createClient, removeClient } from './api.js';
import { clientsData } from './index.js';
import { checkSorting } from './sorting.js';
import { updateDataArray } from './helpers.js';

const appWrapper = document.getElementById('app');
const handlers = {
  onSelectContact(btn, contacts, field, target, valuesContacts, data) {
    btn.children[0].textContent = valuesContacts[target.id].text; // меняем текст внутри кнопки
    data.type = valuesContacts[target.id].text;
    btn.dataset.type = target.dataset.type;
    field.dataset.type = target.dataset.type;
    field.type = valuesContacts[target.id].type;
    contacts.classList.toggle('contact__list-active');
    btn.classList.toggle('contact__selected-active');
  },
  onViewValuesContact(dropDown, btn) {
    dropDown.classList.toggle('contact__list-active');
    btn.classList.toggle('contact__selected-active');
  },
  onRemoveContact(contact, contactData, errorsBlock) {
    const errorMessage = errorsBlock.querySelector(`#${contactData.idContact}`);
    if (errorMessage) {
      errorMessage.remove();
    }
    [contactData.value, contactData.type] = '';
    contact.remove();
    setVisibleAddContactBtn();
  },
  onChangeContact(field, contactData, contacts) {
    contactData.value = field.value;
    contactData.type = contacts[field.dataset.type].text;
  },
  onCloseModal(modalElement) {
    modalElement.remove();
  },
  async onCreateClient({ name, surname, lastName = '', contacts = [] }, loader, errMessage, modal) {
    try {
      const response = await createClient(name, surname, lastName, contacts);
      if (!response.ok) {
        throw new Error();
      }
      modal.remove();
      loadClientsAndRender();
    } catch {
      errMessage.textContent = 'Не удалось создать клиента, попробуйте еще раз';
      loader.remove();
    }
  },
  async onEditClient({ name, surname, lastName, contacts }, id, loader, errMessage, modal) {
    errMessage.innerHTML = '';
    try {
      const response = await changeClient(name, surname, lastName, contacts, id);
      if (!response.ok) {
        throw new Error();
      }

      modal.remove();
      loadClientsAndRender();
    } catch {
      errMessage.textContent = 'Не удалось изменить данные клиента, попробуйте еще раз';
      loader.remove();
    }
  },
  async onDeleteClient(error, modal, overlay, id) {
    const disabledBlock = document.createElement('div');
    const loader = showLoader('delete-loader');
    const errorText = 'Что-то пошло не так. Попробуйте еще раз.';

    disabledBlock.classList.add('disabled-block');
    disabledBlock.append(loader);

    modal.append(disabledBlock);

    try {
      const resp = await removeClient(id);
      if (!resp.ok) throw new Error();
      error.innerHTML = '';
      overlay.remove();
      removeClientFromTable(id);
    } catch {
      error.textContent = errorText;
      loader.remove();
      disabledBlock.remove();
      error.classList.add('is-active');
    }
  },
  sendRequestWithDelay(time, input) {
    let timer;
    return function () {
      const searchParams = input.value;
      clearTimeout(timer);
      timer = setTimeout(async () => {
        const tableLoader = showLoader('table-info__loader');
        const tableBody = document.querySelector('.table__body');
        tableBody.innerHTML = '';
        tableBody.append(tableLoader);

        const res = await fetch(`http://localhost:3000/api/clients?search=${searchParams}`);
        const data = await res.json();
        updateDataArray(clientsData, data);
        checkSorting(clientsData);
        renderListClients(handlers, clientsData);
      }, time);
    };
  },
  async onOpenEditClientForm(id, openBtn) {
    const loader = showLoader('edit-loader');
    openBtn.append(loader);
    const { name, surname, lastName, contacts } = await getClient(id);
    loader.remove();
    const clientForm = createClientForm(handlers, true, { name, surname, lastName }, id, contacts);
    appWrapper.append(clientForm);
  },
  openClientCreationForm(handlers) {
    appWrapper.append(createClientForm(handlers));
  },
  sortId(arr, btn) {
    const classNameAsc = 'sortedASC';
    const classNameDesc = 'sortedDESC';

    if (!btn.classList.contains(classNameAsc)) {
      toogleClassNameSort();
      sortById(arr);
      btn.classList.add(classNameAsc);
      renderListClients(handlers, arr);
    } else {
      toogleClassNameSort();
      btn.classList.add(classNameDesc);
      reverseSort(arr, btn);
    }
  },
  sortName(arr, btn) {
    const classNameAsc = 'sortedASC';
    const classNameDesc = 'sortedDESC';

    if (!btn.classList.contains(classNameAsc)) {
      toogleClassNameSort();
      sortByName(arr);
      btn.classList.add(classNameAsc);
      renderListClients(handlers, arr);
    } else {
      toogleClassNameSort();
      btn.classList.add(classNameDesc);
      reverseSort(arr, btn);
    }
  },
  sortDate(arr, btn, dateType) {
    const classNameAsc = 'sortedASC';
    const classNameDesc = 'sortedDESC';

    if (!btn.classList.contains(classNameAsc)) {
      toogleClassNameSort();
      sortByDate(arr, dateType);
      btn.classList.add(classNameAsc);
      renderListClients(handlers, arr);
    } else {
      toogleClassNameSort();
      btn.classList.add(classNameDesc);
      reverseSort(arr, btn);
    }
  }
};

export default handlers;
