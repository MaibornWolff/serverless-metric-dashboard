FROM debian:latest

ENV version 0.0.11

RUN mkdir -p /prometheus-aggregator
WORKDIR /prometheus-aggregator
RUN apt-get update -qq \
    && apt-get install -y wget
RUN cd /prometheus-aggregator \
    && wget -nv https://github.com/peterbourgon/prometheus-aggregator/releases/download/v${version}/prometheus-aggregator-${version}-linux-amd64
RUN mv prometheus-aggregator-${version}-linux-amd64 prometheus-aggregator
RUN chmod +x prometheus-aggregator

COPY declaration.json .

EXPOSE 8191

ENTRYPOINT [ "/prometheus-aggregator/prometheus-aggregator" ]
CMD ["-debug=true", "-socket=tcp://0.0.0.0:8191", "-prometheus=tcp://0.0.0.0:8192/metrics", "-declfile=declaration.json"]
# the '=' are required otherwise some parameters might not get recoginized by Prometheus Aggregator