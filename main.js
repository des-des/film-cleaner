var fs = require('fs');

var films = fs.readFileSync('./FilmsDB.csv', 'utf8').toString().split('\n');

var rules = [
  /\(.*\)/g, // matches everthing in brackets
  /\*.*\*/g, // matches everthing in astrisks
  /\(.*[\s]?$/g, // matches everthing in brackets or something with one bracket
  /\*/g, // matches astrisks
  /\b[\s+]?[-]?[\s+]?THE[\s+]?[-]?$/g, // mathes [- THE, THE ...] at end
  /\b[\s+]?[-]?[\s+]?AN[\s+]?[-]?$/g, // mathes [- AN, AN ...] at end
  /\b[\s+]?[-]?[\s+]?A[\s+]?[-]?$/g, // mathes [- A, A ...] at end
  /[\s+]?[-]?[\s+]?$/g // trailing hyphans
];
var isShow = function(str) {
  return (
    /SERIES [\d]/.test(str) ||
    /SEASON [\d]/.test(str)
  );
}

var trimWhiteSpace = function(str) {
  return str.replace(/(^[\s]+|[\s]+$)/g, '');
}

var killFunnyDash = function(film) {
  return film.replace("–", '');
}

applyRules = function(film) {
  return rules.reduce((film, rule) => film.replace(rule, ''), film);
};

var reduceFilms = ((lastFilm) => (results, film, i) => {
  var input = film;
  if (!skipFilm(lastFilm, film)) {
    var film = applyRules(film);
    film = killFunnyDash(film);
    film = trimWhiteSpace(film);
    if (film !== lastFilm && !isShow(film)) {
      results.films.push([film, input]);
      lastFilm = film;
    }
  }
  return results;
})('');

var skipFilm = (lastFilm, film) => {
  return film === '' || /^\s+$/.test(film) || film === lastFilm;
}

var cleanFilms = films => films.reduce(reduceFilms, {films: [], tv: []});

var results = cleanFilms(films);

var showFilms = function(result, start, len) {
  var i;
  for (i = start; i < start+len; i++) {
    console.log(result.films[i]);
  }
};

var testFilms = [
  'film1',
  'film1',
  '',
  '    ',
  'film2',
  '42ND STREET*',
  '42ND STREET (brackets)',
  '666  PROPHECY  THE',
  '6TH DAY - THE',
  '8 WOMEN (8 FEMMES)',
  'AGONY AND THE ECSTASY -THE-',
  'AMERICAN HAUNTING  AN',
  'ASSAULT  THE (2010)',
  'BEST MAN - THE',
  'BEST MEN – THE',
  'DEGREE OF MURDER -A-',
  'DISNEY COMPILATION 3(HERESGOOF',
  'DUCK SOUP (MARX BROTHERS)*',
  'DUELLISTS -THE-*',
  'E.R VOL 1 SERIES 1 EPS 2 & 3',
  'EASY COME  EASY GO (1947) (UNI)',
  'FAIL SAFE ***WB***',
  'FRIENDS: COMPLETE SEASON 10',
  'BABE  -'
];

var expected = [
  'film1',
  'film2',
  '42ND STREET',
  '666  PROPHECY',
  '6TH DAY',
  '8 WOMEN',
  'AGONY AND THE ECSTASY',
  'AMERICAN HAUNTING',
  'ASSAULT',
  'BEST MAN',
  'BEST MEN',
  'DEGREE OF MURDER',
  'DISNEY COMPILATION 3',
  'DUCK SOUP',
  'DUELLISTS',
  'EASY COME  EASY GO',
  'FAIL SAFE',
  'BABE'
];

var testResult = cleanFilms(testFilms);

if (expected.length !== testResult.films.length) {
  console.log(testResult);
  throw 'bad result length';
};
expected.forEach((film, i) => {
  if (film !== testResult.films[i][0]) throw 'fail at ' + film + ' : ' + testResult.films[i][0];
});

showFilms(results, 990, 30);

fs.writeFileSync('cleanFilms.csv', results.films.map(pair => pair[0]).join('\n'), 'utf8');

var filmsStr = fs.readFileSync('cleanFilms.csv', 'utf8').toString().slice(0, 2000);
console.log(filmsStr);
