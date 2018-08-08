const CryptoJS = require('crypto-js');
const fs = require('fs');
const path = require('path');
const crypto = require("crypto");
const request = require('request');

const accessToken = '8d68b54a0ddd86a47fc2baf6cc40c289f296a009';
// const host = 'tdm990101.fritz.box';
const host = 'localhost';

function randomString() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function buildOptionsForRequest(method, protocol, host, port, path, qs) {

    return {
        method: method,
        url: protocol + '://' + host + ':' + port + path,
        qs: qs,
        json: true,
        headers: {
            'Content-Type': 'application/json'
        }
    }
}


function convertWordArrayToUint8Array(wordArray) {
    var len = wordArray.words.length,
        u8_array = new Uint8Array(len << 2),
        offset = 0, word, i
    ;
    for (i = 0; i < len; i++) {
        word = wordArray.words[i];
        u8_array[offset++] = word >> 24;
        u8_array[offset++] = (word >> 16) & 0xff;
        u8_array[offset++] = (word >> 8) & 0xff;
        u8_array[offset++] = word & 0xff;
    }
    return u8_array;
}

function saveObject(accessToken, objectData, callback) {

    const options = buildOptionsForRequest(
        'POST',
        'HTTP',
        host,
        '3002',
        '/technologydata',
        {}
    );
    options.headers.authorization = 'Bearer ' + accessToken;

    options.body = objectData;

    request(options, function (e, r, jsonData) {
        let objectId = null;

        console.log(jsonData);

        if (r.headers['location']) {
            objectId = r.headers['location'].substr(r.headers['location'].lastIndexOf('/') + 1)
        }

        callback(e, objectId);
    });
}

function encryptAndUpload() {
    try {
        const dataPath = 'model.gcode';
        const data = fs.readFileSync(dataPath, 'utf8');

        // generate random key with 256 bit length
        const aesKey = CryptoJS.lib.WordArray.random(256 / 8);
        // generate random IV with 128 bit length
        const iv = CryptoJS.lib.WordArray.random(128 / 8);

        // encrypt data using AES with generated key, vi and CBC mode
        const encryptedData = CryptoJS.AES.encrypt(data, aesKey, {
            iv: iv,
            mode: CryptoJS.mode.CBC
        });

        // convert aes key into binary data
        const passwordBuffer = new Buffer(convertWordArrayToUint8Array(aesKey));

        // read public key from file
        const publicKeyPath = path.resolve('ultimaker.pub');
        const publicKey = fs.readFileSync(publicKeyPath, 'utf8');

        // encrypt aes key using rsa with the public key
        const encryptedKey = crypto.publicEncrypt({
            key: publicKey,
            padding: crypto.constants.RSA_PKCS1_PADDING
        }, passwordBuffer);


        // bundle the encrypted key, iv and encrypted data
        const bundle = Buffer.concat([
            encryptedKey,
            new Buffer(convertWordArrayToUint8Array(iv))]);


        const coreData = {};

        coreData.technologyDataName = randomString();
        coreData.technologyData = bundle.toString('base64');
        coreData.technologyDataDescription = randomString();
        coreData.technologyUUID = 'adb4c297-45bd-437e-ac90-2aed14f6b882';
        coreData.licenseFee = 10000;
        coreData.componentList = ["adb4c297-45bd-437e-ac90-a33d0f24de7e", "5df7afa6-48bd-4c19-b314-839fe9f08f1f"];
        coreData.backgroundColor = '#FFFFFF';
        coreData.image = undefined;
        coreData.isFile = true;

        saveObject(accessToken, coreData, (err, uuid) => {
            console.log(err);
            console.log(uuid);

            if (uuid) {
                const encryptedGCodePath = path.resolve(uuid);
                const encryptedBuffer = new Buffer(convertWordArrayToUint8Array(encryptedData.ciphertext));

                uploadFile(uuid, encryptedBuffer);

                fs.writeFileSync(encryptedGCodePath, encryptedBuffer);
            }
        });
    }
    catch (err) {
        console.log(err);

        throw  err;
    }
}

function uploadFile(uuid, fileBuffer) {
    const options = buildOptionsForRequest(
        'POST',
        'HTTP',
        host,
        '3002',
        `/technologydata/${uuid}/content`,
        {}
    );
    options.headers.authorization = 'Bearer ' + accessToken;

    options.formData = {
        file: {
            value: fileBuffer,
            options: {
                filename: `${uuid}.gz`,
                contentType: 'application/x-gzip'
            }
        }
    };

    request(options, function optionalCallback(err, httpResponse, body) {
        if (err) {
            return console.error('upload failed:', err);
        }
        console.log('Upload successful!  Server responded with:', body);

        getData(uuid);

    });
}

function getData(uuid) {
    const options = buildOptionsForRequest(
        'GET',
        'HTTP',
        host,
        '3002',
        `/technologydata/${uuid}`,
        {}
    );
    options.headers.authorization = 'Bearer ' + accessToken;

    request(options, function (e, r, jsonData) {
        console.log(jsonData);
    });
}

function bundle() {
    const b64string = 'STzlW38sM7sZa67qVbNsxGZ9xsb76lPpEIsSQZRC/6iKkyr35pmrGXsWzLRTp1qx2Rw0nDUeERGDoXm/pGVuGcjGrMbSSpKkiNYstZtS2FEwbKFoMSKeVJVDJIcbAX/EtxcXWOb3Z5iV89iHPrzu0Vz4tfAM9OGT1u/8gZOaJ86dvJLV/GHRKADVQp9s2gVWywPmy11nok1wN7+2Jwg7a4t3b0qfA8EBE8qenLzbtHVNa1vTipq6gkrcsf/JMUNUVqUNHMdpzcAElgOcL4XJq5O1ezT2UAV7z1qM/50fI8TZ9Ww4mGRvsiMhBVxvagH7eDXN4W9nkhUQ1pl6D+iwwVW/RgOmO9+wZYiGeDyYZoolDP7L3fjImcwSmdtSmCI7B+jNfUMyGfEyXAKQEOpZYnjVCr3p8fT2UknrGNSQD8Ul1cgXY2EZFa23xAb7+yL/8MFQXmwNE8cHhLW2o/dw76EYE0ZHS3LVJFfNYyWlUD6L2zowrTSn2iv9I9Wcr/7VYBbOyu+3IGsF2Z75AjOTAKSrAqraGGagyD8KKwaExBkyJtQrfbNe6YZdty6OZDrWFiR7tVq73cNbVRAtMkn3Wb9VAq9Sl672kVcI7febrjqVFWBswJkOoYKyVI0lpcQ1gp4Fwmta2nQOmbmDj0JKaMjhTTRXWHap1i+LfvEWMWIzSH+ngBzMdmBcwWiqBvRu';
    const productCode = 1077;
    const encryptedGCodePath = path.resolve('model.gcode.encrypted');

    const fileBuffer = fs.readFileSync(encryptedGCodePath);
    const wibuBuffer = Buffer.from(b64string, 'base64');
    const productCodeBuffer = Buffer.alloc(4);
    productCodeBuffer.writeUInt32LE(1072, 0);

    const bundle = Buffer.concat([
        productCodeBuffer,
        wibuBuffer,
        fileBuffer]);

    const bundlePath = path.resolve('bundle');
    fs.writeFileSync(bundlePath, bundle);

}


encryptAndUpload();
// bundle();
