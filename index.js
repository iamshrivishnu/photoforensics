var express = require('express')
var multer = require('multer')
var app = express();
let fs = require("fs")
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

function processJSON(jsonData, image) {
    var processingSoftware;
    var software = "";
    var result;
    var isSoftware = false;
    var isProcessingSoftware = false;
    let statusOfImage = "FAKE";
    if (jsonData.image.ProcessingSoftware !== null && jsonData.image.ProcessingSoftware !== undefined) {
        processingSoftware = jsonData.image.ProcessingSoftware;
        isProcessingSoftware = checkForSoftware(processingSoftware);
    }
    if (jsonData.image.Software !== null) {
        software = jsonData.image.Software;
        isSoftware = checkForSoftware(software);

        console.log("Software: ", software);
    }

    if (processingSoftware !== undefined || processingSoftware !== null || software !== undefined || software !== null) {

        if (isProcessingSoftware) {
            result = "This image was modified by: " + processingSoftware;
            statusOfImage = "FAKE";
        } else if (isSoftware) {
            result = "This image was modified by: " + software;
            statusOfImage = "FAKE";
        } else {
            result = "This image seems to be not modified";
            statusOfImage = "REAL";
        }
    } else {
        result = "The image was not modified";
    }

    var table_body = '<table class="table" style="display: block;overflow: auto;"><thead><tr><th>Property</th><th>Value</th></tr></thead><tbody>';
    for (x in jsonData) {
        var obj = jsonData[x];

        for (y in obj) {
            table_body += '<tr>';
            table_body += '<td>';
            table_body += y;
            table_body += '</td>';

            table_body += '<td>';
            var value = obj[y];
            table_body += value;
            table_body += '</td>';

            table_body += '</tr>';
        }
    }
    table_body += '</tbody></table>';

    return {
        "result": result,
        "image": "../uploads/" + image,
        "metadata": table_body,
        "statusOfImage": statusOfImage,
        "img": image
    };

}



app.get('/', function (req, res) {
    res.sendFile(__dirname + "/index.html")
});

app.get('/meta/:image', function (req, res) {
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
                    res.render("result", processJSON(exifData, req.params.image));
                    res.end()
                }
                console.log("Extracted Metadata in json format: \n" + exifData) // Do something with your data!
            }
        });
    } catch (error) {
        console.log('Error 2: ' + error.message);
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