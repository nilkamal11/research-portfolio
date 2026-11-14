(() => {
  const controls = document.getElementById('project-controls');
  if (!controls) return;
  const search = document.getElementById('project-search');
  const maturity = document.getElementById('maturity-filter');
  const buttons = [...controls.querySelectorAll('[data-filter]')];
  const cards = [...document.querySelectorAll('.project-card')];
  const params = new URLSearchParams(location.search);
  const aliases = {'#k12':'K–12 analytics', '#higher-ed':'Higher-ed analytics'};
  let category = buttons.some(b => b.dataset.filter === params.get('category')) ? params.get('category') : (aliases[location.hash] || '');
  const normalize = value => value.toLowerCase().replace(/[–—]/g, '-');
  search.value = params.get('q') || '';
  maturity.value = ['published','prototype','guide'].includes(params.get('maturity')) ? params.get('maturity') : '';
  function applyFilters() {
    const terms = normalize(search.value).trim().split(/\s+/).filter(Boolean);
    let count = 0;
    for (const card of cards) {
      const level = card.dataset.maturity.toLowerCase();
      const matchesMaturity = !maturity.value || (maturity.value === 'published' && level.startsWith('published')) || (maturity.value === 'prototype' && /prototype|demo/.test(level)) || (maturity.value === 'guide' && level.includes('guide'));
      card.hidden = !(terms.every(term => normalize(card.dataset.search).includes(term)) && (!category || card.dataset.category.split('|').includes(category)) && matchesMaturity);
      if (!card.hidden) count++;
    }
    buttons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.filter === category)));
    document.getElementById('results-count').textContent = `${count} of ${cards.length} projects`;
    document.getElementById('empty-state').hidden = count !== 0;
    const url = new URL(location.href);
    for (const [key, value] of [['q', search.value.trim()], ['category', category], ['maturity', maturity.value]]) {
      if (value) url.searchParams.set(key, value); else url.searchParams.delete(key);
    }
    url.hash = 'projects';
    document.getElementById('filter-link').href = url.pathname + url.search + url.hash;
  }
  search.addEventListener('input', applyFilters);
  maturity.addEventListener('change', applyFilters);
  buttons.forEach(b => b.addEventListener('click', () => { category = b.dataset.filter; applyFilters(); }));
  document.getElementById('reset-filters').addEventListener('click', () => { search.value = ''; maturity.value = ''; category = ''; applyFilters(); search.focus(); });
  controls.hidden = false;
  applyFilters();
})();
