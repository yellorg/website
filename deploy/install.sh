#!/bin/sh

set -e

envsubst values.yaml.tpl > values.yaml

if [ -n "PULL_SECRET_B64" ]; then
    echo "Creating the pull secret..."
    echo ${PULL_SECRET_B64} | base64 -d | kube apply -n ${HELM_NAMESPACE} -f -
fi

version=""
if [ -n "${HELM_VERSION}" ]; then
    version = "--version ${HELM_VERSION}"
fi

echo "Signing into Quay..."
helm registry login quay.io -u $QUAY_USER -p $QUAY_PASS

echo "Deploying the Helm release..."
helm upgrade -i $HELM_RELEASE_NAME $HELM_CHART_NAME \
    -n ${HELM_NAMESPACE} \
    ${version} \
    --set image.tag="$(cat .tags)"
