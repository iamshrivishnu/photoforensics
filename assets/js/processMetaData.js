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

module.exports = processJSON;

