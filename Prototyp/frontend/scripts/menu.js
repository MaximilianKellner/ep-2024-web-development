document.addEventListener('DOMContentLoaded', () => {
    const menuIcon = document.getElementById('menu-icon');
    const sideMenu = document.getElementById('side-menu');
    const body = document.body;
  
    menuIcon.addEventListener('click', () => {
      sideMenu.classList.toggle('show');
      body.classList.add('no-scroll');
    });
  
    document.addEventListener('click', (event) => {
      if (!sideMenu.contains(event.target) && !menuIcon.contains(event.target)) {
        sideMenu.classList.remove('show');
        body.classList.remove('no-scroll');
      }
    });
  });