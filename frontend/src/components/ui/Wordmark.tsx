const glyphs: Record<string, string[]> = {
  A: ['01110','10001','10001','11111','10001','10001','10001'],
  N: ['10001','11001','11001','10101','10011','10011','10001'],
  I: ['111','010','010','010','010','010','111'],
  T: ['11111','00100','00100','00100','00100','00100','00100'],
  R: ['11110','10001','10001','11110','10100','10010','10001'],
  C: ['01111','10000','10000','10000','10000','10000','01111'],
  K: ['10001','10010','10100','11000','10100','10010','10001'],
};

export default function Wordmark() {
  let offset = 0;
  const dots = [...'ANITRACK'].flatMap((letter, index) => {
    const rows = glyphs[letter];
    const x = offset;
    offset += rows[0].length + 2;
    return rows.flatMap((row, y) => [...row].flatMap((bit, column) =>
      bit === '1' ? [<circle key={`${index}-${y}-${column}`} cx={(x + column) * 3 + 1} cy={y * 3 + 1} r="1" />] : []));
  });
  return <svg className="wordmark-art" viewBox={`0 0 ${(offset - 2) * 3} 21`} role="img" aria-label="AniTrack" fill="currentColor">{dots}</svg>;
}
