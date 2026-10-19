import { leerVerifySuccess, paseDelRtlog, respuestaShell } from './verify-success.util.js';

// Líneas reales del G4 Pro HSR3263100192 (17/10/2026).
const ARCHIVO = [
  '2026-10-17 18:46:09 553:userPin->48058719; userName->Amiel Bautista:     ',
  '2026-10-17 18:48:41 446:userPin->15724705; userName->Fernando Herrera Broncales:     ',
  '2026-10-17 19:00:00 300:userPin->48058719; userName->Amiel Bautista:     ',
].join('\n');

describe('VerifySuccess.txt del G4 Pro', () => {
  it('lee el DNI, el nombre y la hora de cada pase', () => {
    const pases = leerVerifySuccess(ARCHIVO);
    expect(pases).toHaveLength(3);
    expect(pases[1]).toMatchObject({ pin: '15724705', nombre: 'Fernando Herrera Broncales' });
    expect(pases[1].hora.getTime()).toBe(new Date('2026-10-17T18:48:41.446').getTime());
  });

  it('ignora líneas que no entiende', () => {
    expect(leerVerifySuccess('basura\n\n2026-10-17 18:48:41 446:userPin->; userName->X:')).toEqual([]);
  });

  it('une cada rtlog con su línea (se escribe ~1 s después)', () => {
    const pases = leerVerifySuccess(ARCHIVO);
    // rtlog reales: 18:48:40 (Fernando) y 18:59:59 (Amiel).
    expect(paseDelRtlog(pases, new Date('2026-10-17T18:48:40'))?.pin).toBe('15724705');
    expect(paseDelRtlog(pases, new Date('2026-10-17T18:59:59'))?.pin).toBe('48058719');
  });

  it('la línea del pase anterior (antes del rtlog) no se toma: todavía no se escribe la de este', () => {
    // Pasó Fernando (18:48:41.446) y enseguida otro rtlog a las 18:48:42, cuya línea aún no está.
    expect(paseDelRtlog(leerVerifySuccess(ARCHIVO), new Date('2026-10-17T18:48:42'))).toBeNull();
  });

  it('sin línea cercana (todavía no se escribe): null', () => {
    expect(paseDelRtlog(leerVerifySuccess(ARCHIVO), new Date('2026-10-17T19:10:00'))).toBeNull();
  });

  it('dos personas distintas en el mismo rango: no se sabe cuál fue', () => {
    const pases = leerVerifySuccess(
      '2026-10-17 18:48:41 000:userPin->111; userName->A:\n2026-10-17 18:48:45 000:userPin->222; userName->B:',
    );
    expect(paseDelRtlog(pases, new Date('2026-10-17T18:48:40'))).toBeNull();
  });

  it('extrae la salida de la respuesta de un SHELL', () => {
    const cuerpo = `ID=3105\nSN=HSR3263100192\nReturn=0\nCMD=Shell\nFILENAME=shellout.txt\nContent=${ARCHIVO}\n`;
    expect(respuestaShell(cuerpo)).toEqual({ id: 3105, salida: `${ARCHIVO}\n` });
    expect(respuestaShell('ID=1&Return=0&CMD=DATA')).toBeNull();
  });
});
