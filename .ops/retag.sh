#!/bin/bash

set -e

# Ensure the script is run with the required parameters
if [ "$#" -ne 3 ] || [[ " $* " == *" -h "* ]] || [[ " $* " == *" --help "* ]]; then
  echo "Usage: $0 <image-name> <old-tag> <new-tag>"
  exit 1
fi

# Parameters
IMAGE_NAME=$1
OLD_TAG=$2
NEW_TAG=$3
ACR_NAME="supplyside"  # Replace with your Azure Container Registry name

az acr login --name $ACR_NAME

docker pull $ACR_NAME.azurecr.io/$IMAGE_NAME:$OLD_TAG
docker tag $ACR_NAME.azurecr.io/$IMAGE_NAME:$OLD_TAG $ACR_NAME.azurecr.io/$IMAGE_NAME:$NEW_TAG
docker push $ACR_NAME.azurecr.io/$IMAGE_NAME:$NEW_TAG

if [ $? -eq 0 ]; then
  echo "Successfully retagged and pushed $IMAGE_NAME:$NEW_TAG"
else
  echo "Failed to push $IMAGE_NAME:$NEW_TAG"
  exit 1
fi