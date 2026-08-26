# Temas do Foco — como trocar imagem, vídeo e som

## Área visual do Foco

A rota **Foco** não fica mais limitada por um card: a cena ocupa toda a área disponível abaixo do cabeçalho.

- **No app:** largura disponível depois do menu lateral × `calc(100dvh - 76px)`.
- **Em tela cheia:** `100vw × 100dvh`.
- **Proporção de criação:** **16:9**. Crie o arquivo mestre em **3840×2160** e entregue uma versão otimizada em **1920×1080**.
- **Área segura:** deixe os 10% das bordas livres de elementos importantes e não coloque texto na cena; os controles do timer podem aparecer sobre qualquer parte do vídeo.
- A cena é exibida com `object-fit: cover`, então as bordas podem ser cortadas em telas ultrawide ou verticais. O assunto principal deve ficar no centro de 80% da imagem.

Isso é o formato ideal para paisagens, cachoeira, floresta e animais com animação suave. Use a imagem `cover.jpg` como poster/backup do vídeo.

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
- Alternativa aceitável: `loop.mp4` (H.264) — se for usar MP4, a extensão precisa ser apontada no player
- Sem áudio no vídeo (o som vai no `audio.mp3`)
- Loop contínuo, sem cortes bruscos no início/fim
- Duração: **8 a 20 segundos**
- Resolução: **1920×1080** (ou 1280×720 se o arquivo ficar pesado)
- Peso: **2 a 8 MB**
- `muted` + `playsinline` (o app já trata isso)

## Som — `audio.mp3`

Quando o arquivo existir, o app usa ele no lugar do som gerado no navegador.

- Formato principal: **MP3, 128–192 kbps, stereo, 44.1 kHz**
- Fallback: **OGG Vorbis** (`audio.ogg`); para novos arquivos, Opus em `.ogg` também funciona muito bem
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

## Para adicionar um tema novo

1. Crie `public/focus/themes/<id-do-tema>/` com `cover.jpg` e, se houver, `loop.webm`, `audio.mp3` e `audio.ogg`.
2. Adicione o id em `src/lib/ocean/focus.ts` e uma etiqueta traduzida em `src/components/focus/FocusStage.tsx`.
3. O id deve ser minúsculo, sem espaços e com hífens, por exemplo: `floresta-cachoeira`.
4. Para animações vetoriais leves de interface, use Lottie (`.json`) como sobreposição; para animais e natureza, prefira vídeo WebM/MP4. Não use GIF: ele pesa mais e não oferece controle de qualidade adequado.
