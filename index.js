var express = require('express')
var multer = require('multer')
var app = express();
let fs = require("fs")
let slno = 0

var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        // console.log('destination req:' + req)
        // console.log('destination file:' + file)
        callback(null, './uploads')
    },
    filename: function (req, file, callback) {
        // console.log('filename req:' + req)
        // console.log('filename file:' + file)
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

app.get('/', function (req, res) {
    res.sendFile(__dirname + "/index.html")
});

app.get('/:image', function (req, res) {
    console.log(req.params.image)
    var ExifImage = require('exif').ExifImage;
    try {
        new ExifImage({
            image: "./uploads/" + req.params.image
        }, function (error, exifData) {
            if (error) {
                res.end()
                console.log('Error 1: ' + error.message);
            } else {
                res.json(exifData)
                console.log(exifData); // Do something with your data!
            }
        });
    } catch (error) {
        console.log('Error 2: ' + error.message);
    }
});

app.post('/upload', function (req, res) {
    slno = 0
    loadPage()
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