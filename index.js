const converter = require('./src/converter');
const path = require('path');
const download = require('download');

const sqlite = require('sqlite');
const fs = require('fs')
const { promisify } = require('util')
const writefile = promisify(fs.writeFile)
const mkdir = promisify(fs.mkdir);

const bdpm_folder = 'bdpm';
const dbPromise = sqlite.open(`./${bdpm_folder}/bdpm.sqlite`);
const creation_sql_file = path.join(bdpm_folder, 'bdpm.sql');

const files = {
	'CIS_bdpm': {
		name: 'Fichier des spécialités',
		description: 'Il contient la liste des médicaments commercialisés ou en arrêt de commercialisation depuis moins de trois ans',
		headers: [
			{ name: 'cis', type: 'string', pattern: /^\d{8}$/ },
			'nom',
			'formePharma',
			{ name: 'voiesAdministration', type: 'array', sep: ';' },
			'statutAMM',
			'typeAMM',
			'etatCommercialisation',
			{ name: 'dateAMM', type: 'date', toFormat: 'DD/MM/YYYY', format: 'DD/MM/YYYY' },
			'statutBDM',
			'numAutorisation',
			{ name: 'titulaires', type: 'array', sep: ';' },
			{ name: 'surveillance', type: 'bool', deserializer: e => e === 'Oui' }
		]
	},
	'CIS': {
		name: "Fichier des spécialités + code de document",
		description: "Fichier contenant toutes les spécialités du Répertoire des Spécialités Pharmaceutiques. Les champs d'information sont le code CIS, la dénomination de la spécialité pharmaceutique, la forme pharmaceutique, la ou les voies d'administration, le statut de l'AMM, le type de la procédure d'autorisation, l'état de commercialisation tel que déclaré par le titulaire de l'AMM et le code de document (RCP/Notice).",
		headers: [
			{ name: 'cis', type: 'string', pattern: /^\d{8}$/ },
			'nom',
			'formePharma',
			{ name: 'voiesAdministration', type: 'array', sep: ';' },
			'statutAMM',
			'typeAMM',
			'etatCommercialisation',
			'codeDocument'
		],
		url: 'http://agence-prd.ansm.sante.fr/php/ecodex/telecharger/lirecis.php'
	},
	'CIS_CIP_bdpm': {
		name: 'Fichier des présentations',
		description: 'Il contient la liste des présentations (boîtes de médicaments) disponibles pour les médicaments présents dans le fichier décrit dans le paragraphe 3.1.',
		headers: [
			{ name: 'cis', type: 'string', pattern: /^\d{8}$/ },
			{ name: 'cip7', type: 'string', pattern: /^\d{7}$/ },
			'libelle',
			'statutAdministratif',
			'etatCommercialisation',
			{ name: 'dateDeclaration', type: 'date', toFormat: 'DD/MM/YYYY', format: 'DD/MM/YYYY' },
			{ name: 'cip13', type: 'string', pattern: /^\d{13}$/ },
			'agrementCollectivites',
			{ name: 'tauxRemboursement', type: 'array', sep: ';' },
			{ name: 'prix', type: 'float' },
			{ name: 'indicationsRemboursement', type: 'float' }
		]
	},
	'CIS_COMPO_bdpm': {
		name: 'Fichier des compositions',
		description: 'Il contient la composition qualitative et quantitative en substances actives et fractions thérapeutiques (telle que figurant dans le Résumé des Caractéristiques du Produit) des médicaments de la BDPM.',
		headers: [
			{ name: 'cis', type: 'string', pattern: /^\d{8}$/ },
			'designation',
			{ name: 'codeSubstance', type: 'int' },
			'nomSubstance',
			'dosageSubstance',
			'refDosage',
			{ name: 'nature', type: 'enum', vals: ['SA', 'FT'] },
			{ name: 'numLisaison', type: 'int' }
		]
	},
	'CIS_HAS_SMR_bdpm': {
		name: 'Fichier des avis SMR de la HAS',
		description: 'Il contient l\'ensemble des avis de SMR de la HAS postérieurs à l\'année 2002.',
		headers: [
			{ name: 'cis', type: 'string', pattern: /^\d{8}$/ },
			{ name: 'codeHAS', type: 'string', pattern: /^CT-\d+$/ },
			'motifEval',
			{ name: 'dateAvisCT', type: 'date', toFormat: 'DD/MM/YYYY', format: 'YYYYMMDD' },
			'valeurSMR',
			'libelleSMR'
		]
	},
	'CIS_HAS_ASMR_bdpm': {
		name: 'Fichier des avis ASMR de la HAS',
		description: 'Il contient l\'ensemble des avis d\'ASMR de la HAS postérieurs à l\'année 2002.',
		headers: [
			{ name: 'cis', type: 'string', pattern: /^\d{8}$/ },
			{ name: 'codeHAS', type: 'string', pattern: /^CT-\d+$/ },
			'motifEval',
			{ name: 'dateAvisCT', type: 'date', toFormat: 'DD/MM/YYYY', format: 'YYYYMMDD' },
			'valeurASMR',
			'libelleASMR',
		]
	},
	'HAS_LiensPageCT_bdpm': {
		name: 'Fichier des liens vers les avis de la commission de la transparence (CT) de la HAS',
		description: 'Il contient l\'ensemble des liens permettant d\'accéder aux avis complets de la commission de la transparence pour les SMR et ASMR postérieurs à l\'année 2002.',
		headers: [
			{ name: 'codeHAS', type: 'string', pattern: /^CT-\d+$/ },
			'lienAvisCT'
		]
	},
	'CIS_GENER_bdpm': {
		name: 'Fichier des groupe génériques',
		description: 'Il contient l\'ensemble groupes génériques, avec les médicaments en faisant partie.',
		headers: [
			{ name: 'idGroupeGen', type: 'int' },
			'libelleGroupeGen',
			{ name: 'cis', type: 'string', pattern: /^\d{8}$/ },
			{ name: 'typeGen', type: 'int', vals: [0, 1, 2, 4] },
			{ name: 'codeTri', type: 'int' },
		]
	},
	'CIS_CPD_bdpm': {
		name: 'Fichier des conditions de prescription et de délivrance',
		description: 'Il contient l\'ensemble des conditions de prescription et de délivrance associées à un médicament.',
		headers: [
			{ name: 'CIS', type: 'string', pattern: /^\d{8}$/ },
			'conditions'
		]
	},
	'CIS_InfoImportantes_20180112182048_bdpm': {
		name: 'Fichier des informations importantes',
		description: 'On ajoute la date de génération au nom de ce fichier car, contrairement aux autres fichiers, celui-ci est généré en direct. Il contient l\'ensemble des informations importantes disponibles pour les médicaments de la base de données publique des médicaments. ',
		headers: [
			{ name: 'cis', type: 'string', pattern: /^\d{8}$/ },
			{ name: 'dateDebutInfo', type: 'date', toFormat: 'DD/MM/YYYY', format: 'DD/MM/YYYY' },
			{ name: 'dateFinInfo', type: 'date', toFormat: 'DD/MM/YYYY', format: 'DD/MM/YYYY' },
			'texteHTML'
		]
	}
}

const creation_script = `
	BEGIN;
	DROP TABLE IF EXISTS CIS_bdpm;
	CREATE TABLE CIS_bdpm (
		cis TEXT PRIMARY KEY, 
		nom TEXT,
		formePharma TEXT,
		statutAMM TEXT,
		typeAMM TEXT,
		etatCommercialisation TEXT,
		dateAMM TEXT,
		statutBDM TEXT,
		numAutorisation TEXT,
		surveillance INTEGER,
		codeDocument TEXT
	);
	CREATE INDEX CIS_bdpm_numAutorisation ON CIS_bdpm (numAutorisation);

	DROP TABLE IF EXISTS CIS_CIP_bdpm;
	CREATE TABLE CIS_CIP_bdpm (
		cis TEXT,
		cip7 TEXT,
		cip13 TEXT PRIMARY KEY,
		libelle TEXT,
		statutAdministratif TEXT,
		etatCommercialisation TEXT,
		dateDeclaration TEXT,
		agrementCollectivites TEXT,
		prix FLOAT,
		indicationsRemboursement FLOAT
	);
	CREATE INDEX CIS_CIP_bdpm_cis ON CIS_CIP_bdpm (cis);
	CREATE INDEX CIS_CIP_bdpm_cip7 ON CIS_CIP_bdpm (cip7);

	DROP TABLE IF EXISTS CIS_COMPO_bdpm;
	CREATE TABLE CIS_COMPO_bdpm (
		id INTEGER PRIMARY KEY,
		cis TEXT,
		designation TEXT,
		codeSubstance INTEGER,
		nomSubstance TEXT,
		dosageSubstance TEXT,
		refDosage TEXT,
		nature TEXT,
		numLiaison INTEGER
	);
	CREATE INDEX CIS_COMPO_bdpm_cis_codeSubstance_numLiaison ON CIS_COMPO_bdpm (cis, codeSubstance, numLiaison);

	DROP TABLE IF EXISTS CIS_HAS_SMR_bdpm;
	CREATE TABLE CIS_HAS_SMR_bdpm (
		id INTEGER PRIMARY KEY,
		cis TEXT,
		codeHAS TEXT,
		motifEval TEXT,
		dateAvisCT TEXT,
		valeurSMR TEXT,
		libelleSMR TEXT
	);
	CREATE INDEX CIS_HAS_SMR_bdpm_cis_has_date ON CIS_HAS_SMR_bdpm (cis, codeHAS, dateAvisCT);

	DROP TABLE IF EXISTS CIS_HAS_ASMR_bdpm;
	CREATE TABLE CIS_HAS_ASMR_bdpm (
		id INTEGER PRIMARY KEY,
		cis TEXT,
		codeHAS TEXT,
		motifEval TEXT,
		dateAvisCT TEXT,
		valeurASMR TEXT,
		libelleASMR TEXT
	);
	CREATE INDEX CIS_HAS_ASMR_bdpm_cis_has_date ON CIS_HAS_ASMR_bdpm (cis, codeHAS, dateAvisCT);

	DROP TABLE IF EXISTS HAS_LiensPageCT_bdpm;
	CREATE TABLE HAS_LiensPageCT_bdpm (
		codeHAS TEXT PRIMARY KEY,
		lienAvisCT TEXT
	);
	DROP TABLE IF EXISTS CIS_GENER_bdpm;
	CREATE TABLE CIS_GENER_bdpm (
		id INTEGER,
		libelle TEXT,
		cis TEXT,
		typeGen INTEGER,
		codeTri INTEGER,
		PRIMARY KEY (id, cis)
	);
	CREATE INDEX CIS_GENER_bdpm_codeTri ON CIS_GENER_bdpm (codeTri);

	DROP TABLE IF EXISTS CIS_CPD_bdpm;
	CREATE TABLE CIS_CPD_bdpm (
		cis TEXT PRIMARY KEY,
		conditions TEXT
	);
	COMMIT;
`
const json_formats = [
	{
		file: 'CIS_bdpm',
		fields: [
			'cis',
			'nom',
			'formePharma',
			'statutAMM',
			'typeAMM',
			'etatCommercialisation',
			'dateAMM',
			'statutBDM',
			'numAutorisation',
			'surveillance'
		],
	}, {
		file: 'CIS_CIP_bdpm',
		fields: [
			'cis',
			'cip7',
			'cip13',
			'libelle',
			'statutAdministratif',
			'etatCommercialisation',
			'dateDeclaration',
			'agrementCollectivites',
			'prix',
			'indicationsRemboursement'
		],
	},
	{
		file: 'CIS_COMPO_bdpm',
		fields: [
			'cis',
			'designation',
			'codeSubstance',
			'nomSubstance',
			'dosageSubstance',
			'refDosage',
			'nature',
			'numLiaison'
		]
	}, {
		file: 'CIS_HAS_SMR_bdpm',
		fields: [
			'cis',
			'codeHAS',
			'motifEval',
			'dateAvisCT',
			'valeurSMR',
			'libelleSMR',
		]
	}, {
		file: 'CIS_HAS_ASMR_bdpm',
		fields: [
			'cis',
			'codeHAS',
			'motifEval',
			'dateAvisCT',
			'valeurASMR',
			'libelleASMR',
		]
	}, {
		file: 'HAS_LiensPageCT_bdpm',
		fields: [
			'codeHAS',
			'lienAvisCT'
		]
	}, {
		file: 'CIS_GENER_bdpm',
		fields: [
			'id',
			'libelle',
			'cis',
			'typeGen',
			'codeTri',
		]
	}, {
		file: 'CIS_CPD_bdpm',
		fields: [
			'cis',
			'conditions'
		]
	}, {
		file: 'CIS',
		update: 'CIS_bdpm',
		query: 'UPDATE CIS_bdpm SET codeDocument = ? WHERE cis = ?;',
		condition: doc => doc.codeDocument
	}
]
async function main() {
	try {
		try {
			await mkdir(path.join(__dirname, bdpm_folder));
		} catch (e) {
			if (e.code !== 'EEXIST') throw e;
		}
		const p = json_formats
			.map(async a => {
				console.log(`Downloading ${a.file} ...`)
				const url = files[a.file].url || `http://base-donnees-publique.medicaments.gouv.fr/telechargement.php?fichier=${a.file}.txt`;
				await download(url, path.join(__dirname, bdpm_folder), { filename: a.file + '.txt' });
				return a;
			})
			.map(async p => {
				const { file, req, fields, update, query, condition } = await p;
				console.log(`Parsing ${file} ...`);
				const filename = path.join(__dirname, bdpm_folder, file + '.txt');
				try {
					const res = await converter(filename, files[file].headers, doc => {
						if (update && query && (!condition || condition(doc))) {
							return query.replace(/(([^ ]+) *= *)\?/g, (substr, ...vals) => {
								return vals[0] + mapValue(vals[1]);
							})
						}
						else if (!fields) return null;
						const vals = [];
						return `INSERT INTO ${file} (${fields.join(',')}) VALUES (${fields.map(mapValue).join(',')});`;


						function mapValue(h) {
							let v = doc[h];
							if (typeof v === "object")
								v = v.toISOString();
							else if (typeof v === 'boolean')
								v = v ? 1 : 0;
							if (!v) return 'NULL';
							else if (typeof v === 'string') return `'${v.replace(/'/g, '\'\'')}'`;
							else return v
						}
					});
					return res;
				} catch (e) {
					console.error(`Erreur sur le fichier ${file} (${files[file].name}): `, e);
				}
			});

		const sql = creation_script + '\n' + (await Promise.all(p)).join('\n');
		await writefile(creation_sql_file, sql);

		console.log(`Creating database ...`)
		const db = await dbPromise;
		await db.exec(sql);
	} catch (e) {
		console.error(e);
	}
}
main()