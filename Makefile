ALL: help

ALLOW_ALL_ADVISORIES := $(shell echo $${ALLOW_ALL_ADVISORIES:-0})

VERSION := $(shell cat ./version)

version: ## Display current version
	echo "VERSION $(VERSION)"

update-version: ## Update version file with timestamp (RC_YY_MM_DD_HH_MM format)
	@date -u "+RC_%g_%m_%d_%H_%M" > "./version"
	@echo "Updated version to $$(cat ./version)"

# Help target
help:  ## Display this help message
		@echo "Switchboard Landing Page Makefile Help"
		@echo "Usage: make [target]"
		@echo "Available targets:"
		@awk 'BEGIN {FS = ":.*##"; printf "\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  %-45s %s\n", $$1, $$2 }' $(MAKEFILE_LIST)
		@echo ""

################################################################################
### LANDING PAGE
################################################################################

docker-release-oracle-landing-page: docker-build-oracle-landing-page docker-push-oracle-landing-page ## Landing Page: build and push current version
docker-release-oracle-landing-page-latest: docker-release-oracle-landing-page docker-tag-oracle-landing-page-latest docker-push-oracle-landing-page-latest ## Landing Page: build and push latest version

docker-build-oracle-landing-page: ## Landing Page: build docker image
	export TAG="$$(cat ./version | tr '[:upper:]' '[:lower:]')" && \
	docker buildx build \
		--platform linux/amd64 \
		-f ./Dockerfile \
		-t switchboardlabs/oracle-landing-page:"$${TAG}" \
		--pull ./ && \
	echo "\nBuilt switchboardlabs/oracle-landing-page:$${TAG}\n"

docker-push-oracle-landing-page: ## Landing Page: push current version to hub.docker.com
	export TAG="$$(cat ./version | tr '[:upper:]' '[:lower:]')" && \
	docker push \
		switchboardlabs/oracle-landing-page:"$${TAG}" && \
	echo "\nPublished switchboardlabs/oracle-landing-page:$${TAG}\n"

docker-tag-oracle-landing-page-latest: ## Landing Page: tag current version as latest
	export TAG="$$(cat ./version | tr '[:upper:]' '[:lower:]')" && \
	docker tag \
		switchboardlabs/oracle-landing-page:"$${TAG}" \
		switchboardlabs/oracle-landing-page:latest

docker-push-oracle-landing-page-latest: ## Landing Page: push latest tag to hub.docker.com
	docker push \
		switchboardlabs/oracle-landing-page:latest

# vim: set filetype=make foldmethod=marker foldlevel=0 noexpandtab:
