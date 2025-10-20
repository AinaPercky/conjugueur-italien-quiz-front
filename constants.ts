export const VERB_CATEGORIES = {
    'Verbes auxiliaires': ['essere', 'avere'],
    'Verbes réguliers en -are': ['parlare', 'mangiare', 'guardare', 'trovare'],
    'Verbes réguliers en -ere': ['credere', 'vedere', 'leggere', 'scrivere'],
    'Verbes réguliers en -ire': ['dormire', 'sentire', 'partire', 'finire'],
    'Verbes irréguliers': ['andare', 'fare', 'dire', 'potere', 'volere', 'sapere', 'stare', 'dare', 'venire', 'uscire'],
};

export const MODES = [
    'Indicativo',
    'Congiuntivo',
    'Condizionale',
    'Imperativo'
];

export const TENSES_BY_MOOD: Record<string, string[]> = {
    'Indicativo': [
        'Presente',
        'Passato prossimo',
        'Imperfetto',
        'Trapassato prossimo',
        'Passato remoto',
        'Trapassato remoto',
        'Futuro semplice',
        'Futuro anteriore',
    ],
    'Congiuntivo': [
        'Presente',
        'Passato',
        'Imperfetto',
        'Trapassato',
    ],
    'Condizionale': [
        'Presente',
        'Passato',
    ],
    'Imperativo': [
        'Presente',
    ],
};

// A flat list of all unique tenses for the "All Tenses" filter option
export const TENSES = [...new Set(Object.values(TENSES_BY_MOOD).flat())];