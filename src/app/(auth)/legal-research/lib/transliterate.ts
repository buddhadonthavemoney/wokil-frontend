const MAP: [string, string][] = [
  ['ksh', 'क्ष'], ['gya', 'ज्ञ'], ['tra', 'त्र'], ['chh', 'छ'],
  ['sh', 'श'], ['Sh', 'ष'], ['th', 'थ'], ['Th', 'ठ'], ['dh', 'ध'],
  ['Dh', 'ढ'], ['ph', 'फ'], ['bh', 'भ'], ['ch', 'च'], ['kh', 'ख'],
  ['gh', 'घ'], ['jh', 'झ'], ['ng', 'ङ'], ['nn', 'ण'], ['ny', 'ञ'],
  ['k', 'क'], ['g', 'ग'], ['c', 'च'], ['j', 'ज'], ['T', 'ट'],
  ['D', 'ड'], ['N', 'ण'], ['t', 'त'], ['d', 'द'], ['n', 'न'],
  ['p', 'प'], ['b', 'ब'], ['m', 'म'], ['y', 'य'], ['r', 'र'],
  ['l', 'ल'], ['v', 'व'], ['w', 'व'], ['s', 'स'], ['h', 'ह'],
  ['aa', 'आ'], ['ii', 'ई'], ['uu', 'ऊ'], ['ai', 'ऐ'], ['au', 'औ'],
  ['ei', 'ऐ'], ['ou', 'औ'], ['ee', 'ई'], ['oo', 'ऊ'],
  ['a', 'अ'], ['i', 'इ'], ['u', 'उ'], ['e', 'ए'], ['o', 'ओ'],
];

const MATRA: Record<string, string> = {
  'अ': '', 'आ': 'ा', 'इ': 'ि', 'ई': 'ी', 'उ': 'ु',
  'ऊ': 'ू', 'ए': 'े', 'ऐ': 'ै', 'ओ': 'ो', 'औ': 'ौ',
};

const VOWELS = new Set('aeiouAEIOU');
const CONSONANTS = new Set('bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ');

function isDevConsonant(ch: string): boolean {
  const c = ch.charCodeAt(0);
  return c >= 0x0915 && c <= 0x0939;
}

export function transliterate(roman: string): string {
  let out = '';
  let i = 0;
  while (i < roman.length) {
    let matched = false;
    for (const [from, to] of MAP) {
      if (roman.startsWith(from, i)) {
        const last = out.charAt(out.length - 1);
        if (VOWELS.has(from[0]) && isDevConsonant(last)) {
          out += MATRA[to] ?? to;
        } else if (CONSONANTS.has(from[0]) && isDevConsonant(last)) {
          out += '्' + to;
        } else {
          out += to;
        }
        i += from.length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      out += roman[i];
      i++;
    }
  }
  return out;
}

const SUGGEST_URL = 'https://inputtools.google.com/request';

let inflightController: AbortController | null = null;

export async function fetchSuggestions(roman: string): Promise<string[]> {
  const clean = roman.trim().toLowerCase();
  if (clean.length < 1) return [];

  if (inflightController) inflightController.abort();
  inflightController = new AbortController();

  const phonetic = transliterate(clean);

  if (clean.length < 2) return phonetic ? [phonetic] : [];

  try {
    const url = `${SUGGEST_URL}?itc=ne-t-i0-und&num=6&cp=0&cs=1&ie=utf-8&oe=utf-8&app=jsapi&text=${encodeURIComponent(clean)}`;
    const res = await fetch(url, {
      signal: inflightController.signal,
      credentials: 'omit',
      mode: 'cors',
    });
    if (!res.ok) return phonetic ? [phonetic] : [];
    const data = await res.json();
    if (!Array.isArray(data) || data[0] !== 'SUCCESS') return phonetic ? [phonetic] : [];
    const block = data[1]?.[0];
    const list: string[] = (block?.[1] ?? []).filter(
      (s: unknown): s is string => typeof s === 'string' && /[ऀ-ॿ]/.test(s),
    );
    const seen = new Set(list);
    if (phonetic && !seen.has(phonetic)) list.push(phonetic);
    return list.length > 0 ? list : phonetic ? [phonetic] : [];
  } catch {
    return phonetic ? [phonetic] : [];
  }
}
