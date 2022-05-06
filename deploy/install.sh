#!/bin/sh

set -e

BASEDIR="$(cd "$(dirname "$0")" && pwd)"

if [ -n "${KUBECONF}" ]; then
    echo ${KUBECONF} | base64 -d >${KUBECONFIG}
    chmod 0600 ${KUBECONFIG}
fi

envsubst ${BASEDIR}/helm.yaml.tpl > ${BASEDIR}/values.yaml

if [ -n "${PULL_SECRET_B64}" ]; then
    echo "Creating the pull secret..."
    echo ${PULL_SECRET_B64} | base64 -d | kube apply -n ${HELM_NAMESPACE} -f -
fi

version=""
if [ -n "${HELM_VERSION}" ]; then
    version="--version ${HELM_VERSION}"
fi

tag="$(cat ${BASEDIR}/.tags)"
echo "Deploying the Helm release with tag ${tag}"

helm upgrade -i ${HELM_RELEASE} ${HELM_CHART} \
    -n ${HELM_NAMESPACE} \
    ${version} \
    -f ${BASEDIR}/values.yaml \
    --set image.tag=${tag}
