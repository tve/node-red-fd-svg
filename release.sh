#! /bin/bash -e

# read commandline options
RELEASE=0
FDV=
while getopts ":hrs" opt; do
  case $opt in
    h)
      echo "Usage: $0 [-h] [-r]"
      echo " -h show this help message and exit"
      echo " -r release the version (else dev channel)"
      exit 0
      ;;
    r)
      RELEASE=1
      ;;
    \?)
      echo "Invalid option: -$OPTARG" >&2
      exit 1
      ;;
  esac
done

v=`npm version patch`

echo "Releasing Node-RED-SVG"
git push
npm publish --tag dev
mv node-red-svg.html node-red-svg-dist.html
ln -s node-red-svg-dev.html node-red-svg.html
echo RELEASE=$RELEASE
if [[ $RELEASE == 1 ]]; then
  echo "Release-tagging $v with 'latest'"
  npm dist-tag add node-red-svg@$v latest
fi
echo ""
echo "***** Published $v *****"
