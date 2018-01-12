const iconv = require('iconv-lite');
const moment = require('moment')

const readline = require('readline');
const fs = require('fs');



function parseLine(line) {
	return line.trim().replace(/\u0092/g, '\'').split('\t');
}

function createRowObject(headers, values) {
	const rowObject = {};

	headers.forEach((header, index) => {
		if (typeof header === 'string')
			rowObject[header] = values[index];
		else {
			let val;
			if (header.map) val = header.map(values[index]);
			else {
				try {
					switch (header.type) {
						case 'string':
							val = values[index];
							if (val && header.pattern && !values[index].match(header.pattern))
								throw new Error(`[${header.name}] String ${val} doesn\'t match pattern ${header.pattern}`);
							else if (val) val = val.trim();
							break;
						case 'array':
							const sep = header.sep || ';';
							val = values[index] && values[index].split(sep);
							break;
						case 'date':
							val = moment(values[index], header.format);
							break;
						case 'bool':
							val = values[index] === 'true';
							break;
						case 'float':
							val = parseFloat(values[index]);
							break;
						case 'int':
							val = parseInt(values[index], 10);
							break;
						case 'enum':
							val = values[index];
							if (val && header.vals && header.vals.indexOf(val) === -1)
								throw new Error(`Non matching value ${val} from enum ${header.vals}`)
							break;
						default:
							throw new Error('Unknown type ' + header.type);
					}
				} catch (e) {
					console.error(e);
				}
			}
			rowObject[header.name] = val;
		}
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