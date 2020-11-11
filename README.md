# Coverage API Integration Test for Azure DevOps Pipelines

This project is a custom task that you can include in your pipeline on Azure DevOps.
According to the JSON file of Swagger of API and the JUnit file result test, it is made a from-to both files and generates a tests coverage percent.

## The flow
![Flow](https://raw.githubusercontent.com/alexalvess/api-coverage-test/master/images/flow.png)

## How to use 📚
This is the window of Custom Task in a Pipeline:
![Flow](https://raw.githubusercontent.com/alexalvess/api-coverage-test/master/images/buidpipeline.png)

- Api url: the url referring your API, like *[https://aurora-project.azurewebsites.net/]*
- Path of Swagger's JSON: the path where is localed the json of API's Swagger, like *[/swagger/v1/swagger.json]*
- Test Result Path: the path where is located the junit file, which contains the tests result, like *[$(System.DefaultWorkingDirectory)\Results\junitReport.xml]*

The other both options we will talk more specificlly.

#### Where is the test name 🤔
In this section we have two options, and you choose according to the way the JUnit file test was generated. Specifically, is where located your test name in format *[VERB /path]*.

The first option, which is "Test Suite", refers to test name is located into the tag *<testsuite>*, like below:
![Test Suite Example](https://raw.githubusercontent.com/alexalvess/api-coverage-test/master/images/testsuite.png)

And the second option, which is "Test Case", refers to test name is located into the tag *<testcase>* which is located too inside the tag *<testsuite>*, like below:
![Test Case Example](https://raw.githubusercontent.com/alexalvess/api-coverage-test/master/images/testcase.png)

#### Webhook 🤔
When the generate coverage processing to end, the custom task will call an API, if the Webhook field is filled, and will pass some datas of the coverage generated.
The payload model that will be generated is:

```json
"apiTested": "String",
"tests": [
    {
        "createAt": "DateTime",
        "buildNumber": "String",
        "totalEndpointsFound": "Number",
        "totalEndpointsTested": "Number"
        "coverage": "Number",
        "totalTime": "Number",
        "totalSucceed": "Number",
        "totalFailure": "Number",
        "endpoints": [
            {
                "path": "String",
                "infoPath": [
                    {
                        "verb": "String",
                        "executeAt": "DateTime"
                        "success": "Boolean",
                        "time": "Number",
                        "failureMessage": "String"
                    }
                ]
            }
        ]
    }
]
```
---

### We are online 🚀!
See this extension in [Visual Studio Market Place](https://marketplace.visualstudio.com/items?itemName=AlexAlves.task-702d7430-c3a9-422a-87f2-569ed16ba6be)

### About ℹ:
This custom task was developed by [Alex Alves](https://www.linkedin.com/in/alexalvess/) and encouraged by [XP Inc.](https://www.xpi.com.br/)