var express = require('express')
var multer = require('multer')
var app = express();
let fs = require("fs")
let slno = 0

app.use("/css", express.static(__dirname + '/css'));
app.use("/js", express.static(__dirname + '/js'));
app.use("/images", express.static(__dirname + '/images'));
app.set('view engine', 'ejs');


var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './uploads')
    },
    filename: function (req, file, callback) {
        callback(null, 'img' + slno + '.jpg')
    }
});

var upload = multer({
    storage: storage
}).single('userPhoto');

function loadPage() {
    let filename = "./uploads/imagelist.txt";
    if (fs.existsSync(filename)) {
        let data = fs.readFileSync(filename, "utf8").split("\n")
        slno = data.length - 1;
    }
}

function checkForSoftware(software) {
    var editingSoftwares = [
        'Adobe',
        'Windows',
        'Gimp',
        'Corel',
        'Pixlr',
        'Skylum',
        'Capture',
        'On1',
        'ACDSee',
        'Canva',
        'PicMonkey',
        'Snappa',
        'PortraitPro',
        'Fotor',
        'Inkscape',
        'DxO',
        'Serif',
        'Aviary',
        'Bonfire',
        'Cupslice',
        'LightX',
        'PhotoDirector',
        'Effects Pro',
        'Lab',
        'Mate',
        'PicsArt',
        'Snapseed',
        'TouchRetouch',
        'Vimage',
        'Affinity',
        'Photo'
    ];

    var softwares = software.split(" ");
    //console.log("Software:  ", software);
    for (let i = 0; i < softwares.length; i++) { // Get all the words in the processing softwares
        for (let j = 0; j < editingSoftwares.length; j++) {
            if (editingSoftwares[j].toLowerCase() == softwares[i].toLowerCase()) { // Compare each and evey word of processing software with existing list of editing softwares
                return true;
            }
        }
    }
    return false;
}

function processJSON(jsonData) {
    var processingSoftware;
    var software;
    var result;
    var isSoftware = false;
    var isProcessingSoftware = false;
console.log("Processing SOftware: ", jsonData.image.ProcessingSoftware);
console.log("SOftware: ", jsonData.image.Software)
    if (jsonData.image.ProcessingSoftware !== null && jsonData.image.ProcessingSoftware !== undefined) {
        processingSoftware = jsonData.image.ProcessingSoftware;
        isProcessingSoftware = checkForSoftware(processingSoftware);

        console.log("Processing Software: ", processingSoftware);
    }
    if (jsonData.image.Software !== null) {
        software = jsonData.image.Software;
        isSoftware = checkForSoftware(software);

        console.log("Software: ", software);
    }

    if (processingSoftware !== undefined || processingSoftware !== null || software !== undefined || software !== null) {
        console.log("inside result");
        console.log("isSoftware: ", isSoftware)
        console.log("isProcessingSOftware: ", isProcessingSoftware)
        // The image might have been modified
        if (isProcessingSoftware) {
            result = "This image was modified by: " + processingSoftware;
        } else if (isSoftware) {
            result = "This image was modified by: " + software;
        } else {
            result = "This image seems to be not modified";
        }
    } else {
        // The image is not modified
        result = "The image was not modified";
    }

    console.log("Processing Software: " + processingSoftware, "\nSoftware: ", software, "\nResult: ", result);
    return { "result": result };

}

app.get('/', function (req, res) {
    res.sendFile(__dirname + "/index.html")
});

app.get('/:image', function (req, res) {
    console.log(req.params.image)
    console.log(req.params)
    var ExifImage = require('exif').ExifImage;
    try {
        new ExifImage({
            image: "./uploads/" + req.params.image
        }, function (error, exifData) {
            if (error) {
                res.end('<script>alert("Metadata couldn\'t be extracted. Please try other tests...");</script>')
                console.log('Error 1: ' + error.message);
                console.log('This load...')
            } else {
                if (exifData === '') {
                    res.end('<script>alert("Metadata not found. Continue with other tests...");</script>')
                } else {
                    var stringify = require('json-stringify')
                    // res.write(stringify(exifData, null, 3))
                    // Processing of the JSON data.
                    //res.write(processJSON(exifData));
                    res.render("result", processJSON(exifData));
                    res.end()
                }
                console.log("Extracted Metadata in json format: \n" + exifData) // Do something with your data!
            }
        });
    } catch (error) {
        console.log('Error 2: ' + error.message);
    }
});

app.get('/test/:image', function (req, res) {
    console.log(req.params.image)
    console.log(req.params)
    var ExifImage = require('exif').ExifImage;
    try {
        new ExifImage({
            image: "./uploads/" + req.params.image
        }, function (error, exifData) {
            if (error) {
                res.end('<script>alert("Metadata couldn\'t be extracted. Please try other tests...");</script>')
                console.log('Error 1: ' + error.message);
                console.log('This load...')
            } else {
                if (exifData === '') {
                    res.end('<script>alert("Metadata not found. Continue with other tests...");</script>')
                } else {
                    var stringify = require('json-stringify')
                    res.write(stringify(exifData, null, 3))
                    res.end()
                }
                console.log("Extracted Metadata in json format: \n" + exifData) // Do something with your data!
            }
        });
    } catch (error) {
        console.log('Error 2: ' + error.message);
    }
});

app.post('/upload', function (req, res) {
    slno = 0
    loadPage()
    console.log('Uploading')
    upload(req, res, function (err) {
        if (err) {
            return res.end("Error uploading file.")
        }
        fs.appendFile(
            "./uploads/imagelist.txt",
            "img" + slno + ".jpg" + "\n",
            function (err) {
                if (err) throw err;
            }
        );
        res.redirect('/' + "img" + slno + ".jpg")
    });
});

app.listen(3000, function () {
    console.log("Working on port 3000")
});