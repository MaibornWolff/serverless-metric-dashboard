# Serverless Metric Dashboard For Prometheus
[![Build Status](https://travis-ci.com/MaibornWolff/serverless-metric-dashboard.svg?branch=master)](https://travis-ci.com/MaibornWolff/serverless-metric-dashboard)

## Jump to Section

- [What Is Serverless Metric Dashboard](#What-Is-Serverless-Metric-Dashboard)
- [Getting Started](#Getting-Started)
- [Repository Structure](#Repository-Structure)
- [Necessary Changes For Use With Other Providers](#Necessary-Changes-For-Use-With-Other-Providers)
- [Necessary Changes For Use With Other Programming Languages](#Necessary-Changes-For-Use-With-Other-Programming-Languages)
- [Used Tools And Libraries](#Used-Tools-And-Libraries)
- [Known Issues And Limitations](#Known-Issues-And-Limitations)
- [Future Plans And Ideas](#Future-Plans-And-Ideas)

## What Is Serverless Metric Dashboard

Prometheus metrics collector framework for serverless applications, exposing cost and performance related metrics of your running functions.

The goal of the framework is not to focus on any provider. However, small adjustments will be necessary.

The framework sends data from the serverless function to an aggregator, either with TCP or UDP. The aggregator exposes the aggregated metrics to Prometheus.

This repository contains an implementation for Azure Functions with NodeJS including some example functions. The server containing Prometheus, Grafana, Prometheus Pushgateway and Prometheus Aggregator can be automatically deployed in an Azure Virtual Machine.

### Screenshots

Get an overview of function invocations and their total execution time.

![Invocation metrics](https://github.com/MaibornWolff/serverless-metric-dashboard/blob/master/docs/screenshots/Screenshot_invocations.png)

See which functions did not finish correctly and how long the took on average

![Execution metrics](https://github.com/MaibornWolff/serverless-metric-dashboard/blob/master/docs/screenshots/Screenshot_executions2.png)

Get an overview of function starts

![Execution and end metrics](https://github.com/MaibornWolff/serverless-metric-dashboard/blob/master/docs/screenshots/Screenshot_executions3.png)

Get a cost estimation and import real resource usage data from APIs

![Costs](https://github.com/MaibornWolff/serverless-metric-dashboard/blob/master/docs/screenshots/Screenshot_costs.png)

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

This project was initially developed for Microsoft Azure with NodeJS. However, some changes are necessary to make the libraries work with other providers:
- The server component with Prometheus, Grafana, etc. does not require any changes and can be run on any platform that supports Docker
- The NodeJS libraries are developed to be as provider independent as possible. A metadata manager is necessary, to get basic information like function name, invocation id etc. This concerns only one file and is explained in the libraries [Readme](lib/node-js/Readme.md).

## Necessary Changes For Use With Other Programming Languages

This project was developed in NodeJS because it is one of the few languages supported by most Serverless providers. Unfortunately using a different programming language means that you have to rewrite the promES library in your preferred language. The communication between the library and the Prometheus Aggregator is based on simple TCP/UDP sockets and every metric is concluded by a Newline.

## Used Tools And Libraries
- Prometheus & Prometheus Pushgateway
- Grafana
- [Prometheus Aggregator](https://github.com/peterbourgon/prometheus-aggregator) by peterbourgon
- Docker & Docker-Compose
- Node & npm

## Known Issues And Limitations

- Azure Functions in the Consumption Plan are not able to be part of a VNet ([Issue](https://github.com/Azure/Azure-Functions/issues/840), [Azure Feedback](https://feedback.azure.com/forums/355860-azure-functions/suggestions/15616044-add-vnet-integration)). This means that metrics must be sent to a public address which can cause minor costs for network usage. The communication between the server and the library is also not encrypted (TLS could be possible if you modify the Prometheus Aggregator and the libraray).
- The use of the promES library might increase execution time and resource usage of your function. However, the impact of the library in its current form should be minimal if you don't track the RAM-usage of your function. Enabling UDP instead of TCP might also increase the performance of the library.
- The Prometheus Aggregator by peterbourgon is only a temporary solution. Several other aggregators for Prometheus exist but there is currently no standardised solution. I decided to use Prometheus Aggregator because is it easy to use with TCP/UDP and a lightweight Go application
- The Prometheus Aggregator can not persist the aggregated data. It gets lost when you restart the Prometheus Aggregator

## Future Plans And Ideas

The current implementation is interesting for basic metrics, especially aggregated metrics. Setting up Prometheus & Grafana is easy and does not require a lot of resources. The current setup is not useful for the following problems:

- Storing information permanently
- Getting information about single invocations and being able to query that data
- Sending important logs and error messages without being dependent on the cloud provider (and being able to query that data)

A possible solution could be ElasticSearch. The data could be directly pushed to a tool like logstash for example via UDP. This can be an extension to the current library or replace Prometheus entirely. Grafana can also be used with ElasticSearch so Prometheus could be unnecessary.
