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

function processJSON(jsonData) {
    var processingSoftware;
    var software;
    var result;

    if (jsonData.image.ProcessingSoftware !== null) {
        processingSoftware = jsonData.image.ProcessingSoftware;
    }
    if (jsonData.image.Software !== null) {
        software = jsonData.image.Software;
    }

    var editingSoftwares = [
        'Adobe',
        'Windows',
        'Gimp',
        'Corel',
        'Pixlr',
        'Skylum Luminar',
        'Capture One',
        'On1 Photo RAW',
        'ACDSee Photo Studio Ultimate',
        'Canva',
        'PicMonkey',
        'Snappa',
        'PortraitPro',
        'Fotor',
        'Inkscape',
        'DxO Optics Pro 10',
        'Serif Affinity Photo',
        'Aviary',
        'Bonfire Photo Editor',
        'Cupslice',
        'LightX',
        'PhotoDirector',
        'Photo Effects Pro',
        'Photo Lab',
        'Photo Mate',
        'PicsArt',
        'Snapseed',
        'TouchRetouch',
        'Vimage'
    ]

    if (processingSoftware !== undefined || editingSoftwares.includes(software)) {
        // The image might have been modified
        result = "This image was modified by: " + software;
    } else {
        // The image is not modified
        result = "The image was not modified";
    }

    console.log("Processing Software: " + processingSoftware, "\nSoftware: ", software, "\nResult: ", result);
    return {"result": result};

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