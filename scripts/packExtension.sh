rm -f ../temp.json
echo "Start pack proccess"
RESULT=$(tfx extension create --root ../ --output-path ../ --manifest-globs vss-extension.json --rev-version --json)
echo "$RESULT" > ../temp.json