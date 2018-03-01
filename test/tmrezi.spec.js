const expect = require('chai').expect;
const tmrezi = require('../src/tmrezi');

describe('tmrezi', () => {

  before(() => {
    'use strict';
    tmrezi.initialise();
  });

  it('creates the correct search url', () => {
    expect(tmrezi.createSearchUrl('auster', 'tomaten', 'zuchini'))
      .equals('https://www.rezeptwelt.de/suche?filters=ingredients_incl:auster,tomaten,zuchini');
  });

  it('finds a recipe for tomatoes', (done) => {
    tmrezi.searchRecipe((recipes) => {
      expect(recipes[0].title).equals('Gulaschsuppe');
      done();
    }, 'tomaten');
  });

  it('gets recipe details', (done) => {
    tmrezi.getRecipe((recipeDetails) => {
      expect(recipeDetails).equals({ ingredients: undefined, steps: undefined});
      done();
    }, 'https://www.rezeptwelt.de/backen-suess-rezepte/zuchini-plaetzchen/ikiul8n4-e7b28-809365-cfcd2-w7v49stf');
  });



});