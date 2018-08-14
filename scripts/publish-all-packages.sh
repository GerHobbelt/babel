#! /bin/bash

pushd $(dirname $0)/..

for f in packages/*/ codemods/*/ ; do 
	pushd $f
	npm publish --access public
	popd
done

popd

