import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function addFlavorTextsTable() {
  try {
    // Créer la table flavor_texts
    await db.execute(`
      CREATE TABLE IF NOT EXISTS flavor_texts (
        id TEXT PRIMARY KEY,
        action_type TEXT NOT NULL,
        damage_type TEXT NOT NULL,
        result_type TEXT NOT NULL,
        description TEXT NOT NULL,
        created_at INTEGER DEFAULT (unixepoch())
      )
    `);

    console.log('✅ Table flavor_texts créée avec succès');

    // Insérer des exemples de descriptions
    const flavorTexts = [
      // Corps à Corps - Tranchant
      { actionType: 'CàC', damageType: 'Tranchant', resultType: 'Réussite', description: 'La lame mord profondément dans l\'épaule, une ligne rouge suit l\'acier.' },
      { actionType: 'CàC', damageType: 'Tranchant', resultType: 'Réussite', description: 'Ton {arme} trouve une faille et frappe {cible} avec une précision chirurgicale.' },
      { actionType: 'CàC', damageType: 'Tranchant', resultType: 'Réussite', description: 'L\'acier siffle dans l\'air et entaille la chair de {cible}.' },
      { actionType: 'CàC', damageType: 'Tranchant', resultType: 'Réussite', description: 'Un coup net - {cible} grimace alors que le sang commence à couler.' },
      { actionType: 'CàC', damageType: 'Tranchant', resultType: 'Réussite', description: 'Ton {arme} trace un arc écarlate, laissant une blessure béante.' },
      
      { actionType: 'CàC', damageType: 'Tranchant', resultType: 'Échec', description: 'L\'adversaire pare d\'un coup sec, le métal chante contre le métal.' },
      { actionType: 'CàC', damageType: 'Tranchant', resultType: 'Échec', description: '{Cible} esquive avec agilité, ton {arme} ne rencontre que le vide.' },
      { actionType: 'CàC', damageType: 'Tranchant', resultType: 'Échec', description: 'Ton pied glisse sur une pierre au moment crucial - l\'attaque passe à côté.' },
      { actionType: 'CàC', damageType: 'Tranchant', resultType: 'Échec', description: 'Il dévie ton coup avec un sourire méprisant.' },
      { actionType: 'CàC', damageType: 'Tranchant', resultType: 'Échec', description: 'Ton {arme} rebondit sur l\'armure épaisse sans causer de dommages.' },
      
      { actionType: 'CàC', damageType: 'Tranchant', resultType: 'Critique', description: 'La lame plonge dans un point vital - {cible} s\'effondre dans un cri d\'agonie !' },
      { actionType: 'CàC', damageType: 'Tranchant', resultType: 'Critique', description: 'Un coup parfait ! Ton {arme} traverse les défenses et laisse une blessure mortelle.' },
      { actionType: 'CàC', damageType: 'Tranchant', resultType: 'Critique', description: 'Le temps semble ralentir alors que ton {arme} trouve la gorge de {cible}.' },
      
      // Corps à Corps - Contondant
      { actionType: 'CàC', damageType: 'Contondant', resultType: 'Réussite', description: 'Le choc résonne - tu entends un craquement sinistre.' },
      { actionType: 'CàC', damageType: 'Contondant', resultType: 'Réussite', description: 'Ton {arme} percute le torse de {cible} qui chancelle sous l\'impact.' },
      { actionType: 'CàC', damageType: 'Contondant', resultType: 'Réussite', description: 'Un coup lourd et brutal qui fait reculer {cible} de plusieurs pas.' },
      { actionType: 'CàC', damageType: 'Contondant', resultType: 'Réussite', description: 'L\'impact résonne comme un coup de tonnerre - {cible} grimace de douleur.' },
      { actionType: 'CàC', damageType: 'Contondant', resultType: 'Réussite', description: 'Ton {arme} s\'écrase sur {cible}, laissant une marque sombre qui enflera.' },
      
      { actionType: 'CàC', damageType: 'Contondant', resultType: 'Échec', description: '{Cible} absorbe le coup sur son bouclier dans un clang métallique.' },
      { actionType: 'CàC', damageType: 'Contondant', resultType: 'Échec', description: 'Trop lent - {cible} s\'écarte et ton {arme} frappe le sol.' },
      { actionType: 'CàC', damageType: 'Contondant', resultType: 'Échec', description: 'Le coup manque de puissance, {cible} encaisse sans broncher.' },
      { actionType: 'CàC', damageType: 'Contondant', resultType: 'Échec', description: 'Ton {arme} rebondit sur l\'armure avec un bruit métallique futile.' },
      { actionType: 'CàC', damageType: 'Contondant', resultType: 'Échec', description: '{Cible} roule sur le côté - ton attaque ne touche que l\'air.' },
      
      { actionType: 'CàC', damageType: 'Contondant', resultType: 'Critique', description: 'Le crâne se fêle sous la force de l\'impact - {cible} tombe comme une marionnette.' },
      { actionType: 'CàC', damageType: 'Contondant', resultType: 'Critique', description: 'Un coup dévastateur qui brise os et armure dans un fracas horrible !' },
      { actionType: 'CàC', damageType: 'Contondant', resultType: 'Critique', description: 'L\'impact est si violent que {cible} est projeté en arrière, inanimé.' },
      
      // Sort - Feu
      { actionType: 'Sort', damageType: 'Feu', resultType: 'Réussite', description: 'Une déflagration de chaleur brûle l\'air, roussissant les sourcils de {cible}.' },
      { actionType: 'Sort', damageType: 'Feu', resultType: 'Réussite', description: 'Des flammes dansantes enveloppent {cible} qui hurle de douleur.' },
      { actionType: 'Sort', damageType: 'Feu', resultType: 'Réussite', description: 'Une boule de feu explose sur {cible}, l\'odeur de brûlé emplit l\'air.' },
      { actionType: 'Sort', damageType: 'Feu', resultType: 'Réussite', description: 'Les flammes lèchent {cible}, noircissant sa peau et son équipement.' },
      { actionType: 'Sort', damageType: 'Feu', resultType: 'Réussite', description: 'Un jet de flammes consume {cible} qui tente désespérément de les éteindre.' },
      
      { actionType: 'Sort', damageType: 'Feu', resultType: 'Échec', description: '{Cible} esquive le brasier avec agilité, les flammes passent à côté.' },
      { actionType: 'Sort', damageType: 'Feu', resultType: 'Échec', description: 'Le sort fuse trop haut - {cible} sent juste la chaleur au-dessus de sa tête.' },
      { actionType: 'Sort', damageType: 'Feu', resultType: 'Échec', description: '{Cible} résiste à la magie - les flammes s\'éteignent avant de toucher.' },
      { actionType: 'Sort', damageType: 'Feu', resultType: 'Échec', description: 'Ta concentration vacille - le sort fizzle dans une fumée inoffensive.' },
      { actionType: 'Sort', damageType: 'Feu', resultType: 'Échec', description: 'Un bouclier magique absorbe les flammes dans un flash de lumière.' },
      
      { actionType: 'Sort', damageType: 'Feu', resultType: 'Critique', description: 'Les flammes deviennent blanches de chaleur - {cible} hurle alors que son armure commence à fondre !' },
      { actionType: 'Sort', damageType: 'Feu', resultType: 'Critique', description: 'Une explosion de feu consumme totalement {cible} qui s\'écroule, carbonisé !' },
      { actionType: 'Sort', damageType: 'Feu', resultType: 'Critique', description: 'Un pilier de flammes s\'abat sur {cible} - il ne reste que cendres et fumée.' },
      
      // Sort - Froid
      { actionType: 'Sort', damageType: 'Froid', resultType: 'Réussite', description: 'Un souffle glacial frappe {cible}, le givre couvre sa peau.' },
      { actionType: 'Sort', damageType: 'Froid', resultType: 'Réussite', description: 'Des cristaux de glace se forment instantanément sur {cible} qui frissonne.' },
      { actionType: 'Sort', damageType: 'Froid', resultType: 'Réussite', description: 'Le froid mord la chair de {cible}, ralentissant ses mouvements.' },
      { actionType: 'Sort', damageType: 'Froid', resultType: 'Réussite', description: 'Un rayon de glace perfore l\'air et frappe {cible} de plein fouet.' },
      { actionType: 'Sort', damageType: 'Froid', resultType: 'Réussite', description: '{Cible} grelotte violemment alors que le froid pénètre ses os.' },
      
      { actionType: 'Sort', damageType: 'Froid', resultType: 'Échec', description: '{Cible} s\'écarte - le rayon de glace passe dans un sifflement glacé.' },
      { actionType: 'Sort', damageType: 'Froid', resultType: 'Échec', description: 'Le sort se dissipe en une brume froide inoffensive.' },
      { actionType: 'Sort', damageType: 'Froid', resultType: 'Échec', description: '{Cible} résiste au froid - à peine un frisson.' },
      { actionType: 'Sort', damageType: 'Froid', resultType: 'Échec', description: 'Ta magie manque de puissance - juste quelques flocons de neige.' },
      { actionType: 'Sort', damageType: 'Froid', resultType: 'Échec', description: 'Le givre se forme... puis fond immédiatement sans effet.' },
      
      { actionType: 'Sort', damageType: 'Froid', resultType: 'Critique', description: '{Cible} est instantanément gelé en une statue de glace qui se brise au sol !' },
      { actionType: 'Sort', damageType: 'Froid', resultType: 'Critique', description: 'Le froid absolu consume {cible} - plus aucun signe de vie.' },
      { actionType: 'Sort', damageType: 'Froid', resultType: 'Critique', description: 'Une tempête de glace engloutit {cible} qui tombe, figé à jamais !' },
      
      // Distance - Perforant
      { actionType: 'Distance', damageType: 'Perforant', resultType: 'Réussite', description: 'La flèche siffle et se plante dans l\'épaule de {cible}.' },
      { actionType: 'Distance', damageType: 'Perforant', resultType: 'Réussite', description: 'Ton projectile trouve sa cible avec un bruit sourd.' },
      { actionType: 'Distance', damageType: 'Perforant', resultType: 'Réussite', description: '{Cible} grimace alors que le trait perfore sa défense.' },
      { actionType: 'Distance', damageType: 'Perforant', resultType: 'Réussite', description: 'Un tir précis - {cible} chancelle, une flèche plantée dans sa cuisse.' },
      { actionType: 'Distance', damageType: 'Perforant', resultType: 'Réussite', description: 'Le projectile traverse l\'air et perce l\'armure de {cible}.' },
      
      { actionType: 'Distance', damageType: 'Perforant', resultType: 'Échec', description: 'Le trait vole trop à gauche et se perd dans l\'obscurité.' },
      { actionType: 'Distance', damageType: 'Perforant', resultType: 'Échec', description: '{Cible} se baisse au dernier moment - le projectile passe au-dessus.' },
      { actionType: 'Distance', damageType: 'Perforant', resultType: 'Échec', description: 'Ton tir rebondit sur le bouclier avec un clang métallique.' },
      { actionType: 'Distance', damageType: 'Perforant', resultType: 'Échec', description: 'Une rafale de vent détourne le projectile de sa trajectoire.' },
      { actionType: 'Distance', damageType: 'Perforant', resultType: 'Échec', description: '{Cible} attrape le projectile en plein vol avec un sourire narquois !' },
      
      { actionType: 'Distance', damageType: 'Perforant', resultType: 'Critique', description: 'Le trait perfore le cœur - {cible} s\'effondre, les yeux écarquillés !' },
      { actionType: 'Distance', damageType: 'Perforant', resultType: 'Critique', description: 'Un tir parfait traverse la gorge de {cible} qui tombe sans un son.' },
      { actionType: 'Distance', damageType: 'Perforant', resultType: 'Critique', description: 'Le projectile trouve l\'œil de {cible} - mort instantanée !' },
      
      // Sort - Nécrotique
      { actionType: 'Sort', damageType: 'Nécrotique', resultType: 'Réussite', description: 'Une énergie sombre draine la vitalité de {cible} qui pâlit.' },
      { actionType: 'Sort', damageType: 'Nécrotique', resultType: 'Réussite', description: 'Des ténèbres rampantes enveloppent {cible}, aspirant son essence vitale.' },
      { actionType: 'Sort', damageType: 'Nécrotique', resultType: 'Réussite', description: '{Cible} hurle alors que sa chair commence à se nécroser.' },
      { actionType: 'Sort', damageType: 'Nécrotique', resultType: 'Réussite', description: 'Un rayon de mort frappe {cible} qui sent ses forces l\'abandonner.' },
      { actionType: 'Sort', damageType: 'Nécrotique', resultType: 'Réussite', description: 'L\'énergie noire corrode la chair de {cible} dans une fumée nauséabonde.' },
      
      { actionType: 'Sort', damageType: 'Nécrotique', resultType: 'Échec', description: '{Cible} résiste à l\'attraction de la mort - le sort s\'évanouit.' },
      { actionType: 'Sort', damageType: 'Nécrotique', resultType: 'Échec', description: 'Les ténèbres se dissipent avant d\'atteindre {cible}.' },
      { actionType: 'Sort', damageType: 'Nécrotique', resultType: 'Échec', description: 'Une lumière protectrice repousse l\'énergie nécrotique.' },
      { actionType: 'Sort', damageType: 'Nécrotique', resultType: 'Échec', description: 'Ta magie sombre est trop faible - {cible} ne ressent qu\'un frisson.' },
      { actionType: 'Sort', damageType: 'Nécrotique', resultType: 'Échec', description: '{Cible} esquive le rayon de mort d\'un bond désespéré.' },
      
      { actionType: 'Sort', damageType: 'Nécrotique', resultType: 'Critique', description: 'L\'âme de {cible} est arrachée dans un hurlement d\'agonie éternelle !' },
      { actionType: 'Sort', damageType: 'Nécrotique', resultType: 'Critique', description: '{Cible} se dessèche instantanément, réduit à un cadavre momifié !' },
      { actionType: 'Sort', damageType: 'Nécrotique', resultType: 'Critique', description: 'La magie de mort consume {cible} de l\'intérieur - il s\'écroule, vidé de vie !' },
      
      // Sort - Psychique
      { actionType: 'Sort', damageType: 'Psychique', resultType: 'Réussite', description: '{Cible} se tient la tête en grimaçant - ton attaque mentale fait mouche.' },
      { actionType: 'Sort', damageType: 'Psychique', resultType: 'Réussite', description: 'Une douleur aiguë transperce l\'esprit de {cible} qui chancelle.' },
      { actionType: 'Sort', damageType: 'Psychique', resultType: 'Réussite', description: 'Tu envahis l\'esprit de {cible} avec des visions cauchemardesques.' },
      { actionType: 'Sort', damageType: 'Psychique', resultType: 'Réussite', description: '{Cible} hurle, assailli par des murmures assourdissants.' },
      { actionType: 'Sort', damageType: 'Psychique', resultType: 'Réussite', description: 'Un lance psychique perfore les défenses mentales de {cible}.' },
      
      { actionType: 'Sort', damageType: 'Psychique', resultType: 'Échec', description: '{Cible} ferme son esprit - tes pensées rebondissent sur un mur mental.' },
      { actionType: 'Sort', damageType: 'Psychique', resultType: 'Échec', description: 'L\'esprit de {cible} est trop fort - l\'attaque n\'a aucun effet.' },
      { actionType: 'Sort', damageType: 'Psychique', resultType: 'Échec', description: 'Ta concentration se brise - le lien psychique se rompt.' },
      { actionType: 'Sort', damageType: 'Psychique', resultType: 'Échec', description: '{Cible} secoue la tête et sourit - ton attaque mentale est vaine.' },
      { actionType: 'Sort', damageType: 'Psychique', resultType: 'Échec', description: 'Un bouclier mental protège {cible} de ton assaut psychique.' },
      
      { actionType: 'Sort', damageType: 'Psychique', resultType: 'Critique', description: 'L\'esprit de {cible} se brise - il tombe, les yeux vides, mort cérébral !' },
      { actionType: 'Sort', damageType: 'Psychique', resultType: 'Critique', description: 'Tu détruis la conscience de {cible} dans une explosion psychique !' },
      { actionType: 'Sort', damageType: 'Psychique', resultType: 'Critique', description: '{Cible} hurle puis s\'effondre, le cerveau complètement détruit !' },
      
      // Sort - Foudre
      { actionType: 'Sort', damageType: 'Foudre', resultType: 'Réussite', description: 'Un éclair frappe {cible} qui convulse sous la décharge électrique.' },
      { actionType: 'Sort', damageType: 'Foudre', resultType: 'Réussite', description: 'La foudre crépite et électrocute {cible} dans un flash aveuglant.' },
      { actionType: 'Sort', damageType: 'Foudre', resultType: 'Réussite', description: '{Cible} est secoué par l\'électricité, ses muscles se contractent.' },
      { actionType: 'Sort', damageType: 'Foudre', resultType: 'Réussite', description: 'Un arc électrique zèbre l\'air et frappe {cible} de plein fouet.' },
      { actionType: 'Sort', damageType: 'Foudre', resultType: 'Réussite', description: 'Le tonnerre résonne alors que {cible} est foudroyé.' },
      
      { actionType: 'Sort', damageType: 'Foudre', resultType: 'Échec', description: 'L\'éclair se dissipe dans le sol sans toucher {cible}.' },
      { actionType: 'Sort', damageType: 'Foudre', resultType: 'Échec', description: '{Cible} bondit de côté - la foudre frappe là où il se tenait.' },
      { actionType: 'Sort', damageType: 'Foudre', resultType: 'Échec', description: 'Ton sort crépite faiblement avant de s\'éteindre.' },
      { actionType: 'Sort', damageType: 'Foudre', resultType: 'Échec', description: '{Cible} est isolé - l\'électricité glisse sur son armure.' },
      { actionType: 'Sort', damageType: 'Foudre', resultType: 'Échec', description: 'La foudre manque sa cible et frappe un arbre proche.' },
      
      { actionType: 'Sort', damageType: 'Foudre', resultType: 'Critique', description: 'Un éclair massif consume {cible} qui s\'effondre, fumant et carbonisé !' },
      { actionType: 'Sort', damageType: 'Foudre', resultType: 'Critique', description: 'La foudre traverse {cible} de part en part - mort foudroyante !' },
      { actionType: 'Sort', damageType: 'Foudre', resultType: 'Critique', description: '{Cible} explose littéralement sous la puissance électrique !' },
      
      // Sort - Acide
      { actionType: 'Sort', damageType: 'Acide', resultType: 'Réussite', description: 'L\'acide éclabousse {cible} qui hurle alors que sa chair se dissout.' },
      { actionType: 'Sort', damageType: 'Acide', resultType: 'Réussite', description: 'Une projection corrosive ronge l\'armure et la peau de {cible}.' },
      { actionType: 'Sort', damageType: 'Acide', resultType: 'Réussite', description: '{Cible} tente désespérément d\'essuyer l\'acide qui brûle sa peau.' },
      { actionType: 'Sort', damageType: 'Acide', resultType: 'Réussite', description: 'Le liquide vert siffle sur {cible}, creusant des cratères dans sa chair.' },
      { actionType: 'Sort', damageType: 'Acide', resultType: 'Réussite', description: 'L\'acide corrode tout ce qu\'il touche - {cible} grimace de douleur.' },
      
      { actionType: 'Sort', damageType: 'Acide', resultType: 'Échec', description: '{Cible} esquive la projection acide qui grésille au sol.' },
      { actionType: 'Sort', damageType: 'Acide', resultType: 'Échec', description: 'Le sort manque - l\'acide ne fait que quelques trous dans le sol.' },
      { actionType: 'Sort', damageType: 'Acide', resultType: 'Échec', description: '{Cible} se protège derrière son bouclier qui absorbe l\'acide.' },
      { actionType: 'Sort', damageType: 'Acide', resultType: 'Échec', description: 'L\'acide est trop dilué - {cible} l\'essuie sans dommage.' },
      { actionType: 'Sort', damageType: 'Acide', resultType: 'Échec', description: 'Un contre-sort neutralise l\'acide avant l\'impact.' },
      
      { actionType: 'Sort', damageType: 'Acide', resultType: 'Critique', description: '{Cible} est dissous dans un bain d\'acide corrosif - il ne reste rien !' },
      { actionType: 'Sort', damageType: 'Acide', resultType: 'Critique', description: 'L\'acide ronge jusqu\'aux os - {cible} s\'effondre, décomposé !' },
      { actionType: 'Sort', damageType: 'Acide', resultType: 'Critique', description: 'Une vague d\'acide consume totalement {cible} dans un sifflement horrible !' },
    ];

    for (const text of flavorTexts) {
      await db.execute({
        sql: `INSERT INTO flavor_texts (id, action_type, damage_type, result_type, description) 
              VALUES (?, ?, ?, ?, ?)`,
        args: [
          crypto.randomUUID(),
          text.actionType,
          text.damageType,
          text.resultType,
          text.description
        ]
      });
    }

    console.log(`✅ ${flavorTexts.length} descriptions ajoutées avec succès`);

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

addFlavorTextsTable();
