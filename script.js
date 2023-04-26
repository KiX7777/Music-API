const form = document.getElementById('form');
const search = document.getElementById('search');
const result = document.getElementById('result');
const more = document.getElementById('more');
const songEl = document.getElementById('song');

const apiURL = 'https://api.lyrics.ovh';

async function searchSongs(term) {
  const res = await fetch(`${apiURL}/suggest/${term}`);
  const data = await res.json();

  showData(data);
}

function showData(data) {
  result.innerHTML = `
  <ul class="songs">
  ${data.data
    .map(
      (song) =>
        ` <li>
  <span><strong>${song.artist.name}</strong> - ${song.title}</span>
  <button class="btn preview" data-artist="${song.artist.name}" data-title="${song.title}" data-id="${song.id}">Preview</button>
  <img class="cover" src="${song.album.cover_small}" />
  </li>`
    )
    .join('')}
  </ul>
  `;

  const songs = document.querySelectorAll('li');
  setTimeout(() => {
    songs.forEach((song, idx) => {
      song.style.animation = 'show 400ms forwards ease-in-out';
      song.style.animationDelay = `${70 * idx}ms`;
    });
  }, 50);

  if (data.prev || data.next) {
    more.innerHTML = `
    ${
      data.prev
        ? `<button class="btn" onClick="getMoreSongs('${data.prev}')">Prev</button>`
        : ''
    }
    ${
      data.next
        ? `<button class="btn" onClick="getMoreSongs('${data.next}')">Next</button>`
        : ''
    }
    `;
  } else {
    more.innerHTML = '';
  }
}
// getting more songs (prev and next btns)
async function getMoreSongs(url) {
  const res = await fetch(`https://cors-anywhere.herokuapp.com/${url}`);
  const data = await res.json();

  showData(data);
}

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const searchTerm = search.value.trim();
  const standard = searchTerm
    .normalize('NFD')
    .replace(/([\u0300-\u036f]|[^0-9a-zA-Z])/g, '');

  if (!searchTerm) {
    alert('Please type in a search term');
  } else {
    searchSongs(standard);
  }
  search.value = '';
});

async function getPreview(title, id) {
  if (!songEl.paused) {
    songEl.pause();
  } else {
    const res = await fetch(`${apiURL}/suggest/${title}`);
    const data = await res.json();

    console.log();

    const song = data.data.find((song) => song.id === +id);
    console.log(song);
    console.log(song.preview);
    songEl.src = song.preview;
    songEl.play();
  }

  // const lyrics = data.lyrics.replace(/(\r\n|\r|\n)/g, '<br>');

  // result.innerHTML = `
  // <h2><strong>${artist}</strong> - ${title}</h2>
  // <span>${lyrics}</span>
  // `;

  // more.innerHTML = '';
}

result.addEventListener('click', (e) => {
  if (!songEl.paused && e.target.tagName === 'BUTTON') {
    songEl.pause();

    e.target.textContent = 'Preview';
  } else {
    const clicked = e.target;
    console.log(clicked);
    if (clicked.tagName === 'BUTTON') {
      const artist = clicked.getAttribute('data-artist');
      const songTitle = clicked.getAttribute('data-title');
      const id = clicked.getAttribute('data-id');
      getPreview(songTitle, id);

      document.querySelectorAll('.preview').forEach((btn) => {
        btn.textContent = 'Preview';
      });
      clicked.textContent = 'Stop';
    }
  }
});
