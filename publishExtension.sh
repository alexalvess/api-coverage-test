echo "Start publish proccess"
RESULT=`cat temp.json`
PUBLISHER=`echo $RESULT | json publisher`
VERSION=`echo $RESULT | json version`
EXTENSIONID=`echo $RESULT | json extensionId`
FILE="$PUBLISHER.$EXTENSIONID-$VERSION.vsix"

echo $FILE

tfx extension publish --vsix $FILE --token tv4qnnlldyvxwx63yw4qx4qi3q5ybmxu3oxclx6of6pcv5gtci2q

rm -f temp.json
rm -f $FILE