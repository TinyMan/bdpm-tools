const converter = require('./src/converter');
const path = require('path');


const files = {
	'CIS_bdpm': {
		name: 'Fichier des spécialités',
		description: 'Il contient la liste des médicaments commercialisés ou en arrêt de commercialisation depuis moins de trois ans',
		headers: [
			{ name: 'CIS', type: 'string', pattern: /^\d{8}$/ },
			'nom',
			'formePharma',
			{ name: 'voiesAdministration', type: 'array', sep: ';' },
			'statutAMM',
			'typeAMM',
			'etatCommercialisation',
			{ name: 'dateAMM', type: 'date', format: 'DD/MM/YYYY' },
			'statusBDM',
			'numAutorisation',
			{ name: 'titulaires', type: 'array', sep: ';' },
			{ name: 'surveillance', type: 'bool', deserializer: e => e === 'Oui' }
		]
	},
	'CIS_CIP_bdpm': {
		name: 'Fichier des présentations',
		description: 'Il contient la liste des présentations (boîtes de médicaments) disponibles pour les médicaments présents dans le fichier décrit dans le paragraphe 3.1.',
		headers: [
			{ name: 'CIS', type: 'string', pattern: /^\d{8}$/ },
			{ name: 'CIP7', type: 'string', pattern: /^\d{7}$/ },
			'libelle',
			'statutAdministratif',
			'etatCommercialisation',
			{ name: 'dateDeclarationCom', type: 'date', format: 'DD/MM/YYYY' },
			{ name: 'CIP13', type: 'string', pattern: /^\d{13}$/ },
			'agrementCollectivites',
			{ name: 'tauxRemboursement', type: 'array', sep: ';' },
			{ name: 'prix', type: 'float' },
			'indicationsRemboursement'
		]
	},
	'CIS_COMPO_bdpm': {
		name: 'Fichier des compositions',
		description: 'Il contient la composition qualitative et quantitative en substances actives et fractions thérapeutiques (telle que figurant dans le Résumé des Caractéristiques du Produit) des médicaments de la BDPM.',
		headers: [
			{ name: 'CIS', type: 'string', pattern: /^\d{8}$/ },
			'designation',
			{ name: 'codeSubstance', type: 'int' },
			'nomSubstance',
			'dosageSubstance',
			'refDosage',
			{ name: 'nature', type: 'enum', vals: ['SA', 'ST', 'FT'] },
			{ name: 'numLisaison', type: 'int' }
		]
	},
	'CIS_HAS_SMR_bdpm': {
		name: 'Fichier des avis SMR de la HAS',
		description: 'Il contient l\'ensemble des avis de SMR de la HAS postérieurs à l\'année 2002.',
		headers: [
			{ name: 'CIS', type: 'string', pattern: /^\d{8}$/ },
			{ name: 'codeHAS', type: 'string', pattern: /^CT-\d+$/ },
			'motifEval',
			{ name: 'dateAvisCT', type: 'date', format: 'YYYYMMDD' },
			'valeurSMR',
			'libelleSMR'
		]
	},
	'CIS_HAS_ASMR_bdpm': {
		name: 'Fichier des avis ASMR de la HAS',
		description: 'Il contient l\'ensemble des avis d\'ASMR de la HAS postérieurs à l\'année 2002.',
		headers: [
			{ name: 'CIS', type: 'string', pattern: /^\d{8}$/ },
			{ name: 'codeHAS', type: 'string', pattern: /^CT-\d+$/ },
			'motifEval',
			{ name: 'dateAvisCT', type: 'date', format: 'YYYYMMDD' },
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
			{ name: 'CIS', type: 'string', pattern: /^\d{8}$/ },
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
			{ name: 'CIS', type: 'string', pattern: /^\d{8}$/ },
			{ name: 'dateDebutInfo', type: 'date', format: 'DD/MM/YYYY' },
			{ name: 'dateFinInfo', type: 'date', format: 'DD/MM/YYYY' },
			'texteHTML'
		]
	}
}

Object.keys(files).forEach(async file => {
	const filename = path.join(__dirname, 'bdpm', file + '.txt');
	try {
		const json = await converter(filename, files[file].headers, true);
	} catch (e) {
		console.error(`Erreur sur le fichier ${file} (${fichiers[file].name}): `, error);
	}
})