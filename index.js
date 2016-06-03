var request = require('request');
var cheerio = require('cheerio');
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));


request("https://en.wikipedia.org/wiki/List_of_postcode_areas_in_the_United_Kingdom", function(error, response, body) {
  function replacer(key,value){
    if(value === ''){
      return undefined
    }
    return value
  }
  var pairings = {};
  var $ = cheerio.load(body);
  $('.wikitable').first().each(function(){
    $(this).find('tr').each(function(){
      pairings[$(this).find('td').first().text()] =  $(this).find('td:nth-child(2)').text().replace(/\[.+\]/g,'')
    })
  })
  // console.log(pairings);
  fs.appendFileAsync('postcodes.json', JSON.stringify(pairings,replacer,'\t'))
  .then(function(){
    var data = require('./postcodes.json');
    var prefix = Object.keys(data)
    prefix.forEach(function(e){
      request("https://en.wikipedia.org/wiki/" + e + "_postcode_area",function(error,response,body){
      var result = {};
      var $ = cheerio.load(body);
      $('.wikitable').first().each(function(){
        $(this).find('tr').each(function(){
          result[$(this).find('th').first().text()] = $(this).find('td:nth-child(2)').text()
        })
      })
      fs.appendFileAsync('postcodes.json', JSON.stringify(result,replacer,'\t'))
      console.log(result)
    })
    })
    

  })
  
});
