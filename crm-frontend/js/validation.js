function validateForm(data, form) {
  const errors = [];
  const { name, surname, lastName, contacts } = data;
  const fieldName = form.querySelector('.client-form__name');
  const fieldSurname = form.querySelector('.client-form__surname');
  const fieldMiddlename = form.querySelector('.client-form__middlename');
  const invalidClassName = 'is-invalid';

  if (name.length < 2) {
    errors.push({
      invalidField: 'Имя',
      errorId: 'name',
      text: 'Заполните обязательное поле "Имя"'
    });
    fieldName.classList.add(invalidClassName);
  }
  if (surname.length < 2) {
    errors.push({
      invalidField: 'Фамилия',
      errorId: 'surname',
      text: 'Заполните обязательное поле "Фамилия"'
    });
    fieldSurname.classList.add(invalidClassName);
  }
  if (lastName && lastName.length < 5) {
    errors.push({
      invalidField: 'Отчество',
      errorId: 'middlename',
      text: 'Недостаточно символов в поле "Отчество"'
    });
    fieldMiddlename.classList.add(invalidClassName);
  }
  if (contacts.length) {
    contacts.forEach((contact) => {
      const fieldContact = document.getElementById(contact.idContact);
      if (
        contact.type === 'Email' &&
        !contact.value.includes('@') &&
        !contact.value.includes('.')
      ) {
        fieldContact.classList.add(invalidClassName);
        errors.push({
          invalidField: 'Email',
          errorId: contact.idContact,
          text: 'Поле "Email" заполнено неверно'
        });
      }
      if (contact.type === 'Телефон') {
        const phoneNumber = contact.value;

        const isCorrectPhoneNumber = phoneNumber
          .replace('+', '')
          .split('')
          .every((value) => !isNaN(parseInt(value)));

        if (!isCorrectPhoneNumber || !phoneNumber.length) {
          fieldContact.classList.add(invalidClassName);
          errors.push({
            invalidField: 'Телефон',
            errorId: contact.idContact,
            text: 'Поле "Телефон" заполнено неверно'
          });
        }
      }
      if (contact.type === 'Vk' && !contact.value.includes('vk.com')) {
        fieldContact.classList.add(invalidClassName);
        errors.push({
          invalidField: 'Vk',
          errorId: contact.idContact,
          text: 'Поле "Vk" заполнено неверно'
        });
      }
      if (contact.type === 'Facebook' && !contact.value.includes('facebook.com')) {
        fieldContact.classList.add(invalidClassName);
        errors.push({
          invalidField: 'Facebook',
          errorId: contact.idContact,
          text: 'Поле "Facebook" заполнено неверно'
        });
      }
      if (contact.type === 'Другое' && !contact.value.length) {
        fieldContact.classList.add(invalidClassName);
        errors.push({
          invalidField: 'Другое',
          errorId: contact.idContact,
          text: 'Поле дополнительного контакта заполнено неверно.'
        });
      }
    });
  }

  if (errors.length) {
    const error = new TypeError();
    error.errorMessages = errors;
    throw error;
  }
}

function removeInvalidClassName(input, errorBlock) {
  const name = 'client-form__name';
  const surname = 'client-form__surname';
  const middlename = 'client-form__middlename';
  const invalidClassName = 'is-invalid';
  const contact = 'contact__input';

  const isFullname =
    input.classList.contains(name) ||
    input.classList.contains(surname) ||
    input.classList.contains(middlename);

  if (isFullname && input.classList.contains(invalidClassName)) {
    const errorMessage = errorBlock.querySelector(`#${input.id}`);
    input.classList.remove(invalidClassName);
    errorMessage.remove();
  }

  if (input.classList.contains(contact)) {
    const contactWrapper = input.parentElement.parentElement;
    if (contactWrapper.classList.contains(invalidClassName)) {
      const errorMessage = errorBlock.querySelector(`#${contactWrapper.id}`);
      contactWrapper.classList.remove(invalidClassName);
      errorMessage.remove();
    }
  }
}

export { validateForm, removeInvalidClassName };
