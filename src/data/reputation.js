/* history of people who were here before this browser session (demo data) */
const z = { launched: 0, funded: 0, done: 0, evidence: 0, updates: 0, games: 0, reviews: [] };
export const REP_SEED = {
  u_dayana: { launched: 3, funded: 3, done: 2, evidence: 2, updates: 6, games: 0, reviews: [91, 83, 84] },
  u_maya: { launched: 3, funded: 2, done: 3, evidence: 3, updates: 14, games: 1, reviews: [85, 88] },
  u_alex: { launched: 2, funded: 2, done: 2, evidence: 2, updates: 11, games: 0, reviews: [88, 90] },
  u_priya: { launched: 2, funded: 1, done: 1, evidence: 1, updates: 7, games: 1, reviews: [89] },
  u_tomas: { launched: 4, funded: 2, done: 2, evidence: 2, updates: 19, games: 2, reviews: [81, 84] },
  u_lena: { launched: 1, funded: 1, done: 1, evidence: 1, updates: 5, games: 0, reviews: [86] },
  u_kofi: { launched: 3, funded: 3, done: 3, evidence: 3, updates: 16, games: 0, reviews: [90, 87, 89] },
  u_sora: { launched: 2, funded: 1, done: 1, evidence: 1, updates: 6, games: 0, reviews: [80] },
  u_jun: { launched: 2, funded: 2, done: 2, evidence: 1, updates: 9, games: 0, reviews: [87] },
  u_amara: { launched: 1, funded: 1, done: 0, evidence: 0, updates: 3, games: 0, reviews: [82] },
  u_marcus: { launched: 1, funded: 1, done: 1, evidence: 1, updates: 4, games: 0, reviews: [85] },
  u_nadia: { ...z, updates: 2 }, u_ines: { ...z, updates: 1 }, u_oliver: { ...z, launched: 1, updates: 3 }, u_felix: { launched: 1, funded: 0, done: 0, evidence: 0, updates: 4, games: 0, reviews: [] },
};
export const repSeed = (id) => REP_SEED[id] || { ...z };
