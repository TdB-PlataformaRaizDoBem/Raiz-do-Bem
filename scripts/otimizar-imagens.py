"""
Gera os .webp de src/assets/img a partir dos originais em design-originais/img.

Por quê: os PNG/JPG originais pesavam de 190 KB a 2,8 MB e eram exibidos em 200-800 px.
Rodar de novo ao trocar ou adicionar uma imagem:  python scripts/otimizar-imagens.py
Requer: pip install pillow
"""
from pathlib import Path
from PIL import Image

RAIZ = Path(__file__).resolve().parent.parent
ORIGEM = RAIZ / "design-originais" / "img"
DESTINO = RAIZ / "src" / "assets" / "img"

# arquivo original -> lista de (sufixo, largura máxima ou None p/ tamanho natural, qualidade)
ALVOS = {
    # hero: 3 larguras para srcset
    "hero-dentista-exame.jpg": [("-640", 640, 72), ("-1024", 1024, 72), ("-1600", 1600, 70)],
    "apolonia-atendimento-odontologico.jpg": [("", 800, 76)],
    "criancas-escovando-dentes.jpg": [("", 800, 76)],
    "voluntarios-atendimento.jpg": [("", 1000, 76)],
    "dentistas-tdb.png": [("", 800, 70)],
    "dentinhoIntegrantes.png": [("", 640, 80)],
    "mascote.png": [("", 800, 80)],
    "imagemLogin.png": [("", 1000, 78)],
    "dentistaDoBem2.png": [("", None, 80)],
    "Apolonia2.png": [("", None, 80)],
    "dentinhoRegando.png": [("", None, 80)],
    "dentistaConfiante.png": [("", None, 80)],
    "dentinhoContato.png": [("", None, 80)],
    "img-about-tdb.png": [("", None, 80)],
    "member-murilo.png": [("", None, 80)],
    "member-paulo-2.png": [("", None, 80)],
    "member-renan.png": [("", None, 80)],
    "brasil.png": [("", None, 80)],
}

for nome, variantes in ALVOS.items():
    origem = ORIGEM / nome
    if not origem.exists():
        print("pulando (original ausente):", nome)
        continue
    base = origem.stem
    with Image.open(origem) as im:
        for sufixo, largura, qualidade in variantes:
            img = im.copy()
            if largura and img.width > largura:
                altura = round(img.height * largura / img.width)
                img = img.resize((largura, altura), Image.LANCZOS)
            saida = DESTINO / f"{base}{sufixo}.webp"
            img.save(saida, "WEBP", quality=qualidade, method=6)
            print(f"{saida.name}: {saida.stat().st_size // 1024} KB ({img.width}x{img.height})")
