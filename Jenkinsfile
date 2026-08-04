pipeline {
  agent any

  tools {
    nodejs 'node20'
  }

  environment {
    ECR_REPO = "245594728226.dkr.ecr.ap-south-1.amazonaws.com/jenkins-eks-react-app"
    IMAGE_TAG = "${BUILD_NUMBER}"
    CLUSTER_NAME = "devops-cluster"
    DEPLOYMENT_NAME = "react-deployment"
    CONTAINER_NAME = "react-container"
  }

  stages {
    stage('Checkout') {
      steps {
        git branch: 'main', url: 'https://github.com/PritamPriyanshuPatra2003/jenkins-eks-react-app.git', credentialsId: 'github-cred'
      }
    }

    stage('Install Dependencies') {
      steps {
        sh 'npm install'
      }
    }

    stage('Build React App') {
      steps {
        sh 'npm run build'
      }
    }

    stage('Build Docker Image') {
      steps {
        sh "docker build -t $ECR_REPO:$IMAGE_TAG ."
      }
    }

    stage('Push to ECR') {
      steps {
        withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'aws-cred']]) {
          sh """
            aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin $ECR_REPO
            docker push $ECR_REPO:$IMAGE_TAG
          """
        }
      }
    }

    stage('Update K8s Deployment') {
      steps {
        withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'aws-cred']]) {
          sh """
            aws eks update-kubeconfig --region ap-south-1 --name $CLUSTER_NAME
            kubectl set image deployment/$DEPLOYMENT_NAME $CONTAINER_NAME=$ECR_REPO:$IMAGE_TAG
            kubectl rollout status deployment/$DEPLOYMENT_NAME
          """
        }
      }
    }
  }

  post {
    success {
      echo 'Pipeline completed successfully — new version deployed to EKS.'
    }
    failure {
      echo 'Pipeline failed — check the stage logs above.'
    }
  }
}
