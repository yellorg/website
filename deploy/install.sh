#!/bin/sh

set -e

wget -q -O /usr/bin/kubectl "https://storage.googleapis.com/kubernetes-release/release/v1.20.0/bin/linux/amd64/kubectl"
chmod +x /usr/bin/kubectl

echo $KUBECONFIG_B64 | base64 -d > $KUBECONFIG
chmod 0600 $KUBECONFIG

VALUES_PATH="deploy/helm.yaml"

cat ${VALUES_PATH}.tpl | envsubst > ${VALUES_PATH}

if [ -n "PULL_SECRET_B64" ]; then
    echo "Creating the pull secret..."
    echo ${PULL_SECRET_B64} | base64 -d | kubectl apply -n ${HELM_NAMESPACE} -f -
fi

version=""
if [ -n "${HELM_VERSION}" ]; then
    version="--version ${HELM_VERSION}"
fi

set -x

helm registry login quay.io -u $QUAY_USER -p $QUAY_PASS
helm pull $HELM_CHART ${version}

echo "Deploying the Helm release..."
helm upgrade -i $HELM_RELEASE $HELM_CHART \
    -n ${HELM_NAMESPACE} \
    -f deploy/helm.yaml \
    ${version} \
    --set image.tag="$(cat .tags)"
