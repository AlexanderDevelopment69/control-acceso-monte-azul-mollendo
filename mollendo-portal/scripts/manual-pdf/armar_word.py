"""Manual del administrador o del vigilante en Word, con el formato del Documento
Funcional (portada, índice, encabezado y pie) y el contenido extraído del portal."""
import json
import os
import re
import struct
import sys
import zipfile
from html.parser import HTMLParser
from xml.sax.saxutils import escape

ORIGINAL, CARPETA, SALIDA, NOMBRE, DESCRIPCION_VERSION = sys.argv[1:6]

z = zipfile.ZipFile(ORIGINAL)
doc = z.read('word/document.xml').decode('utf8')
cab = doc[:doc.index('<w:body>') + 8]
cuerpo = doc[doc.index('<w:body>') + 8:doc.rindex('</w:body>')]
fin = doc[doc.rindex('</w:body>'):]
els = re.findall(r'(<w:p[ >].*?</w:p>|<w:tbl>.*?</w:tbl>|<w:sectPr.*?</w:sectPr>|<w:p/>)', cuerpo, re.S)
sect = els[-1]
manual = json.load(open(os.path.join(CARPETA, 'manual.json'), encoding='utf-8'))


# ---------- Texto ----------
def run(texto, negrita=False, extra=''):
    rpr = ('<w:b/><w:bCs/>' if negrita else '') + extra
    return f'<w:r><w:rPr>{rpr}<w:lang w:val="es-PE"/></w:rPr><w:t xml:space="preserve">{escape(texto)}</w:t></w:r>'


def parrafo_runs(runs, sangria=0, despues=120):
    ind = f'<w:ind w:left="{sangria}"/>' if sangria else ''
    return f'<w:p><w:pPr><w:spacing w:after="{despues}" w:line="276" w:lineRule="auto"/>{ind}<w:jc w:val="both"/></w:pPr>{runs}</w:p>'


def vineta_runs(runs, nivel=0):
    return (f'<w:p><w:pPr><w:pStyle w:val="ListParagraph"/><w:numPr><w:ilvl w:val="{nivel}"/><w:numId w:val="2"/></w:numPr>'
            f'<w:spacing w:after="60" w:line="276" w:lineRule="auto"/><w:rPr><w:lang w:val="es-PE"/></w:rPr></w:pPr>{runs}</w:p>')


def titulo(estilo, texto, marcador=None, salto=False, n=[200]):
    r = run(texto)
    if marcador:
        n[0] += 1
        r = f'<w:bookmarkStart w:id="{n[0]}" w:name="{marcador}"/>{r}<w:bookmarkEnd w:id="{n[0]}"/>'
    sal = '<w:pageBreakBefore/>' if salto else ''
    return f'<w:p><w:pPr><w:pStyle w:val="{estilo}"/><w:keepNext/>{sal}<w:rPr><w:lang w:val="es-PE"/></w:rPr></w:pPr>{r}</w:p>'


def numero_punto(n, texto):
    return (f'<w:p><w:pPr><w:keepNext/><w:spacing w:before="160" w:after="60"/><w:ind w:left="400" w:hanging="400"/></w:pPr>'
            f'<w:r><w:rPr><w:b/><w:bCs/><w:color w:val="FFFFFF"/><w:shd w:val="clear" w:color="auto" w:fill="465FFF"/></w:rPr><w:t xml:space="preserve"> {n} </w:t></w:r>'
            f'<w:r><w:tab/></w:r>{run(texto, True, "<w:color w:val=\"1F3864\"/>")}</w:p>')


class HtmlABloques(HTMLParser):
    """p, ul/li, b/strong y las etiquetas de color (Badge) → párrafos y viñetas de Word."""

    def __init__(self, sangria):
        super().__init__()
        self.bloques, self.runs, self.negrita, self.lista, self.sangria = [], [], 0, 0, sangria

    def cerrar(self):
        texto = ''.join(self.runs).strip()
        if texto:
            r = ''.join(self.runs)
            self.bloques.append(vineta_runs(r, min(self.lista - 1, 1)) if self.lista else parrafo_runs(r, self.sangria))
        self.runs = []

    def handle_starttag(self, tag, attrs):
        clase = dict(attrs).get('class', '') or ''
        if tag in ('p', 'li', 'div'):
            self.cerrar()
        if tag == 'ul':
            self.cerrar()
            self.lista += 1
        if tag in ('b', 'strong') or ('rounded-full' in clase and tag == 'span'):
            self.negrita += 1
            self._marcas = getattr(self, '_marcas', []) + [tag]
        elif tag == 'span':
            self._marcas = getattr(self, '_marcas', []) + [None]
        if tag == 'br':
            self.cerrar()

    def handle_endtag(self, tag):
        if tag in ('p', 'li', 'div'):
            self.cerrar()
        if tag == 'ul':
            self.cerrar()
            self.lista -= 1
        if tag in ('b', 'strong'):
            self.negrita = max(0, self.negrita - 1)
        if tag == 'span':
            marcas = getattr(self, '_marcas', [])
            if marcas:
                if marcas.pop() == 'span':
                    self.negrita = max(0, self.negrita - 1)

    def handle_data(self, data):
        data = re.sub(r'\s+', ' ', data)
        if data.startswith('→') and self.runs:
            data = ' ' + data
        if data.strip() or (self.runs and data == ' '):
            self.runs.append(run(data, self.negrita > 0))


def html_a_word(html, sangria=0):
    h = HtmlABloques(sangria)
    h.feed(html)
    h.cerrar()
    return ''.join(h.bloques)


# ---------- Imágenes ----------
imagenes = []  # (rId, nombre en media, datos)
PLANTILLA_IMG = els[60]


def imagen(archivo):
    datos = open(os.path.join(CARPETA, archivo), 'rb').read()
    ancho, alto = struct.unpack('>II', datos[16:24])
    cx = 6120000
    cy = int(cx * alto / ancho)
    tope = 6900000
    if cy > tope:
        cx, cy = int(cx * tope / cy), tope
    i = len(imagenes) + 1
    rid, nombre = f'rIdMan{i}', f'manual{i}.png'
    imagenes.append((rid, nombre, datos))
    x = PLANTILLA_IMG.replace('r:embed="rId7"', f'r:embed="{rid}"')
    x = re.sub(r'cx="\d+" cy="\d+"', f'cx="{cx}" cy="{cy}"', x)
    x = re.sub(r'<wp:docPr id="\d+" name="[^"]*" descr="[^"]*" title="[^"]*"/>', f'<wp:docPr id="{100 + i}" name="captura{i}" descr="Captura"/>', x)
    return x


# ---------- Portada e índice ----------
def cambiar_texto(p, viejo, nuevo):
    return p.replace(f'<w:t>{viejo}</w:t>', f'<w:t>{escape(nuevo)}</w:t>')


salida = [els[0],
          cambiar_texto(els[1], 'DOCUMENTO FUNCIONAL', NOMBRE.upper()),
          els[2],
          cambiar_texto(els[3], 'Terminal Monte Azul Mollendo (TMAM) · Alcance base', 'Terminal Monte Azul Mollendo (TMAM)')]
# Los manuales no llevan versión (pedido de TMAM, 27/10/2026): ni la línea de la portada
# (els[4]), ni la tabla "Control de versiones", ni la versión del pie.
salida.append(els[7])
salida.append(els[8])
for i, s in enumerate(manual, 1):
    e = els[9].replace('<w:t>1.</w:t>', f'<w:t>{i}.</w:t>').replace('<w:t>Introducción</w:t>', f'<w:t>{escape(s["titulo"])}</w:t>')
    salida.append(e.replace('w:anchor="sec_1"', f'w:anchor="sec_{i}"').replace('PAGEREF sec_1 ', f'PAGEREF sec_{i} '))
salida.append(els[21])

# ---------- Secciones ----------
for i, s in enumerate(manual, 1):
    salida.append(titulo('Heading1', f'{i}. {s["titulo"]}', f'sec_{i}', salto=i > 1))
    if s['descripcion']:
        salida.append(parrafo_runs(run(s['descripcion'], extra='<w:color w:val="595959"/>')))
    varias = len(s['pantallas']) > 1
    for j, p in enumerate(s['pantallas'], 1):
        if varias:
            salida.append(titulo('Heading2', f'{i}.{j}. {p["titulo"]}'))
            if p['descripcion']:
                salida.append(parrafo_runs(run(p['descripcion'], extra='<w:i/><w:color w:val="595959"/>')))
        if p['imagen']:
            salida.append(imagen(p['imagen']))
        for k, punto in enumerate(p['puntos'], 1):
            salida.append(numero_punto(k, punto['titulo']))
            salida.append(html_a_word(punto['html'], sangria=400))
        if p['html']:
            salida.append(html_a_word(p['html']))

nuevo = cab + ''.join(salida) + sect + fin

# ---------- Escribir ----------
with zipfile.ZipFile(SALIDA, 'w', zipfile.ZIP_DEFLATED) as out:
    for item in z.infolist():
        datos = z.read(item.filename)
        if item.filename == 'word/document.xml':
            datos = nuevo.encode('utf8')
        elif item.filename == 'word/_rels/document.xml.rels':
            rels = ''.join(f'<Relationship Id="{rid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/{nombre}"/>'
                           for rid, nombre, _ in imagenes)
            datos = datos.decode('utf8').replace('</Relationships>', rels + '</Relationships>').encode('utf8')
        elif item.filename == 'word/footer1.xml':
            datos = datos.decode('utf8').replace('Versión final · 02/10/2026', '').encode('utf8')
        elif item.filename == 'word/header1.xml':
            datos = datos.decode('utf8').replace('Documento funcional', escape(NOMBRE)).encode('utf8')
        out.writestr(item, datos)
    for _, nombre, datos in imagenes:
        out.writestr(f'word/media/{nombre}', datos)
print('ok', len(imagenes), 'imágenes')
