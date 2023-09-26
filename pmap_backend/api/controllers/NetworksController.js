/**
 * NetworksController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const Networks = require("../models/Networks");

let fs = require('file-system');

module.exports = {
  // ======================================== manupulation of db to json for D3 ===================================>>>>>>>>>>>>>>>>>>>>>>
  getJsonForD3: (req, res) => {
    if (!req.body.databaseName || !req.body.networkName) {
      return res.badRequest({ message: 'Some parameter is missing' });
    } else {
      Networks.getNetwork(req.body.databaseName, req.body.networkName, {}, (err, resp) => {
        if (err) {
          return res.serverError(err);
        } else {
          return res.json(resp);
        }
      })
    }
  },

  getLinksColumnsName: (req, res) => {
    console.log(req.body)
    // if (!req.body.databaseName || !req.body.collectionName) {
    // 	return res.badRequest({ message: 'parameter missing' })
    // } else {
    // 	Files.getColumnNames(req.body.databaseName, req.body.collectionName, (err, resp) => {
    // 		if (err) {
    // 			return res.badRequest(err)
    // 		} else if (resp) {
    // 			return res.json(resp);
    // 		} else {
    //       return res.badRequest({ message: 'collection not found!' })
    //     }
    // 	})
    // }
  },

  generateNetworkFromGivenNodes: (req, res) => {
    console.log(req.body)
    if (!req.body.nodeNames || req.body.order == undefined || !req.body.analysedWeight || !req.body.score) {
      return res.badRequest({ message: 'parameter missing' });
    } else {
      req.setTimeout(300000); // 5 mins
      Networks.getAllLinksOfNodes(req.body.nodeNames, { order: req.body.order }, req.body.analysedWeight, req.body.score, (err, resp) => {
        if (err) {
          return res.serverError(err);
        } else if (resp.length == 0) {
          return res.badRequest({ message: 'No result found' })
        } else {
          return res.json(resp);
        }
      })
    }
  },

  // generateNetworkFromGivenNodess: (req, res) => {
  //   res.set('Content-Type', 'text/event-stream');
  //   req.setTimeout(300000); // 5 mins
  //   Networks.getAllLinksOfNodes(['MAPT'], { order: 0 }, 'combined_score', 0.7, (err, resp) => {
  //     if (err) {
  //       return res.serverError(err);
  //     } else if (resp.length) {
  //       return res.badRequest({ message: 'No result found' })
  //     } else {
  //       return res.json(resp);
  //     }
  //   })
  // },

  testingForMongo: (req, res) => {
    req.setTimeout(3000000); // 5 mins
    console.log('START');
    console.log('TOTAL NODES ENTERED', req.body.nodeNames.length);
    let n = [];
    req.body.nodeNames.forEach(str => {
      n.push(str.toUpperCase())
    })
    req.body.order = parseInt(req.body.order);
    req.body.score = parseFloat(req.body.score);

    console.log('Order:', req.body.order, 'Score:', req.body.score);
    Networks.testMongo(n, req.body.analysedWeight, req.body.score, req.body.order, (err, resp) => {
      // Networks.createNeighbours(n, req.body.analysedWeight, req.body.score, req.body.order, (err, resp) => {
      if (err) {
        res.serverError(err)
      } else {
        res.json(resp);
      }
    })
  },
  // ================================== Get Neighbours in a file ============================================

  getNeighboursInAFile: (req, res) => {
    req.setTimeout(3000000); // 5 mins
    console.log('START');
    console.log('TOTAL NODES ENTERED', req.body.nodeNames.length);
    let n = [];
    req.body.nodeNames.forEach(str => {
      n.push(str.toUpperCase())
    })
    req.body.order = parseInt(req.body.order);
    req.body.score = parseFloat(req.body.score);

    console.log('Order:', req.body.order, 'Score:', req.body.score);
    // Networks.testMongo(n, req.body.analysedWeight, req.body.score, req.body.order, (err, resp) => {
      Networks.createNeighbours(n, req.body.analysedWeight, req.body.score, req.body.order, (err, resp) => {
      if (err) {
        res.serverError(err)
      } else {
        // res.writeHead({
        //   'Content-Type': 'text/plain'
        // })
        res.send(resp);
      }
    })
  },

  // ================================================================================
  getNodeExists: (req, res) => {
    // console.log('TOTAL NODES ENTERED', req.body, req.body.nodeNames.length);
    let n = [];
    let genes = JSON.parse(req.body.nodeNames);
    // req.body.nodeNames.forEach(str => {
    //   n.push(str.toUpperCase())
    // })
    genes.forEach(str => {
      n.push(str.toUpperCase())
    }),

      n = n.filter((value, index, self) => {
        return self.indexOf(value) === index;
      })

    console.log('NODES ENTERED -> ', n);

    Networks.getNodeExistDetailsSeries(n, (err, resp) => {
    // Networks.getNodeExistDetailsParallel(n, (err, resp) => {
      if (err) {
        res.serverError(err)
      } else {
        res.json(resp);
      }
    })
  },

  // ===================================================================================
  getUniversalData: (req, res) => {
    // console.log(req.body);
    if (!req.body.allGeneNames || !req.body.collectionName || !req.body.db) {
      return res.badRequest({ message: 'parameter missing' });
    } else {
      let allGeneNames = JSON.parse(req.body.allGeneNames);
      console.log(allGeneNames)
      Networks.getUniversalData(allGeneNames, req.body.collectionName, req.body.db, (err, resp) => {
        if (err) {
          return res.serverError(err)
        } else {
          console.log('done _ uni')
          return res.json(resp);
        }
      })
    }
  },

  // =================================================================================
  getUpdatedUniversalData: (req, res) => {

  // error flags
  let headerErrorFlag = false;
  let valueFormatErrorFlag = false;

    function headerValidation(headerArray) {
      headerArray.forEach(header => {
        if (header == '' || header == undefined || header == null || typeof(header) == Number) {
          // headerErrorFlag = true;
          return;
        }
      })
    }

    function reformHeaderNames(headerArray) {
      let newHeaderArray = []
      headerArray.forEach(header => {
        let substr = header.split('_');
        // header = substr[0].toLowerCase();

        if (substr[0].toLowerCase() == 'logfc') {
          substr.splice(0, 1);
          substr = substr.join('_');
          newHeaderArray.push("logFC_" + substr);
        } else if (substr[0].toLowerCase() == 'gwas') {
          substr.splice(0, 1);
          substr = substr.join('_');
          newHeaderArray.push("GWAS_" + substr);
        } else if (substr[0].toLowerCase() == 'trait') {
          substr.splice(0, 1);
          substr = substr.join('_');
          newHeaderArray.push("trait_" + substr);
        } else if (substr[0].toLowerCase() == 'database') {
          substr.splice(0, 1);
          substr = substr.join('_');
          newHeaderArray.push("database_" + substr);
        } else if (substr[0].toLowerCase() == 'direction') {
          substr.splice(0, 1);
          substr = substr.join('_');
          newHeaderArray.push("direction_" + substr);
        } else if (substr[0].toLowerCase() == 'celltype') {
          substr.splice(0, 1);
          substr = substr.join('_');
          newHeaderArray.push("CellType_" + substr);
        } else if (substr[0].toLowerCase() == 'pathway') {
          substr.splice(0, 1);
          substr = substr.join('_');
          newHeaderArray.push("pathway_" + substr);
        } else if ((substr[0].toLowerCase() == 'custom') && ((substr[1].toLowerCase() == 'color'))) {
          substr.splice(0, 2);
          substr = substr.join('_');
          newHeaderArray.push("custom_color_" + substr);
        } else {
          newHeaderArray.push("");
          console.log('REJECTED', header);
          // headerErrorFlag = true;
        }
      })

      console.log('HEADERS', newHeaderArray)
      return newHeaderArray;
    }

    function valueFormatValidation(valueArr, headerArray) {

      let pattern = /^[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)$/;
      let pattern2 = /^[-+]?[0-9]*\.?[0-9]+$/;
      let binaryArr = [0, 1, '0', '1']
      let naArray = ['NA', 'na', '#NA', '#na'];
      let custom_colors = ["red", "green", "blue", "orange", "yellow", "black"];
      let i = 0;
      
      if (valueArr.length != headerArray.length) { // if headers and values length not matching
        // valueFormatErrorFlag = true;
        return;
      } else {
        for (let i = 0; i < headerArray.length; i++) {
          if (valueArr[i] == null || valueArr[i] == undefined) { // if any value is undefined or null
            // valueFormatErrorFlag = true;
            return;
          } else {
            if (headerArray[i].startsWith('logFC') || headerArray[i].startsWith('trait') || headerArray[i].startsWith('direction')) {
              if (pattern.test(valueArr[i]) || pattern2.test(valueArr[i]) || naArray.includes(valueArr[i])) { // contains any float or int or exponent value
                if (naArray.includes(valueArr[i])) {
                  valueArr[i] = "NA";
                } else {
                  valueArr[i] = parseFloat(valueArr[i]);
                }
              } else {
                // valueFormatErrorFlag = true;
              }
            } else if (headerArray[i].startsWith('pathway') || headerArray[i].startsWith('GWAS') || headerArray[i].startsWith('CellType' || headerArray[i].startsWith('database' || headerArray[i].startsWith('direction')))) {
              // console.log(binaryArr.includes(valueArr[i]))
              if (binaryArr.includes(valueArr[i]) || naArray.includes(valueArr[i])) { // contains 0 or 1
                if (naArray.includes(valueArr[i])) {
                  valueArr[i] = "NA";
                } else {
                  valueArr[i] = parseInt(valueArr[i]);
                }
              } else {
                // valueFormatErrorFlag = true;
                return;
              }
            } else if (headerArray[i].startsWith('custom')) {
              if (naArray.includes(valueArr[i])) {
                valueArr[i] = "NA";
              } else if (headerArray[i].startsWith('custom_color') && custom_colors.includes(valueArr[i].toLowerCase())) {
                // do something
                valueArr[i] = valueArr[i].toLowerCase();
              } else {
                // valueFormatErrorFlag = true;
              }
            }
          }
        }
      }
    }

    let universal = JSON.parse(req.body.universal);
    
    req.file('avatar').upload({
      maxBytes: 1073741824
    }, (err, uploadedFiles) => {

      if (err) return res.serverError(err);
      else if (uploadedFiles.length == 0) {
        return res.badRequest({
          message: 'parameter missing'
        })
      } else {

        let ext = uploadedFiles[0].filename.split('.');
        ext = ext[ext.length - 1];

        // console.log(ext);

        let newname = uploadedFiles[0].fd.split('/');
        newname = newname.join('/');
        console.log('file', newname);

        fs.readFile(newname, 'utf8', (err, resp) => {
          let lines = resp.split('\r\n');
          // console.log('Lines', lines);
          let initHeaders = lines[0].split(',')
          initHeaders.splice(0, 1);

          headerValidation(initHeaders);
          console.log(headerErrorFlag)

          let fileHeaders = reformHeaderNames(initHeaders);

          // if all header names are okay
          if (headerErrorFlag == false) {
            
            lines.splice(0, 1); // remove headers from here, its in fileHeaders variable

            console.log('LINES', lines)

            let indexMax = 0;

            // insert header parameter first
            for (let key in universal.headers) {
              if (universal.headers[key] > indexMax) {
                indexMax = universal.headers[key]
              }
            }
            
            fileHeaders.forEach(h => {
              universal.headers[h] = ++indexMax;
            })

            for (let k in universal.genes) {
              for (let i of fileHeaders) {
                universal.genes[k].push('');
              }
            }

            // insert values now if ENSG id found
            async.eachSeries(lines, (e, cb) => {
              let row = e.split(',');
              let ensgID = row[0].toUpperCase();
              // if (ensgID.startsWith("ENSG")) {
                if (row.length > 1) {
                  row.splice(0, 1);
                  if (universal.genes[ensgID] != undefined) {
                    valueFormatValidation(row, fileHeaders);
                    if (valueFormatErrorFlag == false) {
                      universal.genes[ensgID].splice(universal.genes[ensgID].length - fileHeaders.length, fileHeaders.length);
                      universal.genes[ensgID] = universal.genes[ensgID].concat(row);
                    } else {
                      return res.badRequest('Value Format Error');
                    }
                  }
                } else {
                  return res.badRequest('Value Format Error');
                }
              // } else {
              //   return res.badRequest('ENSG format mismatch')
              // }
              cb();
            }, (err) => {
              console.log('DONE')
              return res.json(universal);
            });
          } else {
            return res.badRequest('Headers format mismatch')
          }
        })
      }
    });
  }

};

