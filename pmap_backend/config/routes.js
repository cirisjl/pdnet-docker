/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

module.exports.routes = {


  //  ╦ ╦╔═╗╔╗ ╔═╗╔═╗╔═╗╔═╗╔═╗
  //  ║║║║╣ ╠╩╗╠═╝╠═╣║ ╦║╣ ╚═╗
  //  ╚╩╝╚═╝╚═╝╩  ╩ ╩╚═╝╚═╝╚═╝

  /***************************************************************************
  *                                                                          *
  * Make the view located at `views/homepage.ejs` your home page.            *
  *                                                                          *
  * (Alternatively, remove this and add an `index.html` file in your         *
  * `assets` directory)                                                      *
  *                                                                          *
  ***************************************************************************/

  '/': {
    view: 'pages/homepage'
  },
  'GET /getData/:dbName/:collectionName': 'GenesController.getNames', // get all collection data from mongodb of given database



  // *************************************** Files Controller **********************************************************

  'POST /import': 'FilesController.importData', // save the data into Mongo of an imported csv file
  'GET /:fileName/getFile' : 'FilesController.getFile',
  // 'GET /gnome' : 'FilesController.gnome',


// ******************************************** Netwrok Controller *****************************************************

  // 'POST /import/collections': 'GenesController.importCollections', // create collection from JSON file
  'POST /get/columnName': 'NetworksController.getLinksColumnsName', // Column Names as outout
  'POST /get/jsonForD3' : 'NetworksController.getJsonForD3',
  // 'POST /get/network/fromNodes': 'NetworksController.generateNetworkFromGivenNodes',
  'POST /get/network/fromNodes': 'NetworksController.testingForMongo',
  'POST /test/network/fromNodes': 'NetworksController.getNeighboursInAFile',
  'POST /get/universalData/fromNodes': 'NetworksController.getUniversalData', // universal file from nodenames mongo
  'POST /get/updateUniversal': 'NetworksController.getUpdatedUniversalData', // universal file from nodenames mongo
  'POST /get/nodeExists': 'NetworksController.getNodeExists',
  // 'GET /get/network/fromNodes': 'NetworksController.generateNetworkFromGivenNodess',


  // ******************************************* USER CONTROLLER *******************************************************
  'POST /get/userRole':     'UsersController.getRole',


  
  /***************************************************************************
  *                                                                          *
  * More custom routes here...                                               *
  * (See https://sailsjs.com/config/routes for examples.)                    *
  *                                                                          *
  * If a request to a URL doesn't match any of the routes in this file, it   *
  * is matched against "shadow routes" (e.g. blueprint routes).  If it does  *
  * not match any of those, it is matched against static assets.             *
  *                                                                          *
  ***************************************************************************/


  //  ╔═╗╔═╗╦  ╔═╗╔╗╔╔╦╗╔═╗╔═╗╦╔╗╔╔╦╗╔═╗
  //  ╠═╣╠═╝║  ║╣ ║║║ ║║╠═╝║ ║║║║║ ║ ╚═╗
  //  ╩ ╩╩  ╩  ╚═╝╝╚╝═╩╝╩  ╚═╝╩╝╚╝ ╩ ╚═╝



  //  ╦ ╦╔═╗╔╗ ╦ ╦╔═╗╔═╗╦╔═╔═╗
  //  ║║║║╣ ╠╩╗╠═╣║ ║║ ║╠╩╗╚═╗
  //  ╚╩╝╚═╝╚═╝╩ ╩╚═╝╚═╝╩ ╩╚═╝


  //  ╔╦╗╦╔═╗╔═╗
  //  ║║║║╚═╗║
  //  ╩ ╩╩╚═╝╚═╝


};
