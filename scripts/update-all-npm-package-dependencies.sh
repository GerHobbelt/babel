#! /bin/bash

pushd $(dirname $0)/..

for f in ./package.json packages/*/package.json codemods/*/package.json; do
	echo "Updating NPM dependencies in $f..."
	ncu -a --packageFile=$f
done

popd

