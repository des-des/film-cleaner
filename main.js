var fs = require('fs');

var films = fs.readFileSync('./FilmsDB.csv', 'utf8').toString().split('\n');

var rules = [
  /\b[\s+]?[-]?[\s+]?THE[\s+]?$/g, // mathes [- THE, THE ...] at end
  /\*/g, // matches astrisks
  /\(.*\)/g // matches everthing in brackets
];

applyRules = function(film) {
  return rules.reduce((film, rule) => film.replace(rule, ''), film);
};

var reduceFilms = ((lastFilm) => (results, film, i) => {
  var input = film;
  if (!skipFilm(lastFilm, film)) {
    var film = applyRules(film);
    results.films.push([film, input]);
    lastFilm = film;
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
  '666  PROPHECY  THE',
  '6TH DAY - THE',
  '8 WOMEN (8 FEMMES)'
];

var expected = [
  'film1',
  'film2',
  '42ND STREET',
  '666  PROPHECY',
  '6TH DAY',
  '8 WOMEN '
];

var testResult = cleanFilms(testFilms);

if (expected.length !== testResult.films.length) {
  console.log(testResult);
  throw 'bad result length';
};
expected.forEach((film, i) => {
  if (film !== testResult.films[i][0]) throw 'fail at ' + film + ' : ' + testResult.films[i][0];
});

showFilms(results, 150, 20);

fs.writeFileSync('cleanFilms.csv', results.films.join(', '));
