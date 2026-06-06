import { Score, Note, DURATION_VALUES, Measure } from '../types/score';

export function exportPNG(canvas: HTMLCanvasElement, filename: string = 'score.png') {
  const dataURL = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataURL;
  link.click();
}

function noteToMusicXMLStep(note: Note): string {
  const pitchMap: Record<number, string> = {
    1: 'C', 2: 'D', 3: 'E', 4: 'F', 5: 'G', 6: 'A', 7: 'B',
  };

  if (note.pitch === null) {
    return `
      <note>
        <rest />
        <duration>${DURATION_VALUES[note.duration] * 4}</duration>
        <voice>${note.voice === 'melody' ? '1' : '2'}</voice>
        <type>${getMusicXMLType(note.duration)}</type>
      </note>`;
  }

  const step = pitchMap[note.pitch];
  const octave = 4 + note.octave;
  let alter = 0;
  if (note.accidental === 'sharp') alter = 1;
  if (note.accidental === 'flat') alter = -1;

  return `
      <note>
        <pitch>
          <step>${step}</step>
          ${alter !== 0 ? `<alter>${alter}</alter>` : ''}
          <octave>${octave}</octave>
        </pitch>
        <duration>${DURATION_VALUES[note.duration] * 4}</duration>
        <voice>${note.voice === 'melody' ? '1' : '2'}</voice>
        <type>${getMusicXMLType(note.duration)}</type>
        <lyric>
          <text>${note.lyrics || ''}</text>
        </lyric>
      </note>`;
}

function getMusicXMLType(duration: string): string {
  const map: Record<string, string> = {
    whole: 'whole',
    half: 'half',
    quarter: 'quarter',
    eighth: 'eighth',
    sixteenth: '16th',
  };
  return map[duration] || 'quarter';
}

function measureToMusicXML(measure: Measure, measureIdx: number, score: Score): string {
  let notesXml = '';
  
  [...measure.melody, ...measure.harmony].forEach((note) => {
    notesXml += noteToMusicXMLStep(note);
  });

  return `
    <measure number="${measureIdx + 1}">
      <attributes>
        <divisions>4</divisions>
        <key>
          <fifths>0</fifths>
        </key>
        <time>
          <beats>${score.timeSignature.numerator}</beats>
          <beat-type>${score.timeSignature.denominator}</beat-type>
        </time>
        <clef>
          <sign>G</sign>
          <line>2</line>
        </clef>
      </attributes>${notesXml}
    </measure>`;
}

export function exportMusicXML(score: Score, filename: string = 'score.xml') {
  let measuresXml = '';
  score.measures.forEach((measure, idx) => {
    measuresXml += measureToMusicXML(measure, idx, score);
  });

  const musicXml = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="4.0">
  <work>
    <work-title>${score.title}</work-title>
  </work>
  <part-list>
    <score-part id="P1">
      <part-name>${score.title}</part-name>
    </score-part>
  </part-list>
  <part id="P1">${measuresXml}
  </part>
</score-partwise>`;

  const blob = new Blob([musicXml], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = filename;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}
