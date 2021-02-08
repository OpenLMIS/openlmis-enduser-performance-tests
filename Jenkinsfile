pipeline {
  agent {
      node {
          label '!master'
      }
  }
  parameters {
      booleanParam(name: 'AUTOMATED_PERFTEST', defaultValue: true, description: 'Enabling this parameter will run automated performance tests. It should be turned off after pert tests are done so this should be enabled by default. If you want to execute manual tests you can turn this off.')
      choice(choices: ['use_env', 'keep', 'wipe'], description: 'Choose to keep or wipe data (or use whatever is in the env file) during redeployment. The default option is to use whatever is in the env file. Note: if you choose wipe, the data will be lost and not retrievable, unless you have backed up before.', name: 'KEEP_OR_WIPE')
      text(name: 'ENV_RESTORE_SNAPSHOT', defaultValue: '', description: 'If given, the named env file will be loaded and will be used directly, including restoring from a named snapshot in that file.  Requires the appropriate env variables to be set in the env file for openlmis/restore-snapshot and openlmis/obscure-data.  Default is perftest.env, which it will also use if left blank.')
  }
  options {
    buildDiscarder(logRotator(numToKeepStr: '15', artifactNumToKeepStr: '15'))
    disableConcurrentBuilds()
  }
  environment {
    PATH = "/usr/local/bin:$PATH"
  }
  stages {
    stage('Start perftest instance') {
      agent none
        steps {
          dir('.openlmis-config') {
            git branch: 'master',
              credentialsId: 'OpenLMISConfigKey',
              url: 'git@github.com:villagereach/openlmis-config.git'
          }
          sh 'docker pull openlmis/start-instance'
          sh 'docker run --rm --env-file ./.openlmis-config/perftest.env openlmis/start-instance'
        }
    }
    stage('Deploy to perftest') {
      agent none
        when {
          expression {
            return params.AUTOMATED_PERFTEST
          }
        }
        steps {
          build job: "OpenLMIS-3.x-deploy-to-perftest-mw", propagate: true, wait: true, parameters: [string(name: 'KEEP_OR_WIPE', value: String.valueOf(KEEP_OR_WIPE)), string(name: 'ENV_RESTORE_SNAPSHOT', value: String.valueOf(ENV_RESTORE_SNAPSHOT))]
        }
    }
    stage('Wait for instance to run') {
      agent none
        when {
          expression {
            return params.AUTOMATED_PERFTEST
          }
        }
        steps {
          sleep 30
        }
    }
    stage ('Run tests') {
      agent none
        when {
          expression {
            return params.AUTOMATED_PERFTEST
          }
        }
        steps {
          dir('.openlmis-config') {
            git branch: 'master',
                credentialsId: 'OpenLMISConfigKey',
                url: 'git@github.com:villagereach/openlmis-config.git'
          }
          sh( script: "./ci-runTest.sh")
          archiveArtifacts 'build/openlmis.har*,build/errorShots/**,build/WDIO*.xml,build/recordings/**,build/consolelogs/**,build/performanceResults/**'
        }
        post {
          always {
            junit 'build/WDIO*.xml'
            publishHTML([
                allowMissing: false,
                alwaysLinkToLastBuild: true,
                includes: '**/*.html,**/*.css,**/*.js',
                keepAll: true,
                reportDir: 'build/performanceResults/',
                reportFiles: 'StepPerformanceResults.html',
                reportName: 'Performance Report',
                reportTitles: ''
            ])
          }
        }
    }
    stage ('Shut down perftest instance') {
      when {
        expression {
          return params.AUTOMATED_PERFTEST
        }
      }
      steps {
        build job: "OpenLMIS-perftest-shutdown"
      }
    }
  }
  post {
    unstable {
      slackSend channel: '#build',
        color: 'danger',
        message: "${env.JOB_NAME} - #${env.BUILD_NUMBER} FAILED (<${env.BUILD_URL}|Open>)"
      emailext subject: "${env.JOB_NAME} - #${env.BUILD_NUMBER} ${env.STAGE_NAME} FAILED",
        body: """<p>${env.JOB_NAME} - #${env.BUILD_NUMBER} ${env.STAGE_NAME} FAILED</p><p>Check console <a href="${env.BUILD_URL}">output</a> to view the results.</p>""",
        recipientProviders: [[$class: 'CulpritsRecipientProvider'], [$class: 'DevelopersRecipientProvider']]
    }
    fixed {
      slackSend channel: '#build',
        color: 'good',
        message: "${env.JOB_NAME} - #${env.BUILD_NUMBER} Back to normal"
    }
  }
}