#!/usr/bin/env sh
# Builds the site and uploads dist/ to the Vercel project that serves amanmamgain.com.
# That project lives on the planmyworkday-5720 Vercel account, not the main one. Its CLI
# login is kept in ~/.config/vercel-pmwd; if it expires, run:
#   npx vercel login --global-config ~/.config/vercel-pmwd
set -eu
cd "$(dirname "$0")/.."

npm run build

VERCEL_ORG_ID=team_wIdaK3okrj8jiRykB1dqYJFy \
VERCEL_PROJECT_ID=prj_oXUCvWLuRZqSTpDHwYdOX1CudRxz \
  npx vercel deploy dist --prod --yes --global-config "${VERCEL_CONFIG_DIR:-$HOME/.config/vercel-pmwd}"
