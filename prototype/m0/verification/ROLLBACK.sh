#!/bin/sh
set -eu

target=${1:?"usage: ROLLBACK.sh <prototype-copy>"}
unlink "$target"
printf 'ROLLBACK=removed %s\n' "$target"
