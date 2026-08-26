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

| #  | Tema                           | Experiência / cena                                                                             | Animação                                                                             | Paisagem sonora                                                   | Clima visual                                |
| -- | ------------------------------ | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------- | ------------------------------------------- |
| 01 | 🌊 **Oceano Quieto**           | Um refúgio de frente para o mar, feito para simplesmente observar as ondas                     | Ondas, reflexos na água, cortina/vegetação muito sutil                               | Ondas contínuas, brisa                                            | Azul, areia, branco, luz natural            |
| 02 | 🗻 **Monte Fuji**              | Uma casa japonesa tranquila com vista privilegiada para o Fuji e um lago                       | Água, nuvens lentas, folhas                                                          | Água, vento, aves muito distantes                                 | Azul suave, verde, creme, rosa pálido       |
| 03 | 🚗 **Dirigindo no Rio**        | Dentro do carro, dirigindo sem pressa pela orla do Rio no começo da noite                      | Estrada avançando, postes passando, oceano, luzes distantes                          | Pneus no asfalto, motor baixo, vento e mar                        | Blue hour, oceano profundo, dourado         |
| 04 | 🌌 **Aurora Boreal**           | Um motorhome estacionado na neve diante de uma aurora imensa                                   | Aurora lenta, estrelas e neve ocasional                                              | Vento distante, aquecedor/ventilação abafada                      | Azul-marinho, turquesa, verde-aurora, âmbar |
| 05 | 🦒 **Varanda na Savana**       | Uma varanda confortável olhando a savana; elefantes e girafas vivem ao longe                   | Capim, folhas, animais distantes; ocasionalmente uma girafa cruza a frente da tela   | Vento, aves e sons muito distantes da savana                      | Areia, terracota, oliva, madeira            |
| 06 | 🧑‍💻 **Não me deixe sozinho** | Trabalhar à noite em um ambiente acolhedor sabendo que outras pessoas também estão trabalhando | Pequenos reflexos, luzes distantes, chuva opcional                                   | Teclados distantes, páginas, cadeira, murmúrios quase indistintos | Âmbar, marrom, azul-noturno                 |
| 07 | 🚆 **Último Trem para Casa**   | Viajar junto à janela de um trem quase vazio enquanto pequenas cidades passam lá fora          | Paisagem deslizando, postes, reflexos no vidro, luzes distantes                      | Trilhos ritmados, vibração, ventilação                            | Azul-noturno, âmbar, verde profundo         |
| 08 | 🐋 **Debaixo do Mundo**        | Uma sala de observação submarina diante da imensidão azul                                      | Partículas, raios de luz, pequenos cardumes; raramente uma baleia atravessa a janela | Água abafada, vibração grave e ambiente submarino                 | Azul profundo, petróleo, ciano              |
| 09 | 🌊 **Farol no Fim do Mundo**   | Refúgio de um faroleiro numa ilha remota, olhando o oceano e os penhascos                      | Mar, névoa, chuva fina; feixe do farol passa periodicamente                          | Ondas, vento, madeira da casa, chuva ocasional                    | Cinza-azulado, creme, verde-mar, âmbar      |
| 10 | 🛰️ **Órbita Silenciosa**      | Uma estação espacial minimalista com uma enorme janela para a Terra                            | Terra quase imperceptivelmente girando, nuvens e transição lenta dia/noite           | Ventilação constante, hum grave da estação                        | Preto azulado, branco, azul-Terra           |

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
