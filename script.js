const form = document.getElementById('form');
const search = document.getElementById('search');
const result = document.getElementById('result');
const more = document.getElementById('more');
const songEl = document.getElementById('song');

const songs = [];

let currentPage = 1;
let itemsPerPage = 10;

async function searchSongs(input) {
  const apiURL = `https://itunes.apple.com/search?term=${input}&country=HR`;
  const res = await fetch(`${apiURL}`);
  const data = await res.json();

  result.innerHTML = ``; //remove song cards
  songs.splice(0, songs.length); //clear songs array
  currentPage = 1; // reset pagination

  const unique = [
    ...new Map(data.results.map((item) => [item['trackName'], item])).values(),
  ];
  console.log(data.results);
  console.log(currentPage);

  songs.push(...unique);
  songs.sort((a, b) => {
    //sort from newest
    if (b.releaseDate > a.releaseDate) {
      return 1;
    } else {
      return -1;
    }
  });
  showData(songs); //render cards
}

function showData(data) {
  const from = (currentPage - 1) * itemsPerPage;
  const to = currentPage * itemsPerPage;

  const songsOnly = data.filter((s) => s.kind === 'song'); //render only songs
  const toRender = songsOnly.slice(from, to);
  if (songsOnly.length === 0) {
    result.innerHTML = `<h4>No results found </h4>`;
  } else {
    result.innerHTML = `
  <ul class="songs">
  ${toRender
    .map(
      (song, idx) =>
        ` <li style="animation: show 400ms forwards  ease-in-out; animation-delay: ${
          70 * idx
        }ms"
        ;>
  <span><strong>${song.artistName}</strong> - ${song.trackName}</span>
  <button onClick="(() => playSong(event,'${
    song.previewUrl
  }'))()" class="btn preview" data-artist="${song.artistName}" data-title="${
          song.trackName
        }" data-id="${song.trackId}">Preview</button>
  <img class="cover" src="${song.artworkUrl60}" />
  </li>`
    )
    .join('')}
  </ul>
  `;

    if (songsOnly.length > 10) {
      more.innerHTML = `
      ${
        currentPage === 1
          ? ''
          : `   <button class="btn" onClick="(()=>{getMoreSongs(event)})()">Prev</button>
      `
      }
   ${
     toRender.length < 10 || currentPage === 5
       ? ''
       : `<button class="btn" onClick="(()=>{getMoreSongs(event)})()" >Next</button>`
   }
`;
    } else {
      more.innerHTML = '';
    }
  }
}
// getting more songs (prev and next btns)
async function getMoreSongs(event) {
  if (event.target.textContent === 'Prev') {
    if (currentPage === 1) {
      return;
    }
    currentPage--;
  } else {
    currentPage++;
  }
  console.log(currentPage);
  console.log(songs.length);
  showData(songs);
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
    songEl.pause();
    searchSongs(standard);
  }
  search.value = '';
});

async function playSong(event, url) {
  const btn = event.target;
  if (!songEl.paused && event.target.textContent === 'Pause') {
    songEl.pause();
    btn.textContent = 'Preview';
  } else {
    songEl.src = url;
    songEl.play();
    document.querySelectorAll('li button').forEach((btn) => {
      btn.textContent = 'Preview';
    });
    btn.textContent = 'Pause';
  }

  // const lyrics = data.lyrics.replace(/(\r\n|\r|\n)/g, '<br>');

  // result.innerHTML = `
  // <h2><strong>${artist}</strong> - ${title}</h2>
  // <span>${lyrics}</span>
  // `;

  // more.innerHTML = '';
}

// result.addEventListener('click', (e) => {
//   if (!songEl.paused && e.target.tagName === 'BUTTON') {
//     songEl.pause();

//     e.target.textContent = 'Preview';
//   } else {
//     const clicked = e.target;
//     console.log(clicked);
//     if (clicked.tagName === 'BUTTON') {
//       const artist = clicked.getAttribute('data-artist');
//       const songTitle = clicked.getAttribute('data-title');
//       const id = clicked.getAttribute('data-id');
//       getPreview(songTitle, id);

//       document.querySelectorAll('.preview').forEach((btn) => {
//         btn.textContent = 'Preview';
//       });
//       clicked.textContent = 'Stop';
//     }
//   }
// });
