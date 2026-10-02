export const THRESHOLD = 80;
const d = (n) => Date.now() - n * 86400000;
/* seeded demo projects already passed review */
export const TRUST = {
  p_acheron: { score: 91, at: d(40) }, p_aurora: { score: 88, at: d(55) }, p_robotlab: { score: 85, at: d(30) }, p_hsip: { score: 83, at: d(25) },
  p_nyx: { score: 84, at: d(33) }, p_orbitwatch: { score: 86, at: d(60) }, p_hearthlight: { score: 81, at: d(20) }, p_openmesh: { score: 87, at: d(45) },
  p_tidesong: { score: 80, at: d(18) }, p_neuromap: { score: 89, at: d(50) }, p_petripal: { score: 90, at: d(38) }, p_carbonscout: { score: 82, at: d(15) },
};
