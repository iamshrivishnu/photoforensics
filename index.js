var express = require('express')
var multer = require('multer')
var app = express();
let fs = require("fs")
let slno = 0

app.use("/css", express.static(__dirname + '/css'));
app.use("/js", express.static(__dirname + '/js'));
app.use("/images", express.static(__dirname + '/images'));


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
                    res.write(stringify(exifData, null, 3))
                    res.end()
                }
                console.log(exifData) // Do something with your data!
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
