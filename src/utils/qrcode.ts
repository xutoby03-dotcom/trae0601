export function generateQrCodeData(prepItemId: string, studentId: string): string {
  return `ALLERGY-MEAL:${prepItemId}:${studentId}:${Date.now()}`;
}

export function parseQrCodeData(data: string): { prepItemId: string; studentId: string } | null {
  const parts = data.split(':');
  if (parts.length >= 3 && parts[0] === 'ALLERGY-MEAL') {
    return {
      prepItemId: parts[1],
      studentId: parts[2],
    };
  }
  return null;
}
