# Deployment

The following env vars have to be set for the deployment to work:

|Name|Example|Description|
|---|---|---|
|`QUAY_USER`|yellow+awesome|quay.io username(for Helm chart and Docker image access)|
|`QUAY_PASS`|yesawesome|quay.io password|
|`PULL_SECRET_NAME`|example-quay|K8s image pull secret name|
|`PULL_SECRET_B64`|eWVhaGJvaQo=|[Optional] K8s pull secret YAML encoded in base64; not required if the secret is already present|
|`HELM_RELEASE`|website|Helm release target name|
|`HELM_CHART`|repo/website|Helm chart name|
|`HELM_VERSION`|1.0.0|[Optional] Helm chart version|
|`HELM_NAMESPACE`|websites|Target K8s namespace|
|`HELM_HOST`|www.example.com|Target hostname|

After that's done, feel free to run `install.sh` locally or in a CI environment to get a functional deployment.
