# Temas do Foco — como trocar imagem, vídeo e som

Cada pasta em `public/focus/themes/<id>/` é um tema. O app procura **exatamente** estes nomes:

```
public/focus/themes/<id>/
  cover.jpg     ← fundo estático (obrigatório)
  loop.webm     ← vídeo em loop (opcional)
  audio.mp3     ← som ambiente em loop (opcional)
  audio.ogg     ← fallback de som (opcional)
```

Ids atuais:

- `oceano-quieto`
- `canto-no-campo`
- `companhia`
- `estrada`
- `cafeteria`
- `chuva`
- `onda-de-foco`
- `classico`
- `silencio`

## Imagem — `cover.jpg`

- Formato: **JPG** (ou troque o código se preferir `.webp`)
- Proporção: **16:9**
- Tamanho sugerido: **1920×1080** (até 2560×1440)
- Peso: até **400 KB** se for JPG, ou **WebP ~200 KB**
- Sem texto na imagem

## Vídeo — `loop.webm` (opcional)

Quando este arquivo existir, ele substitui o `cover.jpg` como fundo animado.

- Formato: **WebM (VP9)** — menor e mais suave no navegador
- Alternativa aceitável: `loop.mp4` (H.264) — se for usar MP4, avise para apontarmos o player
- Sem áudio no vídeo (o som vai no `audio.mp3`)
- Loop contínuo, sem cortes bruscos no início/fim
- Duração: **8 a 20 segundos**
- Resolução: **1920×1080** (ou 1280×720 se o arquivo ficar pesado)
- Peso: **2 a 8 MB**
- `muted` + `playsinline` (o app já trata isso)

## Som — `audio.mp3`

Quando o arquivo existir, o app usa ele no lugar do som gerado no navegador.

- Formato principal: **MP3, 128–192 kbps, stereo, 44.1 kHz**
- Fallback: **OGG Vorbis** (`audio.ogg`)
- Loop: o começo e o fim devem se encontrar (crossfade de 1–2 s na edição)
- Duração: **30 s a 3 min** (o player repete)
- Volume master: grave o arquivo em volume médio; o usuário controla no app
- Sem vocais, sem falas inteligíveis, sem picos

Sugestão de conteúdo por tema:

| Pasta            | Som                          |
|------------------|------------------------------|
| oceano-quieto    | ondas lentas, vento leve     |
| canto-no-campo   | pássaros, grama, sem galo    |
| companhia        | teclado, murmurinho de sala  |
| estrada          | motor baixo, asfalto, sem buzina |
| cafeteria        | xícaras, conversas ao fundo  |
| chuva            | chuva constante na janela    |
| onda-de-foco     | ruído marrom + beat 40 Hz    |
| classico         | piano/orquestra instrumental |
| silencio         | deixe **sem** audio.mp3      |

## Ordem de prioridade no app

1. Se existir `loop.webm` → vídeo de fundo
2. Senão → `cover.jpg`
3. Se existir `audio.mp3` (ou `.ogg`) → toca o arquivo
4. Senão → som gerado no navegador (exceto **Silêncio total**)
