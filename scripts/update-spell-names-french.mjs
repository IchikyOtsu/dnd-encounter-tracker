import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function updateSpellNames() {
  try {
    const translations = {
      'Acid Splash': 'Aspersion acide',
      'Blade Ward': 'Lame protectrice',
      'Chill Touch': 'Contact glacial',
      'Dancing Lights': 'Lumières dansantes',
      'Druidcraft': 'Druidisme',
      'Eldritch Blast': 'Décharge occulte',
      'Fire Bolt': 'Trait de feu',
      'Friends': 'Amitié',
      'Guidance': 'Assistance',
      'Light': 'Lumière',
      'Mage Hand': 'Main du mage',
      'Mending': 'Réparation',
      'Message': 'Message',
      'Mind Sliver': 'Éclat psychique',
      'Minor Illusion': 'Illusion mineure',
      'Poison Spray': 'Aspersion de poison',
      'Prestidigitation': 'Prestidigitation',
      'Produce Flame': 'Produire une flamme',
      'Ray of Frost': 'Rayon de givre',
      'Resistance': 'Résistance',
      'Sacred Flame': 'Flamme sacrée',
      'Shillelagh': 'Gourdin magique',
      'Shocking Grasp': 'Décharge électrique',
      'Sorcerous Burst': 'Décharge de sorcellerie',
      'Spare the Dying': 'Épargner les mourants',
      'Starry Wisp': 'Lueur astrale',
      'Thaumaturgy': 'Thaumaturgie',
      'Thorn Whip': 'Fouet épineux',
      'Thunderclap': 'Coup de tonnerre',
      'Toll the Dead': 'Appel des morts',
      'True Strike': 'Coup au but',
      'Vicious Mockery': 'Moquerie cruelle',
      'Word of Radiance': 'Mot de radiance',
      'Élémentalisme': 'Élémentalisme', // Déjà en français
    };

    let updated = 0;
    for (const [english, french] of Object.entries(translations)) {
      const result = await db.execute({
        sql: `UPDATE spells SET name = ? WHERE name = ?`,
        args: [french, english],
      });
      
      if (result.rowsAffected > 0) {
        console.log(`✅ ${english} → ${french}`);
        updated++;
      }
    }

    console.log(`\n✅ ${updated} sorts traduits avec succès`);

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

updateSpellNames();
