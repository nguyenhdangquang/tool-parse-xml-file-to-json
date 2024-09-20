const xmlToJson = require('xml-to-json-stream');
const parser = xmlToJson({ atributeMode: false });
const fs = require('fs');

const keys = ['HEADER', 'CHARACTERISTICS', 'PARTNERS', 'STATUSES', 'MEASUREPOINT'];
const readSingleFile = (file) => {
  return new Promise((res, rej) => {
    fs.readFile(file, (errFile, bufData) => {
      if (errFile) rej('fail to read: ', file);
      const xml = bufData.toString();
      parser.xmlToJson(xml, (er, dataJson) => {
        if (er) throw er;
        const jsonTrueValue = dataJson['ns0:MT_EQUIPMENT'];
        const storageData = {};
        for (const key of Object.keys(jsonTrueValue)) {
          if (keys.includes(key)) {
            Object.assign(storageData, { [key]: jsonTrueValue[key] });
          }
        }
        return res(storageData);
      });
    });
  });
};

fs.readdir('./Equipment/', (err, files) => {
  if (err) throw err;
  const filesInDir = [];
  for (const file of files) {
    filesInDir.push(readSingleFile(`./Equipment/${file}`));
  }
  Promise.all(filesInDir).then((values) => {
    fs.writeFile('./equipments.ts', JSON.stringify(values), (err) => {
      if (err) console.log('error writing file: ', err);
      console.log('sucessfully!');
    });
  });
});
