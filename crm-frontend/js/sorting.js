import { renderListClients } from './view.js';
import handlers from './handlers.js';

function sortById(array) {
  array.sort((current, next) => {
    const currentValue = parseInt(current.id);
    const nextValue = parseInt(next.id);
    return currentValue - nextValue;
  });
}

function sortByName(array) {
  array.sort((current, next) => {
    const currentValue = current.surname[0].toLowerCase();
    const nextValue = next.surname[0].toLowerCase();
    if (currentValue > nextValue) return 1;
    if (currentValue < nextValue) return -1;
    return 0;
  });
}

function reverseSort(arr, btnSort) {
  arr.reverse();
  renderListClients(handlers, arr);
  btnSort.classList.remove('sortedASK');
}

function sortByDate(array, dateType) {
  array.sort((current, next) => {
    const firstValue = parseInt(new Date(current[dateType]).getTime());
    const secondValue = parseInt(new Date(next[dateType]).getTime());
    return firstValue - secondValue;
  });
}

function checkSorting(arr) {
  const sortingBtns = document.querySelectorAll('.head__sort');
  sortingBtns.forEach((btn) => {
    const sortBtnById = btn.classList.contains('head__sort-id');
    const sortBtnByName = btn.classList.contains('head__sort-name');
    const sortBtnByDateCreated = btn.classList.contains('head__sort-date');
    const sortBtnByDateChanged = btn.classList.contains('head__sort-changes');

    const sortedByDESC = btn.classList.contains('sortedDESC');
    const sortedByASC = btn.classList.contains('sortedASC');
    const isSorted = sortedByDESC || sortedByASC;

    if (sortBtnById && isSorted) {
      sortById(arr);
    } else if (sortBtnByName && isSorted) {
      sortByName(arr);
    } else if (sortBtnByDateCreated && isSorted) {
      sortByDate(arr, 'createdAt');
    } else if (sortBtnByDateChanged && isSorted) {
      sortByDate(arr, 'updatedAt');
    }

    if (sortedByDESC) {
      arr.reverse();
    }
  });
}

export { reverseSort, sortByDate, sortByName, sortById, checkSorting };
