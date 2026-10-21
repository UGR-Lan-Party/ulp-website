export const freePlayExperiences = [
  {
    id: 'consolas',
    number: '01',
    title: 'Una partida entre colegas',
    category: 'Consolas',
    description:
      'Un mando para ti y otro para quien se apunte. Multijugador en consola para compartir la partida y las risas.',
    image: '/assets/activities/juego-libre.png',
    minutes: 15,
    duration: '15–30 min',
    groups: ['duo', 'group'],
    moods: ['share', 'duel'],
    players: '2 o más, según el juego',
    location: 'Entrada del Edificio Principal',
    plan: 'principal-0',
    icon: 'controller',
  },
  {
    id: 'retro',
    number: '02',
    title: 'Los clásicos siguen jugando',
    category: 'Juego retro',
    description:
      'Reencuéntrate con un clásico o descubre uno que te perdiste. Aquí siempre cabe otra generación de jugadores.',
    image: '/assets/activities/retro.png',
    minutes: 10,
    duration: '10–20 min',
    groups: ['solo', 'duo', 'group'],
    moods: ['share', 'explore'],
    players: 'A tu aire o en compañía',
    location: 'Aula −1.1',
    plan: 'aulas-inferiores',
    icon: 'arcade',
  },
  {
    id: 'racing',
    number: '03',
    title: 'La siguiente vuelta es tuya',
    category: 'Simulador de racing',
    description:
      'Ponte al volante, aprende la trazada y busca una vuelta que quieras repetir. Cada curva cuenta.',
    image: '/assets/activities/racing.png',
    minutes: 10,
    duration: '10–15 min',
    groups: ['solo'],
    moods: ['duel', 'explore'],
    players: '1 persona por turno',
    location: 'Hall del Edificio Principal',
    plan: 'principal-hall',
    icon: 'wheel',
  },
  {
    id: 'vr',
    number: '04',
    title: 'Cambia de perspectiva',
    category: 'Realidad virtual',
    description:
      'Prueba otra forma de jugar con las gafas de realidad virtual. Acércate a la zona para conocer las experiencias disponibles.',
    image: '/assets/activities/vr.png',
    minutes: 10,
    duration: '10–20 min',
    groups: ['solo'],
    moods: ['explore'],
    players: '1 persona por turno',
    location: 'Hall del Edificio Principal',
    plan: 'principal-hall',
    icon: 'vr',
  },
  {
    id: 'fighting',
    number: '05',
    title: 'Nos vemos en el siguiente round',
    category: 'Fighting games',
    description:
      'Elige personaje y comparte un duelo. Una buena ocasión para probar la lucha o intercambiar algún combo.',
    image: '/assets/activities/fighting.png',
    minutes: 10,
    duration: '10–15 min',
    groups: ['duo'],
    moods: ['duel'],
    players: '2 personas',
    location: 'Recinto ETSIIT',
    plan: 'recinto',
    icon: 'controller',
  },
  {
    id: 'hacking',
    number: '06',
    title: 'La curiosidad también juega',
    category: 'Hacking ético',
    description:
      'Acércate a los retos preparados con Hackiit. Explora, aprende y pon a prueba tu ingenio en el entorno del reto.',
    image: '/assets/activities/hackiit.png',
    minutes: 30,
    duration: '30 min o más',
    groups: ['solo', 'duo', 'group'],
    moods: ['explore', 'share'],
    players: 'Individual o compartiendo ideas',
    location: 'Sala de Profesores Externos',
    plan: 'principal-baja',
    icon: 'code',
  },
  {
    id: 'ping-pong',
    number: '07',
    title: 'Una pausa con mucho efecto',
    category: 'Ping pong',
    description:
      'Cambia la pantalla por una pala y comparte una partida en el bajo exterior entre los edificios.',
    image: null,
    minutes: 10,
    duration: '10–20 min',
    groups: ['duo', 'group'],
    moods: ['duel', 'share'],
    players: '2 o 4 personas',
    location: 'Bajo exterior entre edificios',
    plan: 'bajo-exterior',
    icon: 'paddle',
  },
  {
    id: 'futbolin',
    number: '08',
    title: 'La revancha, en los bancos rojos',
    category: 'Futbolín',
    description:
      'Unas barras, un balón y otra manera de jugar en equipo. Encuentra la zona de futbolín junto a los bancos rojos.',
    image: null,
    minutes: 10,
    duration: '10–20 min',
    groups: ['duo', 'group'],
    moods: ['duel', 'share'],
    players: '2 o 4 personas',
    location: 'Bancos rojos',
    plan: 'bancos-rojos',
    icon: 'foosball',
  },
];

export function matchFreePlay({
  time = 'any',
  group = 'any',
  mood = 'any',
} = {}) {
  if (
    !['any', '15', '30', '60'].includes(time) ||
    !['any', 'solo', 'duo', 'group'].includes(group) ||
    !['any', 'share', 'duel', 'explore'].includes(mood)
  )
    throw new Error('Invalid experience filters');
  return freePlayExperiences.filter(
    (item) =>
      (time === 'any' || item.minutes <= Number(time)) &&
      (group === 'any' || item.groups.includes(group)) &&
      (mood === 'any' || item.moods.includes(mood)),
  );
}
