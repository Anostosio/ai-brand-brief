const language = document.body.dataset.lang === 'ru' ? 'ru' : 'en';
const deleteButton = document.querySelector('#localDataDelete');
const STORAGE_PREFIX = 'brand-brief-studio:';

const copy = {
  en: {
    confirm: 'Delete the saved draft and all recent Brand Brief Studio briefs from this browser? This cannot be undone.'
  },
  ru: {
    confirm: 'Удалить сохранённый черновик и все недавние брифы Brand Brief Studio из этого браузера? Это действие нельзя отменить.'
  }
}[language];

function clearProductLocalData() {
  try {
    const keys = [];
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (key?.startsWith(STORAGE_PREFIX)) keys.push(key);
    }
    for (const key of keys) localStorage.removeItem(key);
  } catch { /* Storage may be blocked by the browser. */ }
}

deleteButton?.addEventListener('click', () => {
  if (!window.confirm(copy.confirm)) return;
  clearProductLocalData();
  location.reload();
});
