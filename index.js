const converter = require('./src/converter');
const path = require('path');


const files = {
	'CIS_bdpm': {
		name: 'Fichier des spécialités',
		description: 'Il contient la liste des médicaments commercialisés ou en arrêt de commercialisation depuis moins de trois ans',
		headers: [
			'CIS',
			'nom',
			'formePharma',
			'voieAdministration',
			'statutAMM',
			'typeAMM',
			'etatCommercialisation',
			'dateAMM',
			'statusBDM',
			'numAutorisation',
			'titulaires',
			'surveillance'
		]
	},
	'CIS_CIP_bdpm': {
		name: 'Fichier des présentations',
		description: 'Il contient la liste des présentations (boîtes de médicaments) disponibles pour les médicaments présents dans le fichier décrit dans le paragraphe 3.1.',
		headers: [
			'CIS',
			'CIP7',
			'libelle',
			'statutAdministratif',
			'etatCommercialisation',
			'dateDeclarationCom',
			'CIP13',
			'agrementCollectivites',
			'tauxRemboursement',
			'prix',
			'indicationsRemboursement'
		]
	},
	'CIS_COMPO_bdpm': {
		name: 'Fichier des compositions',
		description: 'Il contient la composition qualitative et quantitative en substances actives et fractions thérapeutiques (telle que figurant dans le Résumé des Caractéristiques du Produit) des médicaments de la BDPM.',
		headers: [
			'CIS',
			'designation',
			'codeSubstance',
			'nomSubstance',
			'dosageSubstance',
			'refDosage',
			'nature',
			'numLisaison'
		]
	},
	'CIS_HAS_SMR_bdpm': {
		name: 'Fichier des avis SMR de la HAS',
		description: 'Il contient l\'ensemble des avis de SMR de la HAS postérieurs à l\'année 2002.',
		headers: [
			'CIS',
			'codeHAS',
			'motifEval',
			'dateAvisCT',
			'valeurSMR',
			'libelleSMR'
		]
	},
	'CIS_HAS_ASMR_bdpm': {
		name: 'Fichier des avis ASMR de la HAS',
		description: 'Il contient l\'ensemble des avis d\'ASMR de la HAS postérieurs à l\'année 2002.',
		headers: [
			'CIS',
			'codesHAS',
			'motifEval',
			'dateAvisCT',
			'valeurASMR',
			'libelleASMR',
		]
	},
	'HAS_LiensPageCT_bdpm': {
		name: 'Fichier des liens vers les avis de la commission de la transparence (CT) de la HAS',
		description: 'Il contient l\'ensemble des liens permettant d\'accéder aux avis complets de la commission de la transparence pour les SMR et ASMR postérieurs à l\'année 2002.',
		headers: [
			'codeHAS',
			'lienAvisCT'
		]
	},
	'CIS_GENER_bdpm': {
		name: 'Fichier des groupe génériques',
		description: 'Il contient l\'ensemble groupes génériques, avec les médicaments en faisant partie.',
		headers: [
			'idGroupeGen',
			'libelleGroupeGen',
			'CIS',
			'typeGen',
			'codeTri'
		]
	},
	'CIS_CPD_bdpm': {
		name: 'Fichier des conditions de prescription et de délivrance',
		description: 'Il contient l\'ensemble des conditions de prescription et de délivrance associées à un médicament.',
		headers: [
			'CIS',
			'conditions'
		]
	},
	'CIS_InfoImportantes_20180112182048_bdpm': {
		name: 'Fichier des informations importantes',
		description: 'On ajoute la date de génération au nom de ce fichier car, contrairement aux autres fichiers, celui-ci est généré en direct. Il contient l\'ensemble des informations importantes disponibles pour les médicaments de la base de données publique des médicaments. ',
		headers: [
			'CIS',
			'dateDebutInfo',
			'dateFinInfo',
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