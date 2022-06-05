fullnameOverride: ${HELM_RELEASE}
nameOverride: ${HELM_RELEASE}
imagePullSecrets:
  - name: ${PULL_SECRET_NAME}

image:
  repository: ${QUAY_REPO}

service:
  port: ${SVC_PORT}

ingress:
# annotations:
#   cert-manager.io/issuer: zerossl-prod
  redirectTo: ${DOMAIN}
  hosts:
    - host: ${DOMAIN}
      redirectionEnabled: false
      paths:
        - /
    - host: ${REDIRECT_FROM_DOMAIN}
      redirectionEnabled: true
      paths:
        - /
  tls:
    - secretName: ${HELM_RELEASE}-tls
      hosts:
        - ${DOMAIN}
        - ${REDIRECT_FROM_DOMAIN}
