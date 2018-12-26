# Serverless Metric Dashboard For Prometheus

## Jump to Section

- [What Is Serverless Metric Dashboard](#What-Is-Serverless-Metric-Dashboard)
- [Getting Started](#Getting-Started)
- [Repository Structure](#Repository-Structure)
- [Necessary Changes For Use With Other Providers](#Necessary-Changes-For-Use-With-Other-Providers)
- [Used Tools And Libraries](#Used-Tools-And-Libraries)
- [Known Issues And Limitations](#Known-Issues-And-Limitations)

## What Is Serverless Metric Dashboard

Prometheus metrics collector framework for serverless applications, exposing cost and performance related metrics of your running functions.

The goal of the framework is not to focus on any provider. However, small adjustments will be necessary.

The framework sends data from the serverless function to an aggregator, either with TCP or UDP. The aggregator exposes the aggregated metrics to Prometheus.

This repository contains an implementation for Azure Functions with NodeJS including some example functions. The server containing Prometheus, Grafana, Prometheus Pushgateway and Prometheus Aggregator can be automatically deployed in an Azure Virtual Machine.

**Screenshots here**

## Getting Started

This project was initially developed for Microsoft Azure. [Necessary changes for use with other providers](#Necessary-Changes-For-Use-With-Other-Providers).

- [Install an Azure Virtual Machine with Prometheus & Grafana and optionally an Azure Functions example](/example/azure/Readme.md) (free account without credit card sufficient; Installation ~30 min)
- [Run the Prometheus stack with Grafana and other necessary components on your own host](/prometheus-stack/Readme.md)
- [Use the NodeJS library](/lib/node-js/Readme.md)

## Repository Structure

- docs: Contains some ideas about metrics and mainly metadata files from Azure Functions
- example: Contains an Azure Functions resizing example as well as deployment scripts for unix based systems. The example shows how the framework works and what it can do
- lib: The (currently only NodeJS) library, which can be included in your function to send any metric you want to Prometheus. Small changes are necessary to use it with other providers like AWS Lambda or Google Cloud Functions.
- prometheus-stack: A docker-compose stack to deploy Prometheus, Grafana and other necessary components with one command

## Necessary Changes For Use With Other Providers

## Used Tools And Libraries
- Prometheus & Prometheus Pushgateway
- Grafana
- [Prometheus Aggregator](https://github.com/peterbourgon/prometheus-aggregator) by peterbourgon
- Docker & Docker-Compose
- Node & npm

## Known Issues And Limitations

- Azure Functions in the Consumption Plan are not able to be part of a VNet ([Issue](https://github.com/Azure/Azure-Functions/issues/840), [Azure Feedback](https://feedback.azure.com/forums/355860-azure-functions/suggestions/15616044-add-vnet-integration)). This means that metrics must be sent to a public address
- The use of the promES library might increase execution time and resource usage of your function. However, the impact of the library in its current form should be minimal if you don't track the RAM-usage of your function. Enabling UDP instead of TCP might also increase the performance of the library.
- The Prometheus Aggregator by peterbourgon is only a temporary solution. Several other aggregators for Prometheus exist but there is currently no standardised solution. I decided to use Prometheus Aggregator because is it easy to use with TCP/UDP and a lightweight Go application

## Todo
### Deployment Automation
- ~~Automate grafana dashboard deployment~~ Not easy, manual import better
- ~~Automate database deployment~~
- ~~Automate blob container creation~~
- ~~Automate VM deployment~~
- Update Readme
- ~~Logs enabled by default~~ not possible via Azure CLI
- ~~SSH Key~~
- Compile function zip file in cloud

### Project cleanup/restructuring
- ~~Remove experimental folder~~
- ~~Remove all personal information~~
- ~~Move scripts to one folder~~

### Functionalities
- Add more label options to PromClient library
- Test PromClient library
- ~~Add simple http trigger function to example for testing~~
- ~~Improve testing http trigger function to just resize an image from the container~~
- ~~Add timer trigger~~ (skipped because not necessary)
- Add comments to lib

### Documentation
- ~~Update metric ideas~~
- ~~Change this readme to explain the repository and its structure~~
- Explain components of metrics server in Readme
- Expand lib Readme
- ~~Explain dumps in resources~~
- ~~Grafana dashboard import~~

### Publishing
- Publish this repository
- Publish node library