const jsdom = require('jsdom');
const {JSDOM} = jsdom;
const _ = require('lodash');

exports = Object.assign(exports,
  {initialise, searchRecipe, getRecipe, createSearchUrl});

const recipeSearchUrl = 'https://www.rezeptwelt.de/suche';
const iconTitlesConverter = {
  '"Counter-clockwise operation"': 'mit dem Uhrzeiger',
  '"No counter-clockwise operation"': 'gegen den Uhrzeiger',
  '"Dough mode"': 'Teig',
  '"Gentle stir setting"': 'Rühreinsatz',
  '"Closed lid"': 'Topf'
};

function initialise() {
  "use strict";
}

function createSearchUrl(...ingredients) {
  const allIngredients = ingredients.join();
  return `${recipeSearchUrl}?filters=ingredients_incl:${allIngredients}`;
}

function searchRecipe(callback, ...ingredients) {
  const url = createSearchUrl(ingredients);
  JSDOM.fromURL(url)
    .then((dom) => {
      const document = dom.window.document;
      const foundRecipes = document.querySelectorAll('a.item-link.item-title');
      callback(_.map(foundRecipes, recipeNode => {
        const [title, link] = [recipeNode.innerHTML, recipeNode.href];
        return {title, link}
      }));
    })
    .catch((error) => {
      console.log('Error occured:', error);
    });
}

function getRecipe(callback, recipeUrl) {
  JSDOM.fromURL(recipeUrl)
    .then((dom) => {
      const document = dom.window.document;
      const allIngredientsFromHTML = document.querySelectorAll('ul li[itemprop="ingredients"]');
      const ingredients = createIngredientsFromHTML(allIngredientsFromHTML);
      const allStepsFromHTML = document.querySelectorAll('ol.steps-list li p');
      const steps = createStepsFromHTML(allStepsFromHTML);
      // console.log(ingredients, steps);
      callback({ingredients, steps});
    })
    .catch((error) => {
      console.log('Error occured:', error);
    });
}

function createIngredientsFromHTML(html) {
  return _.map(html, (liNode) => {
    return liNode.textContent.replace(/\s\s+/g, ' ').trim();
  });
}

function createStepsFromHTML(html) {
  return _.map(html, (liNode) => {
    const bspRemoved = liNode.innerHTML.replace('&nbsp;', '');
    let iconReplaced = bspRemoved.replace(/<img.*?title=(.*)>/, ' $1 ');
    _.forEach(Object.keys(iconTitlesConverter), (iconTitle) => {
      iconReplaced = iconReplaced.replace(iconTitle, iconTitlesConverter[iconTitle]);
    });
    return iconReplaced.replace(/\s\s+/g, ' ').trim();
  });
}

/*

 */