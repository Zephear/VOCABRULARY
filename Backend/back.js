function showPage(page) {
  document.querySelectorAll('.page-section').forEach(section => {
    section.classList.remove('active');
  });
  document.getElementById(page + '-section').classList.add('active');
  document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
  if (page === 'home') {
    document.querySelector('.nav-link:nth-child(1)').classList.add('active');
  } else if (page === 'dictionary') {
    document.querySelector('.nav-link:nth-child(2)').classList.add('active');
  }
}
