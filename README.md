# Serverless Metric Dashboard For Prometheus

## Jump to Section

- [What Is Serverless Metric Dashboard](#What-Is-Serverless-Metric-Dashboard)
- [Getting Started](#Getting-Started)
- [Repository Structure](#Repository-Structure)
- [Necessary Changes For Use With Other Providers](#Necessary-Changes-For-Use-With-Other-Providers)
- [Used Tools And Libraries](#Used-Tools-And-Libraries)

## What Is Serverless Metric Dashboard

Prometheus metrics collector framework for serverless applications, exposing cost and performance related metrics of your running functions.

The goal of the framework is not to focus on any provider. However, small adjustments will be necessary.

The framework sends data from the serverless function to an aggregator, either with TCP or UDP. The aggregator exposes the aggregated metrics to Prometheus.

This repository contains an implementation for Azure Functions with NodeJS including some example functions. The server containing Prometheus, Grafana, Prometheus Pushgateway and Prometheus Aggregator can be automatically deployed in an Azure Virtual Machine.

## Getting Started

## Repository Structure

## Necessary Changes For Use With Other Providers

## Used Tools and Libraries

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
- Update metric ideas
- Change this readme to explain the repository and its structure
- Explain components of metrics server in Readme
- Expand lib Readme
- Explain dumps in resources
- ~~Grafana dashboard import~~

### Publishing
- Publish this repository
- Publish node library