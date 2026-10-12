#!/usr/bin/env bash
# Commit hasil build Hugo (folder public/) ke branch master.
# Cloudflare Pages hanya membaca isi folder public/ dari repo (tanpa build command), jadi
# SETIAP deploy harus memperbarui public/ di master — kalau tidak, situs Cloudflare tidak berubah.
#
# PENTING: pesan commit TIDAK boleh mengandung "[skip ci]" / "[CF-Pages-Skip]", karena Cloudflare
# Pages akan melewati deploy untuk commit tersebut.
set -euo pipefail

MSG="${1:-Build site (public/)}"
BRANCH="${2:-master}"

git config --local user.email "action@github.com"
git config --local user.name "GitHub Action"

# Simpan hasil build di luar working tree supaya aman saat reset ke origin terbaru.
rm -rf /tmp/public-built
cp -r public /tmp/public-built

for i in 1 2 3 4 5; do
  git add -A -f public/
  if git diff --staged --quiet; then
    echo "ℹ️  public/ tidak berubah — tidak ada yang di-commit."
    exit 0
  fi
  git commit -q -m "$MSG"
  if git push origin "$BRANCH"; then
    echo "✅ public/ ter-push ke $BRANCH (percobaan $i) — Cloudflare Pages akan mendeploy."
    exit 0
  fi
  if [ "$i" -eq 5 ]; then
    echo "❌ Push gagal 5x — cek manual." >&2
    exit 1
  fi
  wait_s=$(( (RANDOM % 10) + 5 ))
  echo "⏳ Push ditolak (ada commit baru di $BRANCH). Ambil terbaru & coba lagi dalam ${wait_s}s (percobaan $i/5)..."
  sleep "$wait_s"
  git fetch --depth=1 origin "$BRANCH"
  git reset -q --hard "origin/$BRANCH"
  rm -rf public
  cp -r /tmp/public-built public
done
