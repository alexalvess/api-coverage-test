# Coverage API Integration Test for Azure DevOps Pipelines

This project is a custom task that you can include in your pipeline on Azure DevOps.
According to the JSON file of Swagger of API and the JUnit file result test, it is made a from-to both files and generates a tests coverage percent.

## The flow
![Flow](https://raw.githubusercontent.com/alexalvess/api-coverage-test/master/images/flow.png)

## How to use 📚
Before everything, we have to align how can we "construct" our test, following some guides:

### Guidelines to develop an integration test
First, it is a premise that we will build integration tests for an API. In this context, we need to put in our test what we do. So, we need to inform the API path and the Verb that we tested.

When these concepts are aligned, we can go to the next step. 

We have many different tools that we can use to build an integration test, like Postman, Cypress, or Supertest. In each tool, the report, or test result, generates in a different way. So, pay attention! You need to inform the API Path and the Verb in the right place! In the XML Report, observe where is the description of the test. In Postman, will be inside the <testsuite> tag, and when you save your test, on the field name, just give the correct description, like below:
![Flow](https://raw.githubusercontent.com/alexalvess/api-coverage-test/master/images/postmantestname.png)

Usually, in other tool that use JS, the description of the test will be inside the <testcase> tag. So, if you use the *[describe...it]* or *[context...it]*, put the API Path and Verb inside the *[it]* method, like that:
![Flow](https://raw.githubusercontent.com/alexalvess/api-coverage-test/master/images/jstestname.png)

**Important:**
- When you inform the test description, put the Verb and API Path, in this order, at the **end of the description**. The content before it is not important to the task and this does not impact it.
- It is very important to separate the API Path, Verb and other things by space.

### Task Configuration
Now that we build our test, let's see below. This is the window of Custom Task in a Pipeline:
![Flow](https://raw.githubusercontent.com/alexalvess/api-coverage-test/master/images/buildpipeline.png)

- ApplicationName: the name of your application/software/project, like *[Aurora.Api]*
- Api url: the url referring your API, like *[https://aurora-project.azurewebsites.net/]*
- Path of Swagger's JSON: the path where is located the json of API's Swagger, like *[/swagger/v1/swagger.json]*
- Test Result Path: the path where is located the junit file, which contains the tests result, like *[$(System.DefaultWorkingDirectory)\Results\junitReport.xml]*
- Webhook: the URL that the result of the coverage process will be sent by the custom task

The other both options we will talk more specifically.

### Where is the test name 🤔
In this section we have two options, and you choose according to the way the JUnit file test was generated. Specifically, is where located your test name in format *[VERB /path]*.

The first option, which is "Test Suite", refers to test name is located into the tag *<testsuite>*, like below:
![Test Suite Example](https://raw.githubusercontent.com/alexalvess/api-coverage-test/master/images/testsuite.png)

And the second option, which is "Test Case", refers to test name is located into the tag *<testcase>* which is located too inside the tag *<testsuite>*, like below:
![Test Case Example](https://raw.githubusercontent.com/alexalvess/api-coverage-test/master/images/testcase.png)

### Webhook 🤔
When the generate coverage processing to end, the custom task will call an API, if the Webhook field is filled, and will pass some data of the coverage generated.
The payload model that will be generated is:

**VERB**: POST

```json
{
	"application": "string",
	"apiTested": "string",
	"createAt": "date",
	"buildNumber": "string",
	"totalEndpointsFound": "number",
	"totalEndpointsTested": "number",
	"coverage": "number",
	"endpointsFound": [{
		"path": "string",
		"infoPath": [{
			"verb": "string",
			"time": "number",
			"executeAt": "Date",
			"success": "string"
		}]
	}],
	"endpointsTested": [{
		"path": "string",
		"infoPath": [{
			"verb": "string",
			"time": "string",
			"executeAt": "Date",
			"success": "boolean",
			"failureMessage": "string"
		}]
	}],
	"endpointsUncover": [{
		"path": "string",
		"infoPath": [{
			"verb": "string",
			"time": "number",
			"executeAt": "Date",
			"success": "boolean"
		}]
	}],
	"totalTime": "number",
	"totalSucceed": "number",
	"totalFailure": "number"
}
```

### Now, let's see the pipeline execution
![Pipeline execution](https://raw.githubusercontent.com/alexalvess/api-coverage-test/master/images/pipelineexecution.png)

---

## We are online 🚀!
See this extension in [Visual Studio Market Place](https://marketplace.visualstudio.com/items?itemName=AlexAlves.task-702d7430-c3a9-422a-87f2-569ed16ba6be)

## About ℹ:
This custom task was developed by [Alex Alves](https://www.linkedin.com/in/alexalvess/) and encouraged by [XP Inc.](https://www.xpi.com.br/)