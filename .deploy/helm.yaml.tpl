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
  hosts:
    - host: ${DOMAIN}
      paths:
        - /
  tls:
    - secretName: ${HELM_RELEASE}-tls
      hosts:
        - ${DOMAIN}
