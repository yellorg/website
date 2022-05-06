image:
  repository: quay.io/openware/website

imagePullSecrets:
  - name: ${PULL_SECRET_NAME}

fullnameOverride: ${HELM_RELEASE}

ingress:
  annotations:
    cert-manager.io/issuer: zerossl-prod
  hosts:
    - host: ${HELM_HOST}
      paths:
        - /
  tls:
    - secretName: ${HELM_RELEASE}-tls
      hosts:
        - ${HELM_HOST}

service:
  port: 80