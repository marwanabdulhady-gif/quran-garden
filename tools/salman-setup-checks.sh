#!/usr/bin/env bash
# تجهيز أدوات الفحص خارج المستودع (تُفقد عند إعادة تهيئة البيئة):
#   - بايثون مع Pillow لمعالجة الرسوم (tools/salman-process-scenes.py)
#   - متصفح Chromium headless مع puppeteer-core لفحص دون إنترنت ولقطات الدرس
# الاستخدام من جذر المستودع:  bash tools/salman-setup-checks.sh
# النتيجة: /home/user/recovery/venv/bin/python و/home/user/recovery/chrome/ و/home/user/recovery/libs/lib
set -euo pipefail
RECOVERY="${RECOVERY:-/home/user/recovery}"
mkdir -p "$RECOVERY" "$RECOVERY/libs" "$RECOVERY/chrome"

if [ ! -x "$RECOVERY/venv/bin/python" ]; then
  python3 -m venv "$RECOVERY/venv"
fi
"$RECOVERY/venv/bin/pip" install -q pillow
echo "python: $("$RECOVERY/venv/bin/python" -c 'import PIL; print("Pillow", PIL.__version__)')"

cd "$RECOVERY/chrome"
[ -f package.json ] || npm init -y > /dev/null
npm i --silent @sparticuz/chromium@131 puppeteer-core@23
echo "chromium: $(node -e "require('@sparticuz/chromium/package.json').version" 2>/dev/null || echo ok)"

# مكتبات Chromium مضغوطة بـ brotli: نفكّها بـ Node ثم نستخرج الـ tar
node -e "
const fs=require('fs'),zlib=require('zlib');
const bin='$RECOVERY/chrome/node_modules/@sparticuz/chromium/bin/';
for (const t of ['al2023','al2']) {
  fs.writeFileSync('$RECOVERY/libs/'+t+'.tar', zlib.brotliDecompressSync(fs.readFileSync(bin+t+'.tar.br')));
}"
(cd "$RECOVERY/libs" && tar -xf al2023.tar && tar -xf al2.tar)
echo "libs: $(ls "$RECOVERY/libs/lib" | wc -l) files in $RECOVERY/libs/lib"
echo "LD_LIBRARY_PATH=$RECOVERY/libs/lib"
