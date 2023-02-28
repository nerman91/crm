import { getClients } from './api.js';
import { clientsData } from './index.js';
import { removeInvalidClassName, validateForm } from './validation.js';
import { formatdDate, fixedString } from './helpers.js';
import { checkSorting } from './sorting.js';
import handlers from './handlers.js';

const appWrapper = document.getElementById('app');

function createInput(type, className) {
  const input = document.createElement('input');
  input.type = type;
  input.classList.add(className);
  return input;
}

function createForm(className) {
  const form = document.createElement('form');
  form.classList.add(className);
  return form;
}

async function loadClientsAndRender() {
  const loader = showLoader('table-info__loader');
  const tableBody = document.querySelector('.table__body');
  tableBody.innerHTML = '';
  tableBody.append(loader);
  await getClients();
  checkSorting(clientsData);
  renderListClients(handlers, clientsData);
}

function createHead({ sendRequestWithDelay }) {
  const headerContainer = document.createElement('div');
  const header = document.createElement('header');
  const logo = document.createElement('a');
  const headerSearchForm = createForm('header__form');
  const searchInput = createInput('text', 'header__input');

  searchInput.placeholder = 'Введите запрос';

  logo.innerHTML = `
  <svg>
    <use xlink:href="img/sprite.svg#logo"></use>
  </svg>`;

  logo.classList.add('header__logo', 'logo');
  headerContainer.classList.add('header__container', 'container');
  header.classList.add('header');

  headerSearchForm.append(searchInput);
  headerContainer.append(logo, headerSearchForm);
  header.append(headerContainer);

  searchInput.addEventListener('input', sendRequestWithDelay(300, searchInput));

  return {
    searchInput,
    header
  };
}

function createTable({ openClientCreationForm, sortName, sortId, sortDate }) {
  const svgArrow = `
  <svg>
    <use xlink:href="img/sprite.svg#arrow"></use>
  </svg>`;

  const tableHeadings = [
    {
      className: 'head__id',
      title: 'ID',
      btn: {
        btnClassNames: ['head__sort', 'head__sort-id', 'btn-reset', 'sortedASC'],
        btnContent: `${svgArrow}`
      }
    },
    {
      className: 'head__full-name',
      title: 'Фамилия Имя Отчество',
      btn: {
        btnClassNames: ['head__sort', 'head__sort-name', 'btn-reset'],
        btnContent: `${svgArrow}<span>А-Я</span>`
      }
    },
    {
      className: 'head__date-creation',
      title: 'Дата и время <br> создания',
      btn: {
        btnClassNames: ['head__sort', 'head__sort-date', 'btn-reset'],
        btnContent: `${svgArrow}`
      }
    },
    {
      className: 'head__last-changes',
      title: 'Последние <br> изменения',
      btn: {
        btnClassNames: ['head__sort', 'head__sort-changes', 'btn-reset'],
        btnContent: `${svgArrow}`
      }
    },
    {
      className: 'head__contacts',
      title: 'Контакты'
    },
    {
      className: 'head__actions',
      title: 'Действия'
    }
  ];

  const tableContainer = document.createElement('div');
  const tableWrapper = document.createElement('div');
  const table = document.createElement('table');
  const tableCaption = document.createElement('caption');
  const tableBody = document.createElement('tbody');
  const tableHead = document.createElement('thead');
  const tableRow = document.createElement('tr');
  const createClientBtn = document.createElement('button');
  createClientBtn.innerHTML = `
  <svg>
    <use xlink:href="img/sprite.svg#add-icon-btn"></use>
  </svg>
  <span>Добавить клиента</span>
  `;

  tableHeadings.forEach((head) => {
    const tableHeading = document.createElement('th');
    const tableHeadingInner = document.createElement('div');
    if (head.btn) {
      const btn = document.createElement('button');
      const { btnClassNames, btnContent } = head.btn;
      btn.classList.add(...btnClassNames);
      btn.innerHTML = `${head.title}${btnContent}`;
      tableHeadingInner.append(btn);
    } else {
      tableHeadingInner.textContent = head.title;
    }

    tableHeading.classList.add(head.className);
    tableHeadingInner.classList.add('head__inner');
    tableHeading.append(tableHeadingInner);
    tableRow.append(tableHeading);
  });

  tableHead.append(tableRow);

  tableBody.classList.add('table__body', 'table-info');
  tableCaption.classList.add('table__heading');
  tableHead.classList.add('table__header', 'head');
  tableContainer.classList.add('container', 'table-container');
  table.classList.add('table');
  createClientBtn.classList.add('clients__create', 'btn-reset');
  tableWrapper.classList.add('table-wrapper');
  tableCaption.textContent = 'Клиенты';

  createClientBtn.addEventListener('click', () => openClientCreationForm(handlers));

  table.append(tableCaption, tableHead, tableBody);
  tableWrapper.append(table);
  tableContainer.append(tableWrapper, createClientBtn);

  //HANDLERS
  tableHead.addEventListener('click', (event) => {
    const target = event.target;
    //Id
    if (target.classList.contains('head__sort-id')) sortId(clientsData, target);
    //Имя
    if (target.classList.contains('head__sort-name')) sortName(clientsData, target);
    //Дата создания
    if (target.classList.contains('head__sort-date')) sortDate(clientsData, target, 'createdAt');
    //Дата изменения
    if (target.classList.contains('head__sort-changes')) sortDate(clientsData, target, 'updatedAt');
  });

  return tableContainer;
}

function createClientForm(handlers, isEdit = false, client = {}, id = '', initialContacts = []) {
  const { onCreateClient, onCloseModal, onEditClient, onDeleteClient } = handlers;
  const form = createForm('client-form__inner');
  const inputSurname = createInput('text', 'client-form__surname');
  const inputName = createInput('text', 'client-form__name');
  const inputMiddleName = createInput('text', 'client-form__middlename');
  const title = document.createElement('h2');
  const titleWrapper = document.createElement('div');
  const idTitle = document.createElement('span');
  const formWrapper = document.createElement('div');
  const contactsBlock = document.createElement('div');
  const contactsList = document.createElement('div');
  const addContactBtn = document.createElement('button');
  const errorBlock = document.createElement('div');
  const modalOverlay = document.createElement('div');
  const closeButton = document.createElement('button');
  const saveButton = document.createElement('button');
  const cancelButton = document.createElement('button');

  // Поля инпутов
  const fieldsForm = [
    {
      label: 'Фамилия<span>*</span>',
      input: inputSurname
    },
    {
      label: 'Имя<span>*</span>',
      input: inputName
    },
    {
      label: 'Отчество',
      input: inputMiddleName
    }
  ];
  const contactsData = [];

  // Заполнение полей инпутов при редактировании клиента
  if (isEdit) {
    [inputName.value, inputSurname.value, inputMiddleName.value] = [
      client.name,
      client.surname,
      client.lastName
    ];
  }

  //Рендер инпутов
  fieldsForm.forEach((field) => {
    const { label, input } = field;
    const inputGroup = document.createElement('div');
    const formLabel = document.createElement('label');

    formLabel.innerHTML = label;
    formLabel.classList.add('client-form__label');
    inputGroup.classList.add('client-form__input-group');
    input.classList.add('client-form__input');
    input.placeholder = ' ';

    inputGroup.append(input, formLabel);
    form.append(inputGroup);
  });

  addContactBtn.innerHTML = `
    <svg>
      <use xlink:href="img/sprite.svg#add-icon-form"></use>
    </svg>
    <span>Добавить контакт</span>
  `;

  closeButton.innerHTML = `
  <svg>
    <use xlink:href="img/sprite.svg#close-form"></use>
  </svg>
  `;

  cancelButton.type = 'button';
  addContactBtn.type = 'button';

  idTitle.textContent = isEdit ? `ID:${id.slice(-7)}` : '';
  title.textContent = isEdit ? 'Изменить данные' : 'Новый клиент';
  saveButton.textContent = 'Сохранить';
  cancelButton.textContent = isEdit ? 'Удалить клиента' : 'Отмена';

  inputName.id = 'name';
  inputSurname.id = 'surname';
  inputMiddleName.id = 'middlename';

  modalOverlay.classList.add('overlay-modal');
  formWrapper.classList.add('client-form');
  idTitle.classList.add('client-form__id');
  titleWrapper.classList.add('client-form__head');
  title.classList.add('client-form__title');
  contactsBlock.classList.add('client-form__contacts');
  contactsList.classList.add('client-form__contacts-list');
  addContactBtn.classList.add('btn-reset', 'client-form__add-contact');
  errorBlock.classList.add('client-form__errors');
  closeButton.classList.add('btn-reset', 'client-form__close');
  saveButton.classList.add('btn-reset', 'client-form__save');
  cancelButton.classList.add('btn-reset', 'client-form__cancel');

  titleWrapper.append(title, idTitle);
  contactsBlock.append(contactsList, addContactBtn);
  form.append(contactsBlock, errorBlock, saveButton, cancelButton);
  formWrapper.append(closeButton, titleWrapper, form);
  modalOverlay.append(formWrapper);

  //Рендер списка контактов при редактировании данных клиента
  if (isEdit && !!initialContacts.length) {
    contactsList.append(
      ...initialContacts.map((elem) => {
        const contact = createContact(handlers, errorBlock, true, elem);
        contactsData.push(contact.data);
        return contact.contactWrapper;
      })
    );
  }

  //    *** HANDLERS ***
  //Добавить контакт
  addContactBtn.addEventListener('click', () => {
    const contact = createContact(handlers, errorBlock);
    contactsList.append(contact.contactWrapper);
    contactsData.push(contact.data);
    setVisibleAddContactBtn();
  });

  //   ***Закрытие модального окна ***
  // 1. Клик вне модального окна
  modalOverlay.addEventListener('click', (event) => {
    if (event.target === modalOverlay) {
      onCloseModal(modalOverlay);
    }
  });
  // 2. Клик по крестику
  closeButton.addEventListener('click', () => onCloseModal(modalOverlay));
  // 3. Клик по кнопке 'Отмена'
  if (!isEdit) {
    cancelButton.addEventListener('click', () => onCloseModal(modalOverlay));
  }
  // 4. Клик по кнопке 'Удалить клиента'
  if (isEdit) {
    cancelButton.addEventListener('click', () => {
      onDeleteClient(errorBlock, formWrapper, modalOverlay, id);
    });
  }

  // Submit формы
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    errorBlock.innerHTML = '';
    //Форматируем данные из инпутов
    const loader = showLoader('client-form__loader');
    const name = fixedString(inputName.value);
    const surname = fixedString(inputSurname.value);
    const lastName = fixedString(inputMiddleName.value);
    //Удалеям из массива объкты с пустыми значениями (контакты были удалены из формы)
    const arrayOfContacts = contactsData.filter((contact) => !!contact.type);
    const data = { name, surname, lastName, contacts: arrayOfContacts };

    formWrapper.append(loader);

    //Валидация
    try {
      validateForm(data, form);
    } catch (error) {
      errorBlock.append(
        ...error.errorMessages.map((message) => {
          const errorWrapper = document.createElement('div');
          errorWrapper.id = message.errorId;
          errorWrapper.textContent = message.text;
          return errorWrapper;
        })
      );
      loader.remove();

      form.querySelectorAll('input').forEach((input) => {
        input.addEventListener('input', () => {
          removeInvalidClassName(input, errorBlock);
        });
      });

      return;
    }

    //Удаляем у контактов поле 'idContact'
    arrayOfContacts.forEach((contact) => {
      delete contact.idContact;
    });

    if (isEdit) {
      onEditClient(data, id, loader, errorBlock, modalOverlay);
    } else {
      onCreateClient(data, loader, errorBlock, modalOverlay);
    }
  });

  return modalOverlay;
}

function createContact(
  { onSelectContact, onViewValuesContact, onRemoveContact, onChangeContact },
  errorsBlock,
  isEdit = false,
  contact = {}
) {
  const contacts = {
    tel: {
      type: 'tel',
      text: 'Телефон'
    },
    email: {
      type: 'email',
      text: 'Email'
    },
    vk: {
      type: 'url',
      text: 'Vk'
    },
    facebook: {
      type: 'url',
      text: 'Facebook'
    },
    another: {
      type: 'text',
      text: 'Другое'
    }
  };

  const dropdownWrapper = document.createElement('div');
  const contactWrapper = document.createElement('div');
  const btnDrop = document.createElement('button');
  const list = document.createElement('ul');
  const btnDelete = document.createElement('button');
  const label = document.createElement('label');
  const data = isEdit ? contact : { value: '', type: '' };
  const idContact = 'contact' + Math.floor(Math.random() * 1000000).toString();
  let input;

  data.idContact = idContact;

  if (isEdit) {
    const { value, type } = data;
    const [dataType, { type: inputType }] = Object.entries(contacts).find(
      (contactElem) => contactElem[1].text === type
    );
    input = createInput(inputType, 'contact__input');
    btnDelete.classList.add('contact__delete-btn_active');
    input.value = value;
    input.dataset.type = dataType;
  } else {
    const textPlaceholder = window.innerWidth <= 724 ? 'Введите данные' : 'Введите данные контакта';
    input = createInput('tel', 'contact__input');
    input.placeholder = textPlaceholder;
    input.dataset.type = 'tel';
    btnDrop.dataset.type = 'tel';
    data.type = 'Телефон';
  }

  btnDrop.innerHTML = `
    <span>${contacts[input.dataset.type].text}</span>
    <svg>
      <use xlink:href="img/sprite.svg#select-icon"></use>
    </svg>
  `;

  btnDelete.innerHTML = `
    <svg>
      <use xlink:href="img/sprite.svg#cancel-input"></use>
    </svg>
  `;

  btnDrop.type = 'button';
  btnDelete.type = 'button';

  //Рендер дропдауна
  Object.entries(contacts).forEach((contactItem) => {
    const [id, { text }] = contactItem;
    const listItem = document.createElement('li');
    listItem.classList.add('values__item');
    listItem.textContent = text;
    listItem.id = id;
    listItem.dataset.type = id;
    list.append(listItem);
  });

  dropdownWrapper.append(btnDrop, list);
  label.append(input, btnDelete);
  contactWrapper.append(dropdownWrapper, label);

  list.classList.add('list-reset', 'contact__list', 'values');
  contactWrapper.classList.add('client-form__contact', 'contact');
  contactWrapper.id = idContact;
  dropdownWrapper.classList.add('contact__dropdown');
  label.classList.add('contact__input-wrapper');
  btnDelete.classList.add('contact__delete-btn', 'btn-reset');
  btnDrop.classList.add('btn-reset', 'contact__selected');

  // **** HANDLERS ****

  // Открытие/закрытые дропдауна
  btnDrop.addEventListener('click', () => onViewValuesContact(list, btnDrop));
  // Удаление контакта
  btnDelete.addEventListener('click', () => {
    onRemoveContact(contactWrapper, data, errorsBlock);
  });
  // Выбор контакта из дропдауна
  contactWrapper.addEventListener('click', (event) => {
    const target = event.target;
    if (target.classList.contains('values__item')) {
      onSelectContact(btnDrop, list, input, target, contacts, data);
    }
  });
  // Инпут контакта
  input.addEventListener('input', () => {
    setIsVisibleDeleteBtn(input.value, btnDelete);
    onChangeContact(input, data, contacts);
  });

  return {
    contactWrapper,
    data
  };
}

function setVisibleAddContactBtn() {
  const nodeListContacts = document.querySelectorAll('.client-form__contact');
  const addContactBtn = document.querySelector('.client-form__add-contact');
  const hideClassName = 'client-form__add-contact_hide';

  if (nodeListContacts.length === 10) {
    addContactBtn.classList.add(hideClassName);
  } else if (nodeListContacts.length < 10 && addContactBtn.classList.contains(hideClassName)) {
    addContactBtn.classList.remove(hideClassName);
  }
}

function renderListClients(handlers, data) {
  const tableBody = document.querySelector('tbody');

  tableBody.innerHTML = '';

  const { onOpenEditClientForm } = handlers;
  data.forEach((client) => {
    const addedCells = [];
    const tableRow = document.createElement('tr');
    const { name, surname, lastName, id, updatedAt, createdAt, contacts } = client;
    tableRow.id = id;

    for (let cell = 0; cell < 6; cell++) {
      const tableCell = document.createElement('td');
      if (!addedCells.includes('id')) {
        tableCell.textContent = id.slice(-7);
        tableCell.classList.add('table-info__id');
        tableRow.append(tableCell);
        addedCells.push('id');
        continue;
      } else if (!addedCells.includes('fullName')) {
        tableCell.textContent = `${surname} ${name} ${lastName}`;
        tableRow.append(tableCell);
        addedCells.push('fullName');
        continue;
      } else if (!addedCells.includes('created')) {
        const { data, time } = formatdDate(createdAt);
        tableCell.innerHTML = `<span class="table-info__created-date">${data}</span>
        <span class="table-info__created-time">${time}</span>`;
        tableRow.append(tableCell);
        addedCells.push('created');
        continue;
      } else if (!addedCells.includes('changed')) {
        const { data, time } = formatdDate(updatedAt);
        tableCell.innerHTML = `<span class="table-info__changed-date">${data}</span>
        <span class="table-info__changed-time">${time}</span>`;
        tableRow.append(tableCell);
        addedCells.push('changed');
        continue;
      } else if (!addedCells.includes('contacts')) {
        const contactsWrapper = document.createElement('div');
        contacts.forEach((contact) => {
          const contactType = contact.type;
          const tooltipBtn = document.createElement('button');
          const tooltipContent = document.createElement('span');
          const tooltipContactValue = document.createElement('span');

          if (contactType === 'Телефон') {
            tooltipBtn.innerHTML = `<svg>
              <use xlink:href="img/sprite.svg#phone"></use>
            </svg>`;
          } else if (contactType === 'Email') {
            tooltipBtn.innerHTML = `<svg>
              <use xlink:href="img/sprite.svg#mail"></use>
            </svg>`;
          } else if (contactType === 'Vk') {
            tooltipBtn.innerHTML = `<svg>
              <use xlink:href="img/sprite.svg#vk"></use>
            </svg>`;
          } else if (contactType === 'Facebook') {
            tooltipBtn.innerHTML = `<svg>
              <use xlink:href="img/sprite.svg#fb"></use>
            </svg>`;
          } else if (contactType === 'Другое') {
            tooltipBtn.innerHTML = `<svg>
              <use xlink:href="img/sprite.svg#contact-other"></use>
            </svg>`;
          }

          tooltipContent.textContent =
            contactType === 'Другое' ? `${checkTypeContact(contact.value)}: ` : `${contactType}: `;
          tooltipContactValue.textContent = contact.value;

          tooltipContent.append(tooltipContactValue);

          const tooltip = createTolltip(tooltipBtn, tooltipContent);

          tooltipBtn.classList.add('tooltip__btn', 'btn-reset');
          tooltipContent.classList.add('tooltip__content');
          tooltipContactValue.classList.add('tooltip__contact-value');

          contactsWrapper.append(tooltip);
        });
        contactsWrapper.classList.add('table-info__contacts-wrapper');
        tableCell.append(contactsWrapper);
        tableRow.append(tableCell);
        addedCells.push('contacts');
        continue;
      } else if (!addedCells.includes('actions')) {
        const actionWrapper = document.createElement('div');
        const editBtn = document.createElement('button');
        const removeBtn = document.createElement('button');
        const changeIcon = `<svg>
          <use xlink:href="img/sprite.svg#edit"></use>
        </svg>`;
        const removeIcon = `<svg>
          <use xlink:href="img/sprite.svg#cancel"></use>
        </svg>`;

        editBtn.innerHTML = changeIcon + 'Изменить';
        removeBtn.innerHTML = removeIcon + 'Удалить';
        editBtn.classList.add('table-info__actions-change', 'btn-reset');
        removeBtn.classList.add('table-info__actions-remove', 'btn-reset');
        actionWrapper.classList.add('table-info__actions-wrapper');
        tableCell.classList.add('table-info__actions');

        editBtn.addEventListener('click', async () => {
          onOpenEditClientForm(id, editBtn);
        });

        removeBtn.addEventListener('click', () => {
          appWrapper.append(createClientDeleteConfirm(handlers, id));
        });

        actionWrapper.append(editBtn, removeBtn);
        tableCell.append(actionWrapper);
        addedCells.push('actions');
      }

      tableRow.append(tableCell);
    }
    tableBody.append(tableRow);
  });
}

function createTolltip(element, content) {
  const tooltip = document.createElement('div');
  const tooltipInfoWrapper = document.createElement('div');
  const tooltipInfoInner = document.createElement('div');
  const tooltipArrow = `<svg>
    <use xlink:href="img/sprite.svg#tooltip-arrow"></use>
  </svg>`;
  tooltipInfoWrapper.role = 'tooltip';
  tooltip.classList.add('table-info__tooltip', 'tooltip');
  tooltipInfoWrapper.classList.add('tooltip__info-wrapper');
  tooltipInfoInner.classList.add('tooltip__info-inner');
  tooltipInfoInner.innerHTML = tooltipArrow;
  tooltipInfoInner.append(content);
  tooltipInfoWrapper.append(tooltipInfoInner);
  tooltip.append(element, tooltipInfoWrapper);

  return tooltip;
}

function createClientDeleteConfirm({ onDeleteClient, onCloseModal }, id) {
  const modalOverlay = document.createElement('div');
  const modalWrapper = document.createElement('div');
  const deleteButton = document.createElement('button');
  const cancelButton = document.createElement('button');
  const closeButton = document.createElement('button');
  const title = document.createElement('h2');
  const modalInfo = document.createElement('p');
  const errorBlock = document.createElement('div');

  modalOverlay.classList.add('overlay-modal');
  modalWrapper.classList.add('confirm-delete');
  title.classList.add('confirm-delete__title');
  modalInfo.classList.add('confirm-delete__description');
  errorBlock.classList.add('confirm-delete__error-info');
  deleteButton.classList.add('btn-reset', 'confirm-delete__delete');
  closeButton.classList.add('btn-reset', 'confirm-delete__close');
  cancelButton.classList.add('btn-reset', 'confirm-delete__cancel');

  closeButton.innerHTML = `
  <svg>
    <use xlink:href="img/sprite.svg#close-form"></use>
  </svg>
  `;

  title.textContent = 'Удалить клиента';
  modalInfo.textContent = 'Вы действительно хотите удалить данного клиента?';
  deleteButton.textContent = 'Удалить';
  cancelButton.textContent = 'Отмена';

  modalWrapper.append(title, modalInfo, errorBlock, deleteButton, closeButton, cancelButton);
  modalOverlay.append(modalWrapper);

  /** HANDLERS **/
  modalOverlay.addEventListener('click', (event) => {
    if (event.target === modalOverlay) {
      onCloseModal(modalOverlay);
    }
  });
  closeButton.addEventListener('click', () => onCloseModal(modalOverlay));
  cancelButton.addEventListener('click', () => onCloseModal(modalOverlay));
  deleteButton.addEventListener('click', async () => {
    onDeleteClient(errorBlock, modalWrapper, modalOverlay, id);
  });

  return modalOverlay;
}

function removeClientFromTable(id) {
  const clientRow = document.getElementById(id);
  clientRow.remove();
}

function showLoader(className) {
  const loaderWrapper = document.createElement('div');
  const loader = document.createElement('div');
  loaderWrapper.classList.add(className);
  loader.classList.add('loader');
  loaderWrapper.classList.add('loader-wrapper');
  loaderWrapper.append(loader);
  return loaderWrapper;
}

function setIsVisibleDeleteBtn(inputValue, btn) {
  const activeClassName = 'contact__delete-btn_active';
  if (inputValue.trim() && !btn.classList.contains(activeClassName)) {
    btn.classList.add(activeClassName);
  } else if (!inputValue.trim() && btn.classList.contains(activeClassName)) {
    btn.classList.remove(activeClassName);
  }
}

function toogleClassNameSort() {
  const nodeListBnts = document.querySelectorAll('.head__sort');
  nodeListBnts.forEach((elem) => {
    const classSortByAsk = 'sortedASC';
    const classSortByDesc = 'sortedDESC';

    if (elem.classList.contains(classSortByAsk)) elem.classList.remove(classSortByAsk);
    if (elem.classList.contains(classSortByDesc)) elem.classList.remove(classSortByDesc);
  });
}

function checkTypeContact(value) {
  if (value.includes('instagram.com')) {
    return 'Instagram';
  }

  if (value.includes('twitter.com')) {
    return 'Twitter';
  }

  if (value.includes('ok.ru')) {
    return 'Одноклассники';
  }
}

export {
  createTable,
  createHead,
  loadClientsAndRender,
  createClientForm,
  showLoader,
  toogleClassNameSort,
  renderListClients,
  setIsVisibleDeleteBtn,
  setVisibleAddContactBtn,
  removeClientFromTable
};
