function formatdDate(initialData) {
  const formaterDate = new Intl.DateTimeFormat('ru');
  const formaterTime = new Intl.DateTimeFormat('ru', {
    hour: 'numeric',
    minute: 'numeric'
  });
  const time = formaterTime.format(new Date(initialData));
  const data = formaterDate.format(new Date(initialData));
  return { data, time };
}

function fixedString(str) {
  return `${str.slice(0, 1).toUpperCase()}${str.slice(1).toLowerCase()}`.trim();
}

function updateDataArray(arr, data) {
  arr.length = 0;
  arr.push(...data);
}

export { formatdDate, fixedString, updateDataArray };
