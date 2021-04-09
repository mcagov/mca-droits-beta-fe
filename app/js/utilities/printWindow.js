export const windowPrint = (() =>
  document.addEventListener('DOMContentLoaded', () => {
    const el = document.querySelector('.print-page');
    el &&
      el.addEventListener('click', () => {
        window.print();
      });
  }))();
