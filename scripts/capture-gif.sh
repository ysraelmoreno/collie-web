#!/bin/bash
# Renders media/<id>/index.html to public/features/<id>.{mp4,jpg,gif} through a headless Collie browser panel.
# (HyperFrames' own Chrome cannot start inside a Collie terminal sandbox.)
# usage: [THEME=light] scripts/capture-gif.sh <id> [poster-second]     needs: collie, ffmpeg, python3
# THEME=light renders with the Light tokens (media/_theme.js) and writes <id>-light.{mp4,jpg} (no gif).
set -euo pipefail
id=$1
cd "$(dirname "$0")/.."
[ -f "media/$id/index.html" ] || { echo "no media/$id/index.html" >&2; exit 1; }
theme=${THEME:-dark}
name=$id; [ "$theme" = light ] && name="$id-light"
panel="gifcap-$name" port=4200 fps=30 frames="media/$id/.frames-$theme" out=public/features
b() { collie browser "$@" --panel "$panel"; }
val() { python3 -c 'import json,sys; print(json.load(sys.stdin)["value"])'; }

curl -sf "http://127.0.0.1:$port/" >/dev/null || { python3 -m http.server $port --bind 127.0.0.1 -d media >/dev/null 2>&1 & sleep 1; }
url="http://127.0.0.1:$port/$id/index.html?t=$(date +%s)&theme=$theme" # media/_theme.js reads ?theme
collie panel open browser --name "$panel" --placement headless --url "$url" >/dev/null 2>&1 || b navigate "$url" >/dev/null
b resize --width 1280 --height 800 >/dev/null
for _ in $(seq 40); do # wait for the timeline and the fonts
  ready=$(b eval "!!(window.__timelines && window.__timelines.main) && document.fonts.status === 'loaded'" 2>/dev/null | val || true)
  [ "$ready" = True ] && break
  sleep 0.5
done
[ "$ready" = True ] || { echo "timeline or fonts never became ready" >&2; exit 1; }

dur=$(b eval "Number(document.querySelector('[data-composition-id]').dataset.duration)" | val)
n=$(python3 -c "print(round($dur * $fps))")
rm -rf "$frames" && mkdir -p "$frames" "$out"
for i in $(seq 0 $((n - 1))); do
  b eval "window.__timelines.main.seek($i / $fps); 1" >/dev/null
  b screenshot --out "$PWD/$frames/$(printf %04d "$i").png" >/dev/null
done
collie panel close "$panel" >/dev/null 2>&1 || true

poster=${2:-$(python3 -c "print($dur - 1)")}
ff() { ffmpeg -loglevel error -y "$@"; }
ff -framerate $fps -i "$frames/%04d.png" -vf scale=1280:800:flags=lanczos -c:v libx264 -crf 26 -preset slow -pix_fmt yuv420p -an -movflags +faststart "$out/$name.mp4"
ff -i "$frames/$(printf %04d "$(python3 -c "print(min($n - 1, round($poster * $fps)))")").png" -vf scale=1280:800:flags=lanczos -q:v 3 "$out/$name.jpg"
[ "$theme" = light ] || ff -framerate $fps -i "$frames/%04d.png" -vf "fps=15,scale=960:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=96[p];[b][p]paletteuse=dither=bayer:bayer_scale=4" "$out/$id.gif"
rm -rf "$frames"
ls -l "$out/$name".* | awk '{print $5, $9}'
