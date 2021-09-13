# Coverage API Integration Test for Azure DevOps Pipelines
A custom task that you can include in your pipeline on Azure DevOps.

## CI/CD:
![Workflow Status](https://github.com/alexalvess/api-coverage-test/workflows/.github/workflows/vsmp-deploy.yml/badge.svg)

### Install
```
$ git clone https://github.com/alexalvess/api-coverage-test.git
$ cd api-coverage-test
$ npm install --prefix ./buildAndReleaseTask package.json
$ npm install -g json
$ npm install -g tfx-cli
```

### Build for Debug
```
$ npm run build --prefix ./buildAndReleaseTask
$ npm run copyNodeModules --prefix ./buildAndReleaseTask
```

### Build for Production
```
$ npm run build --prefix ./buildAndReleaseTask
$ npm run changeEnvironment --prefix ./buildAndReleaseTask
$ npm run copyNodeModules --prefix ./buildAndReleaseTask
$ json -I -f ./buildAndReleaseTask/task.json -e "this.version.Patch++"
$ npm run copyTaskToDist --prefix ./buildAndReleaseTask
```

### Run for Debug
```
$ npm start --prefix ./buildAndReleaseTask
```

### Pack and Publish:
```
$ tfx extension create --manifest-globs vss-extension.json
```
And upload the file generate in Visual Studio Market Place

---

## Look the all documentation:
- Wiki: https://github.com/alexalvess/api-coverage-test/wiki

---

## We are online 🚀!
See this extension in [Visual Studio Market Place](https://marketplace.visualstudio.com/items?itemName=AlexAlves.task-702d7430-c3a9-422a-87f2-569ed16ba6be)

## About ℹ:
This custom task was developed by [Alex Alves](https://www.linkedin.com/in/alexalvess/) and encouraged by [XP Inc.](https://www.xpi.com.br/)
