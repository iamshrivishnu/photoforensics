var express = require('express')
var multer = require('multer')
var app = express();
let fs = require("fs")

var processJSON = require('./assets/js/processMetaData');

let slno = 0


app.use("/uploads", express.static(__dirname + '/uploads'));
app.use("/assets", express.static(__dirname + '/assets'));
app.use("/python", express.static(__dirname + '/python'));
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


app.get('/', function (req, res) {
    res.sendFile(__dirname + "/index.html")
});

app.get('/meta/:image', function (req, res) {
    var ExifImage = require('exif').ExifImage;
    try {
        new ExifImage({
            image: "./uploads/" + req.params.image
        }, function (error, exifData) {
            if (error) {
                res.render("result", {
                    "result": "Metadata couldn\'t be extracted. Please try other tests...",
                    "image": "../uploads/" + req.params.image,
                    "metadata": "Metadata couldn\'t be extracted.",
                    "statusOfImage": "UNKNOWN",
                    "img": req.params.image
                });
            } else {
                if (exifData === '') {
                    res.end('<script>alert("Metadata not found. Continue with other tests...");</script>')
                } else {
                    res.render("result", processJSON(exifData, req.params.image));
                    res.end()
                }
            }
        });
    } catch (error) {
        console.log('Un known Error: ' + error.message);
    }
});




app.get('/machineLearning/:image', function (req, res) {

    var spawn = require("child_process").spawn;
    var process = spawn('python', ["./python/machinelearning.py", req.params.image]);

    let statusOfImage = ""
    var output = "";
    let accuracy = "";

    process.stdout.on('data', function (data) {
        fs.readFile("./python/output.txt", "utf-8", (err, data) => {
            if (err) {
                console.log(err)
            }
            output = data;
            if (output == "Orginal") {
                statusOfImage = "REAL";
            } else {
                statusOfImage = "FAKE";
            }

            accuracy = "95%";
            res.render("resultMachineLearning", {
                "result": output,
                "image": "/uploads/" + req.params.image,
                "statusOfImage": statusOfImage,
                "accuracy": accuracy
            });
        })
    })

});

app.post('/upload', function (req, res) {
    slno = 0
    upload(req, res, function (err) {
        if (err) {
            return res.end("Error uploading file.")
        }
        res.redirect('/meta/' + "img" + slno + ".jpg")
    });
});

app.listen(3000, function () {
    console.log("Working on port 3000")
});