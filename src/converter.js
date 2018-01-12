const iconv = require('iconv-lite');

const readline = require('readline');
const fs = require('fs');



function parseLine(line) {
	return line.trim().replace(/\u0092/g, '\'').split('\t');
}

function createRowObject(headers, values) {
	const rowObject = {};

	headers.forEach((value, index) => {
		rowObject[value] = values[index];
	});

	return rowObject;
}

module.exports = async function (file_name, headers, write) {
	return new Promise((res, rej) => {

		const json = [];
		const lineReader = readline.createInterface({
			input: fs.createReadStream(file_name).pipe(iconv.decodeStream('binary'))
		});

		lineReader.on('line', function (line) {
			json.push(createRowObject(headers, parseLine(line)));
		});

		lineReader.on('close', () => {
			if (write) {
				fs.writeFile(file_name + '.json', JSON.stringify(json, null, 2), err => {
					if (err) rej(err)
					else res(true);
				});
			} else {
				res(json)
			}
		});
		lineReader.on('error', e => rej(e));

	});
}