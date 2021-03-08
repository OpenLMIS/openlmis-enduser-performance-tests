// first, some pre-work to set variables for our later wdio.config.js

// workaround from https://github.com/webdriverio/wdio-cucumber-framework/issues/79
const glob = require('glob');

const steps = glob.sync('src/features/**/*.steps.js');
const features = glob.sync('src/features/**/*.feature');
const fs = require('fs-extra');
const yaml = require('js-yaml');
const path = require('path');
const parse = require('papaparse');
const video = require('wdio-video-reporter');
const convert = require('xml-js');

const fileContents = fs.readFileSync('./durationTimeThresholds.yaml', 'utf8');
const durationTimeThresholds = yaml.safeLoad(fileContents);

// configure proxy usage based on env setting - workaround for Taurus not supporting multiple
// wdio.conf.js files
const bmpPresent = process.env.BMP_PRESENT;
const recordingsDir = process.env.RECORDINGS_DIR ? process.env.RECORDINGS_DIR : 'build/recordings';
const consoleLogDir = process.env.CONSOLE_LOG_DIR ? process.env.CONSOLE_LOG_DIR : 'build/consolelogs';
const performanceResultsDir = 'build/performanceResults/';
const errorShotsDir = './build/errorShots/';

if (!fs.existsSync(performanceResultsDir)) {
    fs.mkdirSync(performanceResultsDir);
}

if (!fs.existsSync(errorShotsDir)) {
    fs.mkdirSync(errorShotsDir);
}

const stepPerformanceResultsFile = `${performanceResultsDir}StepPerformanceResults.csv`;
const scenarioPerformanceResultsFile = `${performanceResultsDir}ScenarioPerformanceResults.csv`;
const featurePerformanceResultsFile = `${performanceResultsDir}FeaturePerformanceResults.csv`;

if (!fs.existsSync(stepPerformanceResultsFile)) {
    fs.writeFile(stepPerformanceResultsFile, 'FEATURE,SCENARIO,STEP,DURATION,MAX ALLOWED\n', (err) => {
        if (err) {
            console.log(err);
        }
    });
}

if (!fs.existsSync(scenarioPerformanceResultsFile)) {
    fs.writeFile(scenarioPerformanceResultsFile, 'FEATURE,SCENARIO,DURATION\n', (err) => {
        if (err) {
            console.log(err);
        }
    });
}

if (!fs.existsSync(featurePerformanceResultsFile)) {
    fs.writeFile(featurePerformanceResultsFile, 'FEATURE,DURATION\n', (err) => {
        if (err) {
            console.log(err);
        }
    });
}

const stepPerformanceResultsStream = fs.createWriteStream(stepPerformanceResultsFile, { flags: 'a' });
const scenarioPerformanceResultsStream = fs.createWriteStream(scenarioPerformanceResultsFile, { flags: 'a' });
const featurePerformanceResultsStream = fs.createWriteStream(featurePerformanceResultsFile, { flags: 'a' });

const SOME_FEATURE_TESTS_FAILED = 1;

const getConsoleLogFileName = (scenario) => `${consoleLogDir}/${scenario.feature.name}.txt`;
const getNameForXml = (name) => (!name ? '' : name.replace(/["':]/g, '').replace(/[-&\s/\\]/g, '_'));

const getDurationTimeThreshold = (resultStep) => {
    let foundDuration = '';
    durationTimeThresholds.features.find((feature) => {
      feature.name === resultStep.feature.name && feature.scenarios.some((scenario) => {
        scenario.name === resultStep.scenario.name && scenario.steps.some((step) => {
            if (step.name === resultStep.step.text) {
                foundDuration = step.duration;
            }
        })
      })
    });
    return foundDuration;
};

let consoleLogs = [];
let proxy = undefined;
let beforeScenario = () => {};

if (bmpPresent) {
    proxy = {
        proxyType: 'MANUAL',
        httpProxy: 'bmp:9091',
        sslProxy: 'bmp:9091',
    };

    const request = require('request');
    beforeScenario = (scenario) => {
        request({
            method: 'PUT',
            url: 'http://bmp:9090/proxy/9091/har/pageRef',
            form: {
                pageTitle: scenario.name,
            },
        }, (err, response, body) => {
            if (err != null) {
                console.log(`Error body: ${body}`);
            }
        });
    };
}

let featureDuration = 0;
let scenarioDuration = 0;
let stepDuration = 0;

// Data which will write in a file.
let stepObjects = [];
let scenarioObjects = [];
let featureObject = {};

const drivers = {
    chrome: { version: '86.0.4240.22' },
};

// wdio config
exports.config = {
    //
    // ==================
    // Specify Test Files
    // ==================
    // Define which test specs should run. The pattern is relative to the
    // directory from which `wdio` was called. Notice that, if you are calling
    // `wdio` from an NPM script (see https://docs.npmjs.com/cli/run-script)
    // then the current working directory is where your package.json resides, so
    // `wdio` will be called from there.
    //
    specs: features,
    // Patterns to exclude.
    exclude: [
        // 'path/to/excluded/files'
    ],
    //
    // ============
    // Capabilities
    // ============
    // Define your capabilities here. WebdriverIO can run multiple capabilities
    // at the same time. Depending on the number of capabilities, WebdriverIO
    // launches several test sessions. Within your capabilities you can
    // overwrite the spec and exclude options in order to group specific specs
    // to a specific capability.
    //
    // First, you can define how many instances should be started at the same
    // time. Let's say you have 3 different capabilities (Chrome, Firefox, and
    // Safari) and you have set maxInstances to 1; wdio will spawn 3 processes.
    // Therefore, if you have 10 spec files and you set maxInstances to 10, all
    // spec files will get tested at the same time and 30 processes will get
    // spawned. The property handles how many capabilities from the same test
    // should run tests.
    //
    maxInstances: 1,
    //
    // If you have trouble getting all important capabilities together, check
    // out the Sauce Labs platform configurator - a great tool to configure your
    // capabilities: https://docs.saucelabs.com/reference/platforms-configurator
    //
    capabilities: [{
        // maxInstances can get overwritten per capability. So if you have an
        // in-house Selenium grid with only 5 firefox instance available you can
        // make sure that not more than 5 instance gets started at a time.
        maxInstances: 1,
        //
        browserName: 'chrome',
        'goog:chromeOptions': {
            args: [
                '--disable-infobars',
                '--window-size=1920,1080',
                '--no-sandbox',
                '--disable-gpu',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
            ],
        },
        acceptInsecureCerts: true,
        proxy,
    }],
    //
    // ===================
    // Test Configurations
    // ===================
    // Define all options that are relevant for the WebdriverIO instance here
    //
    // By default WebdriverIO commands are executed in a synchronous way using
    // the wdio-sync package. If you still want to run your tests in an async
    // way e.g. using promises you can set the sync option to false.
    sync: true,
    //
    // Level of logging verbosity: silent | verbose | command | data | result |
    // error
    logLevel: 'error',
    //
    // Enables colors for log output.
    coloredLogs: true,
    //
    // Set a base URL in order to shorten url command calls. If your url
    // parameter starts with '/', then the base url gets prepended.
    baseUrl: 'https://perftest.openlmis.org',
    //
    // Default timeout for all waitFor* commands.
    waitforTimeout: 10000,
    //
    // Default timeout in milliseconds for request
    // if Selenium Grid doesn't send response
    connectionRetryTimeout: 90000,
    //
    // Default request retries count
    connectionRetryCount: 3,
    //
    // Initialize the browser instance with a WebdriverIO plugin. The object
    // should have the plugin name as key and the desired plugin options as
    // properties. Make sure you have the plugin installed before running any
    // tests. The following plugins are currently available:
    // WebdriverCSS: https://github.com/webdriverio/webdrivercss
    // WebdriverRTC: https://github.com/webdriverio/webdriverrtc
    // Browserevent: https://github.com/webdriverio/browserevent
    // plugins: {
    //     webdrivercss: {
    //         screenshotRoot: 'my-shots',
    //         failedComparisonsRoot: 'diffs',
    //         misMatchTolerance: 0.05,
    //         screenWidth: [320,480,640,1024]
    //     },
    //     webdriverrtc: {},
    //     browserevent: {}
    // },
    //
    // Test runner services
    // Services take over a specific job you don't want to take care of. They
    // enhance your test setup with almost no effort. Unlike plugins, they don't
    // add new commands. Instead, they hook themselves up into the test process.
    services: ['devtools', ['selenium-standalone', { installArgs: { drivers }, args: { drivers } }]],
    //
    // Framework you want to run your specs with.
    // The following are supported: Mocha, Jasmine, and Cucumber
    // see also: http://webdriver.io/guide/testrunner/frameworks.html
    //
    // Make sure you have the wdio adapter package for the specific framework
    // installed before running any tests.
    framework: 'cucumber',
    //
    // Test reporter for stdout.
    // The only one supported by default is 'dot'
    // see also: http://webdriver.io/guide/testrunner/reporters.html
    reporters: [
        'spec',
        ['junit', {
            outputDir: './build/',
            outputFileFormat: (options) => `WDIO.xunit.${options.capabilities.browserName}.${options.cid}.xml`,
        }],
        [video, {
            saveAllVideos: false, // If true, also saves videos for successful test cases
            videoSlowdownMultiplier: 10, // Higher to get slower videos, lower for faster videos [Value 1-100]
            outputDir: recordingsDir,
        }],
    ],
    //
    // If you are using Cucumber you need to specify the location of your step
    // definitions.
    cucumberOpts: {
        // <boolean> show full backtrace for errors
        backtrace: false,
        requireModule: ['@babel/register'],
        // <boolean< Treat ambiguous definitions as errors
        failAmbiguousDefinitions: true,
        // <boolean> invoke formatters without executing steps
        // dryRun: false,
        // <boolean> abort the run on first failure
        failFast: true,
        // <boolean> Enable this config to treat undefined definitions as
        // warnings
        ignoreUndefinedDefinitions: false,
        // <string[]> ('extension:module') require files with the given
        // EXTENSION after requiring MODULE (repeatable)
        name: [],
        // <boolean> hide step definition snippets for pending steps
        snippets: true,
        // <boolean> hide source uris
        source: true,
        // <string[]> (name) specify the profile to use
        profile: [],
        // <string[]> (file/dir) require files before executing features
        require: steps,
        // <string> specify a custom snippet syntax
        snippetSyntax: undefined,
        // <boolean> fail if there are any undefined or pending steps
        strict: true,
        // <string> (expression) only execute the features or scenarios with
        // tags matching the expression, see
        // https://docs.cucumber.io/tag-expressions/
        tagExpression: 'not @Pending',
        // <boolean> add cucumber tags to feature or scenario name
        tagsInTitle: false,
        // <number> timeout for step definitions
        timeout: 600000,
    },

    //
    // =====
    // Hooks
    // =====
    // WebdriverIO provides several hooks you can use to interfere with the test
    // process in order to enhance it and to build services around it. You can
    // either apply a single function or an array of methods to it. If one of
    // them returns with a promise, WebdriverIO will wait until that promise got
    // resolved to continue.
    //
    // Gets executed once before all workers get launched.
    onPrepare: function onPrepare() {
        if (fs.existsSync(recordingsDir)) {
            fs.removeSync(recordingsDir);
        }
        if (fs.existsSync(consoleLogDir)) {
            fs.removeSync(consoleLogDir);
        }
        fs.mkdirSync(recordingsDir);
        fs.mkdirSync(consoleLogDir);
    },
    //
    // Gets executed before test execution begins. At this point you can access
    // all global variables, such as `browser`. It is the perfect place to
    // define custom commands.
    before: function before() {
        /**
         * Setup the Chai assertion framework
         */
        const chai = require('chai');

        global.expect = chai.expect;
        global.assert = chai.assert;
        global.should = chai.should();

        browser.throttle({
            'offline': false,
            'downloadThroughput': 500 * 1024 / 8 * .8,
            'uploadThroughput': 500 * 1024 / 8 * .8,
            'latency': 400 * 5
        });
    },
    //
    // Hook that gets executed before the suite starts
    // beforeSuite: function beforeSuite(suite) {
    // },
    //
    // Hook that gets executed _before_ a hook within the suite starts (e.g.
    // runs before calling beforeEach in Mocha)
    // beforeHook: function beforeHook() {
    // },
    //
    // Hook that gets executed _after_ a hook within the suite starts (e.g. runs
    // after calling afterEach in Mocha)
    // afterHook: function afterHook() {
    // },
    //
    // Function to be executed before a test (in Mocha/Jasmine) or a step (in
    // Cucumber) starts.
    // beforeTest: function beforeTest(test) {
    // },
    //
    // Runs before a WebdriverIO command gets executed.
    // beforeCommand: function beforeCommand(commandName, args) {
    // },
    //
    // Runs after a WebdriverIO command gets executed
    // afterCommand: function afterCommand(commandName, args, result, error) {
    // },
    //
    // Function to be executed after a test (in Mocha/Jasmine) or a step (in
    // Cucumber) starts.
    // afterTest: function afterTest(test) {
    // },
    //
    // Hook that gets executed after the suite has ended
    // afterSuite: function afterSuite(suite) {
    // },
    beforeScenario,

    // beforeFeature: (uri, feature) => {
    // },

    afterFeature: (uri, feature) => {
        featureObject = {
            name: feature.document.feature.name,
            duration: featureDuration,
            scenarios: scenarioObjects,
        };
        scenarioObjects = [];
        featureDuration = 0;
    },

    afterStep: ({ step }, context, { duration, passed }) => {
        stepDuration = duration / 1000;
        const durationTimeThreshold = getDurationTimeThreshold(step);

        const stepObject = {
            name: step.step.text,
            duration: stepDuration,
            maxAllowed: durationTimeThreshold,
        };
        stepObjects.push(stepObject);
        scenarioDuration += stepDuration;

        if (passed === false) {
            const filepath = path.join(errorShotsDir, `ERROR_chrome_${new Date(Date.now()).toISOString()}.png`);
            browser.saveScreenshot(filepath);
        }

        const scenario = step.scenario;
        scenario.feature = step.feature;
        const logs = browser.getLogs('browser');
        logs.forEach((log) => {
            consoleLogs.push({
                scenario: scenario,
                stepName: step.step.text,
                date: new Date(log.timestamp).toLocaleString(),
                message: log.message,
            });
        });
    },

    afterScenario: (uri, feature, scenario) => {
        const scenarioObject = {
            name: scenario.name,
            duration: scenarioDuration,
            steps: stepObjects,
        };

        scenarioObjects.push(scenarioObject);
        stepObjects = [];

        featureDuration += scenarioDuration;
        scenarioDuration = 0;
    },
    //
    // Gets executed after all tests are done. You still have access to all
    // global variables from the test.
    after: function after(result) {
        const featureName = featureObject.name.replace(/"/g, '\'');

        featurePerformanceResultsStream.write(`"${featureName}",${featureObject.duration}\n`);

        featureObject.scenarios.forEach((scenario) => {
            const scenarioName = scenario.name.replace(/"/g, '\'');

            scenarioPerformanceResultsStream.write(`"${featureName}","${scenarioName}",${scenario.duration}\n`);

            scenario.steps.forEach((step) => {
                stepPerformanceResultsStream.write(`"${featureName}","${scenarioName}",` +
                  `"${step.name.replace(/"/g, '\'')}",${step.duration},${step.maxAllowed}\n`);
            });
        });

        if (result === SOME_FEATURE_TESTS_FAILED) {
            const stringLogs = consoleLogs.map(log => {
                return `[${log.date}] [${log.scenario.name}][${log.stepName}]: ${log.message}`;
            });

            const featureLogFileName = getConsoleLogFileName(consoleLogs[0].scenario);
            fs.writeFile(featureLogFileName, stringLogs.join('\n\n'), function (err) {
                if (err) {
                    return console.log(err);
                }
            });
        }

    },
    //
    // Gets executed after all workers got shut down and the process is about to
    // exit. It is not possible to defer the end of the process using a promise.
    onComplete: function onComplete() {
        if (fs.existsSync(`${recordingsDir}/rawSeleniumVideoGrabs`)) {
            fs.removeSync(`${recordingsDir}/rawSeleniumVideoGrabs`);
        }

        const features = {};
        const performanceResults = fs.readFileSync(stepPerformanceResultsFile, 'utf8');
        const results = parse.parse(performanceResults, { delimiter: ',', skipEmptyLines: true });
        const output = results.data;

        if (output.length > 1) {
            for (let i = 1; i < output.length; i += 1) {
                const duration = parseFloat(output[i][3]);
                const maxAllowed = parseFloat(output[i][4]);

                if (!Number.isNaN(duration) && !Number.isNaN(maxAllowed) && duration > maxAllowed) {
                    const featureName = getNameForXml(output[i][0]);
                    const scenarioName = getNameForXml(output[i][1]);

                    if (!features[featureName]) {
                        features[featureName] = {};
                    }

                    if (!features[featureName][scenarioName]) {
                        features[featureName][scenarioName] = [];
                    }

                    features[featureName][scenarioName].push({ step: output[i][2], duration, maxAllowed });
                }
            }
        }

        if (Object.keys(features).length > 0) {
            const testsuites = { testsuite: [] };

            for (const feature in features) {
                const scenarios = features[feature];
                const testsuite = {
                    _attributes: {
                        name: feature,
                        tests: `${Object.keys(scenarios).length}`,
                        failures: `${Object.keys(scenarios).length}`,
                    },
                    testcase: [],
                };

                for (const scenario in scenarios) {
                    const steps = scenarios[scenario];
                    let error = '';

                    steps.forEach((step) => {
                        error += `${step.step}: The time duration should not exceed`
                          + ` ${step.maxAllowed}s but is ${step.duration}s.\n`;
                    });

                    const testcase = {
                        _attributes: {
                            classname: `Performance.${feature}`,
                            name: `${feature}.${scenario}`,
                        },
                        error: 'Max allowed time duration exceeded in step(s)',
                        'system-err': { _cdata: error },
                    };

                    testsuite.testcase.push(testcase);
                }

                testsuites.testsuite.push(testsuite);
            }

            const js = { _declaration: { _attributes: { version: '1.0', encoding: 'utf-8' } }, testsuites };
            const xml = convert.js2xml(js, { compact: true, spaces: 2 });

            fs.writeFile('build/WDIO.xunit.performance.xml', xml, (err) => {
                if (err) {
                    console.log(err);
                }
            });
        }
    },
};
