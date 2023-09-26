/**
 * FilesController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

let fs = require('file-system');
let axios = require('axios');
// let csv = require('csv-parser');
let csv = require('csvtojson/v2');
const Files = require('../models/Files');

module.exports = {
    // =======================================importing csv file to database==========================================>>>>>>>>>>>>>>>>>>
    importData: (req, res) => {
        // this function is uploading the file into the ../.tmp/uploads folder
        const cond = req.body.isImport ? (req.body.isImport == true ? (req.body.collectionNameByUser ? true : false) : true) : false;

        req.file('avatar').upload({
            maxBytes: 1073741824
        }, (err, uploadedFiles) => {
            function makeid(length) {
                var str = '';
                var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
                var charactersLength = characters.length;
                for (var i = 0; i < length; i++) {
                    str += characters.charAt(Math.floor(Math.random() * charactersLength));
                }
                return str;
            }

            // console.log(uploadedFiles)
            if (err) return res.serverError(err);
            else if (uploadedFiles.length == 0 || cond == false) {
                return res.badRequest({
                    message: 'parameter missing'
                })
            } else {
                let ext = uploadedFiles[0].filename.split('.');
                ext = ext[ext.length - 1];

                // console.log(ext);

                let newname = uploadedFiles[0].fd.split('/');
                if (ext == 'csv') {
                 newname[newname.length - 1] = uploadedFiles[0].filename;
                }
                else if (ext == 'json') {
                    var j_name = `JSON_${makeid(6)}.json`;
                    newname[newname.length - 1] = j_name;
                }


                newname = newname.join('/');
                // console.log(newname, typeof(newname));
                
                    fs.rename(`${uploadedFiles[0].fd}`, newname, (err) => {
                        if (err) {
                            return res.serverError(err);
                        } else {
                            if (ext == 'csv') {
                                const results = [];
                                const source = fs.createReadStream(`${newname}`);

                                source
                                    .pipe(csv())
                                    .on('data', function(chunk) {
                                        results.push(JSON.parse(chunk));
                                    })
                                    .on('end', () => {
                                        // console.log('results', results);
                                        if (req.body.isImport == true) {
                                            Files.createCollection(results, req.body.collectionNameByUser, (err, resp) => {
                                                if (err) {
                                                    return res.serverError(err)
                                                } else {
                                                    return res.json({ message: resp });
                                                }
                                            })
                                        } else {
                                            // fs.unlink(newname)
                                            // var writeStream = fs.createWriteStream('./output');
                                            Files.getNetworkFromCSV(results, (err, resp) => {
                                                // console.log();
                                                fs.unlink(newname, (err, removed) => {
                                                    // console.log(err, removed)
                                                    if (err) {
                                                        return res.serverError(err)
                                                    } else {
                                                        let randomFileName = `CSV_${makeid(6)}.txt`;
                                                        let thisPath = `${__dirname}/../../.tmp/uploads/${randomFileName}`;
                                                        var writeStream = fs.createWriteStream(thisPath);
                                                        writeStream.write(JSON.stringify(resp));
                                                        // on Node.js older than 0.10, add cb to end()
                                                        writeStream.end(() => {
                                                            return res.json({ fileName: randomFileName })
                                                        });
                                                        // return res.json(resp);
                                                    }
                                                })
                                                // if (err) {
                                                //     return res.serverError(err)
                                                // } else {
                                                //     return res.json(resp);
                                                // }
                                            })
                                        }

                                    })
                            } else if (ext == 'json') {
                                return res.json({ fileName: j_name })
                            }

                        }
                    });
                // } 
            }
        });
    },

    // ========================================== getting an temp file ====================================>>>>>>>>>>>>>>>>>>>>

    getFile: (req, res) => {
        console.log('GET FILE IS CALLED')
        req.setTimeout(3000000); // 5 mins
        let fileName = req.allParams().fileName;

        if (fileName == undefined) {
            return res.badRequest({ message: 'file name missing' })
        } else {
            console.log('FILENAME', fileName)
            let filePath = `${__dirname}/../../.tmp/uploads/${fileName}`;
            // let filePath = `${__dirname}/../../${fileName}`;
            fs.readFile(filePath, 'utf8', (err, resp) => {
                if (err) {
                    return res.serverError(err);
                } else {
                    let org = JSON.parse(resp);
                    // let allNodes = _.pluck(org.nodes, 'id');
                    // console.log('======', allNodes);
                    fs.unlink(filePath, (err, removed) => {
                        if (err) {
                            return res.serverError(err)
                        } else {
                            let node404 = []
                            console.log('DONE');
                            return res.json(org);
                        }
                    });
                }
            })

        }
    },

    // =======================================creating new database==========================================>>>>>>>>>>>>>>>>>>
    createNewDatabase: (req, res) => {
        if (!req.body.databaseName) {
            return res.badRequest({
                message: 'database name missing'
            })
        } else {
            Files.getDatabaseNames({}, (err, names) => {
                if (err) {
                    return res.serverError(err)
                } else {
                    return res.json(names);
                }
            })
        }
    },

    // ==================================================================================================================

};