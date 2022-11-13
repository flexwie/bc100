const opentelemetry = require("@opentelemetry/api");

// Not functionally required but gives some insight what happens behind the scenes
const { diag, DiagConsoleLogger, DiagLogLevel } = opentelemetry;
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

const { AlwaysOnSampler } = require("@opentelemetry/core");
const { registerInstrumentations } = require("@opentelemetry/instrumentation");
const { NodeTracerProvider } = require("@opentelemetry/sdk-trace-node");
const { SimpleSpanProcessor } = require("@opentelemetry/sdk-trace-base");
const { JaegerExporter } = require("@opentelemetry/exporter-jaeger");
const { Resource } = require("@opentelemetry/resources");
const {
  SemanticAttributes,
  SemanticResourceAttributes,
} = require("@opentelemetry/semantic-conventions");
const { PrismaInstrumentation } = require("@prisma/instrumentation");

const Exporter = JaegerExporter;
const {
  ExpressInstrumentation,
} = require("@opentelemetry/instrumentation-express");
const { HttpInstrumentation } = require("@opentelemetry/instrumentation-http");

const prismaInstrumentation = new PrismaInstrumentation({ middleware: true });

const setupTracing = (serviceName) => {
  const provider = new NodeTracerProvider({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
    }),
    sampler: filterSampler(ignoreHealthCheck, new AlwaysOnSampler()),
  });
  registerInstrumentations({
    tracerProvider: provider,
    instrumentations: [
      // Express instrumentation expects HTTP layer to be instrumented
      HttpInstrumentation,
      ExpressInstrumentation,
      prismaInstrumentation,
    ],
  });

  const exporter = new Exporter({
    endpoint: process.env.TRACING_ENDPOINT,
  });

  provider.addSpanProcessor(new SimpleSpanProcessor(exporter));

  // Initialize the OpenTelemetry APIs to use the NodeTracerProvider bindings
  provider.register();

  return opentelemetry.trace.getTracer(serviceName);
};

function filterSampler(filterFn, parent) {
  return {
    shouldSample(ctx, tid, spanName, spanKind, attr, links) {
      if (!filterFn(spanName, spanKind, attr)) {
        return { decision: opentelemetry.SamplingDecision.NOT_RECORD };
      }
      return parent.shouldSample(ctx, tid, spanName, spanKind, attr, links);
    },
    toString() {
      return `FilterSampler(${parent.toString()})`;
    },
  };
}

function ignoreHealthCheck(spanName, spanKind, attributes) {
  return (
    spanKind !== opentelemetry.SpanKind.SERVER ||
    attributes[SemanticAttributes.HTTP_ROUTE] !== "/metrics"
  );
}

module.exports = { setupTracing };
