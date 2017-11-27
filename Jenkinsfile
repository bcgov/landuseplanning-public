pipeline {
    agent any
    tools {
        nodejs 'NodeJS-V8.x'
    }
    stages {
        stage('build angular-builder'){
            steps {
                notifyBuild('STARTED')
                openshiftBuild(bldCfg: 'angular-builder', showBuildLogs: 'true')
            }
        }
        stage('tag angular-builder'){
            steps {
                openshiftTag(srcStream: 'angular-builder', srcTag: 'latest', destStream: 'angular-builder', destTag: 'dev')
            }
        }
        stage('build nginx-runtime'){
            steps {
                openshiftBuild(bldCfg: 'nginx-runtime', showBuildLogs: 'true')
            }
        }
        stage('tag nginx-runtime'){
            steps {
                openshiftTag(srcStream: 'nginx-runtime', srcTag: 'latest', destStream: 'nginx-runtime', destTag: 'dev')
            }
        }
        stage('build and package angular-on-nginx'){
            steps {
                openshiftBuild(bldCfg: 'angular-on-nginx-build', showBuildLogs: 'true')
            }
        }
        stage('tag and deploy to dev') {
            steps {
                openshiftTag(srcStream: 'angular-on-nginx', srcTag: 'latest', destStream: 'angular-on-nginx', destTag: 'dev')
                notifyBuild('DEPLOYED:DEV')
            }
        }
        stage('tag and deploy to test') {
            steps {
                script {
                    try {
                        timeout(time: 2, unit: 'MINUTES') {
                          input "Deploy to TEST?"
                          openshiftTag(srcStream: 'angular-on-nginx', srcTag: 'dev', destStream: 'angular-on-nginx', destTag: 'test')
                          notifyBuild('DEPLOYED:TEST')
                        }
                    } catch (err) {
                        notifyBuild('DEPLOYMENT:TEST ABORTED')
                    }
                }
            }
        }
        stage('tag and deploy to prod') {
            steps {
                script {
                    try {
                        timeout(time: 2, unit: 'MINUTES') {
                          input "Deploy to PROD?"
                          openshiftTag(srcStream: 'angular-on-nginx', srcTag: 'test', destStream: 'angular-on-nginx', destTag: 'prod')
                          notifyBuild('DEPLOYED:PROD')
                        }
                    } catch (err) {
                        notifyBuild('DEPLOYMENT:PROD ABORTED')
                    }
                }
            }
        }
    }
}
def notifyBuild(String buildStatus = 'STARTED') {
  // build status of null means successful
  buildStatus =  buildStatus ?: 'SUCCESSFUL'

  // Default values
  def colorName = 'RED'
  def colorCode = '#FF0000'
  def subject = "${buildStatus}: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]'"
  def summary = "${subject} (${env.BUILD_URL})"
  def details = """<p>STARTED: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]':</p>
    <p>Check console output at "<a href="${env.BUILD_URL}">${env.JOB_NAME} [${env.BUILD_NUMBER}]</a>"</p>"""

  // Override default values based on build status
  if (buildStatus == 'STARTED' || buildStatus.startsWith("DEPLOYMENT")) {
    color = 'YELLOW'
    colorCode = '#FFFF00'
  } else if (buildStatus == 'SUCCESSFUL' || buildStatus.startsWith("DEPLOYED")) {
    color = 'GREEN'
    colorCode = '#00FF00'
  } else {
    color = 'RED'
    colorCode = '#FF0000'
  }

  // Send notifications
  slackSend (color: colorCode, message: summary)
}