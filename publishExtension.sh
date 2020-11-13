echo "Start publish proccess"
TOKEN=`echo $1`
RESULT=`cat temp.json`
PUBLISHER=`echo $RESULT | json publisher`
VERSION=`echo $RESULT | json version`
EXTENSIONID=`echo $RESULT | json extensionId`
FILE="$PUBLISHER.$EXTENSIONID-$VERSION.vsix"

echo $FILE

tfx extension publish --vsix $FILE --token $TOKEN

rm -f temp.json
rm -f $FILE