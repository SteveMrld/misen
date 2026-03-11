/**
 * MISEN V14.4 — Test Suite: 50 Professional Scripts
 * @description 50 scénarios professionnels couvrant tous les genres,
 *   écrits selon les conventions réelles de l'industrie.
 *   Chaque script est calibré pour tester des aspects spécifiques du pipeline.
 */

export interface TestScript {
  id: string
  title: string
  genre: string
  subgenre: string
  targetAudience: string
  duration: string // "30s", "2min", etc.
  complexity: 'simple' | 'medium' | 'complex'
  testFocus: string[] // which engines this particularly tests
  script: string
}

export const TEST_SCRIPTS: TestScript[] = [
  // ═══════════════════════════════════════
  // PUBLICITÉ LUXE (8 scripts)
  // ═══════════════════════════════════════
  {
    id: 'pub-parfum-01',
    title: 'ÉCLIPSE — Parfum',
    genre: 'pub_luxe',
    subgenre: 'Parfum féminin',
    targetAudience: 'Femmes 25-45, premium',
    duration: '30s',
    complexity: 'medium',
    testFocus: ['grammar', 'camera-physics', 'style-bible', 'rec-engine', 'performance'],
    script: `EXT. DÉSERT BLANC — AUBE

Sel à perte de vue. Horizon parfait. Ciel violet.

Une FEMME (30) marche pieds nus. Robe noire fluide. Contraste absolu.

Le vent soulève du sel comme de la poussière de diamant.

INSERT — Ses pieds laissent des empreintes qui se remplissent d'eau dorée.

INT. ESPACE ABSTRAIT — LUMIÈRE

La femme face à un miroir infini. Ses reflets se multiplient.
Elle ferme les yeux. Un flacon noir apparaît dans sa main.

INSERT — Le flacon. Design géométrique. Lumière le traverse. Prismes.

VOIX OFF (V.O.)
L'ombre révèle la lumière. ÉCLIPSE.

FIN`
  },
  {
    id: 'pub-auto-01',
    title: 'SILHOUETTE — Automobile',
    genre: 'pub_luxe',
    subgenre: 'Automobile premium',
    targetAudience: 'Hommes 35-55, CSP+',
    duration: '45s',
    complexity: 'complex',
    testFocus: ['motion-director', 'camera-physics', 'world-model', 'performance'],
    script: `EXT. ROUTE CÔTIÈRE — GOLDEN HOUR

Une route sinueuse longe une falaise. L'océan en contrebas, doré.

Un coupé noir apparaît au loin. Reflets du soleil sur la carrosserie.

EXT. ROUTE — TRAVELLING LATÉRAL

La voiture glisse. Mouvement fluide. La caméra la suit en parallèle.
On entend le moteur, grave, discret.

INSERT — La main du conducteur sur le volant. Cuir cousu main.
INSERT — Le tableau de bord. Lumière ambiante cuivre.
INSERT — Le rétroviseur. Le coucher de soleil s'y reflète.

EXT. PROMONTOIRE — CRÉPUSCULE

La voiture s'arrête. Vue sur l'océan infini.
Le conducteur descend. Silhouette contre le ciel.

VOIX OFF
Il y a des routes qu'on ne prend pas pour arriver quelque part. SILHOUETTE.

FIN`
  },
  {
    id: 'pub-joaillerie-01',
    title: 'ETERNELLE — Joaillerie',
    genre: 'pub_luxe',
    subgenre: 'Haute joaillerie',
    targetAudience: 'Femmes 30-60, ultra-premium',
    duration: '30s',
    complexity: 'medium',
    testFocus: ['camera-physics', 'style-bible', 'rec-engine'],
    script: `INT. ATELIER — LUMIÈRE NATURELLE

Gros plan sur des mains d'artisan. Loupe d'horloger.
Un diamant est serti dans une monture en or blanc.

INSERT — Le diamant tourne. Mille feux. Macro extrême.

INT. OPÉRA — NUIT

Une femme ajuste un collier devant un miroir ancien.
Le collier capte la lumière des lustres.

GROS PLAN — Son regard dans le miroir. Sourire imperceptible.

PLAN LARGE — Elle descend l'escalier d'honneur. Robe longue.
Les regards se tournent.

INSERT — Le collier sur sa peau. Lumière sculptée.

VOIX OFF
Ce qui est éternel ne se mesure pas en carats. ÉTERNELLE.

FIN`
  },
  {
    id: 'pub-cosmetique-01',
    title: 'AURA — Cosmétique',
    genre: 'pub_luxe',
    subgenre: 'Soin premium',
    targetAudience: 'Femmes 25-50',
    duration: '20s',
    complexity: 'simple',
    testFocus: ['grammar', 'rec-engine', 'performance'],
    script: `INT. SALLE DE BAIN MINIMALISTE — MATIN

Lumière douce, naturelle. Marbre blanc.

GROS PLAN — Des gouttes d'eau perlent sur une peau parfaite.

Une main dépose une crème nacrée sur une joue.
Le produit s'étale en slow motion.

INSERT — Le pot. Design épuré. Reflets nacrés.

PLAN MOYEN — La femme se regarde. Confiante. Lumineuse.

VOIX OFF
Votre peau, votre lumière. AURA.

FIN`
  },
  {
    id: 'pub-champagne-01',
    title: 'BULLE — Champagne',
    genre: 'pub_luxe',
    subgenre: 'Spiritueux premium',
    targetAudience: 'Mixte 30-55, festif premium',
    duration: '30s',
    complexity: 'medium',
    testFocus: ['grammar', 'camera-physics', 'consistency-inject'],
    script: `INT. CAVE VOÛTÉE — PÉNOMBRE

Des bouteilles alignées. Poussière dorée. Silence.

Une main sort une bouteille du casier. Geste précis. Révérent.

EXT. TERRASSE — CRÉPUSCULE

Le bouchon saute. Mousse dorée déborde au ralenti.

INSERT — Bulles qui montent dans le verre. Macro.
La lumière du coucher de soleil traverse le verre. Ambre.

PLAN MOYEN — Deux personnes trinquent. Sourires. Complicité.

PLAN LARGE — La terrasse surplombe une vallée viticole.
Le soleil se couche derrière les vignes.

VOIX OFF
Chaque bulle est une promesse. BULLE.

FIN`
  },
  {
    id: 'pub-montres-01',
    title: 'HEURES — Horlogerie',
    genre: 'pub_luxe',
    subgenre: 'Horlogerie',
    targetAudience: 'Hommes 35-60, ultra-premium',
    duration: '30s',
    complexity: 'complex',
    testFocus: ['camera-physics', 'motion-director', 'rec-engine'],
    script: `INT. ATELIER HORLOGER — LUMIÈRE ZÉNITHALE

Macro extrême. Un mouvement mécanique. Rubis, rouages, ressorts.
Le balancier oscille. Hypnotique.

INSERT — L'aiguille des secondes avance. Trotteuse sur cadran bleu.
INSERT — Le fond du boîtier, gravé. Numéro de série.

EXT. SOMMET MONTAGNEUX — AUBE

Un alpiniste consulte sa montre. Altitude 4 000m.
La montre brille contre le glacier.

PLAN LARGE — L'homme face à l'immensité.

INT. SOIRÉE — NUIT

La même montre au poignet d'un homme en smoking.
Il serre une main. Affaire conclue.

VOIX OFF
Le temps ne s'arrête pas. Soyez à la hauteur. HEURES.

FIN`
  },
  {
    id: 'pub-mode-01',
    title: 'OMBRE — Mode',
    genre: 'pub_luxe',
    subgenre: 'Haute couture',
    targetAudience: 'Femmes 20-40, fashion',
    duration: '45s',
    complexity: 'complex',
    testFocus: ['style-bible', 'character-bible', 'motion-director', 'performance'],
    script: `INT. STUDIO PHOTO — LUMIÈRE GRAPHIQUE

Fond blanc infini. Une MODÈLE (22) entre dans le cadre.
Robe architecturale. Noir et blanc.

Elle marche. Chaque pas est une chorégraphie.
Les ombres se déplacent avec elle.

INSERT — Tissu en gros plan. Plis géométriques.
INSERT — Chaussure. Talon aiguille. Reflet sur sol noir.

INT. COULOIR BRUTALISTE — BÉTON

La même modèle dans un couloir en béton brut.
Robe rouge sang. Contraste violent.

TRAVELLING AVANT — Elle avance vers la caméra. Regard frontal.

EXT. TOIT — NUIT

Elle debout au bord. La ville en contrebas. Vent.
La robe flotte comme un drapeau.

VOIX OFF
La mode n'habille pas le corps. Elle révèle l'attitude. OMBRE.

FIN`
  },
  {
    id: 'pub-immobilier-01',
    title: 'HORIZON — Immobilier luxe',
    genre: 'pub_luxe',
    subgenre: 'Immobilier premium',
    targetAudience: 'CSP++, 40-65, investisseurs',
    duration: '45s',
    complexity: 'complex',
    testFocus: ['world-model', 'camera-physics', 'motion-director'],
    script: `EXT. VILLA CONTEMPORAINE — GOLDEN HOUR

Drone. La villa émerge entre les pins parasols.
Piscine à débordement. L'horizon se confond avec l'eau.

INT. SÉJOUR — LUMIÈRE NATURELLE

Baies vitrées du sol au plafond. La mer au loin.
Un couple entre. Ils découvrent l'espace. Émerveillement silencieux.

INSERT — Main sur le marbre du plan de travail.
INSERT — Lumière naturelle sur le parquet chêne.

EXT. TERRASSE — CRÉPUSCULE

Le couple sur la terrasse. Deux verres de vin.
Le soleil se couche dans la mer.

PLAN LARGE — La villa illuminée dans la nuit. Écrin de lumière.

VOIX OFF
Certains lieux n'attendent que vous. HORIZON.

FIN`
  },

  // ═══════════════════════════════════════
  // COURT-MÉTRAGE (10 scripts)
  // ═══════════════════════════════════════
  {
    id: 'court-drame-01',
    title: 'Les Cailloux',
    genre: 'court_metrage',
    subgenre: 'Drame familial',
    targetAudience: 'Festivals, adultes',
    duration: '3min',
    complexity: 'complex',
    testFocus: ['tension', 'character-bible', 'intent', 'grammar', 'world-model'],
    script: `EXT. PLAGE — MATIN GRIS

Un PÈRE (45) et sa FILLE (8) marchent sur une plage déserte.
Elle ramasse des cailloux. Lui regarde la mer.

FILLE
Papa, celui-là il est beau ?

PÈRE
Ils sont tous beaux, ma puce.

FILLE
Non. Celui-là il est spécial. Il a une fissure dorée.

Le père s'arrête. Regarde le caillou.

INT. CUISINE — NUIT (FLASHBACK)

Le père seul. Bouteille vide. La table est mise pour deux.
Une chaise est vide.

EXT. PLAGE — MATIN

Retour. La fille lui met le caillou dans la main.

FILLE
Maman disait que les fissures, c'est par là que la lumière entre.

Silence. Le père serre le caillou. Les yeux humides.

PÈRE
Ta mère avait raison.

Il s'accroupit. La prend dans ses bras.

EXT. PLAGE — PLAN LARGE

Les deux silhouettes enlacées. La mer. Le ciel gris.

FIN`
  },
  {
    id: 'court-thriller-01',
    title: 'Trente Secondes',
    genre: 'court_metrage',
    subgenre: 'Thriller psychologique',
    targetAudience: 'Festivals, adultes',
    duration: '2min',
    complexity: 'complex',
    testFocus: ['tension', 'grammar', 'intent', 'camera-physics', 'motion-director'],
    script: `INT. ASCENSEUR — NUIT

Un HOMME (35) entre dans un ascenseur vide. Il appuie sur le 12.
Les portes se ferment.

L'ascenseur monte. Musique d'ambiance étouffée.

Étage 3. Les portes s'ouvrent. Personne. Elles se referment.

Son téléphone vibre. Message : "Ne monte pas."

Il regarde le message. Hésite. N'appuie sur rien.

Étage 6. Les lumières clignotent. Une seconde de noir total.
Les lumières reviennent. Une FEMME est là. Dos tourné.

HOMME
Excusez-moi, vous...

Elle ne bouge pas. Étage 8.

Il recule contre le mur. Elle tourne la tête lentement.
C'est son propre visage. Son double.

LE DOUBLE
Tu n'aurais pas dû monter.

Étage 12. DING. Les portes s'ouvrent sur le noir.

L'homme est seul dans l'ascenseur. Le miroir en face.
Son reflet ne sourit pas.

FIN`
  },
  {
    id: 'court-comedie-01',
    title: 'Le Stagiaire',
    genre: 'court_metrage',
    subgenre: 'Comédie de bureau',
    targetAudience: 'Grand public, web',
    duration: '2min',
    complexity: 'medium',
    testFocus: ['character-bible', 'grammar', 'tension'],
    script: `INT. OPEN SPACE — MATIN

LÉON (22), costume trop grand, arrive. Premier jour de stage.
Il porte un plateau de cafés. 12 gobelets.

Il slalome entre les bureaux. Concentration maximale.

COLLÈGUE 1
Eh le nouveau ! Le mien c'est sans lait !

Il tente de trouver le bon gobelet. Un café tangue dangereusement.

COLLÈGUE 2
Le mien c'est le décaféiné soja !

Il tend un café. Se trompe. Le reprend.
Un gobelet tombe. Il le rattrape du pied. Le remonte sur le plateau.

INSERT — Goutte de sueur sur son front.

Il arrive devant le bureau de la DIRECTRICE.
Dernier café. Le plus important.

Il pose le plateau. Tend le gobelet avec une révérence.

DIRECTRICE
(sans lever les yeux)
Je ne bois pas de café.

Silence. Léon regarde le plateau de 11 cafés restants.

LÉON
(sourire figé)
Quelqu'un veut un café ?

FIN`
  },
  {
    id: 'court-sf-01',
    title: 'Mémoire Vive',
    genre: 'court_metrage',
    subgenre: 'Science-fiction',
    targetAudience: 'Festivals, geek culture',
    duration: '3min',
    complexity: 'complex',
    testFocus: ['world-model', 'style-bible', 'camera-physics', 'intent', 'consistency-inject'],
    script: `INT. LABORATOIRE — FUTUR

Écrans holographiques. Lumière bleue froide.

DOCTEUR CHEN regarde un scan cérébral 3D qui flotte dans l'air.

CHEN
Sujet 47. Téléchargement mémoire à 89%.

Une FEMME (60) est allongée sur un lit médicalisé. Casque neural.

FEMME
Est-ce que je me souviendrai de tout ?

CHEN
De tout ce que vous choisirez de garder.

INT. MÉMOIRE — ESPACE ABSTRAIT

Des fragments de souvenirs flottent comme des bulles.
Un mariage. Un premier pas d'enfant. Un coucher de soleil.

La femme, jeune (25), marche parmi ses souvenirs.
Elle touche un souvenir — il s'illumine et joue.

INSERT — Ses mains jeunes caressent le visage d'un homme.

Elle arrive devant un souvenir sombre. Opaque. Lourd.

FEMME (V.O.)
Et celui-là ?

CHEN (V.O.)
C'est votre choix. Garder ou effacer.

Elle tend la main vers le souvenir sombre.
Le touche. Il s'illumine — c'est un enterrement.
Elle pleure. Mais elle sourit aussi.

FEMME (V.O.)
Gardez-le. La douleur aussi, c'est vivre.

INT. LABORATOIRE

La femme ouvre les yeux. Une larme coule.

CHEN
Bienvenue dans votre nouvelle mémoire.

FIN`
  },
  {
    id: 'court-social-01',
    title: 'Deux Mètres',
    genre: 'court_metrage',
    subgenre: 'Drame social',
    targetAudience: 'Festivals, sensibilisation',
    duration: '2min',
    complexity: 'medium',
    testFocus: ['intent', 'tension', 'character-bible', 'grammar'],
    script: `EXT. FILE D'ATTENTE — JOUR

Une file devant une administration. Soleil de plomb.

Un HOMME EN COSTUME attend. Derrière lui, un JEUNE EN HOODIE.

L'homme s'écarte. Met deux mètres de distance.

Le jeune le remarque. Sourit amèrement.

INSERT — Les mains de l'homme serrent sa mallette.

La file avance. Ils entrent dans le bâtiment.

INT. SALLE D'ATTENTE

Deux chaises côte à côte. L'homme hésite. S'assoit plus loin.

Le jeune sort un livre. Dostoïevski. L'homme le remarque.

HOMME
(surpris)
Les Frères Karamazov ?

JEUNE
Troisième lecture.

Silence. L'homme se rapproche d'une chaise.

HOMME
Mon fils refuse de le lire.

JEUNE
Votre fils a tort.

Ils se regardent. Quelque chose change.

FONCTIONNAIRE (O.S.)
Numéro 247 !

Ils se lèvent. Ensemble. Même numéro.

FIN`
  },
  {
    id: 'court-fantastique-01',
    title: 'L\'Heure Bleue',
    genre: 'court_metrage',
    subgenre: 'Fantastique poétique',
    targetAudience: 'Festivals, tous publics',
    duration: '3min',
    complexity: 'complex',
    testFocus: ['style-bible', 'world-model', 'camera-physics', 'intent'],
    script: `EXT. VILLAGE — CRÉPUSCULE

Un vieux village de pierre. L'heure bleue. Ce moment entre jour et nuit.

Une VIEILLE FEMME ferme ses volets. Elle regarde le ciel.

VIEILLE FEMME
C'est l'heure.

Les lampadaires s'éteignent un par un.

EXT. RUE DU VILLAGE

Dans l'obscurité bleue, des lucioles apparaissent.
Mais ce ne sont pas des lucioles — ce sont des souvenirs lumineux.

Un enfant qui court. Translucide. Doré.
Un couple qui danse. Éthéré.
Un vieux chien qui remue la queue.

La vieille femme marche parmi eux. Elle les reconnaît tous.

VIEILLE FEMME
(murmure)
Bonsoir, Marcel.

Le souvenir d'un homme lui sourit.

EXT. FONTAINE DU VILLAGE

Elle s'assoit. Les souvenirs tournent autour d'elle comme une valse.
La lumière bleue les enveloppe.

Puis l'aube arrive. Les souvenirs s'estompent.
Les lampadaires se rallument.

La vieille femme est seule. Elle sourit.

VIEILLE FEMME
À demain.

FIN`
  },
  {
    id: 'court-romance-01',
    title: 'Dernier Métro',
    genre: 'court_metrage',
    subgenre: 'Romance',
    targetAudience: 'Grand public',
    duration: '2min',
    complexity: 'medium',
    testFocus: ['character-bible', 'grammar', 'tension', 'intent'],
    script: `INT. QUAI DE MÉTRO — 23H50

Quai presque désert. Néons qui bourdonnent.

ELLE (28) lit un livre. Assise sur un banc.
LUI (30) arrive en courant. Essoufflé. Regarde le panneau : "Dernier métro — 2 min".

Il s'assoit à l'autre bout du banc. La regarde du coin de l'oeil.

INSERT — Le livre qu'elle lit : "L'Écume des jours".

LUI
C'est triste à la fin.

ELLE
(sans lever les yeux)
C'est beau à la fin. C'est différent.

Le métro arrive. Portes ouvertes. Personne ne monte.

LUI
Vous ne montez pas ?

ELLE
J'attends le prochain.

LUI
C'est le dernier.

ELLE
Alors j'attends demain.

Les portes se ferment. Le métro part.

Silence. Ils se regardent.

LUI
Je m'appelle Thomas.

ELLE
(ferme son livre)
Je sais. On travaille au même étage.

Il rit. Elle sourit.

EXT. RUE — NUIT

Ils marchent côte à côte. Leurs ombres se rapprochent.

FIN`
  },
  {
    id: 'court-horreur-01',
    title: 'Le Reflet',
    genre: 'court_metrage',
    subgenre: 'Horreur psychologique',
    targetAudience: 'Adultes, festival genre',
    duration: '2min',
    complexity: 'complex',
    testFocus: ['tension', 'grammar', 'intent', 'camera-physics'],
    script: `INT. SALLE DE BAIN — NUIT

ANNA (35) se brosse les dents. Miroir embué.

Elle essuie le miroir. Son reflet la regarde.
Tout est normal.

Elle se penche pour cracher. Se relève.

Son reflet n'a pas bougé. Il est encore penché.

Elle cligne des yeux. Le reflet cligne — en retard d'une seconde.

INSERT — Ses mains tremblent.

Elle lève la main droite. Le reflet lève la gauche.

ANNA
(murmure)
Qu'est-ce que...

Le reflet sourit. Anna ne sourit pas.

LE REFLET
(voix identique)
Tu te souviens quand on était une seule personne ?

Anna recule. Heurte le mur.

Le reflet pose sa main contre le miroir de l'intérieur.
Le verre se déforme comme de l'eau.

NOIR.

Son du miroir qui se brise.

INT. SALLE DE BAIN — MATIN

Anna se réveille par terre. Miroir intact.
Elle se relève. Se regarde dans le miroir.

Son reflet sourit avant elle.

FIN`
  },
  {
    id: 'court-musical-01',
    title: 'Silence',
    genre: 'court_metrage',
    subgenre: 'Drame musical',
    targetAudience: 'Festivals, mélomanes',
    duration: '3min',
    complexity: 'complex',
    testFocus: ['tension', 'style-bible', 'grammar', 'camera-physics'],
    script: `INT. SALLE DE CONCERT VIDE — JOUR

Un PIANISTE (50) entre. Costume usé. Cheveux gris.
Il s'assoit au piano. Ouvre le couvercle.

Ses doigts au-dessus des touches. Ils tremblent.

INSERT — Ses mains. Arthrite. Doigts déformés.

Il pose un doigt. Une note. Do. Le son résonne dans la salle vide.

INT. SALLE DE CONCERT — PASSÉ (FLASHBACK)

Le même pianiste, jeune (25). Concert triomphal.
Mains parfaites volant sur le clavier. Standing ovation.

INT. SALLE VIDE — RETOUR

Le vieil homme joue. Lentement. Maladroitement.
Des notes manquent. D'autres sont fausses.

Mais il joue. Les yeux fermés.

INT. MÉMOIRE — MONTAGE

Ses mains jeunes jouent Chopin.
Ses mains vieilles jouent la même phrase — plus lente, imparfaite.

INT. SALLE VIDE

Il termine. Silence.
Puis un son. Des applaudissements.

Il ouvre les yeux. La salle est toujours vide.
Mais une petite FILLE (6) est assise au premier rang.

FILLE
C'était beau.

PIANISTE
C'était plein de fautes.

FILLE
C'est pour ça que c'était beau.

Il sourit. Ferme le piano.

FIN`
  },
  {
    id: 'court-absurde-01',
    title: 'La File',
    genre: 'court_metrage',
    subgenre: 'Absurde / Kafkaïen',
    targetAudience: 'Festivals, cinéphiles',
    duration: '2min',
    complexity: 'medium',
    testFocus: ['world-model', 'character-bible', 'intent'],
    script: `EXT. PLACE PUBLIQUE — JOUR

Une file d'attente. Très longue. Des centaines de personnes.

UN HOMME arrive. Se met à la fin.

HOMME
(au dernier de la file)
C'est pour quoi ?

DERNIER
Je ne sais pas.

HOMME
Depuis combien de temps vous attendez ?

DERNIER
Mardi.

HOMME
On est jeudi.

DERNIER
Oui.

L'homme regarde devant lui. La file ne bouge pas.

Il attend. Une heure. Deux heures.

Un NOUVEAU arrive derrière lui.

NOUVEAU
C'est pour quoi ?

HOMME
(sans hésiter)
Ça vaut le coup. Croyez-moi.

Le nouveau s'installe. Confiant.

PLAN LARGE — La file vue du ciel. Elle forme un cercle parfait.
Il n'y a pas de début.

FIN`
  },

  // ═══════════════════════════════════════
  // CLIP MUSICAL (7 scripts)
  // ═══════════════════════════════════════
  {
    id: 'clip-electro-01',
    title: 'PULSE — Electro',
    genre: 'clip_musical',
    subgenre: 'Electro/Dance',
    targetAudience: '18-30, clubbers',
    duration: '1min30',
    complexity: 'complex',
    testFocus: ['motion-director', 'grammar', 'style-bible', 'camera-physics'],
    script: `INT. ENTREPÔT DÉSAFFECTÉ — NUIT

Noir total. Silence.

Un BATTEMENT. Grave. Le sol vibre.

Des néons s'allument un par un. Rose. Bleu. Violet.

Un DANSEUR apparaît. Mouvement mécanique, saccadé.
Chaque mouvement synchronisé avec le beat.

INT. COULOIR NÉON — TRAVELLING

Le danseur avance dans un couloir infini de néons.
La caméra le suit. Chaque pas = un beat.

Les néons changent de couleur au rythme.

INT. SALLE PRINCIPALE

Le beat monte. Le danseur accélère.
Mouvements fluides maintenant. Libéré.

PLAN ZÉNITHAL — Il danse vu du dessus.
Les lumières forment des motifs géométriques autour de lui.

DROP MUSICAL.

Tout s'arrête. Noir. Silence.

Un dernier néon. Rouge. Le danseur, immobile. Regard caméra.

FIN`
  },
  {
    id: 'clip-rnb-01',
    title: 'GLASS — R&B',
    genre: 'clip_musical',
    subgenre: 'R&B / Soul',
    targetAudience: '20-35',
    duration: '1min',
    complexity: 'medium',
    testFocus: ['style-bible', 'grammar', 'camera-physics'],
    script: `INT. APPARTEMENT — AUBE

Lumière dorée à travers les stores vénitiens.
Des lignes d'ombre sur un visage endormi.

UNE CHANTEUSE ouvre les yeux. Regard mélancolique.

Elle se lève. Robe de chambre en soie.
Marche pieds nus sur le parquet.

INT. CUISINE — LUMIÈRE

Elle prépare un café. Gestes lents, sensuels.
La vapeur monte. Contre-jour.

INSERT — Ses lèvres sur la tasse.
INSERT — Ses doigts sur la vitre. La ville en contrebas.

INT. SALON — MIROIR

Elle chante face au miroir. Les reflets se multiplient.
Chaque reflet montre une émotion différente.

EXT. BALCON — AUBE

Elle sur le balcon. La ville s'éveille.
Elle ferme les yeux. Le vent dans ses cheveux.

FIN`
  },
  {
    id: 'clip-rap-01',
    title: 'BÉTON — Rap',
    genre: 'clip_musical',
    subgenre: 'Rap français',
    targetAudience: '16-30',
    duration: '1min30',
    complexity: 'complex',
    testFocus: ['world-model', 'grammar', 'motion-director', 'character-bible'],
    script: `EXT. CITÉ HLM — JOUR

Tours de béton. Ciel gris. Un terrain de basket vide.

UN RAPPEUR marche au milieu de la cité. Regard droit.
Pas déterminé. La caméra recule devant lui.

EXT. ESCALIERS — TRAVELLING VERTICAL

Il monte les escaliers extérieurs. La caméra monte avec lui.
À chaque étage, un souvenir.

Étage 3 — Un enfant joue au ballon.
Étage 6 — Des mères discutent sur le palier.
Étage 9 — Un jeune regarde par la fenêtre.

EXT. TOIT — JOUR

Le rappeur arrive sur le toit. Vue sur toute la ville.
Il écarte les bras. Le vent.

PLAN ZÉNITHAL — Les tours vues du ciel.
Elles forment les lettres de son nom.

INSERT — Ses mains. Tatouages. Chaque tatouage raconte.

EXT. TERRAIN DE BASKET — NUIT

Il rappe sous un lampadaire. Seul. Les mots résonnent.

FIN`
  },
  {
    id: 'clip-jazz-01',
    title: 'SMOKE — Jazz',
    genre: 'clip_musical',
    subgenre: 'Jazz contemporain',
    targetAudience: '25-50, mélomanes',
    duration: '2min',
    complexity: 'medium',
    testFocus: ['style-bible', 'camera-physics', 'grammar'],
    script: `INT. CLUB DE JAZZ — NUIT

Fumée. Lumière ambrée. Velours rouge.

Un SAXOPHONISTE monte sur scène. Costume sombre.
Il porte le saxophone à ses lèvres.

Première note. Longue. Vibrante.

GROS PLAN — Ses doigts sur les clés. Dorées, usées.
GROS PLAN — L'embouchure. La vibration de l'air.

Le public écoute. Visages en clair-obscur.

INSERT — Un verre de whisky sur le comptoir. La surface vibre au son.
INSERT — La fumée de cigarette dessine des spirales au rythme.

PLAN MOYEN — Le saxophoniste ferme les yeux. Improvisation.
La musique monte. Les lumières pulsent doucement.

PLAN LARGE — Le club entier. Silhouettes. Fumée. Musique.

FIN`
  },
  {
    id: 'clip-pop-01',
    title: 'COLORS — Pop',
    genre: 'clip_musical',
    subgenre: 'Pop / Indie',
    targetAudience: '16-35',
    duration: '1min',
    complexity: 'simple',
    testFocus: ['grammar', 'style-bible', 'motion-director'],
    script: `EXT. CHAMP DE FLEURS — JOUR

Explosion de couleurs. Coquelicots, tournesols, lavande.

UNE CHANTEUSE court à travers le champ. Robe blanche.
Ralenti. Les pétales volent autour d'elle.

EXT. LAC — GOLDEN HOUR

Elle tourne sur elle-même au bord du lac.
Son reflet dans l'eau se fragmente.

PLAN DRONE — Vue du dessus. Le champ forme un arc-en-ciel naturel.

INSERT — Ses mains touchent l'eau. Ondes colorées.

EXT. CHAMP — COUCHER

Elle est allongée dans les fleurs. Yeux fermés. Sourire.
Pétales tombent sur elle comme de la neige.

FIN`
  },
  {
    id: 'clip-classique-01',
    title: 'REQUIEM — Classique',
    genre: 'clip_musical',
    subgenre: 'Musique classique / Opéra',
    targetAudience: '30-60, classique',
    duration: '2min',
    complexity: 'complex',
    testFocus: ['camera-physics', 'style-bible', 'tension', 'grammar'],
    script: `INT. CATHÉDRALE — NUIT

Vide. Bougies. Milliers de flammes vacillantes.

UN ORCHESTRE s'installe en silence. Habits noirs.

Le CHEF D'ORCHESTRE entre. Silence absolu.

Il lève la baguette. Suspension.

Le premier accord éclate. Puissant. Les flammes tremblent.

PLAN LARGE — L'orchestre vu depuis la voûte.
La lumière des bougies crée des ombres monumentales.

GROS PLAN — Les mains du violoniste. L'archet tremble d'émotion.
GROS PLAN — Le visage de la soprano. Elle ouvre la bouche. Chante.

La voix monte dans la cathédrale. Les vitraux vibrent.

INSERT — Une larme coule sur la joue d'un spectateur.

PLAN FIXE — Le chef d'orchestre, de dos. Face à son orchestre.
Ses bras dessinent la musique dans l'air.

Dernier accord. Silence. Les bougies s'éteignent une par une.

FIN`
  },
  {
    id: 'clip-reggaeton-01',
    title: 'FUEGO — Reggaeton',
    genre: 'clip_musical',
    subgenre: 'Reggaeton / Latin',
    targetAudience: '18-35',
    duration: '1min',
    complexity: 'medium',
    testFocus: ['motion-director', 'grammar', 'style-bible'],
    script: `EXT. PLAGE TROPICALE — COUCHER

Palmiers. Ciel orange et rose. Musique lointaine.

UN DANSEUR ET UNE DANSEUSE sur le sable mouillé.
Reflets du coucher dans l'eau.

La musique démarre. Ils dansent. Sensuel. Énergique.
Leurs mouvements projettent des éclaboussures dorées.

EXT. PISCINE — NUIT

Lumières sous-marines turquoise. Des danseurs autour de la piscine.
Chorégraphie synchronisée.

INSERT — Pieds dans l'eau. Éclaboussures au ralenti.
INSERT — Bracelets dorés qui s'entrechoquent.

EXT. TERRASSE BAR — NUIT

Le chanteur au micro. Foule qui danse.
Confettis dorés. Fumigènes.

PLAN DRONE — La plage vue du ciel. Les lumières de la fête.

FIN`
  },

  // ═══════════════════════════════════════
  // DOCUMENTAIRE (8 scripts)
  // ═══════════════════════════════════════
  {
    id: 'docu-ocean-01',
    title: 'L\'Abysse',
    genre: 'documentaire',
    subgenre: 'Nature / Océan',
    targetAudience: 'Grand public, éducatif',
    duration: '3min',
    complexity: 'complex',
    testFocus: ['world-model', 'camera-physics', 'grammar', 'style-bible'],
    script: `EXT. SURFACE DE L'OCÉAN — JOUR

L'eau calme. Reflets du soleil. Infini bleu.

NARRATEUR (V.O.)
La surface de l'océan. Ce que nous voyons. 1% de l'histoire.

EXT. SOUS-MARIN — PLONGÉE

La caméra descend. Le bleu devient sombre.
Des particules flottent comme de la neige inversée.

NARRATEUR (V.O.)
À 200 mètres, la lumière du soleil disparaît. C'est la zone crépusculaire.

Des créatures bioluminescentes apparaissent.
Points bleus, verts, violets dans l'obscurité.

NARRATEUR (V.O.)
À 1 000 mètres, c'est la nuit permanente. Et pourtant, la vie explose.

INSERT — Méduse géante. Transparente. Pulsations lumineuses.
INSERT — Poisson abyssal. Dents, lanterne frontale.

NARRATEUR (V.O.)
À 4 000 mètres, la pression est 400 fois celle de la surface.

Le fond apparaît. Plaines sous-marines. Cheminées hydrothermales.
De la fumée noire jaillit du fond.

NARRATEUR (V.O.)
Et là, au fond de l'abysse, la vie commence. Pas malgré l'obscurité. Grâce à elle.

INSERT — Des crevettes albinos autour d'une cheminée.

EXT. SURFACE — RETOUR

Le soleil se couche sur l'océan calme.

NARRATEUR (V.O.)
Nous connaissons mieux la surface de Mars que le fond de nos océans.

FIN`
  },
  {
    id: 'docu-urbain-01',
    title: 'Béton Vivant',
    genre: 'documentaire',
    subgenre: 'Urbain / Architecture',
    targetAudience: 'Adultes, urbanistes',
    duration: '2min',
    complexity: 'medium',
    testFocus: ['world-model', 'camera-physics', 'grammar'],
    script: `EXT. GRATTE-CIEL — AUBE

Drone. La ville émerge de la brume.
Les tours de verre reflètent le ciel rose.

NARRATEUR (V.O.)
Une ville ne se construit pas. Elle pousse.

EXT. RUE — TIMELAPSE

Foule. Des milliers de personnes en accéléré.
Les feux changent. Les taxis jaunes défilent.

NARRATEUR (V.O.)
Huit millions de personnes qui ne se connaissent pas.
Et pourtant, un organisme unique.

EXT. PARC — JOUR

Un arbre pousse entre les dalles de béton.
Ses racines soulèvent le trottoir.

INSERT — L'écorce de l'arbre. Macro. Textures.
INSERT — Le béton fissuré. Une fleur y pousse.

NARRATEUR (V.O.)
Le béton résiste. La nature insiste.
La ville est un compromis permanent.

EXT. PONT — CRÉPUSCULE

Silhouette sur un pont. La ville illuminée en fond.

NARRATEUR (V.O.)
Nous construisons des villes pour nous protéger du monde.
Et puis nous grimpons sur les toits pour le retrouver.

FIN`
  },
  {
    id: 'docu-tech-01',
    title: 'Le Code',
    genre: 'documentaire',
    subgenre: 'Technologie / IA',
    targetAudience: 'Tech-savvy, éducatif',
    duration: '2min',
    complexity: 'medium',
    testFocus: ['world-model', 'style-bible', 'grammar'],
    script: `GROS PLAN — Un écran. Des lignes de code défilent.

NARRATEUR (V.O.)
Un algorithme ne pense pas. Il calcule.
Mais la frontière devient floue.

INSERT — Des neurones artificiels. Visualisation de réseau.
Les connexions s'illuminent en cascade.

NARRATEUR (V.O.)
En 2024, une IA a généré sa première image.
En 2025, son premier film.

INSERT — Images générées par IA. De plus en plus réalistes.

PLAN MOYEN — Un développeur face à son écran.
Il regarde une vidéo générée. Incrédule.

NARRATEUR (V.O.)
La question n'est plus : l'IA peut-elle créer ?
La question est : qui dirige ?

INSERT — Des mains humaines sur un clavier.
INSERT — Un chef d'orchestre lève sa baguette.

NARRATEUR (V.O.)
La technologie est un instrument.
L'intelligence créative est le musicien.
Et le réalisateur... c'est toujours vous.

FIN`
  },
  {
    id: 'docu-sport-01',
    title: 'Le Dernier Tour',
    genre: 'documentaire',
    subgenre: 'Sport / Humain',
    targetAudience: 'Grand public, sportifs',
    duration: '2min',
    complexity: 'medium',
    testFocus: ['tension', 'character-bible', 'grammar', 'camera-physics'],
    script: `EXT. PISTE D'ATHLÉTISME — AUBE

Stade vide. Brume au sol. Silence.

Un COUREUR (40) entre sur la piste. Seul.
Il s'étire. Gestes méthodiques. Rituels.

NARRATEUR (V.O.)
Marco Delgado. 40 ans. 15 marathons. 3 médailles.
Et aujourd'hui, son dernier tour de piste.

INSERT — Ses chaussures usées. L'usure raconte des kilomètres.
INSERT — Ses mains. Veines saillantes.

Il se met en position de départ. Ligne blanche.

NARRATEUR (V.O.)
On lui a dit que ses genoux ne tiendraient plus.
On lui a dit d'arrêter il y a trois ans.

Il s'élance. Foulées amples. Respiration régulière.

TRAVELLING LATÉRAL — La caméra le suit. Son ombre court avec lui.

NARRATEUR (V.O.)
Un athlète ne court pas contre les autres.
Il court contre celui qu'il était hier.

Le chrono tourne. Il accélère dans la dernière ligne droite.

Il franchit la ligne. S'arrête. Les mains sur les genoux.
Regarde le stade vide. Sourit.

NARRATEUR (V.O.)
Temps : 58 secondes. Son pire chrono.
Le plus beau de sa vie.

FIN`
  },
  {
    id: 'docu-cuisine-01',
    title: 'Umami',
    genre: 'documentaire',
    subgenre: 'Gastronomie',
    targetAudience: 'Foodies, adultes',
    duration: '2min',
    complexity: 'medium',
    testFocus: ['camera-physics', 'grammar', 'world-model'],
    script: `INT. CUISINE — MATIN

Un CHEF japonais prépare son plan de travail. Précision millimétrique.

NARRATEUR (V.O.)
Umami. La cinquième saveur. Celle que l'on ne peut pas nommer.

INSERT — Un couteau tranche un poisson. Macro. Précision chirurgicale.
INSERT — Le poisson tombe en tranches parfaites.

NARRATEUR (V.O.)
Ce n'est ni sucré, ni salé, ni amer, ni acide. C'est plus profond.

Le chef porte une tranche à ses lèvres. Ferme les yeux.

INT. MARCHÉ — MATIN TÔT

Le chef marche entre les étals. Touche les légumes.
Sent un champignon. Le repose. En prend un autre.

NARRATEUR (V.O.)
Le bon ingrédient ne se choisit pas. Il se reconnaît.

INT. CUISINE — SERVICE

Activité intense. Flammes. Vapeur.
Les assiettes sortent. Œuvres d'art.

INSERT — Une goutte de sauce tombe sur l'assiette. Parfaite.

NARRATEUR (V.O.)
Cuisiner n'est pas suivre une recette. C'est écouter le produit.

FIN`
  },
  {
    id: 'docu-espace-01',
    title: 'Silence Cosmique',
    genre: 'documentaire',
    subgenre: 'Espace / Science',
    targetAudience: 'Grand public, éducatif',
    duration: '3min',
    complexity: 'complex',
    testFocus: ['world-model', 'style-bible', 'camera-physics', 'intent'],
    script: `EXT. ESPACE — VIDE

Noir total. Silence absolu.

NARRATEUR (V.O.)
L'univers est le silence le plus vaste qui existe.
13,8 milliards d'années de silence.

La Terre apparaît. Petite. Bleue.

NARRATEUR (V.O.)
Et sur cette poussière, nous faisons du bruit.

INSERT — Villes vues de l'espace. Lumières.
INSERT — Signaux radio visualisés. Ondes qui partent de la Terre.

NARRATEUR (V.O.)
Nos premiers signaux radio ont parcouru 100 années-lumière.
Dans une galaxie de 100 000 années-lumière de diamètre.

Zoom arrière progressif. La Terre s'éloigne.
La Voie Lactée apparaît. Puis des millions de galaxies.

NARRATEUR (V.O.)
Nous cherchons de la vie. Nous écoutons.
Mais peut-être que le silence est la réponse.

INSERT — Un radiotélescope géant. Immobile sous les étoiles.
La Voie Lactée au-dessus.

NARRATEUR (V.O.)
Peut-être que la vie intelligente ne crie pas dans l'univers.
Peut-être qu'elle écoute. Comme nous devrions le faire.

FIN`
  },
  {
    id: 'docu-artisan-01',
    title: 'Mains',
    genre: 'documentaire',
    subgenre: 'Artisanat / Humain',
    targetAudience: 'Grand public',
    duration: '2min',
    complexity: 'simple',
    testFocus: ['camera-physics', 'grammar', 'character-bible'],
    script: `INSERT — Des mains. Vieilles. Calleuses. Puissantes.

NARRATEUR (V.O.)
Des mains de charpentier. 42 ans de métier.

Les mains rabotent une planche. Copeaux dorés.

INSERT — D'autres mains. Fines. Tachées d'encre.

NARRATEUR (V.O.)
Des mains de calligraphe. L'encre comme langage.

Les mains tracent un caractère japonais. Pinceau sur papier de riz.

INSERT — Des mains de boulanger. Farine. Pâte.

NARRATEUR (V.O.)
Des mains qui pétrissent. 4 heures du matin. Chaque jour.

INSERT — Des mains de chirurgien. Gants. Précision.

NARRATEUR (V.O.)
Des mains qui sauvent. Un geste, une vie.

INSERT — Des mains d'enfant. Dessin au crayon.

NARRATEUR (V.O.)
Et des mains qui apprennent. Tout commence là.

PLAN LARGE — Toutes les mains ensemble. Montage.

NARRATEUR (V.O.)
L'intelligence n'est pas dans la machine. Elle est au bout des doigts.

FIN`
  },
  {
    id: 'docu-climat-01',
    title: 'Demain Matin',
    genre: 'documentaire',
    subgenre: 'Climat / Environnement',
    targetAudience: 'Grand public, sensibilisation',
    duration: '2min',
    complexity: 'medium',
    testFocus: ['intent', 'tension', 'grammar', 'world-model'],
    script: `EXT. GLACIER — JOUR

Un glacier immense. Bleu profond.

NARRATEUR (V.O.)
Ce glacier a 10 000 ans.

Un bloc de glace se détache. Tombe dans la mer. SPLASH.

NARRATEUR (V.O.)
Il disparaîtra dans 30.

EXT. FORÊT — AUBE

Forêt tropicale. Brume. Oiseaux.

NARRATEUR (V.O.)
Cette forêt produit 20% de notre oxygène.

Coupe. La même forêt. Brûlée. Troncs noirs. Cendres.

NARRATEUR (V.O.)
Elle a perdu 17% de sa surface en 20 ans.

EXT. VILLE — TIMELAPSE

Le soleil se lève. La ville s'éveille. Fumée des usines.

NARRATEUR (V.O.)
Nous savons. Nous avons toujours su.

EXT. CHAMP — JOUR

Un enfant plante un arbre. Petit. Fragile.

NARRATEUR (V.O.)
La question n'est pas ce que nous savons.
C'est ce que nous faisons demain matin.

L'enfant arrose l'arbre. Sourit.

FIN`
  },

  // ═══════════════════════════════════════
  // GAME TRAILER (5 scripts)
  // ═══════════════════════════════════════
  {
    id: 'game-fantasy-01',
    title: 'ASHBORN — Fantasy RPG',
    genre: 'game_trailer',
    subgenre: 'Fantasy / RPG',
    targetAudience: 'Gamers 16-35',
    duration: '1min',
    complexity: 'complex',
    testFocus: ['world-model', 'motion-director', 'style-bible', 'camera-physics'],
    script: `EXT. FORTERESSE EN RUINES — NUIT

Ciel rouge. Cendres qui tombent comme de la neige.

VOIX OFF (V.O.)
Ils ont dit que le feu détruirait tout.

Un GUERRIER en armure noire traverse les ruines. Épée brisée à la main.

EXT. CHAMP DE BATAILLE — FLASHBACK

Des armées s'affrontent. Magie. Feu. Destruction.
Un dragon survole le carnage.

VOIX OFF
Ils avaient tort.

EXT. FORTERESSE — RETOUR

Le guerrier s'arrête devant un trône de cendres.
Il s'agenouille. Ramasse une couronne noircie.

INSERT — Ses yeux. Une flamme y brûle.

VOIX OFF
Le feu n'a pas tout détruit.

Il pose la couronne sur sa tête. Les cendres autour de lui s'embrasent.
Il se lève. Transformé. Armure dorée.

VOIX OFF
Il a forgé un roi.

TITRE : ASHBORN
Sous-titre : "Rise from the ashes"
Date de sortie.

FIN`
  },
  {
    id: 'game-sf-01',
    title: 'NOVA — Sci-Fi',
    genre: 'game_trailer',
    subgenre: 'Science-fiction / Exploration',
    targetAudience: 'Gamers 18-40',
    duration: '1min',
    complexity: 'complex',
    testFocus: ['world-model', 'camera-physics', 'style-bible', 'motion-director'],
    script: `EXT. ESPACE — SILENCE

Une station spatiale en orbite. La Terre en dessous.

VOIX OFF
On nous a envoyés chercher un nouveau monde.

INT. VAISSEAU — CRYOGÉNIE

Des capsules de sommeil. Buée. Lumière bleue froide.
Une PILOTE ouvre les yeux. Désorientée.

PILOTE
Combien de temps...

IA DU VAISSEAU
214 ans, Commandante.

EXT. PLANÈTE INCONNUE — ATTERRISSAGE

Le vaisseau traverse une atmosphère violette.
Des montagnes cristallines. Des océans de mercure.

La pilote descend. Premier pas sur le sol étranger.

INSERT — Son pied laisse une empreinte dans la poussière violette.

PILOTE
C'est... magnifique.

Le sol tremble. Les cristaux vibrent.
Quelque chose émerge du sol. Immense. Vivant.

TITRE : NOVA
"The universe is not empty. It's waiting."

FIN`
  },
  {
    id: 'game-survival-01',
    title: 'HOLLOW — Survival Horror',
    genre: 'game_trailer',
    subgenre: 'Survival Horror',
    targetAudience: 'Gamers 18+',
    duration: '45s',
    complexity: 'complex',
    testFocus: ['tension', 'grammar', 'camera-physics', 'intent'],
    script: `INT. HÔPITAL ABANDONNÉ — NUIT

Noir. Une lampe torche s'allume. Faisceau tremblant.

Un SURVIVANT avance dans un couloir. Murs écaillés. Moisissure.

Son du pas sur le carrelage brisé.

INSERT — Une porte grince. S'ouvre seule.

Le survivant s'arrête. Respiration lourde.

CHUCHOTEMENT (O.S.)
Tu es revenu...

INSERT — Ombre sur le mur. Pas la sienne.

Le survivant court. La caméra le suit en handheld.
Les lumières clignotent. Les portes claquent.

Il tourne un angle. Cul-de-sac.

Il se retourne. La lampe éclaire... rien.

Silence.

Puis la lampe s'éteint.

NOIR TOTAL.

Un souffle dans son oreille.

TITRE : HOLLOW
"Don't look back."

FIN`
  },
  {
    id: 'game-racing-01',
    title: 'APEX — Racing',
    genre: 'game_trailer',
    subgenre: 'Course automobile',
    targetAudience: 'Gamers 16-40',
    duration: '30s',
    complexity: 'medium',
    testFocus: ['motion-director', 'camera-physics', 'grammar'],
    script: `EXT. CIRCUIT — NUIT

Feux de départ. Rouge. Rouge. Vert.

Les voitures s'élancent. Moteurs hurlent.

TRACKING SHOT — La caméra suit une voiture de course. Vitesse pure.

INSERT — Le compteur : 280 km/h.
INSERT — Les mains sur le volant. Gants carbonés.
INSERT — Les pneus mordent le bitume. Étincelles dans le virage.

EXT. LIGNE DROITE — RALENTI

Deux voitures côte à côte. Ralenti extrême.
Le pilote regarde son rival à travers la visière.

ACCÉLÉRATION. Vitesse normale. Le dépassement.

EXT. LIGNE D'ARRIVÉE

Drapeau à damier.

TITRE : APEX
"Every millisecond counts."

FIN`
  },
  {
    id: 'game-medieval-01',
    title: 'SWORN — Medieval',
    genre: 'game_trailer',
    subgenre: 'Action médiévale',
    targetAudience: 'Gamers 16-35',
    duration: '45s',
    complexity: 'complex',
    testFocus: ['world-model', 'motion-director', 'camera-physics', 'tension'],
    script: `EXT. PLAINE — AUBE

Brouillard. Deux armées face à face. Bannières.

VOIX OFF
Un serment a été brisé.

INSERT — Une épée plantée dans le sol.
INSERT — Le visage d'un roi. Cicatrice. Déterminé.

VOIX OFF
Un royaume s'est effondré.

EXT. BATAILLE

Cavalerie charge. Fracas de métal. Boue. Sang.

PLAN SÉQUENCE — Un chevalier traverse la mêlée. Épée, bouclier.
Chaque coup est chorégraphié. Brutal. Élégant.

INSERT — Flèche en vol. Ralenti. Elle traverse le cadre.

VOIX OFF
Mais un homme se lève.

Le chevalier face au château en flammes.
Il retire son casque. Jeune. Déterminé.

VOIX OFF
Et un serment nouveau est forgé.

TITRE : SWORN
"Honor has a price."

FIN`
  },

  // ═══════════════════════════════════════
  // CORPORATE (6 scripts)
  // ═══════════════════════════════════════
  {
    id: 'corpo-tech-01',
    title: 'NEXUS — Tech Startup',
    genre: 'corporate',
    subgenre: 'Startup tech',
    targetAudience: 'Investisseurs, B2B',
    duration: '1min',
    complexity: 'medium',
    testFocus: ['grammar', 'performance', 'rec-engine'],
    script: `INT. BUREAU — MATIN

Open space lumineux. Plantes. Écrans.

NARRATEUR (V.O.)
On nous a dit que l'IA allait remplacer la créativité.

Des développeurs travaillent. Collaboration. Post-its. Whiteboards.

NARRATEUR (V.O.)
Nous, on a décidé de lui donner un réalisateur.

INSERT — Écran : une interface d'analyse cinématographique.
INSERT — Des prompts optimisés qui s'affichent.

PLAN MOYEN — Un créateur voit son scénario se transformer en plans.

NARRATEUR (V.O.)
NEXUS ne remplace pas les créateurs.
NEXUS leur donne des super-pouvoirs.

INSERT — Données : 30 moteurs. 16 axes. 11 modèles IA.

EXT. TERRASSE — JOUR

L'équipe ensemble. Sourires. La ville en fond.

NARRATEUR (V.O.)
La technologie au service de l'intelligence créative.
NEXUS. Think bigger.

LOGO + CTA

FIN`
  },
  {
    id: 'corpo-sante-01',
    title: 'PULSE — Santé',
    genre: 'corporate',
    subgenre: 'Santé / Medtech',
    targetAudience: 'B2B, investisseurs santé',
    duration: '1min',
    complexity: 'medium',
    testFocus: ['grammar', 'intent', 'performance'],
    script: `INT. HÔPITAL — MATIN

Un médecin consulte un écran. Données patient.

NARRATEUR (V.O.)
Chaque seconde, un médecin prend une décision.

INSERT — Battements de cœur sur un moniteur.
INSERT — Un scan cérébral s'affiche.

NARRATEUR (V.O.)
Et si la technologie pouvait l'aider à voir ce que l'œil humain ne voit pas ?

INT. LABORATOIRE

Des chercheurs analysent des images médicales.
L'IA surligne une anomalie invisible à l'œil nu.

NARRATEUR (V.O.)
PULSE analyse 10 000 images par seconde.
Ce que 100 radiologues mettraient 10 jours à faire.

PLAN MOYEN — Le médecin sourit. Diagnostic posé.

INT. CHAMBRE

Le médecin annonce la bonne nouvelle au patient.

NARRATEUR (V.O.)
La technologie ne soigne pas. Les médecins soignent.
PULSE leur donne une longueur d'avance.

LOGO + CTA

FIN`
  },
  {
    id: 'corpo-finance-01',
    title: 'VERTEX — Fintech',
    genre: 'corporate',
    subgenre: 'Finance / Fintech',
    targetAudience: 'B2B, investisseurs',
    duration: '45s',
    complexity: 'simple',
    testFocus: ['grammar', 'performance'],
    script: `EXT. SKYLINE — AUBE

Les tours financières. Le soleil se lève.

NARRATEUR (V.O.)
Les marchés n'attendent personne.

INSERT — Écrans avec données financières. Chiffres qui défilent.
INSERT — Un trader regarde ses écrans. Concentré.

NARRATEUR (V.O.)
VERTEX analyse 500 millions de transactions par jour.
En temps réel.

INSERT — Visualisation de données. Flux lumineux.

NARRATEUR (V.O.)
Pas pour remplacer votre instinct.
Pour le confirmer.

PLAN MOYEN — Le trader prend sa décision. Confiant.

LOGO + CTA
VERTEX — L'intelligence au service de la décision.

FIN`
  },
  {
    id: 'corpo-education-01',
    title: 'SPARK — EdTech',
    genre: 'corporate',
    subgenre: 'Éducation / EdTech',
    targetAudience: 'B2B2C, écoles, parents',
    duration: '1min',
    complexity: 'simple',
    testFocus: ['grammar', 'character-bible', 'performance'],
    script: `INT. SALLE DE CLASSE — MATIN

Des enfants. Tablettes. Chacun avance à son rythme.

NARRATEUR (V.O.)
Chaque enfant apprend différemment.
L'école traite tout le monde pareil.

INSERT — Un enfant bloqué sur un exercice. Frustré.
L'application s'adapte. L'exercice change. Plus simple. Visuel.

L'enfant comprend. Sourit.

NARRATEUR (V.O.)
SPARK s'adapte à chaque cerveau.
Pas l'inverse.

INSERT — Données : progression personnalisée.
INSERT — Un enseignant consulte le tableau de bord. Chaque élève en vert.

PLAN LARGE — La classe. Tous engagés. Pas de décrochage.

NARRATEUR (V.O.)
L'avenir de l'éducation n'est pas plus de technologie.
C'est la bonne technologie.

LOGO + CTA

FIN`
  },
  {
    id: 'corpo-rh-01',
    title: 'HUMAN — RH Tech',
    genre: 'corporate',
    subgenre: 'Ressources humaines',
    targetAudience: 'B2B, DRH',
    duration: '45s',
    complexity: 'simple',
    testFocus: ['grammar', 'performance'],
    script: `INT. OPEN SPACE — JOUR

Des collaborateurs. Divers. Souriants. Concentrés.

NARRATEUR (V.O.)
Le talent ne se mesure pas en diplômes.

INSERT — CV classique. Barré d'un X.
INSERT — Un profil digital. Compétences, projets, soft skills.

NARRATEUR (V.O.)
HUMAN détecte ce que le CV ne dit pas.
Le potentiel. L'adaptabilité. La motivation.

PLAN MOYEN — Un manager en entretien. Il écoute vraiment.

NARRATEUR (V.O.)
L'IA ne recrute pas. Les humains recrutent.
HUMAN les aide à voir au-delà du papier.

LOGO + CTA

FIN`
  },
  {
    id: 'corpo-green-01',
    title: 'TERRA — GreenTech',
    genre: 'corporate',
    subgenre: 'Développement durable',
    targetAudience: 'B2B, investisseurs ESG',
    duration: '1min',
    complexity: 'medium',
    testFocus: ['intent', 'grammar', 'world-model', 'performance'],
    script: `EXT. CHAMP SOLAIRE — AUBE

Des panneaux solaires à perte de vue. Le soleil se lève.

NARRATEUR (V.O.)
L'énergie propre n'est plus l'avenir. C'est le présent.

INSERT — Données : production énergétique en temps réel.
INSERT — Un tableau de bord. Courbes vertes montantes.

NARRATEUR (V.O.)
TERRA optimise chaque watt. Chaque paneau. Chaque éolienne.

EXT. PARC ÉOLIEN — JOUR

Des éoliennes tournent. Majestueuses.

NARRATEUR (V.O.)
Notre algorithme prédit la météo à 72 heures.
Il ajuste la production en temps réel.

INSERT — Avant/après : une facture divisée par 3.

PLAN MOYEN — Un directeur d'usine sourit. Son usine fonctionne au vert.

NARRATEUR (V.O.)
La transition écologique n'est pas un coût.
C'est un investissement.

LOGO + CTA
TERRA — L'intelligence verte.

FIN`
  },

  // ═══════════════════════════════════════
  // ANIMATION (3 scripts)
  // ═══════════════════════════════════════
  {
    id: 'anim-conte-01',
    title: 'L\'Étoile Tombée',
    genre: 'court_metrage',
    subgenre: 'Animation / Conte',
    targetAudience: 'Enfants, familles',
    duration: '2min',
    complexity: 'medium',
    testFocus: ['style-bible', 'world-model', 'character-bible', 'grammar'],
    script: `EXT. CIEL ÉTOILÉ — NUIT

Des milliers d'étoiles. L'une d'elles clignote. Hésite. Tombe.

EXT. FORÊT — NUIT

Une petite étoile lumineuse atterrit dans une clairière.
Elle a peur. Elle est toute petite sur Terre.

Un RENARD s'approche. Curieux.

RENARD
Tu es quoi, toi ?

ÉTOILE
Je suis une étoile. Je suis tombée.

RENARD
Pourquoi ?

ÉTOILE
Je voulais voir de près ce que j'éclairais de loin.

Le renard et l'étoile marchent ensemble dans la forêt.
L'étoile éclaire le chemin.

Ils croisent un HIBOU.

HIBOU
Une étoile par terre ? C'est le monde à l'envers.

ÉTOILE
Peut-être que le monde à l'envers est le bon côté.

EXT. COLLINE — AUBE

Le renard et l'étoile regardent le lever du soleil.

RENARD
Tu dois remonter.

ÉTOILE
Je sais.

Elle s'élève doucement. De plus en plus haut.
Le renard la regarde.

L'étoile reprend sa place dans le ciel. Elle brille plus fort qu'avant.

FIN`
  },
  {
    id: 'anim-robot-01',
    title: 'BOLT',
    genre: 'court_metrage',
    subgenre: 'Animation / Sci-fi enfant',
    targetAudience: 'Enfants 6-12',
    duration: '2min',
    complexity: 'medium',
    testFocus: ['character-bible', 'world-model', 'style-bible'],
    script: `INT. ATELIER — MATIN

Un INVENTEUR construit un petit robot.
Dernier boulon. Tournevis. Clic.

Le robot ouvre les yeux. Des LED bleues.

BOLT
Bonjour.

INVENTEUR
Bonjour, Bolt. Bienvenue au monde.

EXT. VILLE — JOUR

Bolt découvre le monde. Tout l'émerveille.
Un papillon. Il essaie de l'attraper. Trébuche.

Un CHAT le regarde. Méfiant.

BOLT
Tu veux jouer ?

Le chat griffe. Bolt recule. Triste.

INSERT — Son écran-visage affiche un emoji triste.

EXT. PARC — JOUR

Bolt est assis sur un banc. Seul.
Une PETITE FILLE s'assoit à côté.

FILLE
T'es bizarre, toi.

BOLT
Je sais.

FILLE
Moi aussi je suis bizarre.

Elle lui prend la main. Ses LED deviennent roses.

Ils courent ensemble dans le parc. Le chat les suit.

FIN`
  },
  {
    id: 'anim-abstrait-01',
    title: 'FLOW',
    genre: 'clip_musical',
    subgenre: 'Animation abstraite / Expérimental',
    targetAudience: 'Artistes, festivals',
    duration: '1min30',
    complexity: 'complex',
    testFocus: ['style-bible', 'motion-director', 'camera-physics'],
    script: `FOND NOIR.

Un point de lumière. Il pulse au rythme d'un battement de cœur.

Le point se divise. Deux. Quatre. Huit.
Les points forment une constellation qui tourne.

La musique commence. Électronique organique.

Les points deviennent des lignes.
Les lignes deviennent des formes.
Les formes deviennent des visages. Abstraits. Lumineux.

La musique monte. Les formes explosent en particules.
Les particules reforment un paysage.

Montagnes de lumière. Océan de données.
Un arbre fait de filaments lumineux pousse en accéléré.

La caméra traverse l'arbre. Chaque branche est un réseau neural.
Chaque feuille est un pixel.

CLIMAX — Tout converge en un seul point de lumière.

Silence.

Le point pulse. Comme un cœur.

FIN`
  },
]

// ─── Helpers ───
export function getScriptsByGenre(genre: string): TestScript[] {
  return TEST_SCRIPTS.filter(s => s.genre === genre)
}

export function getScriptsByComplexity(complexity: TestScript['complexity']): TestScript[] {
  return TEST_SCRIPTS.filter(s => s.complexity === complexity)
}

export function getScriptsByTestFocus(engine: string): TestScript[] {
  return TEST_SCRIPTS.filter(s => s.testFocus.includes(engine))
}
